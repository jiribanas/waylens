import type { Route } from '../types'
import { findPoi } from './pois'

const M_PER_GATE = 40
const WALK_SPEED_M_PER_MIN = 80

function routeKey(fromId: string, toId: string): string {
  return `${fromId}->${toId}`
}

const ROUTES: Record<string, Route> = {
  [routeKey('GATE_D30', 'CAFE_STARBUCKS')]: {
    fromId: 'GATE_D30',
    toId: 'CAFE_STARBUCKS',
    totalDistanceM: 20 * M_PER_GATE,
    totalMinutes: Math.round((20 * M_PER_GATE) / WALK_SPEED_M_PER_MIN),
    steps: [
      {
        instruction: 'Exit D30, turn left',
        direction: 'left',
        distanceM: 3 * M_PER_GATE,
        fromX: 30,
        toX: 27,
      },
      {
        instruction: 'Continue west past D20',
        direction: 'straight',
        distanceM: 8 * M_PER_GATE,
        fromX: 27,
        toX: 19,
      },
      {
        instruction: 'Pass D15, Starbucks on the right',
        direction: 'straight',
        distanceM: 7 * M_PER_GATE,
        fromX: 19,
        toX: 12,
      },
      {
        instruction: 'Arrive at Starbucks',
        direction: 'arrive',
        distanceM: 2 * M_PER_GATE,
        fromX: 12,
        toX: 10,
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

export function routeBounds(route: Route): { minX: number; maxX: number } {
  const xs: number[] = [route.steps[0]?.fromX ?? 0]
  for (const s of route.steps) {
    xs.push(s.fromX, s.toX)
  }
  return { minX: Math.min(...xs), maxX: Math.max(...xs) }
}
