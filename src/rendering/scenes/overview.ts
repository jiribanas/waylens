import { CANVAS_H, CANVAS_W, drawCompass, drawEndPin, drawLabelChip, drawStartPin } from '../sceneKit'
import {
  buildDemoRoute,
  drawActiveSegment,
  drawAllGateRooms,
  drawAllPOIRooms,
  drawBaseRoute,
  drawConcourseRibbon,
  gateCenter,
  poiCenter,
  routeWaypoints,
} from '../mia'
import { GREY } from '../canvasUtils'
import { FULL_VIEWPORT, applyViewport, beginScene, createCanvas288, endViewport, finishScene, SceneTiles } from './common'

export async function renderOverviewScene(): Promise<SceneTiles> {
  const canvas = createCanvas288()
  const ctx = beginScene(canvas)

  applyViewport(ctx, FULL_VIEWPORT)
  drawConcourseRibbon(ctx, { showLabel: true })
  drawAllGateRooms(ctx)
  drawAllPOIRooms(ctx, { labelIds: ['CAFE_STARBUCKS'] })

  const legs = buildDemoRoute()
  const wps = routeWaypoints(legs)
  drawBaseRoute(ctx, wps, { width: 3.6 })
  const startLeg = legs[0]!.waypoints
  const endLeg = legs[legs.length - 1]!.waypoints
  drawActiveSegment(ctx, wps, { width: 4.4 })

  const start = gateCenter(30)
  const end = poiCenter('CAFE_STARBUCKS')
  drawStartPin(ctx, start.x, start.y, 2.4)
  drawEndPin(ctx, end.x, end.y, 3.6)

  void startLeg
  void endLeg

  endViewport(ctx)

  drawCompass(ctx, CANVAS_W - 16, 16, 7)
  drawLabelChip(ctx, 'MIA · CONCOURSE D', 8, 10, { color: GREY.LIGHT, bold: true, size: 9, align: 'left' })
  drawLabelChip(ctx, 'D30  →  Starbucks', 8, CANVAS_H - 8, { color: GREY.LIGHT, bold: true, size: 9, align: 'left' })

  return finishScene(canvas)
}
