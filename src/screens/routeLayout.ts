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
export const IMAGE_CONTAINER_ID = 10
export const IMAGE_CONTAINER_NAME = 'map'

export const IMAGE_WIDTH = 288
export const IMAGE_HEIGHT = 144
export const IMAGE_X = Math.round((576 - IMAGE_WIDTH) / 2)
export const IMAGE_Y = 52

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
  image: ImageContainerProperty
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
    yPosition: 4,
    width: 576,
    height: 36,
    borderWidth: 0,
    borderColor: 5,
    borderRadius: 0,
    paddingLength: 8,
    containerID: HEADER_CONTAINER_ID,
    containerName: HEADER_CONTAINER_NAME,
    isEventCapture: 0,
    content: headerText,
  })

  const footer = new TextContainerProperty({
    xPosition: 0,
    yPosition: 244,
    width: 576,
    height: 40,
    borderWidth: 0,
    borderColor: 5,
    borderRadius: 0,
    paddingLength: 8,
    containerID: FOOTER_CONTAINER_ID,
    containerName: FOOTER_CONTAINER_NAME,
    isEventCapture: 0,
    content: footerText,
  })

  const image = new ImageContainerProperty({
    xPosition: IMAGE_X,
    yPosition: IMAGE_Y,
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    containerID: IMAGE_CONTAINER_ID,
    containerName: IMAGE_CONTAINER_NAME,
  })

  return { background, header, footer, image }
}
