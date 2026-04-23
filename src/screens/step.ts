import { ImageContainerProperty, TextContainerProperty } from '@evenrealities/even_hub_sdk'
import { showPage, updateImage, upgradeText } from '../bridge/glasses'
import type { Route } from '../types'
import { renderAllStepImages, renderStepImage } from '../rendering/stepImage'
import type { SceneTiles } from '../rendering/scenes/common'
import {
  FOOTER_CONTAINER_ID,
  FOOTER_CONTAINER_NAME,
  HEADER_CONTAINER_ID,
  HEADER_CONTAINER_NAME,
  LEFT_IMAGE_CONTAINER_ID,
  LEFT_IMAGE_CONTAINER_NAME,
  RIGHT_IMAGE_CONTAINER_ID,
  RIGHT_IMAGE_CONTAINER_NAME,
  buildRouteLayout,
  getLastPushedRouteKey,
  setLastPushedRouteKey,
} from './routeLayout'

const tileCacheByRouteKey = new Map<string, SceneTiles[]>()

async function ensureStepTiles(route: Route): Promise<SceneTiles[]> {
  const key = `${route.fromId}->${route.toId}`
  const existing = tileCacheByRouteKey.get(key)
  if (existing) return existing
  const tiles = await renderAllStepImages(route)
  tileCacheByRouteKey.set(key, tiles)
  return tiles
}

function stepHeader(route: Route, stepIndex: number): string {
  const step = route.steps[stepIndex]
  if (!step) return ''
  return `Step ${stepIndex + 1}/${route.steps.length}  ${step.instruction}`
}

function stepFooter(route: Route, stepIndex: number): string {
  const step = route.steps[stepIndex]
  if (!step) return ''
  const isLast = stepIndex === route.steps.length - 1
  const back = stepIndex === 0 ? 'overview' : `step ${stepIndex}`
  const forward = isLast ? 'arrive' : `step ${stepIndex + 2}`
  return `${step.distanceM} m  -  swipe up: ${back}  /  down: ${forward}`
}

async function pushTiles(tiles: SceneTiles): Promise<void> {
  const leftResult = await updateImage(LEFT_IMAGE_CONTAINER_ID, LEFT_IMAGE_CONTAINER_NAME, tiles.left)
  if (leftResult !== 'success') console.warn('[WayLens] step left updateImage:', leftResult)
  const rightResult = await updateImage(RIGHT_IMAGE_CONTAINER_ID, RIGHT_IMAGE_CONTAINER_NAME, tiles.right)
  if (rightResult !== 'success') console.warn('[WayLens] step right updateImage:', rightResult)
}

export async function showStep(route: Route, stepIndex: number): Promise<void> {
  const header = stepHeader(route, stepIndex)
  const footer = stepFooter(route, stepIndex)

  const layout = buildRouteLayout(header, footer)
  await showPage({
    textObject: [
      layout.background as TextContainerProperty,
      layout.header as TextContainerProperty,
      layout.footer as TextContainerProperty,
    ],
    imageObject: [layout.leftImage as ImageContainerProperty, layout.rightImage as ImageContainerProperty],
  })

  const cache = await ensureStepTiles(route)
  const tiles = cache[stepIndex] ?? (await renderStepImage(route, stepIndex))
  await pushTiles(tiles)
  setLastPushedRouteKey(`${route.fromId}->${route.toId}#step${stepIndex}`)
}

export async function updateStep(route: Route, stepIndex: number): Promise<void> {
  const key = `${route.fromId}->${route.toId}#step${stepIndex}`
  if (getLastPushedRouteKey() === key) return

  await upgradeText(HEADER_CONTAINER_ID, HEADER_CONTAINER_NAME, stepHeader(route, stepIndex))
  await upgradeText(FOOTER_CONTAINER_ID, FOOTER_CONTAINER_NAME, stepFooter(route, stepIndex))

  const cache = await ensureStepTiles(route)
  const tiles = cache[stepIndex] ?? (await renderStepImage(route, stepIndex))
  await pushTiles(tiles)

  setLastPushedRouteKey(key)
}

export async function prefetchStepImages(route: Route): Promise<void> {
  await ensureStepTiles(route)
}
