import { CANVAS_H, CANVAS_W } from '../sceneKit'
import { TILE_HEIGHT, TILE_WIDTH, canvasToPngBytes, clearCanvas, createCanvas } from '../canvasUtils'

export interface Viewport {
  x: number
  y: number
  w: number
  h: number
}

export const FULL_VIEWPORT: Viewport = { x: 0, y: 0, w: CANVAS_W, h: CANVAS_H }

export interface SceneTiles {
  left: Uint8Array
  right: Uint8Array
}

export function createCanvas288(): HTMLCanvasElement {
  return createCanvas(CANVAS_W, CANVAS_H)
}

export function beginScene(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D context unavailable')
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  clearCanvas(ctx)
  return ctx
}

// Apply a world-space viewport so subsequent drawing is in world coords.
export function applyViewport(ctx: CanvasRenderingContext2D, vp: Viewport): void {
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  const sx = CANVAS_W / vp.w
  const sy = CANVAS_H / vp.h
  const s = Math.min(sx, sy)
  const offsetX = (CANVAS_W - vp.w * s) / 2 - vp.x * s
  const offsetY = (CANVAS_H - vp.h * s) / 2 - vp.y * s
  ctx.setTransform(s, 0, 0, s, offsetX, offsetY)
}

// Reset transform so chrome is drawn in screen pixels.
export function endViewport(ctx: CanvasRenderingContext2D): void {
  ctx.setTransform(1, 0, 0, 1, 0, 0)
}

// (Unused; kept for compatibility with older callers.)
export function drawFrameChrome(_ctx: CanvasRenderingContext2D): void {
  return
}

// Slice the wide (576x144) source canvas into left and right 288x144 tiles
// and encode each as a PNG byte array for `updateImageRawData`.
export async function finishScene(canvas: HTMLCanvasElement): Promise<SceneTiles> {
  const left = createCanvas(TILE_WIDTH, TILE_HEIGHT)
  const right = createCanvas(TILE_WIDTH, TILE_HEIGHT)
  const lctx = left.getContext('2d')
  const rctx = right.getContext('2d')
  if (!lctx || !rctx) throw new Error('2D context unavailable for tile')
  lctx.drawImage(canvas, 0, 0, TILE_WIDTH, TILE_HEIGHT, 0, 0, TILE_WIDTH, TILE_HEIGHT)
  rctx.drawImage(canvas, TILE_WIDTH, 0, TILE_WIDTH, TILE_HEIGHT, 0, 0, TILE_WIDTH, TILE_HEIGHT)
  const [leftBytes, rightBytes] = await Promise.all([
    canvasToPngBytes(left),
    canvasToPngBytes(right),
  ])
  return { left: leftBytes, right: rightBytes }
}
