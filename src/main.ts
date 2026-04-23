import { waitForEvenAppBridge } from '@evenrealities/even_hub_sdk'
import { attachEventDispatcher } from './bridge/events'
import { setBridge } from './bridge/glasses'
import { handleInput, setState } from './state'
import { setStatus } from './phoneUI'

async function bootstrap(): Promise<void> {
  setStatus('Connecting to glasses bridge...')

  let bridge
  try {
    bridge = await waitForEvenAppBridge()
  } catch (err) {
    console.error('[WayLens] bridge wait failed', err)
    setStatus('Bridge unavailable - open the Even Realities app and relaunch.', 'error')
    return
  }

  setBridge(bridge)

  attachEventDispatcher(bridge, (input) => {
    handleInput(input).catch((err) => {
      console.error('[WayLens] handleInput error', err)
    })
  })

  try {
    await setState({ kind: 'home' })
  } catch (err) {
    console.error('[WayLens] failed to render home page', err)
    setStatus('Failed to render the home screen on the glasses.', 'error')
  }
}

void bootstrap()
