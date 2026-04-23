import { CANVAS_H, CANVAS_W, drawChevronArrow, drawEndPin, drawLabelChip, drawPillLabel } from '../sceneKit'
import {
  buildDemoRoute,
  drawActiveSegment,
  drawAllGateRooms,
  drawAllPOIRooms,
  drawBaseRoute,
  drawConcourseRibbon,
  poiCenter,
  routeWaypoints,
} from '../mia'
import { GREY } from '../canvasUtils'
import { applyViewport, beginScene, createCanvas288, endViewport, finishScene, SceneTiles } from './common'

// Step 4: Turn right into Starbucks.
export async function renderStep4Scene(): Promise<SceneTiles> {
  const canvas = createCanvas288()
  const ctx = beginScene(canvas)

  const starbucks = poiCenter('CAFE_STARBUCKS')
  const viewport = { x: starbucks.x - 110, y: starbucks.y - 44, w: 220, h: 84 }
  applyViewport(ctx, viewport)

  drawConcourseRibbon(ctx)
  drawAllGateRooms(ctx)
  drawAllPOIRooms(ctx, { highlightId: 'CAFE_STARBUCKS', showIcons: true, labelIds: ['CAFE_STARBUCKS'] })

  const legs = buildDemoRoute()
  const wps = routeWaypoints(legs)
  drawBaseRoute(ctx, wps, { width: 3 })
  const activeLeg = legs[3]!.waypoints
  drawActiveSegment(ctx, activeLeg, { width: 5.4 })

  const arrowHead = activeLeg[activeLeg.length - 2]!
  const prev = activeLeg[activeLeg.length - 3]!
  const angle = Math.atan2(arrowHead.y - prev.y, arrowHead.x - prev.x)
  drawChevronArrow(ctx, arrowHead.x, arrowHead.y, angle, 4.5)

  drawEndPin(ctx, starbucks.x, starbucks.y, 5)

  endViewport(ctx)

  drawPillLabel(ctx, 'STEP 4  ·  ARRIVING', 104, 12, { size: 8 })
  drawLabelChip(ctx, 'right  ·  80 m', CANVAS_W - 8, CANVAS_H - 8, {
    color: GREY.LIGHT,
    bold: true,
    size: 9,
    align: 'right',
  })

  return finishScene(canvas)
}
