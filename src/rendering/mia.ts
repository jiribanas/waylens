import type { POICategory, Point2D } from '../types'
import {
  CANVAS_H,
  CANVAS_W,
  bezierPerp,
  bezierPoint,
  drawBlobRoom,
  drawPoiBadge,
  drawTrapezoidalRoom,
  offsetPoint,
  roundedRectPath,
  strokeSmoothPolyline,
} from './sceneKit'
import { GREY } from './canvasUtils'

// ---------------------------------------------------------------------------
// Curved concourse definition
// ---------------------------------------------------------------------------

// World coordinates match the full 576x144 render canvas. The concourse
// bezier has been stretched horizontally to span the wider space.
export const CONCOURSE = {
  p0: { x: 26, y: 100 },
  p1: { x: 170, y: 118 },
  p2: { x: 410, y: 44 },
  p3: { x: 552, y: 46 },
}

export const CONCOURSE_THICKNESS = 22

export function concoursePt(t: number): Point2D {
  return bezierPoint(CONCOURSE.p0, CONCOURSE.p1, CONCOURSE.p2, CONCOURSE.p3, t)
}

export function concoursePerp(t: number): Point2D {
  return bezierPerp(CONCOURSE.p0, CONCOURSE.p1, CONCOURSE.p2, CONCOURSE.p3, t)
}

// Sample the top edge of the concourse (for attaching gate rooms)
export function concourseTop(t: number, distance = CONCOURSE_THICKNESS / 2): Point2D {
  const p = concoursePt(t)
  const perp = concoursePerp(t)
  const upward = perp.y < 0 ? perp : { x: -perp.x, y: -perp.y }
  return offsetPoint(p, upward, distance)
}

// Sample the bottom edge of the concourse (for attaching POIs)
export function concourseBottom(t: number, distance = CONCOURSE_THICKNESS / 2): Point2D {
  const p = concoursePt(t)
  const perp = concoursePerp(t)
  const downward = perp.y > 0 ? perp : { x: -perp.x, y: -perp.y }
  return offsetPoint(p, downward, distance)
}

// Sample upward direction (perpendicular, pointing up toward smaller y).
export function concourseUpward(t: number): Point2D {
  const perp = concoursePerp(t)
  return perp.y < 0 ? perp : { x: -perp.x, y: -perp.y }
}

export function concourseDownward(t: number): Point2D {
  const perp = concoursePerp(t)
  return perp.y > 0 ? perp : { x: -perp.x, y: -perp.y }
}

// ---------------------------------------------------------------------------
// Gates (t-parameter along the concourse)
// ---------------------------------------------------------------------------

export interface Gate {
  id: string
  number: number
  label: string
  t: number
}

export const GATES: Gate[] = [
  { id: 'GATE_D1', number: 1, label: 'D1', t: 0.04 },
  { id: 'GATE_D10', number: 10, label: 'D10', t: 0.18 },
  { id: 'GATE_D15', number: 15, label: 'D15', t: 0.28 },
  { id: 'GATE_D20', number: 20, label: 'D20', t: 0.4 },
  { id: 'GATE_D25', number: 25, label: 'D25', t: 0.52 },
  { id: 'GATE_D30', number: 30, label: 'D30', t: 0.66 },
  { id: 'GATE_D40', number: 40, label: 'D40', t: 0.8 },
  { id: 'GATE_D50', number: 50, label: 'D50', t: 0.9 },
  { id: 'GATE_D60', number: 60, label: 'D60', t: 0.97 },
]

export function findGate(number: number): Gate | undefined {
  return GATES.find((g) => g.number === number)
}

export function findGateById(id: string): Gate | undefined {
  return GATES.find((g) => g.id === id)
}

// Gate waiting room center point (above the concourse top).
export function gateCenter(number: number, roomHeight = 22): Point2D {
  const g = findGate(number)
  if (!g) return { x: 0, y: 0 }
  const top = concourseTop(g.t)
  const up = concourseUpward(g.t)
  return offsetPoint(top, up, roomHeight / 2)
}

// ---------------------------------------------------------------------------
// POIs (t-parameter along the concourse)
// ---------------------------------------------------------------------------

export interface POIInfo {
  id: string
  t: number
  category: POICategory
  shape: 'round' | 'notched' | 'hex'
}

export const POI_INFOS: POIInfo[] = [
  { id: 'CAFE_STARBUCKS', t: 0.2, category: 'cafe', shape: 'round' },
  { id: 'RESTAURANT_CORONA', t: 0.32, category: 'restaurant', shape: 'hex' },
  { id: 'LOUNGE_CENTURION_D14', t: 0.44, category: 'lounge', shape: 'notched' },
  { id: 'LOUNGE_ADMIRALS_D15', t: 0.56, category: 'lounge', shape: 'notched' },
  { id: 'RESTAURANT_SHULAS', t: 0.7, category: 'restaurant', shape: 'hex' },
  { id: 'LOUNGE_FLAGSHIP_D30', t: 0.82, category: 'lounge', shape: 'notched' },
]

export function findPoiInfo(id: string): POIInfo | undefined {
  return POI_INFOS.find((p) => p.id === id)
}

export function poiCenter(id: string, roomHeight = 26): Point2D {
  const p = findPoiInfo(id)
  if (!p) return { x: 0, y: 0 }
  const bottom = concourseBottom(p.t)
  const down = concourseDownward(p.t)
  return offsetPoint(bottom, down, roomHeight / 2 + 1)
}

// Short name map for labelling.
export const POI_SHORT: Record<string, string> = {
  CAFE_STARBUCKS: 'Starbucks',
  RESTAURANT_CORONA: 'Corona Beach',
  LOUNGE_CENTURION_D14: 'Centurion',
  LOUNGE_ADMIRALS_D15: 'Admirals Club',
  RESTAURANT_SHULAS: "Shula's",
  LOUNGE_FLAGSHIP_D30: 'Flagship Lounge',
}

// ---------------------------------------------------------------------------
// Background renderers
// ---------------------------------------------------------------------------

export function drawConcourseRibbon(
  ctx: CanvasRenderingContext2D,
  opts: { showLabel?: boolean } = {},
): void {
  ctx.save()
  const half = CONCOURSE_THICKNESS / 2
  const samples = 60
  const top: Point2D[] = []
  const bottom: Point2D[] = []
  for (let i = 0; i <= samples; i++) {
    const t = i / samples
    top.push(concourseTop(t, half))
    bottom.push(concourseBottom(t, half))
  }

  ctx.beginPath()
  ctx.moveTo(top[0]!.x, top[0]!.y)
  for (let i = 1; i < top.length; i++) ctx.lineTo(top[i]!.x, top[i]!.y)
  for (let i = bottom.length - 1; i >= 0; i--) ctx.lineTo(bottom[i]!.x, bottom[i]!.y)
  ctx.closePath()
  ctx.fillStyle = '#111'
  ctx.fill()
  ctx.strokeStyle = GREY.LIGHT
  ctx.lineWidth = 1
  ctx.stroke()

  const center: Point2D[] = []
  for (let i = 0; i <= samples; i++) center.push(concoursePt(i / samples))
  strokeDashedSmooth(ctx, center, GREY.DARK, 0.7, [3, 3])

  if (opts.showLabel) {
    const mid = concoursePt(0.48)
    ctx.fillStyle = GREY.DARK
    ctx.font = 'bold 7px -apple-system, Helvetica, Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('CONCOURSE D', mid.x, mid.y + 1)
  }
  ctx.restore()
}

export function drawAllGateRooms(
  ctx: CanvasRenderingContext2D,
  opts: { highlightGate?: number; labelScale?: number } = {},
): void {
  const { highlightGate, labelScale = 1 } = opts
  for (const gate of GATES) {
    const attach = concourseTop(gate.t)
    const up = concourseUpward(gate.t)
    const isHighlight = gate.number === highlightGate
    drawTrapezoidalRoom(ctx, attach, up, 22, 14, 12, {
      stroke: isHighlight ? GREY.WHITE : GREY.LIGHT,
      fill: GREY.BLACK,
      lineWidth: isHighlight ? 1.8 : 1,
    })
    const labelPos = offsetPoint(attach, up, 12)
    ctx.save()
    ctx.fillStyle = isHighlight ? GREY.WHITE : GREY.LIGHT
    ctx.font = `bold ${11 * labelScale}px -apple-system, Helvetica, Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(gate.label, labelPos.x, labelPos.y)
    ctx.restore()
  }
}

export function drawAllPOIRooms(
  ctx: CanvasRenderingContext2D,
  opts: { highlightId?: string; showIcons?: boolean; labelIds?: string[] } = {},
): void {
  const { highlightId, showIcons = true, labelIds = [] } = opts
  for (const poi of POI_INFOS) {
    const center = poiCenter(poi.id, 26)
    const isHighlight = poi.id === highlightId
    drawBlobRoom(ctx, center.x, center.y, 30, 26, poi.shape, {
      stroke: isHighlight ? GREY.WHITE : GREY.LIGHT,
      fill: GREY.BLACK,
      lineWidth: isHighlight ? 1.8 : 1,
    })
    if (showIcons) {
      drawPoiBadge(ctx, poi.category, center.x, center.y, 9)
    }
    if (labelIds.includes(poi.id)) {
      const label = POI_SHORT[poi.id] ?? poi.id
      const labelY = center.y + 16
      drawLabelBelow(ctx, label, center.x, labelY)
    }
  }
}

function drawLabelBelow(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
): void {
  ctx.save()
  ctx.font = 'bold 8px -apple-system, Helvetica, Arial, sans-serif'
  const metrics = ctx.measureText(text)
  const padX = 3
  const padY = 1.5
  const w = metrics.width + padX * 2
  const h = 8 + padY * 2
  ctx.beginPath()
  roundedRectPath(ctx, cx - w / 2, cy - h / 2, w, h, 3)
  ctx.fillStyle = '#000'
  ctx.fill()
  ctx.strokeStyle = GREY.LIGHT
  ctx.lineWidth = 0.8
  ctx.stroke()
  ctx.fillStyle = GREY.LIGHT
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, cx, cy + 0.5)
  ctx.restore()
}

// Draw the base route (whole path, dim white) as a smooth polyline through waypoints.
export function drawBaseRoute(
  ctx: CanvasRenderingContext2D,
  waypoints: Point2D[],
  opts: { width?: number } = {},
): void {
  const width = opts.width ?? 3.4
  strokeSmoothPolyline(ctx, waypoints, '#000', width + 2)
  strokeSmoothPolyline(ctx, waypoints, GREY.WHITE, width)
}

// Draw an active-step overlay over a subsection of the path with emphasis.
export function drawActiveSegment(
  ctx: CanvasRenderingContext2D,
  waypoints: Point2D[],
  opts: { width?: number } = {},
): void {
  const width = opts.width ?? 5.4
  strokeSmoothPolyline(ctx, waypoints, '#000', width + 2)
  strokeSmoothPolyline(ctx, waypoints, GREY.WHITE, width)
}

function strokeDashedSmooth(
  ctx: CanvasRenderingContext2D,
  pts: Point2D[],
  color: string,
  width: number,
  dash: number[],
): void {
  ctx.save()
  ctx.setLineDash(dash)
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.lineCap = 'butt'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  if (pts.length > 0) ctx.moveTo(pts[0]!.x, pts[0]!.y)
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i]!.x, pts[i]!.y)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.restore()
}

// ---------------------------------------------------------------------------
// Route waypoints for the demo journey (D30 -> Starbucks)
// ---------------------------------------------------------------------------

// Each "leg" is a list of waypoints. Legs connect end-to-end.
export interface RouteLeg {
  waypoints: Point2D[]
}

export function buildDemoRoute(): RouteLeg[] {
  const gateD30 = findGate(30)!
  const starbucksInfo = findPoiInfo('CAFE_STARBUCKS')!

  const gateCenterPt = gateCenter(30)
  const d30Top = concourseTop(gateD30.t)
  const d30Middle = concoursePt(gateD30.t)

  // West traversal sampled along concourse
  const traverseMid1 = concoursePt(0.52)
  const traverseMid2 = concoursePt(0.4)
  const traverseEnd = concoursePt(0.3)

  const starbucksTop = concourseBottom(starbucksInfo.t)
  const starbucksCenter = poiCenter('CAFE_STARBUCKS')
  const hallwayAtStarbucks = concoursePt(starbucksInfo.t)

  const legs: RouteLeg[] = [
    // Leg 1: exit D30 room into the hallway
    { waypoints: [gateCenterPt, d30Top, d30Middle, traverseMid1] },
    // Leg 2: west traversal
    { waypoints: [traverseMid1, traverseMid2] },
    // Leg 3: approach Starbucks
    { waypoints: [traverseMid2, traverseEnd, hallwayAtStarbucks] },
    // Leg 4: turn into Starbucks
    { waypoints: [hallwayAtStarbucks, starbucksTop, starbucksCenter] },
  ]

  void CANVAS_H
  void CANVAS_W
  return legs
}

export function routeWaypoints(legs: RouteLeg[]): Point2D[] {
  const all: Point2D[] = []
  for (let i = 0; i < legs.length; i++) {
    const leg = legs[i]!
    if (i === 0) all.push(...leg.waypoints)
    else all.push(...leg.waypoints.slice(1))
  }
  return all
}
