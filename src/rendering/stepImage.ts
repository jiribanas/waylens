import type { Route } from '../types'
import { canvasToPngBytes } from './canvasUtils'
import { createSceneCanvas, drawCorridorScene } from './corridor'

export async function renderStepImage(route: Route, stepIndex: number): Promise<Uint8Array> {
  const canvas = createSceneCanvas()
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D context unavailable')

  const step = route.steps[stepIndex]
  if (!step) throw new Error(`Invalid step index: ${stepIndex}`)

  const centerX = (step.fromX + step.toX) / 2
  const zoomHalf = Math.max(4, Math.abs(step.toX - step.fromX) / 2 + 3)
  const minX = Math.max(0, centerX - zoomHalf)
  const maxX = Math.min(60, centerX + zoomHalf)
  const span = maxX - minX
  const tickEveryGates = span <= 10 ? 2 : span <= 20 ? 5 : 10

  const arrow = step.direction === 'left' ? '<' : step.direction === 'right' ? '>' : step.direction === 'arrive' ? '*' : '->'
  drawCorridorScene(ctx, {
    window: { minX, maxX },
    route,
    activeStepIndex: stepIndex,
    title: `${arrow} Step ${stepIndex + 1}/${route.steps.length}`,
    subtitle: `${step.distanceM} m`,
    tickEveryGates,
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
