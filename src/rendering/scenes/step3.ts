import { CANVAS_H, CANVAS_W, drawChevronArrow, drawLabelChip, drawPillLabel } from '../sceneKit'
import {
  buildDemoRoute,
  concoursePt,
  drawActiveSegment,
  drawAllGateRooms,
  drawAllPOIRooms,
  drawBaseRoute,
  drawConcourseRibbon,
  findPoiInfo,
  poiCenter,
  routeWaypoints,
} from '../mia'
import { GREY } from '../canvasUtils'
import { applyViewport, beginScene, createCanvas288, endViewport, finishScene, SceneTiles } from './common'

// Step 3: Pass D15, Starbucks on the right.
export async function renderStep3Scene(): Promise<SceneTiles> {
  const canvas = createCanvas288()
  const ctx = beginScene(canvas)

  const starbucks = findPoiInfo('CAFE_STARBUCKS')!
  const focus = concoursePt(0.3)
  const viewport = { x: focus.x - 150, y: focus.y - 38, w: 300, h: 90 }
  applyViewport(ctx, viewport)

  drawConcourseRibbon(ctx)
  drawAllGateRooms(ctx)
  drawAllPOIRooms(ctx, { highlightId: 'CAFE_STARBUCKS', showIcons: true, labelIds: ['CAFE_STARBUCKS'] })

  const legs = buildDemoRoute()
  const wps = routeWaypoints(legs)
  drawBaseRoute(ctx, wps, { width: 3 })
  const activeLeg = legs[2]!.waypoints
  drawActiveSegment(ctx, activeLeg, { width: 5 })

  const arrowHead = activeLeg[activeLeg.length - 1]!
  const prev = activeLeg[activeLeg.length - 2]!
  const angle = Math.atan2(arrowHead.y - prev.y, arrowHead.x - prev.x)
  drawChevronArrow(ctx, arrowHead.x, arrowHead.y, angle, 6)

  void starbucks
  void poiCenter

  endViewport(ctx)

  drawPillLabel(ctx, 'STEP 3  ·  APPROACH', 100, 12, { size: 8 })
  drawLabelChip(ctx, 'Starbucks · 340 m', CANVAS_W - 8, CANVAS_H - 8, {
    color: GREY.LIGHT,
    bold: true,
    size: 9,
    align: 'right',
  })

  return finishScene(canvas)
}
