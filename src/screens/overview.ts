import { ImageContainerProperty, TextContainerProperty } from '@evenrealities/even_hub_sdk'
import { showPage, updateImage } from '../bridge/glasses'
import type { Route } from '../types'
import { describeRoute } from '../data/routes'
import { renderOverviewImage } from '../rendering/overviewImage'
import {
  IMAGE_CONTAINER_ID,
  IMAGE_CONTAINER_NAME,
  buildRouteLayout,
  setLastPushedRouteKey,
} from './routeLayout'

export async function showOverview(route: Route): Promise<void> {
  const headerText = describeRoute(route)
  const bottomText = `${route.totalDistanceM} m  ${route.totalMinutes} min  -  swipe down to start`

  const { header, background, footer, image } = buildRouteLayout(headerText, bottomText)
  await showPage({
    textObject: [background as TextContainerProperty, header as TextContainerProperty, footer as TextContainerProperty],
    imageObject: [image as ImageContainerProperty],
  })

  const bytes = await renderOverviewImage(route)
  const result = await updateImage(IMAGE_CONTAINER_ID, IMAGE_CONTAINER_NAME, bytes)
  if (result !== 'success') {
    console.warn('[WayLens] overview updateImage:', result)
  }
  setLastPushedRouteKey(`${route.fromId}->${route.toId}#overview`)
}
