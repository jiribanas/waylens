import type { GlassesInput, Route } from './types'
import { POIS } from './data/pois'
import { getRoute } from './data/routes'
import { showHome } from './screens/home'
import { showArrived } from './screens/arrived'
import { showOverview } from './screens/overview'
import { showPoiList } from './screens/poiList'
import { showStep, updateStep } from './screens/step'
import { showRouteUnavailable } from './screens/routeUnavailable'
import { exit } from './bridge/glasses'
import { setStatus } from './phoneUI'

export type AppState =
  | { kind: 'home' }
  | { kind: 'fromList' }
  | { kind: 'toList'; fromId: string }
  | { kind: 'overview'; route: Route }
  | { kind: 'step'; route: Route; stepIndex: number }
  | { kind: 'arrived'; route: Route }
  | { kind: 'routeUnavailable'; fromId: string; toId: string }

let currentState: AppState = { kind: 'home' }
let transitioning = false

export function getState(): AppState {
  return currentState
}

export async function setState(next: AppState): Promise<void> {
  if (transitioning) {
    console.warn('[WayLens] setState ignored (transitioning):', next.kind)
    return
  }
  if (import.meta.env.DEV) {
    console.log('[WayLens] setState ->', next.kind)
  }
  transitioning = true
  try {
    const prevState = currentState
    currentState = next
    setStatus(describeStateForPhone(next))

    switch (next.kind) {
      case 'home':
        await showHome()
        break
      case 'fromList':
        await showPoiList({ title: 'From', excludeId: null })
        break
      case 'toList':
        await showPoiList({ title: 'To', excludeId: next.fromId })
        break
      case 'overview':
        await showOverview(next.route)
        break
      case 'step': {
        if (prevState.kind === 'step' && prevState.route.fromId === next.route.fromId && prevState.route.toId === next.route.toId) {
          await updateStep(next.route, next.stepIndex)
        } else {
          await showStep(next.route, next.stepIndex)
        }
        break
      }
      case 'arrived':
        await showArrived(next.route)
        break
      case 'routeUnavailable':
        await showRouteUnavailable(next.fromId, next.toId)
        break
    }
  } finally {
    transitioning = false
  }
}

function poisForList(excludeId: string | null) {
  if (!excludeId) return POIS
  return POIS.filter((p) => p.id !== excludeId)
}

export async function handleInput(input: GlassesInput): Promise<void> {
  const s = currentState
  if (import.meta.env.DEV) {
    console.log('[WayLens] handleInput', input.kind, 'in state', s.kind, input.listIndex !== undefined ? `listIndex=${input.listIndex}` : '')
  }
  if (input.kind === 'foregroundExit') {
    return
  }

  switch (s.kind) {
    case 'home': {
      if (input.kind === 'click') await setState({ kind: 'fromList' })
      return
    }

    case 'fromList': {
      if (input.kind === 'doubleClick') {
        await setState({ kind: 'home' })
        return
      }
      if (input.kind === 'listSelect') {
        const pois = poisForList(null)
        const idx = input.listIndex ?? -1
        const poi = pois[idx]
        if (poi) await setState({ kind: 'toList', fromId: poi.id })
      }
      return
    }

    case 'toList': {
      if (input.kind === 'doubleClick') {
        await setState({ kind: 'fromList' })
        return
      }
      if (input.kind === 'listSelect') {
        const pois = poisForList(s.fromId)
        const idx = input.listIndex ?? -1
        const toPoi = pois[idx]
        if (!toPoi) return
        const route = getRoute(s.fromId, toPoi.id)
        if (route) {
          await setState({ kind: 'overview', route })
        } else {
          await setState({ kind: 'routeUnavailable', fromId: s.fromId, toId: toPoi.id })
        }
      }
      return
    }

    case 'overview': {
      if (input.kind === 'doubleClick') {
        await setState({ kind: 'home' })
        return
      }
      if (input.kind === 'scrollDown' || input.kind === 'click') {
        await setState({ kind: 'step', route: s.route, stepIndex: 0 })
      }
      return
    }

    case 'step': {
      if (input.kind === 'doubleClick') {
        await setState({ kind: 'home' })
        return
      }
      if (input.kind === 'scrollUp') {
        if (s.stepIndex === 0) {
          await setState({ kind: 'overview', route: s.route })
        } else {
          await setState({ kind: 'step', route: s.route, stepIndex: s.stepIndex - 1 })
        }
        return
      }
      if (input.kind === 'scrollDown' || input.kind === 'click') {
        const last = s.route.steps.length - 1
        if (s.stepIndex >= last) {
          await setState({ kind: 'arrived', route: s.route })
        } else {
          await setState({ kind: 'step', route: s.route, stepIndex: s.stepIndex + 1 })
        }
      }
      return
    }

    case 'arrived': {
      if (input.kind === 'doubleClick') {
        await setState({ kind: 'home' })
      } else if (input.kind === 'scrollUp') {
        const last = s.route.steps.length - 1
        await setState({ kind: 'step', route: s.route, stepIndex: last })
      } else if (input.kind === 'click') {
        await exit()
      }
      return
    }

    case 'routeUnavailable': {
      if (input.kind === 'doubleClick' || input.kind === 'click') {
        await setState({ kind: 'fromList' })
      }
      return
    }
  }
}

function describeStateForPhone(state: AppState): string {
  switch (state.kind) {
    case 'home':
      return 'Ready - press the temple to start'
    case 'fromList':
      return 'Pick a starting point on the glasses'
    case 'toList':
      return 'Pick a destination on the glasses'
    case 'overview':
      return 'Showing route overview on the glasses'
    case 'step':
      return `Step ${state.stepIndex + 1} of ${state.route.steps.length}`
    case 'arrived':
      return 'Arrived - double-tap the temple to finish'
    case 'routeUnavailable':
      return 'Demo route unavailable for that pair'
  }
}
