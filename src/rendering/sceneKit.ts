import type { POICategory, Point2D } from '../types'
import { GREY, IMAGE_WIDTH, IMAGE_HEIGHT } from './canvasUtils'

export const CANVAS_W = IMAGE_WIDTH
export const CANVAS_H = IMAGE_HEIGHT

// ---------------------------------------------------------------------------
// Bezier + path helpers
// ---------------------------------------------------------------------------

export function bezierPoint(
  p0: Point2D,
  p1: Point2D,
  p2: Point2D,
  p3: Point2D,
  t: number,
): Point2D {
  const u = 1 - t
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  }
}

export function bezierTangent(
  p0: Point2D,
  p1: Point2D,
  p2: Point2D,
  p3: Point2D,
  t: number,
): Point2D {
  const u = 1 - t
  let x = 3 * u * u * (p1.x - p0.x) + 6 * u * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x)
  let y = 3 * u * u * (p1.y - p0.y) + 6 * u * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y)
  const len = Math.hypot(x, y) || 1
  x /= len
  y /= len
  return { x, y }
}

export function bezierPerp(
  p0: Point2D,
  p1: Point2D,
  p2: Point2D,
  p3: Point2D,
  t: number,
): Point2D {
  const tan = bezierTangent(p0, p1, p2, p3, t)
  return { x: -tan.y, y: tan.x }
}

export function offsetPoint(p: Point2D, dir: Point2D, dist: number): Point2D {
  return { x: p.x + dir.x * dist, y: p.y + dir.y * dist }
}

export function distance(a: Point2D, b: Point2D): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

// Render a smoothed polyline through a list of waypoints using a simple
// Catmull-Rom to bezier conversion. This gives natural-looking bends in
// route paths instead of hard corners.
export function strokeSmoothPolyline(
  ctx: CanvasRenderingContext2D,
  pts: Point2D[],
  color: string,
  lineWidth: number,
): void {
  if (pts.length < 2) return
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  if (pts.length === 2) {
    ctx.moveTo(pts[0]!.x, pts[0]!.y)
    ctx.lineTo(pts[1]!.x, pts[1]!.y)
  } else {
    ctx.moveTo(pts[0]!.x, pts[0]!.y)
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] ?? pts[i]!
      const p1 = pts[i]!
      const p2 = pts[i + 1]!
      const p3 = pts[i + 2] ?? p2
      const c1x = p1.x + (p2.x - p0.x) / 6
      const c1y = p1.y + (p2.y - p0.y) / 6
      const c2x = p2.x - (p3.x - p1.x) / 6
      const c2y = p2.y - (p3.y - p1.y) / 6
      ctx.bezierCurveTo(c1x, c1y, c2x, c2y, p2.x, p2.y)
    }
  }
  ctx.stroke()
  ctx.restore()
}

// ---------------------------------------------------------------------------
// Shape primitives
// ---------------------------------------------------------------------------

export function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
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

// Trapezoid attached to a centerline point. The "base" sits on the attach
// point, the "cap" is `height` pixels above in the direction of `up`.
// `baseHalf` is half-width at the base, `capHalf` at the cap.
export function drawTrapezoidalRoom(
  ctx: CanvasRenderingContext2D,
  attach: Point2D,
  up: Point2D,
  height: number,
  baseHalf: number,
  capHalf: number,
  opts: { fill?: string; stroke?: string; lineWidth?: number } = {},
): { center: Point2D; cornerRadius: number } {
  const { fill = GREY.BLACK, stroke = GREY.LIGHT, lineWidth = 1.2 } = opts
  const perp: Point2D = { x: -up.y, y: up.x }
  const b0 = { x: attach.x + perp.x * baseHalf, y: attach.y + perp.y * baseHalf }
  const b1 = { x: attach.x - perp.x * baseHalf, y: attach.y - perp.y * baseHalf }
  const cBase = { x: attach.x + up.x * height, y: attach.y + up.y * height }
  const c0 = { x: cBase.x + perp.x * capHalf, y: cBase.y + perp.y * capHalf }
  const c1 = { x: cBase.x - perp.x * capHalf, y: cBase.y - perp.y * capHalf }
  const r = 3
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(b0.x, b0.y)
  ctx.lineTo(b1.x, b1.y)
  ctx.arcTo(c1.x, c1.y, c0.x, c0.y, r)
  ctx.lineTo(c0.x, c0.y)
  ctx.arcTo(c0.x, c0.y, b0.x, b0.y, r)
  ctx.closePath()
  ctx.fillStyle = fill
  ctx.fill()
  ctx.strokeStyle = stroke
  ctx.lineWidth = lineWidth
  ctx.stroke()
  ctx.restore()
  const cx = (c0.x + c1.x) / 2
  const cy = (c0.y + c1.y) / 2
  const midx = (cx + attach.x) / 2
  const midy = (cy + attach.y) / 2
  return { center: { x: midx, y: midy }, cornerRadius: r }
}

// Blob-shaped POI room: rounded rectangle with one edge softened.
export function drawBlobRoom(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number,
  variant: 'round' | 'notched' | 'hex',
  opts: { fill?: string; stroke?: string; lineWidth?: number } = {},
): void {
  const { fill = GREY.BLACK, stroke = GREY.LIGHT, lineWidth = 1.2 } = opts
  const x = cx - w / 2
  const y = cy - h / 2
  ctx.save()
  ctx.beginPath()
  switch (variant) {
    case 'round':
      // Near-circular rounded rectangle
      roundedRectPath(ctx, x, y, w, h, Math.min(w, h) / 2.4)
      break
    case 'notched': {
      const r = 4
      const notch = h * 0.3
      ctx.moveTo(x + r, y)
      ctx.lineTo(x + w - r, y)
      ctx.arcTo(x + w, y, x + w, y + r, r)
      ctx.lineTo(x + w, y + h - r)
      ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
      ctx.lineTo(x + w / 2 + notch / 2, y + h)
      ctx.lineTo(x + w / 2, y + h - notch / 2)
      ctx.lineTo(x + w / 2 - notch / 2, y + h)
      ctx.lineTo(x + r, y + h)
      ctx.arcTo(x, y + h, x, y + h - r, r)
      ctx.lineTo(x, y + r)
      ctx.arcTo(x, y, x + r, y, r)
      ctx.closePath()
      break
    }
    case 'hex': {
      const r = 3
      const bevel = Math.min(w, h) * 0.22
      ctx.moveTo(x + bevel, y)
      ctx.lineTo(x + w - bevel, y)
      ctx.arcTo(x + w, y, x + w, y + bevel, r)
      ctx.lineTo(x + w, y + h - bevel)
      ctx.arcTo(x + w, y + h, x + w - bevel, y + h, r)
      ctx.lineTo(x + bevel, y + h)
      ctx.arcTo(x, y + h, x, y + h - bevel, r)
      ctx.lineTo(x, y + bevel)
      ctx.arcTo(x, y, x + bevel, y, r)
      ctx.closePath()
      break
    }
  }
  ctx.fillStyle = fill
  ctx.fill()
  ctx.strokeStyle = stroke
  ctx.lineWidth = lineWidth
  ctx.stroke()
  ctx.restore()
}

// ---------------------------------------------------------------------------
// Icons + chrome
// ---------------------------------------------------------------------------

export function drawPoiBadge(
  ctx: CanvasRenderingContext2D,
  category: POICategory,
  cx: number,
  cy: number,
  radius: number,
): void {
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, radius + 1.3, 0, Math.PI * 2)
  ctx.fillStyle = GREY.BLACK
  ctx.fill()
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.fillStyle = GREY.WHITE
  ctx.fill()

  ctx.fillStyle = GREY.BLACK
  ctx.strokeStyle = GREY.BLACK

  const s = radius
  switch (category) {
    case 'gate':
      drawPlaneGlyph(ctx, cx, cy, s)
      break
    case 'cafe':
      drawCupGlyph(ctx, cx, cy, s)
      break
    case 'lounge':
      drawChairGlyph(ctx, cx, cy, s)
      break
    case 'restaurant':
      drawForkGlyph(ctx, cx, cy, s)
      break
  }
  ctx.restore()
}

function drawPlaneGlyph(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number): void {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(-Math.PI / 8)
  ctx.beginPath()
  ctx.moveTo(-s * 0.8, 0)
  ctx.lineTo(s * 0.6, -s * 0.22)
  ctx.lineTo(s * 0.85, 0)
  ctx.lineTo(s * 0.6, s * 0.22)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(-s * 0.15, -s * 0.6)
  ctx.lineTo(s * 0.2, -s * 0.6)
  ctx.lineTo(s * 0.35, 0)
  ctx.lineTo(s * 0.0, 0)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(-s * 0.55, s * 0.5)
  ctx.lineTo(-s * 0.25, s * 0.5)
  ctx.lineTo(-s * 0.1, 0)
  ctx.lineTo(-s * 0.4, 0)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function drawCupGlyph(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number): void {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.beginPath()
  ctx.moveTo(-s * 0.55, -s * 0.4)
  ctx.lineTo(s * 0.35, -s * 0.4)
  ctx.lineTo(s * 0.35, s * 0.25)
  ctx.quadraticCurveTo(s * 0.35, s * 0.6, s * 0.05, s * 0.6)
  ctx.lineTo(-s * 0.35, s * 0.6)
  ctx.quadraticCurveTo(-s * 0.55, s * 0.6, -s * 0.55, s * 0.25)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.strokeStyle = GREY.BLACK
  ctx.lineWidth = Math.max(1, s * 0.2)
  ctx.arc(s * 0.55, 0, s * 0.25, -Math.PI / 2, Math.PI / 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.lineWidth = Math.max(0.8, s * 0.12)
  ctx.moveTo(-s * 0.25, -s * 0.75)
  ctx.quadraticCurveTo(-s * 0.1, -s * 0.55, -s * 0.25, -s * 0.45)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(s * 0.05, -s * 0.75)
  ctx.quadraticCurveTo(s * 0.2, -s * 0.55, s * 0.05, -s * 0.45)
  ctx.stroke()
  ctx.restore()
}

function drawChairGlyph(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number): void {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.beginPath()
  ctx.moveTo(-s * 0.65, -s * 0.55)
  ctx.lineTo(-s * 0.3, -s * 0.55)
  ctx.lineTo(-s * 0.3, s * 0.05)
  ctx.lineTo(s * 0.55, s * 0.05)
  ctx.lineTo(s * 0.55, s * 0.6)
  ctx.lineTo(s * 0.2, s * 0.6)
  ctx.lineTo(s * 0.2, s * 0.35)
  ctx.lineTo(-s * 0.3, s * 0.35)
  ctx.lineTo(-s * 0.3, s * 0.6)
  ctx.lineTo(-s * 0.65, s * 0.6)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(s * 0.3, -s * 0.35)
  ctx.lineTo(s * 0.65, -s * 0.35)
  ctx.lineTo(s * 0.65, s * 0.05)
  ctx.lineTo(s * 0.3, s * 0.05)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function drawForkGlyph(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number): void {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.lineWidth = Math.max(1, s * 0.18)
  ctx.strokeStyle = GREY.BLACK
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath()
    ctx.moveTo(i * s * 0.28, -s * 0.65)
    ctx.lineTo(i * s * 0.28, -s * 0.1)
    ctx.stroke()
  }
  ctx.beginPath()
  ctx.moveTo(-s * 0.4, -s * 0.1)
  ctx.lineTo(s * 0.4, -s * 0.1)
  ctx.lineTo(s * 0.18, s * 0.15)
  ctx.lineTo(s * 0.12, s * 0.75)
  ctx.lineTo(-s * 0.12, s * 0.75)
  ctx.lineTo(-s * 0.18, s * 0.15)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

export function drawStartPin(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
): void {
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, r + 1.8, 0, Math.PI * 2)
  ctx.fillStyle = GREY.BLACK
  ctx.fill()
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fillStyle = GREY.WHITE
  ctx.fill()
  ctx.beginPath()
  ctx.arc(cx, cy, r * 0.45, 0, Math.PI * 2)
  ctx.fillStyle = GREY.BLACK
  ctx.fill()
  ctx.restore()
}

export function drawEndPin(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
): void {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.beginPath()
  ctx.ellipse(0, r * 0.4, r * 0.4, r * 0.15, 0, 0, Math.PI * 2)
  ctx.fillStyle = GREY.DARK
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(0, -r * 2.3)
  ctx.quadraticCurveTo(r * 1.1, -r * 2.3, r * 1.05, -r * 1.0)
  ctx.quadraticCurveTo(r * 0.9, -r * 0.1, 0, r * 0.4)
  ctx.quadraticCurveTo(-r * 0.9, -r * 0.1, -r * 1.05, -r * 1.0)
  ctx.quadraticCurveTo(-r * 1.1, -r * 2.3, 0, -r * 2.3)
  ctx.closePath()
  ctx.fillStyle = GREY.BLACK
  ctx.fill()
  ctx.strokeStyle = GREY.WHITE
  ctx.lineWidth = 1.4
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(0, -r * 1.35, r * 0.5, 0, Math.PI * 2)
  ctx.fillStyle = GREY.WHITE
  ctx.fill()
  ctx.restore()
}

export function drawChevronArrow(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  angleRad: number,
  size: number,
): void {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(angleRad)
  ctx.beginPath()
  ctx.moveTo(-size * 0.8, -size * 0.9)
  ctx.lineTo(size * 0.9, 0)
  ctx.lineTo(-size * 0.8, size * 0.9)
  ctx.lineTo(-size * 0.3, 0)
  ctx.closePath()
  ctx.fillStyle = GREY.WHITE
  ctx.fill()
  ctx.strokeStyle = GREY.BLACK
  ctx.lineWidth = 1.2
  ctx.stroke()
  ctx.restore()
}

export function drawCompass(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
): void {
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, size, 0, Math.PI * 2)
  ctx.strokeStyle = GREY.DARK
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(cx, cy - size * 0.9)
  ctx.lineTo(cx - size * 0.45, cy + size * 0.2)
  ctx.lineTo(cx, cy - size * 0.2)
  ctx.closePath()
  ctx.fillStyle = GREY.WHITE
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(cx, cy - size * 0.9)
  ctx.lineTo(cx + size * 0.45, cy + size * 0.2)
  ctx.lineTo(cx, cy - size * 0.2)
  ctx.closePath()
  ctx.fillStyle = GREY.LIGHT
  ctx.fill()

  ctx.fillStyle = GREY.LIGHT
  ctx.font = 'bold 7px -apple-system, Helvetica, Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('N', cx, cy - size - 3)
  ctx.restore()
}

export function drawLabelChip(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  opts: { bold?: boolean; size?: number; color?: string; align?: CanvasTextAlign } = {},
): void {
  const { bold = false, size = 8, color = GREY.LIGHT, align = 'center' } = opts
  ctx.save()
  ctx.font = `${bold ? 'bold ' : ''}${size}px -apple-system, Helvetica, Arial, sans-serif`
  ctx.textAlign = align
  ctx.textBaseline = 'middle'
  ctx.fillStyle = color
  ctx.fillText(text, cx, cy)
  ctx.restore()
}

export function drawPillLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  opts: { size?: number } = {},
): void {
  const size = opts.size ?? 8
  ctx.save()
  ctx.font = `bold ${size}px -apple-system, Helvetica, Arial, sans-serif`
  const metrics = ctx.measureText(text)
  const padX = 4
  const padY = 2
  const w = metrics.width + padX * 2
  const h = size + padY * 2
  ctx.beginPath()
  roundedRectPath(ctx, cx - w / 2, cy - h / 2, w, h, h / 2)
  ctx.fillStyle = GREY.BLACK
  ctx.fill()
  ctx.strokeStyle = GREY.LIGHT
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.fillStyle = GREY.LIGHT
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, cx, cy + 0.5)
  ctx.restore()
}

// ---------------------------------------------------------------------------
// Hatched background (adds a Wayfinder-like "floor" texture)
// ---------------------------------------------------------------------------

export function drawHatchedArea(
  ctx: CanvasRenderingContext2D,
  path: (ctx: CanvasRenderingContext2D) => void,
  color: string,
): void {
  ctx.save()
  path(ctx)
  ctx.clip()
  ctx.strokeStyle = color
  ctx.lineWidth = 0.6
  ctx.setLineDash([1, 3])
  for (let y = -CANVAS_H; y < CANVAS_H * 2; y += 4) {
    ctx.beginPath()
    ctx.moveTo(-CANVAS_W, y)
    ctx.lineTo(CANVAS_W * 2, y + CANVAS_W * 2)
    ctx.stroke()
  }
  ctx.setLineDash([])
  ctx.restore()
}
