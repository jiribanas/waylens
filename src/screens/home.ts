import { TextContainerProperty } from '@evenrealities/even_hub_sdk'
import { showPage } from '../bridge/glasses'

export async function showHome(): Promise<void> {
  const main = new TextContainerProperty({
    xPosition: 0,
    yPosition: 0,
    width: 576,
    height: 288,
    borderWidth: 0,
    borderColor: 0,
    paddingLength: 4,
    containerID: 1,
    containerName: 'home',
    isEventCapture: 1,
    content:
      'WAYLENS\n' +
      'MIA Terminal D - Wayfinder POC\n' +
      '\n' +
      'Press the temple pad to start.\n' +
      'Swipe up / down on temple or R1 ring\n' +
      'to navigate between steps.\n' +
      '\n' +
      'Double-press to go back.',
  })

  await showPage({ textObject: [main] })
}
