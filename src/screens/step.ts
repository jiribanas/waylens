import { ImageContainerProperty, TextContainerProperty } from '@evenrealities/even_hub_sdk'
import { showPage, updateImage, upgradeText } from '../bridge/glasses'
import type { Route } from '../types'
import { renderStepImage, renderAllStepImages } from '../rendering/stepImage'
import {
  FOOTER_CONTAINER_ID,
  FOOTER_CONTAINER_NAME,
  HEADER_CONTAINER_ID,
  HEADER_CONTAINER_NAME,
  IMAGE_CONTAINER_ID,
  IMAGE_CONTAINER_NAME,
  buildRouteLayout,
  getLastPushedRouteKey,
  setLastPushedRouteKey,
} from './routeLayout'

const imageCacheByRouteKey = new Map<string, Uint8Array[]>()

async function ensureStepImages(route: Route): Promise<Uint8Array[]> {
  const key = `${route.fromId}->${route.toId}`
  const existing = imageCacheByRouteKey.get(key)
  if (existing) return existing
  const images = await renderAllStepImages(route)
  imageCacheByRouteKey.set(key, images)
  return images
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

export async function showStep(route: Route, stepIndex: number): Promise<void> {
  const header = stepHeader(route, stepIndex)
  const footer = stepFooter(route, stepIndex)

  const layout = buildRouteLayout(header, footer)
  await showPage({
    textObject: [layout.background as TextContainerProperty, layout.header as TextContainerProperty, layout.footer as TextContainerProperty],
    imageObject: [layout.image as ImageContainerProperty],
  })

  const images = await ensureStepImages(route)
  const bytes = images[stepIndex] ?? (await renderStepImage(route, stepIndex))
  const result = await updateImage(IMAGE_CONTAINER_ID, IMAGE_CONTAINER_NAME, bytes)
  if (result !== 'success') {
    console.warn('[WayLens] step updateImage:', result)
  }
  setLastPushedRouteKey(`${route.fromId}->${route.toId}#step${stepIndex}`)
}

export async function updateStep(route: Route, stepIndex: number): Promise<void> {
  const key = `${route.fromId}->${route.toId}#step${stepIndex}`
  if (getLastPushedRouteKey() === key) return

  await upgradeText(HEADER_CONTAINER_ID, HEADER_CONTAINER_NAME, stepHeader(route, stepIndex))
  await upgradeText(FOOTER_CONTAINER_ID, FOOTER_CONTAINER_NAME, stepFooter(route, stepIndex))

  const images = await ensureStepImages(route)
  const bytes = images[stepIndex] ?? (await renderStepImage(route, stepIndex))
  const result = await updateImage(IMAGE_CONTAINER_ID, IMAGE_CONTAINER_NAME, bytes)
  if (result !== 'success') {
    console.warn('[WayLens] step updateImage:', result)
  }

  setLastPushedRouteKey(key)
}

export async function prefetchStepImages(route: Route): Promise<void> {
  await ensureStepImages(route)
}
