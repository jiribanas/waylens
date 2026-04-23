import type { Route } from '../types'
import { canvasToPngBytes } from './canvasUtils'
import { createSceneCanvas, drawScene } from './corridor'
import { fullWorldViewport } from './world'

export async function renderOverviewImage(route: Route): Promise<Uint8Array> {
  const canvas = createSceneCanvas()
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D context unavailable')

  drawScene(ctx, {
    viewport: fullWorldViewport(6),
    route,
    showLabels: true,
    labelWhitelist: new Set([route.fromId, route.toId]),
  })

  return canvasToPngBytes(canvas)
}
