import type { Point2D } from '../types'

// Architectural floor plan for MIA Terminal D.
//
// World = canvas = 288x144 at overview zoom. A viewport crops a rectangular
// subregion of the world and scales it to fill the canvas. The layout is
// intentionally rectilinear (Wayfinder-style): a long horizontal concourse
// hallway with gate rooms branching off the top, shops/lounges branching off
// the bottom.

export const WORLD_WIDTH = 288
export const WORLD_HEIGHT = 144

export interface Viewport {
  x: number
  y: number
  w: number
  h: number
}

export interface Rect {
  x: number
  y: number
  w: number
  h: number
  label?: string
}

// Main concourse hallway: the walkable corridor that runs across Terminal D.
export const CONCOURSE_HALLWAY: Rect = {
  x: 24,
  y: 58,
  w: 240,
  h: 30,
  label: 'CONCOURSE D',
}

// Centerline of the hallway (where routes travel).
export const HALLWAY_CENTER_Y = CONCOURSE_HALLWAY.y + CONCOURSE_HALLWAY.h / 2

// Gate rooms branch off the top of the hallway.
// We list gates in gate-number order; position them along x.
// D1 is hub-side (east, left), D60 is tip-side (west, right in world space).
export interface GateRoom {
  number: number
  rect: Rect
  entryPoint: Point2D // where the gate connects to the hallway
}

function gateRoomAt(xCenter: number, number: number): GateRoom {
  const w = 22
  const h = 26
  const rect: Rect = {
    x: xCenter - w / 2,
    y: CONCOURSE_HALLWAY.y - h - 2,
    w,
    h,
    label: `D${number}`,
  }
  return {
    number,
    rect,
    entryPoint: { x: xCenter, y: CONCOURSE_HALLWAY.y },
  }
}

export const GATE_ROOMS: GateRoom[] = [
  gateRoomAt(44, 1),
  gateRoomAt(76, 10),
  gateRoomAt(100, 15),
  gateRoomAt(124, 20),
  gateRoomAt(148, 25),
  gateRoomAt(172, 30),
  gateRoomAt(200, 40),
  gateRoomAt(224, 50),
  gateRoomAt(248, 60),
]

export function findGateRoom(number: number): GateRoom | undefined {
  return GATE_ROOMS.find((g) => g.number === number)
}

// POI rooms branch off the bottom of the hallway.
export interface POIRoom {
  id: string
  rect: Rect
  entryPoint: Point2D
}

function poiRoomAt(xCenter: number, id: string): POIRoom {
  const w = 28
  const h = 28
  const rect: Rect = {
    x: xCenter - w / 2,
    y: CONCOURSE_HALLWAY.y + CONCOURSE_HALLWAY.h + 2,
    w,
    h,
  }
  return {
    id,
    rect,
    entryPoint: { x: xCenter, y: CONCOURSE_HALLWAY.y + CONCOURSE_HALLWAY.h },
  }
}

export const POI_ROOMS: POIRoom[] = [
  poiRoomAt(68, 'CAFE_STARBUCKS'),
  poiRoomAt(88, 'RESTAURANT_CORONA'),
  poiRoomAt(102, 'LOUNGE_CENTURION_D14'),
  poiRoomAt(124, 'LOUNGE_ADMIRALS_D15'),
  poiRoomAt(148, 'RESTAURANT_SHULAS'),
  poiRoomAt(180, 'LOUNGE_FLAGSHIP_D30'),
]

export function findPoiRoom(id: string): POIRoom | undefined {
  return POI_ROOMS.find((r) => r.id === id)
}

// Path helpers: where gates and POIs exit/enter the hallway.
export function gateExitPoint(number: number): Point2D {
  const g = findGateRoom(number)
  if (g) return g.entryPoint
  const fallback = GATE_ROOMS[GATE_ROOMS.length - 1]!.entryPoint
  return fallback
}

export function poiEntryPoint(id: string): Point2D {
  const r = findPoiRoom(id)
  if (r) return r.entryPoint
  return { x: 144, y: HALLWAY_CENTER_Y }
}

export function poiCenter(id: string): Point2D {
  const r = findPoiRoom(id)
  if (r) return { x: r.rect.x + r.rect.w / 2, y: r.rect.y + r.rect.h / 2 }
  return { x: 144, y: HALLWAY_CENTER_Y + 18 }
}

export function gateCenter(number: number): Point2D {
  const g = findGateRoom(number)
  if (g) return { x: g.rect.x + g.rect.w / 2, y: g.rect.y + g.rect.h / 2 }
  return { x: 144, y: HALLWAY_CENTER_Y - 18 }
}

// Build a 90-degree-bend polyline from a gate, down into the hallway,
// across the hallway, and down into a POI. Returns ordered waypoints.
export function buildGateToPoiPath(fromGate: number, toPoiId: string): Point2D[] {
  const gatePt = gateCenter(fromGate)
  const gateExit = gateExitPoint(fromGate)
  const hallwayAtGate: Point2D = { x: gateExit.x, y: HALLWAY_CENTER_Y }
  const poiEntry = poiEntryPoint(toPoiId)
  const hallwayAtPoi: Point2D = { x: poiEntry.x, y: HALLWAY_CENTER_Y }
  const poi = poiCenter(toPoiId)
  return [gatePt, gateExit, hallwayAtGate, hallwayAtPoi, poiEntry, poi]
}

// Viewport utilities --------------------------------------------------------

export function boundsOfPoints(points: Point2D[], padding: number): Viewport {
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const p of points) {
    if (p.x < minX) minX = p.x
    if (p.x > maxX) maxX = p.x
    if (p.y < minY) minY = p.y
    if (p.y > maxY) maxY = p.y
  }
  return {
    x: minX - padding,
    y: minY - padding,
    w: maxX - minX + padding * 2,
    h: maxY - minY + padding * 2,
  }
}

export function fullWorldViewport(padding = 4): Viewport {
  return {
    x: -padding,
    y: -padding,
    w: WORLD_WIDTH + padding * 2,
    h: WORLD_HEIGHT + padding * 2,
  }
}

export function fitViewportToAspect(vp: Viewport, canvasAspect: number): Viewport {
  const a = vp.w / vp.h
  if (a >= canvasAspect) {
    const h = vp.w / canvasAspect
    return { x: vp.x, y: vp.y - (h - vp.h) / 2, w: vp.w, h }
  }
  const w = vp.h * canvasAspect
  return { x: vp.x - (w - vp.w) / 2, y: vp.y, w, h: vp.h }
}

export function worldToCanvas(p: Point2D, vp: Viewport, canvasW: number, canvasH: number): Point2D {
  return {
    x: ((p.x - vp.x) / vp.w) * canvasW,
    y: ((p.y - vp.y) / vp.h) * canvasH,
  }
}

export function scaleFactor(vp: Viewport, canvasW: number): number {
  return canvasW / vp.w
}
