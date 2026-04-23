import { TextContainerProperty } from '@evenrealities/even_hub_sdk'
import { showPage } from '../bridge/glasses'
import { findPoi } from '../data/pois'
import { setLastPushedRouteKey } from './routeLayout'

export async function showRouteUnavailable(fromId: string, toId: string): Promise<void> {
  const from = findPoi(fromId)
  const to = findPoi(toId)
  const fromLabel = from?.shortName ?? fromId
  const toLabel = to?.shortName ?? toId

  const message = new TextContainerProperty({
    xPosition: 0,
    yPosition: 0,
    width: 576,
    height: 288,
    borderWidth: 0,
    borderColor: 5,
    borderRadius: 0,
    paddingLength: 24,
    containerID: 1,
    containerName: 'unavail',
    isEventCapture: 1,
    content:
      `Demo route unavailable.\n` +
      `${fromLabel} -> ${toLabel}\n` +
      `\n` +
      `This POC only renders directions for:\n` +
      `D30 -> Starbucks\n` +
      `\n` +
      `Press or double-press to pick again.`,
  })

  await showPage({ textObject: [message] })
  setLastPushedRouteKey(null)
}
