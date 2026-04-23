export const GREY = {
  BLACK: '#000000',
  DARK: '#555555',
  LIGHT: '#aaaaaa',
  WHITE: '#ffffff',
} as const

export const IMAGE_WIDTH = 200
export const IMAGE_HEIGHT = 100

export function createCanvas(width: number, height: number): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = width
  c.height = height
  return c
}

export async function canvasToPngBytes(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), 'image/png')
  })
  if (!blob) throw new Error('canvas.toBlob returned null')
  const buffer = await blob.arrayBuffer()
  return new Uint8Array(buffer)
}

export function clearCanvas(ctx: CanvasRenderingContext2D): void {
  const { width, height } = ctx.canvas
  ctx.fillStyle = GREY.BLACK
  ctx.fillRect(0, 0, width, height)
}

export function drawFilledCircle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string,
): void {
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
}

export function drawRing(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string,
  lineWidth: number,
): void {
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  ctx.stroke()
}

export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options: { color?: string; size?: number; align?: CanvasTextAlign; baseline?: CanvasTextBaseline; bold?: boolean } = {},
): void {
  const { color = GREY.WHITE, size = 10, align = 'left', baseline = 'alphabetic', bold = false } = options
  ctx.fillStyle = color
  ctx.font = `${bold ? 'bold ' : ''}${size}px -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif`
  ctx.textAlign = align
  ctx.textBaseline = baseline
  ctx.fillText(text, x, y)
}
