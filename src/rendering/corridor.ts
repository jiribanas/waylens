import type { Point2D, Route, RouteStep } from '../types'
import { POIS, findPoi } from '../data/pois'
import { allRouteWaypoints } from '../data/routes'
import {
  CONCOURSE_HALLWAY,
  GATE_ROOMS,
  POI_ROOMS,
  Rect,
  Viewport,
  fitViewportToAspect,
  fullWorldViewport,
  scaleFactor,
  worldToCanvas,
} from './world'
import { GREY, IMAGE_HEIGHT, IMAGE_WIDTH, clearCanvas, createCanvas, drawText } from './canvasUtils'
import { drawChevron, drawEndPin, drawPoiMarker, drawStartPin } from './icons'

export const CANVAS_WIDTH = IMAGE_WIDTH
export const CANVAS_HEIGHT = IMAGE_HEIGHT
export const CANVAS_ASPECT = CANVAS_WIDTH / CANVAS_HEIGHT

export interface SceneOpts {
  viewport?: Viewport
  route?: Route
  activeStepIndex?: number
  showLabels?: boolean
  showPoiIcons?: boolean
  labelWhitelist?: ReadonlySet<string>
}

export function createSceneCanvas(): HTMLCanvasElement {
  return createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT)
}

function transform(p: Point2D, vp: Viewport): Point2D {
  return worldToCanvas(p, vp, CANVAS_WIDTH, CANVAS_HEIGHT)
}

function transformRect(r: Rect, vp: Viewport): Rect {
  const topLeft = transform({ x: r.x, y: r.y }, vp)
  const size = transform({ x: r.x + r.w, y: r.y + r.h }, vp)
  return { x: topLeft.x, y: topLeft.y, w: size.x - topLeft.x, h: size.y - topLeft.y, label: r.label }
}

export function drawScene(ctx: CanvasRenderingContext2D, rawOpts: SceneOpts): void {
  const viewport = fitViewportToAspect(rawOpts.viewport ?? fullWorldViewport(), CANVAS_ASPECT)
  const opts = {
    route: rawOpts.route,
    activeStepIndex: rawOpts.activeStepIndex ?? -1,
    showLabels: rawOpts.showLabels ?? true,
    showPoiIcons: rawOpts.showPoiIcons ?? true,
    labelWhitelist: rawOpts.labelWhitelist,
    viewport,
  }
  const vp = opts.viewport
  const scale = scaleFactor(vp, CANVAS_WIDTH)

  clearCanvas(ctx)
  drawHallway(ctx, vp, scale)
  drawGateRooms(ctx, vp, scale)
  drawPoiRooms(ctx, vp, scale)
  if (opts.route) {
    drawRouteBase(ctx, opts.route, vp, scale)
    if (opts.activeStepIndex >= 0) {
      drawActiveStep(ctx, opts.route.steps[opts.activeStepIndex], vp, scale)
    }
  }
  if (opts.showPoiIcons) {
    drawPoiBadges(ctx, vp, scale, opts.showLabels, opts.labelWhitelist)
  }
  if (opts.route) {
    drawRouteEndpoints(ctx, opts.route, vp, scale)
  }
}

// ---------------------------------------------------------------------------
// Hallway (the walkable concourse)
// ---------------------------------------------------------------------------

function drawHallway(ctx: CanvasRenderingContext2D, vp: Viewport, scale: number): void {
  const h = transformRect(CONCOURSE_HALLWAY, vp)
  ctx.save()
  ctx.strokeStyle = GREY.LIGHT
  ctx.lineWidth = Math.max(1.2, scale * 0.3)
  roundedRect(ctx, h.x, h.y, h.w, h.h, 4)
  ctx.stroke()

  const centerY = h.y + h.h / 2
  ctx.save()
  ctx.strokeStyle = GREY.DARK
  ctx.lineWidth = Math.max(0.8, scale * 0.2)
  ctx.setLineDash([5, 5])
  ctx.beginPath()
  ctx.moveTo(h.x + 4, centerY)
  ctx.lineTo(h.x + h.w - 4, centerY)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.restore()
  ctx.restore()
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  const radius = Math.max(0, Math.min(r, Math.min(w, h) / 2))
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + w - radius, y)
  ctx.arcTo(x + w, y, x + w, y + radius, radius)
  ctx.lineTo(x + w, y + h - radius)
  ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius)
  ctx.lineTo(x + radius, y + h)
  ctx.arcTo(x, y + h, x, y + h - radius, radius)
  ctx.lineTo(x, y + radius)
  ctx.arcTo(x, y, x + radius, y, radius)
  ctx.closePath()
}

// ---------------------------------------------------------------------------
// Gate rooms (above hallway)
// ---------------------------------------------------------------------------

function drawGateRooms(ctx: CanvasRenderingContext2D, vp: Viewport, scale: number): void {
  const fontSize = Math.max(8, Math.min(16, scale * 3.2))
  for (const gate of GATE_ROOMS) {
    const r = transformRect(gate.rect, vp)
    if (r.x + r.w < 0 || r.x > CANVAS_WIDTH) continue
    ctx.save()
    ctx.strokeStyle = GREY.LIGHT
    ctx.lineWidth = Math.max(1, scale * 0.22)
    roundedRect(ctx, r.x, r.y, r.w, r.h, 2)
    ctx.stroke()
    if (gate.rect.label && scale >= 0.8) {
      drawText(ctx, gate.rect.label, r.x + r.w / 2, r.y + r.h / 2 + fontSize * 0.35, {
        color: GREY.LIGHT,
        size: fontSize,
        bold: true,
        align: 'center',
      })
    }
    ctx.restore()
  }
}

// ---------------------------------------------------------------------------
// POI rooms (below hallway)
// ---------------------------------------------------------------------------

function drawPoiRooms(ctx: CanvasRenderingContext2D, vp: Viewport, scale: number): void {
  for (const room of POI_ROOMS) {
    const r = transformRect(room.rect, vp)
    if (r.x + r.w < 0 || r.x > CANVAS_WIDTH) continue
    ctx.save()
    ctx.strokeStyle = GREY.DARK
    ctx.lineWidth = Math.max(1, scale * 0.18)
    roundedRect(ctx, r.x, r.y, r.w, r.h, 2)
    ctx.stroke()
    ctx.restore()
  }
}

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

function strokePath(ctx: CanvasRenderingContext2D, wps: Point2D[], vp: Viewport, width: number, color: string): void {
  if (wps.length < 2) return
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  for (let i = 0; i < wps.length; i++) {
    const c = transform(wps[i]!, vp)
    if (i === 0) ctx.moveTo(c.x, c.y)
    else ctx.lineTo(c.x, c.y)
  }
  ctx.stroke()
  ctx.restore()
}

function drawRouteBase(ctx: CanvasRenderingContext2D, route: Route, vp: Viewport, scale: number): void {
  const wps = allRouteWaypoints(route)
  if (wps.length < 2) return
  const width = Math.max(3, scale * 2.2)
  strokePath(ctx, wps, vp, width + 2, GREY.BLACK)
  strokePath(ctx, wps, vp, width, GREY.WHITE)
}

function drawActiveStep(ctx: CanvasRenderingContext2D, step: RouteStep | undefined, vp: Viewport, scale: number): void {
  if (!step) return
  const wps = step.waypoints
  if (wps.length < 2) return
  const width = Math.max(4, scale * 3.2)
  strokePath(ctx, wps, vp, width + 2, GREY.BLACK)
  strokePath(ctx, wps, vp, width, GREY.WHITE)

  const last = wps[wps.length - 1]!
  const prev = wps[wps.length - 2]!
  const finalC = transform(last, vp)
  const prevC = transform(prev, vp)
  const angle = Math.atan2(finalC.y - prevC.y, finalC.x - prevC.x)
  if (step.direction !== 'arrive') {
    const arrowSize = Math.max(6, scale * 3.2)
    const offset = arrowSize * 0.35
    const ax = finalC.x - Math.cos(angle) * offset
    const ay = finalC.y - Math.sin(angle) * offset
    drawChevron(ctx, ax, ay, angle, arrowSize)
  }
}

function drawRouteEndpoints(ctx: CanvasRenderingContext2D, route: Route, vp: Viewport, scale: number): void {
  if (route.steps.length === 0) return
  const firstStep = route.steps[0]!
  const lastStep = route.steps[route.steps.length - 1]!
  const first = firstStep.waypoints[0]
  const last = lastStep.waypoints.slice(-1)[0]
  const size = Math.max(5, scale * 3.2)
  if (first) {
    const c = transform(first, vp)
    drawStartPin(ctx, c.x, c.y, size)
  }
  if (last) {
    const c = transform(last, vp)
    drawEndPin(ctx, c.x, c.y, size)
  }
}

// ---------------------------------------------------------------------------
// POIs (large circular badges in the room)
// ---------------------------------------------------------------------------

function drawPoiBadges(
  ctx: CanvasRenderingContext2D,
  vp: Viewport,
  scale: number,
  showLabels: boolean,
  labelWhitelist?: ReadonlySet<string>,
): void {
  const radius = Math.max(6, scale * 4)
  for (const poi of POIS) {
    if (poi.category === 'gate') continue
    const c = transform(poi.position, vp)
    if (c.x < -radius * 2 || c.x > CANVAS_WIDTH + radius * 2) continue
    if (c.y < -radius * 2 || c.y > CANVAS_HEIGHT + radius * 2) continue
    drawPoiMarker(ctx, poi.category, c.x, c.y, radius)
    const shouldLabel = showLabels && (labelWhitelist ? labelWhitelist.has(poi.id) : scale >= 2.5)
    if (shouldLabel) {
      drawText(ctx, poi.shortName, c.x, c.y + radius + 8, {
        color: GREY.LIGHT,
        size: Math.max(7, Math.round(scale * 2.2)),
        align: 'center',
        bold: true,
      })
    }
  }
}

// ---------------------------------------------------------------------------
// Compat re-exports
// ---------------------------------------------------------------------------

export function drawCorridorScene(ctx: CanvasRenderingContext2D, opts: SceneOpts): void {
  drawScene(ctx, opts)
}

export function poiShortNameById(id: string): string | undefined {
  return findPoi(id)?.shortName
}
