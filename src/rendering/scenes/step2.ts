import { CANVAS_H, CANVAS_W, drawChevronArrow, drawLabelChip, drawPillLabel } from '../sceneKit'
import {
  buildDemoRoute,
  concoursePt,
  drawActiveSegment,
  drawAllGateRooms,
  drawAllPOIRooms,
  drawBaseRoute,
  drawConcourseRibbon,
  routeWaypoints,
} from '../mia'
import { GREY } from '../canvasUtils'
import { applyViewport, beginScene, createCanvas288, endViewport, finishScene, SceneTiles } from './common'

// Step 2: Continue west past D20.
export async function renderStep2Scene(): Promise<SceneTiles> {
  const canvas = createCanvas288()
  const ctx = beginScene(canvas)

  const focus = concoursePt(0.5)
  const viewport = { x: focus.x - 220, y: focus.y - 50, w: 440, h: 110 }
  applyViewport(ctx, viewport)

  drawConcourseRibbon(ctx)
  drawAllGateRooms(ctx)
  drawAllPOIRooms(ctx, { showIcons: true })

  const legs = buildDemoRoute()
  const wps = routeWaypoints(legs)
  drawBaseRoute(ctx, wps, { width: 3 })
  const activeLeg = legs[1]!.waypoints
  drawActiveSegment(ctx, activeLeg, { width: 5 })

  const arrowHead = activeLeg[activeLeg.length - 1]!
  const prev = activeLeg[0]!
  const angle = Math.atan2(arrowHead.y - prev.y, arrowHead.x - prev.x)
  drawChevronArrow(ctx, arrowHead.x, arrowHead.y, angle, 6)

  endViewport(ctx)

  drawPillLabel(ctx, 'STEP 2  ·  PAST D20', 96, 12, { size: 8 })
  drawLabelChip(ctx, 'west · 260 m', CANVAS_W - 8, CANVAS_H - 8, {
    color: GREY.LIGHT,
    bold: true,
    size: 9,
    align: 'right',
  })

  return finishScene(canvas)
}
