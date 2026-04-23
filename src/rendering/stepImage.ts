import type { Route } from '../types'
import { canvasToPngBytes } from './canvasUtils'
import { createSceneCanvas, drawScene } from './corridor'
import { boundsOfPoints } from './world'

export async function renderStepImage(route: Route, stepIndex: number): Promise<Uint8Array> {
  const canvas = createSceneCanvas()
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D context unavailable')

  const step = route.steps[stepIndex]
  if (!step) throw new Error(`Invalid step index: ${stepIndex}`)

  const viewport = boundsOfPoints(step.waypoints, 24)

  const isLast = stepIndex === route.steps.length - 1
  const labelWhitelist = isLast ? new Set([route.toId]) : new Set<string>()

  drawScene(ctx, {
    viewport,
    route,
    activeStepIndex: stepIndex,
    showLabels: true,
    labelWhitelist,
  })

  return canvasToPngBytes(canvas)
}

export async function renderAllStepImages(route: Route): Promise<Uint8Array[]> {
  const images: Uint8Array[] = []
  for (let i = 0; i < route.steps.length; i++) {
    images.push(await renderStepImage(route, i))
  }
  return images
}
