import { GREY } from './canvasUtils'
import type { POICategory } from '../types'

export function drawPoiMarker(
  ctx: CanvasRenderingContext2D,
  category: POICategory,
  cx: number,
  cy: number,
  radius: number,
): void {
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, radius + 1, 0, Math.PI * 2)
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
  ctx.beginPath()
  ctx.moveTo(-s * 0.75, 0)
  ctx.lineTo(s * 0.65, -s * 0.15)
  ctx.lineTo(s * 0.75, 0)
  ctx.lineTo(s * 0.65, s * 0.15)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(-s * 0.25, -s * 0.55)
  ctx.lineTo(s * 0.1, -s * 0.55)
  ctx.lineTo(s * 0.25, 0)
  ctx.lineTo(-s * 0.1, 0)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(-s * 0.55, s * 0.45)
  ctx.lineTo(-s * 0.25, s * 0.45)
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
  ctx.moveTo(-s * 0.5, -s * 0.45)
  ctx.lineTo(s * 0.35, -s * 0.45)
  ctx.lineTo(s * 0.35, s * 0.25)
  ctx.quadraticCurveTo(s * 0.35, s * 0.55, s * 0.1, s * 0.55)
  ctx.lineTo(-s * 0.3, s * 0.55)
  ctx.quadraticCurveTo(-s * 0.5, s * 0.55, -s * 0.5, s * 0.25)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.lineWidth = Math.max(1, s * 0.18)
  ctx.strokeStyle = GREY.BLACK
  ctx.arc(s * 0.55, 0, s * 0.25, -Math.PI / 2, Math.PI / 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.strokeStyle = GREY.BLACK
  ctx.lineWidth = Math.max(0.8, s * 0.12)
  ctx.moveTo(-s * 0.25, -s * 0.7)
  ctx.quadraticCurveTo(-s * 0.15, -s * 0.6, -s * 0.25, -s * 0.5)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(s * 0.0, -s * 0.7)
  ctx.quadraticCurveTo(s * 0.1, -s * 0.6, s * 0.0, -s * 0.5)
  ctx.stroke()
  ctx.restore()
}

function drawChairGlyph(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number): void {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.beginPath()
  ctx.moveTo(-s * 0.6, -s * 0.55)
  ctx.lineTo(-s * 0.25, -s * 0.55)
  ctx.lineTo(-s * 0.25, 0)
  ctx.lineTo(s * 0.5, 0)
  ctx.lineTo(s * 0.5, s * 0.55)
  ctx.lineTo(s * 0.15, s * 0.55)
  ctx.lineTo(s * 0.15, s * 0.3)
  ctx.lineTo(-s * 0.25, s * 0.3)
  ctx.lineTo(-s * 0.25, s * 0.55)
  ctx.lineTo(-s * 0.6, s * 0.55)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(s * 0.25, -s * 0.3)
  ctx.lineTo(s * 0.6, -s * 0.3)
  ctx.lineTo(s * 0.6, 0)
  ctx.lineTo(s * 0.25, 0)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function drawForkGlyph(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number): void {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.lineWidth = Math.max(0.8, s * 0.14)
  ctx.strokeStyle = GREY.BLACK
  const tineY0 = -s * 0.6
  const tineY1 = -s * 0.1
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath()
    ctx.moveTo(i * s * 0.28, tineY0)
    ctx.lineTo(i * s * 0.28, tineY1)
    ctx.stroke()
  }
  ctx.beginPath()
  ctx.moveTo(-s * 0.4, tineY1)
  ctx.lineTo(s * 0.4, tineY1)
  ctx.lineTo(s * 0.18, s * 0.1)
  ctx.lineTo(s * 0.12, s * 0.7)
  ctx.lineTo(-s * 0.12, s * 0.7)
  ctx.lineTo(-s * 0.18, s * 0.1)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

export function drawStartPin(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, r + 1.5, 0, Math.PI * 2)
  ctx.fillStyle = GREY.BLACK
  ctx.fill()
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fillStyle = GREY.WHITE
  ctx.fill()
  ctx.beginPath()
  ctx.arc(cx, cy, r * 0.42, 0, Math.PI * 2)
  ctx.fillStyle = GREY.BLACK
  ctx.fill()
  ctx.restore()
}

export function drawEndPin(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
  ctx.save()
  ctx.translate(cx, cy)

  ctx.beginPath()
  ctx.ellipse(0, r * 0.4, r * 0.35, r * 0.14, 0, 0, Math.PI * 2)
  ctx.fillStyle = GREY.DARK
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(0, -r * 2.2)
  ctx.quadraticCurveTo(r, -r * 2.2, r * 1.0, -r * 1.0)
  ctx.quadraticCurveTo(r * 0.9, -r * 0.1, 0, r * 0.4)
  ctx.quadraticCurveTo(-r * 0.9, -r * 0.1, -r * 1.0, -r * 1.0)
  ctx.quadraticCurveTo(-r, -r * 2.2, 0, -r * 2.2)
  ctx.closePath()
  ctx.fillStyle = GREY.BLACK
  ctx.lineWidth = 1
  ctx.fill()
  ctx.strokeStyle = GREY.WHITE
  ctx.lineWidth = 1.2
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(0, -r * 1.3, r * 0.45, 0, Math.PI * 2)
  ctx.fillStyle = GREY.WHITE
  ctx.fill()
  ctx.restore()
}

export function drawChevron(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  angleRad: number,
  size = 6,
): void {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(angleRad)
  ctx.beginPath()
  ctx.moveTo(-size * 0.7, -size * 0.8)
  ctx.lineTo(size * 0.7, 0)
  ctx.lineTo(-size * 0.7, size * 0.8)
  ctx.lineTo(-size * 0.25, 0)
  ctx.closePath()
  ctx.fillStyle = GREY.BLACK
  ctx.fill()
  ctx.strokeStyle = GREY.WHITE
  ctx.lineWidth = 1.2
  ctx.stroke()
  ctx.restore()
}
