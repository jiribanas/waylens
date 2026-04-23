import {
  CreateStartUpPageContainer,
  EvenAppBridge,
  ImageContainerProperty,
  ImageRawDataUpdate,
  ImageRawDataUpdateResult,
  ListContainerProperty,
  RebuildPageContainer,
  StartUpPageCreateResult,
  TextContainerProperty,
  TextContainerUpgrade,
} from '@evenrealities/even_hub_sdk'

let bridgeRef: EvenAppBridge | null = null
let hasCreatedStartup = false

export function setBridge(bridge: EvenAppBridge): void {
  bridgeRef = bridge
}

export function getBridge(): EvenAppBridge {
  if (!bridgeRef) throw new Error('Bridge has not been initialised yet')
  return bridgeRef
}

export interface PageLayout {
  textObject?: TextContainerProperty[]
  imageObject?: ImageContainerProperty[]
  listObject?: ListContainerProperty[]
}

function total(layout: PageLayout): number {
  return (
    (layout.textObject?.length ?? 0) +
    (layout.imageObject?.length ?? 0) +
    (layout.listObject?.length ?? 0)
  )
}

export async function showPage(layout: PageLayout): Promise<void> {
  const containerTotalNum = total(layout)
  if (containerTotalNum === 0) {
    throw new Error('showPage called with no containers')
  }

  if (!hasCreatedStartup) {
    hasCreatedStartup = true
    const payload = new CreateStartUpPageContainer(pruneEmptyArrays({
      containerTotalNum,
      textObject: layout.textObject,
      imageObject: layout.imageObject,
      listObject: layout.listObject,
    }))
    const result = await getBridge().createStartUpPageContainer(payload)
    if (result !== StartUpPageCreateResult.success) {
      console.warn('[WayLens] createStartUpPageContainer result:', result)
    }
    return
  }

  const rebuildPayload = new RebuildPageContainer(pruneEmptyArrays({
    containerTotalNum,
    textObject: layout.textObject,
    imageObject: layout.imageObject,
    listObject: layout.listObject,
  }))
  await getBridge().rebuildPageContainer(rebuildPayload)
}

function pruneEmptyArrays<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (Array.isArray(v) && v.length === 0) continue
    if (v === undefined) continue
    out[k] = v
  }
  return out as T
}

export async function upgradeText(
  containerID: number,
  containerName: string,
  content: string,
): Promise<void> {
  await getBridge().textContainerUpgrade(
    new TextContainerUpgrade({
      containerID,
      containerName,
      content,
      contentOffset: 0,
      contentLength: content.length,
    }),
  )
}

export async function updateImage(
  containerID: number,
  containerName: string,
  imageData: Uint8Array,
): Promise<ImageRawDataUpdateResult> {
  return getBridge().updateImageRawData(
    new ImageRawDataUpdate({
      containerID,
      containerName,
      imageData: Array.from(imageData),
    }),
  )
}

export async function exit(): Promise<void> {
  try {
    await getBridge().shutDownPageContainer(0)
  } catch (err) {
    console.warn('[WayLens] shutDownPageContainer failed', err)
  }
}
