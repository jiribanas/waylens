import type { Route } from '../types'
import { renderOverviewScene } from './scenes/overview'
import type { SceneTiles } from './scenes/common'

export async function renderOverviewImage(_route: Route): Promise<SceneTiles> {
  return renderOverviewScene()
}
