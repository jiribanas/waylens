import { ImageContainerProperty, TextContainerProperty } from '@evenrealities/even_hub_sdk'
import { showPage, updateImage } from '../bridge/glasses'
import type { Route } from '../types'
import { describeRoute } from '../data/routes'
import { renderOverviewImage } from '../rendering/overviewImage'
import {
  LEFT_IMAGE_CONTAINER_ID,
  LEFT_IMAGE_CONTAINER_NAME,
  RIGHT_IMAGE_CONTAINER_ID,
  RIGHT_IMAGE_CONTAINER_NAME,
  buildRouteLayout,
  setLastPushedRouteKey,
} from './routeLayout'

export async function showOverview(route: Route): Promise<void> {
  const headerText = describeRoute(route)
  const bottomText = `${route.totalDistanceM} m  ${route.totalMinutes} min  -  swipe down to start`

  const { header, background, footer, leftImage, rightImage } = buildRouteLayout(headerText, bottomText)
  await showPage({
    textObject: [background as TextContainerProperty, header as TextContainerProperty, footer as TextContainerProperty],
    imageObject: [leftImage as ImageContainerProperty, rightImage as ImageContainerProperty],
  })

  const tiles = await renderOverviewImage(route)
  const leftResult = await updateImage(LEFT_IMAGE_CONTAINER_ID, LEFT_IMAGE_CONTAINER_NAME, tiles.left)
  if (leftResult !== 'success') console.warn('[WayLens] overview left updateImage:', leftResult)
  const rightResult = await updateImage(RIGHT_IMAGE_CONTAINER_ID, RIGHT_IMAGE_CONTAINER_NAME, tiles.right)
  if (rightResult !== 'success') console.warn('[WayLens] overview right updateImage:', rightResult)

  setLastPushedRouteKey(`${route.fromId}->${route.toId}#overview`)
}
