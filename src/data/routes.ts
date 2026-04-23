import type { Point2D, Route } from '../types'
import { findPoi } from './pois'
import { buildDemoRoute } from '../rendering/mia'

const WALK_SPEED_M_PER_MIN = 80

function routeKey(fromId: string, toId: string): string {
  return `${fromId}->${toId}`
}

// Waypoints for the demo route are baked by the hand-drawn scene kit; the
// route object only surfaces per-step metadata the state machine uses for
// header/footer text and step counts. Rendering per step is handled by
// dedicated scene renderers in src/rendering/scenes/.
function demoRouteLegsOr(fromId: string, toId: string): Point2D[][] | undefined {
  if (fromId !== 'GATE_D30' || toId !== 'CAFE_STARBUCKS') return undefined
  return buildDemoRoute().map((l) => l.waypoints)
}

const ROUTES: Record<string, Route> = (() => {
  const legs = demoRouteLegsOr('GATE_D30', 'CAFE_STARBUCKS')
  if (!legs) return {}
  return {
    [routeKey('GATE_D30', 'CAFE_STARBUCKS')]: {
      fromId: 'GATE_D30',
      toId: 'CAFE_STARBUCKS',
      totalDistanceM: 800,
      totalMinutes: Math.round(800 / WALK_SPEED_M_PER_MIN),
      steps: [
        {
          instruction: 'Exit D30, turn left onto concourse',
          direction: 'left',
          distanceM: 120,
          waypoints: legs[0]!,
        },
        {
          instruction: 'Continue west past D20',
          direction: 'straight',
          distanceM: 260,
          waypoints: legs[1]!,
        },
        {
          instruction: 'Pass D15, Starbucks on the right',
          direction: 'straight',
          distanceM: 340,
          waypoints: legs[2]!,
        },
        {
          instruction: 'Turn right into Starbucks',
          direction: 'right',
          distanceM: 80,
          waypoints: legs[3]!,
        },
      ],
    },
  }
})()

export function getRoute(fromId: string, toId: string): Route | undefined {
  if (fromId === toId) return undefined
  return ROUTES[routeKey(fromId, toId)]
}

export function hasRoute(fromId: string, toId: string): boolean {
  return getRoute(fromId, toId) !== undefined
}

export function describeRoute(route: Route): string {
  const from = findPoi(route.fromId)
  const to = findPoi(route.toId)
  const fromLabel = from?.shortName ?? route.fromId
  const toLabel = to?.shortName ?? route.toId
  return `${fromLabel} -> ${toLabel}`
}

export function allRouteWaypoints(route: Route): Point2D[] {
  const all: Point2D[] = []
  for (const step of route.steps) {
    for (const wp of step.waypoints) {
      all.push(wp)
    }
  }
  return all
}
