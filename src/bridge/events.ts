import {
  EventSourceType,
  EvenAppBridge,
  EvenHubEvent,
  OsEventTypeList,
} from '@evenrealities/even_hub_sdk'
import type { GlassesInput } from '../types'

export type InputHandler = (input: GlassesInput) => void | Promise<void>

export function attachEventDispatcher(bridge: EvenAppBridge, handler: InputHandler): () => void {
  return bridge.onEvenHubEvent((event: EvenHubEvent) => {
    void dispatchEvent(event, handler)
  })
}

function normaliseEventType(raw: OsEventTypeList | undefined): OsEventTypeList {
  if (raw === undefined || raw === null) return OsEventTypeList.CLICK_EVENT
  return raw
}

async function dispatchEvent(event: EvenHubEvent, handler: InputHandler): Promise<void> {
  if (event.listEvent) {
    const type = normaliseEventType(event.listEvent.eventType)
    logEvent('list', type, undefined, event.listEvent)
    if (type === OsEventTypeList.CLICK_EVENT) {
      await handler({
        kind: 'listSelect',
        ...(event.listEvent.currentSelectItemIndex !== undefined
          ? { listIndex: event.listEvent.currentSelectItemIndex }
          : {}),
        ...(event.listEvent.currentSelectItemName !== undefined
          ? { listItemName: event.listEvent.currentSelectItemName }
          : {}),
      })
      return
    }
    await handler(toGlassesInput(type))
    return
  }

  if (event.textEvent) {
    const type = normaliseEventType(event.textEvent.eventType)
    logEvent('text', type, undefined, event.textEvent)
    await handler(toGlassesInput(type))
    return
  }

  if (event.sysEvent) {
    const type = normaliseEventType(event.sysEvent.eventType)
    if (type === OsEventTypeList.IMU_DATA_REPORT) return
    logEvent('sys', type, event.sysEvent.eventSource, event.sysEvent)

    if (
      type === OsEventTypeList.FOREGROUND_EXIT_EVENT ||
      type === OsEventTypeList.ABNORMAL_EXIT_EVENT ||
      type === OsEventTypeList.SYSTEM_EXIT_EVENT
    ) {
      await handler({ kind: 'foregroundExit' })
      return
    }

    if (
      type === OsEventTypeList.CLICK_EVENT ||
      type === OsEventTypeList.DOUBLE_CLICK_EVENT ||
      type === OsEventTypeList.SCROLL_TOP_EVENT ||
      type === OsEventTypeList.SCROLL_BOTTOM_EVENT
    ) {
      const fromRing = event.sysEvent.eventSource === EventSourceType.TOUCH_EVENT_FROM_RING
      await handler({ ...toGlassesInput(type), ...(fromRing ? { fromRing: true } : {}) })
    }
    return
  }
}

function toGlassesInput(type: OsEventTypeList): GlassesInput {
  switch (type) {
    case OsEventTypeList.CLICK_EVENT:
      return { kind: 'click' }
    case OsEventTypeList.DOUBLE_CLICK_EVENT:
      return { kind: 'doubleClick' }
    case OsEventTypeList.SCROLL_TOP_EVENT:
      return { kind: 'scrollUp' }
    case OsEventTypeList.SCROLL_BOTTOM_EVENT:
      return { kind: 'scrollDown' }
    default:
      return { kind: 'click' }
  }
}

function logEvent(
  category: 'list' | 'text' | 'sys',
  type: OsEventTypeList,
  source: EventSourceType | undefined,
  payload: unknown,
): void {
  if (!import.meta.env.DEV) return
  const typeName = OsEventTypeList[type] ?? type
  const sourceName = source !== undefined ? EventSourceType[source] ?? source : 'n/a'
  console.log(`[WayLens] ${category}Event ${typeName} source=${sourceName}`, payload)
}
