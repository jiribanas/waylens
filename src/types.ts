export type POICategory = 'gate' | 'lounge' | 'cafe' | 'restaurant'

export interface POI {
  id: string
  name: string
  shortName: string
  category: POICategory
  corridorX: number
  glyph: string
}

export type StepDirection = 'straight' | 'left' | 'right' | 'arrive'

export interface RouteStep {
  instruction: string
  direction: StepDirection
  distanceM: number
  fromX: number
  toX: number
}

export interface Route {
  fromId: string
  toId: string
  totalDistanceM: number
  totalMinutes: number
  steps: RouteStep[]
}

export type InputKind =
  | 'click'
  | 'doubleClick'
  | 'scrollUp'
  | 'scrollDown'
  | 'listSelect'
  | 'foregroundExit'

export interface GlassesInput {
  kind: InputKind
  listIndex?: number
  listItemName?: string
  fromRing?: boolean
}
