import {
  ImageContainerProperty,
  TextContainerProperty,
} from '@evenrealities/even_hub_sdk'

export const HEADER_CONTAINER_ID = 1
export const HEADER_CONTAINER_NAME = 'hdr'
export const BACKGROUND_CONTAINER_ID = 2
export const BACKGROUND_CONTAINER_NAME = 'bg'
export const FOOTER_CONTAINER_ID = 3
export const FOOTER_CONTAINER_NAME = 'ftr'

export const LEFT_IMAGE_CONTAINER_ID = 10
export const LEFT_IMAGE_CONTAINER_NAME = 'mapL'
export const RIGHT_IMAGE_CONTAINER_ID = 11
export const RIGHT_IMAGE_CONTAINER_NAME = 'mapR'

// Each tile is 288x144. The two sit side-by-side and together span the full
// 576px glasses width.
export const TILE_WIDTH = 288
export const TILE_HEIGHT = 144
export const LEFT_IMAGE_X = 0
export const RIGHT_IMAGE_X = TILE_WIDTH
export const IMAGE_Y = 44

// Header / footer tightened to maximise the map real estate.
export const HEADER_Y = 2
export const HEADER_H = 32
export const FOOTER_Y = 238
export const FOOTER_H = 48

let lastPushedKey: string | null = null

export function getLastPushedRouteKey(): string | null {
  return lastPushedKey
}

export function setLastPushedRouteKey(key: string | null): void {
  lastPushedKey = key
}

export interface RouteLayoutContainers {
  background: TextContainerProperty
  header: TextContainerProperty
  footer: TextContainerProperty
  leftImage: ImageContainerProperty
  rightImage: ImageContainerProperty
}

export function buildRouteLayout(headerText: string, footerText: string): RouteLayoutContainers {
  const background = new TextContainerProperty({
    xPosition: 0,
    yPosition: 0,
    width: 576,
    height: 288,
    borderWidth: 0,
    borderColor: 0,
    borderRadius: 0,
    paddingLength: 0,
    containerID: BACKGROUND_CONTAINER_ID,
    containerName: BACKGROUND_CONTAINER_NAME,
    isEventCapture: 1,
    content: ' ',
  })

  const header = new TextContainerProperty({
    xPosition: 0,
    yPosition: HEADER_Y,
    width: 576,
    height: HEADER_H,
    borderWidth: 0,
    borderColor: 5,
    borderRadius: 0,
    paddingLength: 6,
    containerID: HEADER_CONTAINER_ID,
    containerName: HEADER_CONTAINER_NAME,
    isEventCapture: 0,
    content: headerText,
  })

  const footer = new TextContainerProperty({
    xPosition: 0,
    yPosition: FOOTER_Y,
    width: 576,
    height: FOOTER_H,
    borderWidth: 0,
    borderColor: 5,
    borderRadius: 0,
    paddingLength: 6,
    containerID: FOOTER_CONTAINER_ID,
    containerName: FOOTER_CONTAINER_NAME,
    isEventCapture: 0,
    content: footerText,
  })

  const leftImage = new ImageContainerProperty({
    xPosition: LEFT_IMAGE_X,
    yPosition: IMAGE_Y,
    width: TILE_WIDTH,
    height: TILE_HEIGHT,
    containerID: LEFT_IMAGE_CONTAINER_ID,
    containerName: LEFT_IMAGE_CONTAINER_NAME,
  })

  const rightImage = new ImageContainerProperty({
    xPosition: RIGHT_IMAGE_X,
    yPosition: IMAGE_Y,
    width: TILE_WIDTH,
    height: TILE_HEIGHT,
    containerID: RIGHT_IMAGE_CONTAINER_ID,
    containerName: RIGHT_IMAGE_CONTAINER_NAME,
  })

  return { background, header, footer, leftImage, rightImage }
}
