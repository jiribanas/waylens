import type { Route } from '../types'
import { canvasToPngBytes } from './canvasUtils'
import { createSceneCanvas, drawCorridorScene } from './corridor'
import { describeRoute, routeBounds } from '../data/routes'

export async function renderOverviewImage(route: Route): Promise<Uint8Array> {
  const canvas = createSceneCanvas()
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D context unavailable')

  const bounds = routeBounds(route)
  const pad = 3
  const minX = Math.max(0, bounds.minX - pad)
  const maxX = Math.min(60, bounds.maxX + pad)

  drawCorridorScene(ctx, {
    window: { minX, maxX },
    route,
    title: describeRoute(route),
    subtitle: `${route.totalDistanceM} m  ${route.totalMinutes} min`,
  })

  return canvasToPngBytes(canvas)
}
