import type { POI, Route, RouteStep } from '../types'
import { POIS } from '../data/pois'
import { GREY, clearCanvas, drawFilledCircle, drawRing, drawText, createCanvas } from './canvasUtils'

export interface CorridorWindow {
  minX: number
  maxX: number
}

export interface CorridorDrawOpts {
  window: CorridorWindow
  route?: Route
  activeStepIndex?: number
  title?: string
  subtitle?: string
  poisToLabel?: POI[]
  tickEveryGates?: number
}

function xToPixel(x: number, minX: number, maxX: number, width: number, pad: number): number {
  const span = Math.max(1, maxX - minX)
  return pad + ((x - minX) / span) * (width - pad * 2)
}

export function drawCorridorScene(
  ctx: CanvasRenderingContext2D,
  opts: CorridorDrawOpts,
): void {
  const { width, height } = ctx.canvas
  const { minX, maxX } = opts.window
  const pad = 12

  clearCanvas(ctx)

  const corridorY = Math.round(height * 0.55)
  const corridorHeight = 6
  ctx.fillStyle = GREY.DARK
  ctx.fillRect(pad, corridorY - corridorHeight / 2, width - pad * 2, corridorHeight)

  const tickEvery = opts.tickEveryGates ?? 5
  const firstTick = Math.ceil(minX / tickEvery) * tickEvery
  for (let g = firstTick; g <= maxX; g += tickEvery) {
    const px = xToPixel(g, minX, maxX, width, pad)
    ctx.fillStyle = GREY.LIGHT
    ctx.fillRect(px - 0.5, corridorY - corridorHeight / 2 - 3, 1, corridorHeight + 6)
    drawText(ctx, `D${g}`, px, corridorY + corridorHeight + 12, {
      color: GREY.LIGHT,
      size: 9,
      align: 'center',
      baseline: 'alphabetic',
    })
  }

  const shownPois = opts.poisToLabel ?? POIS.filter((p) => p.category !== 'gate' && p.corridorX >= minX && p.corridorX <= maxX)
  for (const poi of shownPois) {
    const px = xToPixel(poi.corridorX, minX, maxX, width, pad)
    drawFilledCircle(ctx, px, corridorY - corridorHeight / 2 - 8, 2.5, GREY.LIGHT)
  }

  if (opts.route) {
    drawRoute(ctx, opts.route, minX, maxX, width, pad, corridorY)
    if (opts.activeStepIndex !== undefined) {
      drawActiveStepHighlight(ctx, opts.route.steps[opts.activeStepIndex], minX, maxX, width, pad, corridorY)
    }
  }

  if (opts.title) {
    drawText(ctx, opts.title, pad, 14, { color: GREY.WHITE, size: 12, bold: true, baseline: 'alphabetic' })
  }
  if (opts.subtitle) {
    drawText(ctx, opts.subtitle, pad, 28, { color: GREY.LIGHT, size: 10, baseline: 'alphabetic' })
  }
}

function drawRoute(
  ctx: CanvasRenderingContext2D,
  route: Route,
  minX: number,
  maxX: number,
  width: number,
  pad: number,
  corridorY: number,
): void {
  if (route.steps.length === 0) return

  const startX = route.steps[0]!.fromX
  const endX = route.steps[route.steps.length - 1]!.toX
  const startPx = xToPixel(startX, minX, maxX, width, pad)
  const endPx = xToPixel(endX, minX, maxX, width, pad)

  ctx.strokeStyle = GREY.WHITE
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(startPx, corridorY)
  ctx.lineTo(endPx, corridorY)
  ctx.stroke()

  drawFilledCircle(ctx, startPx, corridorY, 4, GREY.WHITE)
  drawRing(ctx, endPx, corridorY, 5, GREY.WHITE, 2)
  drawFilledCircle(ctx, endPx, corridorY, 2, GREY.WHITE)
}

function drawActiveStepHighlight(
  ctx: CanvasRenderingContext2D,
  step: RouteStep | undefined,
  minX: number,
  maxX: number,
  width: number,
  pad: number,
  corridorY: number,
): void {
  if (!step) return
  const fromPx = xToPixel(step.fromX, minX, maxX, width, pad)
  const toPx = xToPixel(step.toX, minX, maxX, width, pad)

  ctx.strokeStyle = GREY.WHITE
  ctx.lineWidth = 5
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(fromPx, corridorY)
  ctx.lineTo(toPx, corridorY)
  ctx.stroke()

  drawFilledCircle(ctx, fromPx, corridorY, 5, GREY.WHITE)

  const goesLeft = step.toX < step.fromX
  const arrowSize = 6
  const arrowX = toPx
  const tipX = arrowX + (goesLeft ? -arrowSize : arrowSize)
  ctx.fillStyle = GREY.WHITE
  ctx.beginPath()
  ctx.moveTo(tipX, corridorY)
  ctx.lineTo(arrowX, corridorY - arrowSize)
  ctx.lineTo(arrowX, corridorY + arrowSize)
  ctx.closePath()
  ctx.fill()
}

export function createSceneCanvas(): HTMLCanvasElement {
  return createCanvas(200, 100)
}
