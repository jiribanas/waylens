import type { Point2D, Route } from '../types'
import { findPoi } from './pois'
import {
  HALLWAY_CENTER_Y,
  gateCenter,
  gateExitPoint,
  poiCenter,
  poiEntryPoint,
} from '../rendering/world'

const WALK_SPEED_M_PER_MIN = 80

function routeKey(fromId: string, toId: string): string {
  return `${fromId}->${toId}`
}

// D30 -> Starbucks: 4 steps with clean rectilinear turns.
// 1. Exit the gate, turn left onto the main concourse.
// 2. Continue west past D20 / D15.
// 3. Walk past the Centurion Lounge toward Starbucks.
// 4. Turn right into the Starbucks storefront.
const GATE_D30 = gateCenter(30)
const GATE_D30_EXIT = gateExitPoint(30)
const HALLWAY_AT_D30: Point2D = { x: GATE_D30_EXIT.x, y: HALLWAY_CENTER_Y }
const HALLWAY_AT_D25: Point2D = { x: gateCenter(25).x, y: HALLWAY_CENTER_Y }
const HALLWAY_AT_D15: Point2D = { x: gateCenter(15).x, y: HALLWAY_CENTER_Y }
const HALLWAY_AT_STARBUCKS: Point2D = { x: poiEntryPoint('CAFE_STARBUCKS').x, y: HALLWAY_CENTER_Y }
const STARBUCKS_ENTRY = poiEntryPoint('CAFE_STARBUCKS')
const STARBUCKS = poiCenter('CAFE_STARBUCKS')

const ROUTES: Record<string, Route> = {
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
        waypoints: [GATE_D30, GATE_D30_EXIT, HALLWAY_AT_D30, HALLWAY_AT_D25],
      },
      {
        instruction: 'Continue west past D20',
        direction: 'straight',
        distanceM: 260,
        waypoints: [HALLWAY_AT_D25, HALLWAY_AT_D15],
      },
      {
        instruction: 'Pass D15, Starbucks on the right',
        direction: 'straight',
        distanceM: 340,
        waypoints: [HALLWAY_AT_D15, HALLWAY_AT_STARBUCKS],
      },
      {
        instruction: 'Turn right into Starbucks',
        direction: 'right',
        distanceM: 80,
        waypoints: [HALLWAY_AT_STARBUCKS, STARBUCKS_ENTRY, STARBUCKS],
      },
    ],
  },
}

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
