import { TextContainerProperty } from '@evenrealities/even_hub_sdk'
import { showPage } from '../bridge/glasses'
import { describeRoute } from '../data/routes'
import type { Route } from '../types'
import { setLastPushedRouteKey } from './routeLayout'

export async function showArrived(route: Route): Promise<void> {
  const title = new TextContainerProperty({
    xPosition: 0,
    yPosition: 0,
    width: 576,
    height: 288,
    borderWidth: 0,
    borderColor: 5,
    borderRadius: 0,
    paddingLength: 24,
    containerID: 1,
    containerName: 'arrived',
    isEventCapture: 1,
    content:
      `You have arrived.\n` +
      `${describeRoute(route)}\n` +
      `${route.totalDistanceM} m  ${route.totalMinutes} min\n` +
      `\n` +
      `Swipe up to review the last step.\n` +
      `Press to exit, double-press for home.`,
  })

  await showPage({ textObject: [title] })
  setLastPushedRouteKey(null)
}
