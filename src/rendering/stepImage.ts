import type { Route } from '../types'
import type { SceneTiles } from './scenes/common'
import { renderStep1Scene } from './scenes/step1'
import { renderStep2Scene } from './scenes/step2'
import { renderStep3Scene } from './scenes/step3'
import { renderStep4Scene } from './scenes/step4'

export async function renderStepImage(_route: Route, stepIndex: number): Promise<SceneTiles> {
  switch (stepIndex) {
    case 0:
      return renderStep1Scene()
    case 1:
      return renderStep2Scene()
    case 2:
      return renderStep3Scene()
    case 3:
      return renderStep4Scene()
    default:
      throw new Error(`No scene defined for step index ${stepIndex}`)
  }
}

export async function renderAllStepImages(route: Route): Promise<SceneTiles[]> {
  const images: SceneTiles[] = []
  for (let i = 0; i < route.steps.length; i++) {
    images.push(await renderStepImage(route, i))
  }
  return images
}
