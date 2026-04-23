import { CANVAS_H, CANVAS_W, drawChevronArrow, drawLabelChip, drawPillLabel, drawStartPin } from '../sceneKit'
import {
  buildDemoRoute,
  drawActiveSegment,
  drawAllGateRooms,
  drawAllPOIRooms,
  drawBaseRoute,
  drawConcourseRibbon,
  findGate,
  gateCenter,
  routeWaypoints,
} from '../mia'
import { GREY } from '../canvasUtils'
import { applyViewport, beginScene, createCanvas288, endViewport, finishScene, SceneTiles } from './common'

// Step 1: Exit D30, turn left onto the concourse.
export async function renderStep1Scene(): Promise<SceneTiles> {
  const canvas = createCanvas288()
  const ctx = beginScene(canvas)

  const d30 = findGate(30)!
  const focus = gateCenter(d30.number)
  const viewport = { x: focus.x - 180, y: focus.y - 36, w: 360, h: 90 }
  applyViewport(ctx, viewport)

  drawConcourseRibbon(ctx)
  drawAllGateRooms(ctx, { highlightGate: 30 })
  drawAllPOIRooms(ctx, { showIcons: true })

  const legs = buildDemoRoute()
  const wps = routeWaypoints(legs)
  drawBaseRoute(ctx, wps, { width: 3.2 })
  const activeLeg = legs[0]!.waypoints
  drawActiveSegment(ctx, activeLeg, { width: 5 })

  drawStartPin(ctx, focus.x, focus.y, 3.6)

  const arrowHead = activeLeg[activeLeg.length - 1]!
  const prev = activeLeg[activeLeg.length - 2]!
  const angle = Math.atan2(arrowHead.y - prev.y, arrowHead.x - prev.x)
  drawChevronArrow(ctx, arrowHead.x, arrowHead.y, angle, 6)

  endViewport(ctx)

  drawPillLabel(ctx, 'STEP 1  ·  EXIT D30', 82, 12, { size: 8 })
  drawLabelChip(ctx, '← west · 120 m', CANVAS_W - 8, CANVAS_H - 8, {
    color: GREY.LIGHT,
    bold: true,
    size: 9,
    align: 'right',
  })

  return finishScene(canvas)
}
