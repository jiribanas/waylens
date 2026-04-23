import {
  ListContainerProperty,
  ListItemContainerProperty,
  TextContainerProperty,
} from '@evenrealities/even_hub_sdk'
import { showPage } from '../bridge/glasses'
import { POIS, poiListLine } from '../data/pois'

export interface PoiListOpts {
  title: string
  excludeId: string | null
}

export async function showPoiList(opts: PoiListOpts): Promise<void> {
  const items = (opts.excludeId ? POIS.filter((p) => p.id !== opts.excludeId) : POIS).map(poiListLine)

  const header = new TextContainerProperty({
    xPosition: 0,
    yPosition: 0,
    width: 576,
    height: 36,
    borderWidth: 0,
    borderColor: 5,
    borderRadius: 0,
    paddingLength: 8,
    containerID: 1,
    containerName: 'hdr',
    isEventCapture: 0,
    content: `${opts.title.toUpperCase()}  -  press to select  /  swipe to scroll  /  double-press back`,
  })

  const list = new ListContainerProperty({
    xPosition: 0,
    yPosition: 36,
    width: 576,
    height: 252,
    borderWidth: 1,
    borderColor: 4,
    borderRadius: 0,
    paddingLength: 4,
    containerID: 2,
    containerName: 'poi',
    isEventCapture: 1,
    itemContainer: new ListItemContainerProperty({
      itemCount: items.length,
      itemWidth: 576,
      isItemSelectBorderEn: 1,
      itemName: items,
    }),
  })

  await showPage({ textObject: [header], listObject: [list] })
}
