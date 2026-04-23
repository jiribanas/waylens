import type { POI } from '../types'
import { gateCenter, poiCenter } from '../rendering/world'

const GATE_GLYPH = '>'
const LOUNGE_GLYPH = '#'
const CAFE_GLYPH = '*'
const RESTAURANT_GLYPH = '~'

export const POIS: POI[] = [
  { id: 'GATE_D1', name: 'Gate D1', shortName: 'D1', category: 'gate', glyph: GATE_GLYPH, position: gateCenter(1) },
  { id: 'GATE_D10', name: 'Gate D10', shortName: 'D10', category: 'gate', glyph: GATE_GLYPH, position: gateCenter(10) },
  { id: 'GATE_D15', name: 'Gate D15', shortName: 'D15', category: 'gate', glyph: GATE_GLYPH, position: gateCenter(15) },
  { id: 'GATE_D20', name: 'Gate D20', shortName: 'D20', category: 'gate', glyph: GATE_GLYPH, position: gateCenter(20) },
  { id: 'GATE_D25', name: 'Gate D25', shortName: 'D25', category: 'gate', glyph: GATE_GLYPH, position: gateCenter(25) },
  { id: 'GATE_D30', name: 'Gate D30', shortName: 'D30', category: 'gate', glyph: GATE_GLYPH, position: gateCenter(30) },
  { id: 'GATE_D40', name: 'Gate D40', shortName: 'D40', category: 'gate', glyph: GATE_GLYPH, position: gateCenter(40) },
  { id: 'GATE_D50', name: 'Gate D50', shortName: 'D50', category: 'gate', glyph: GATE_GLYPH, position: gateCenter(50) },
  { id: 'GATE_D60', name: 'Gate D60', shortName: 'D60', category: 'gate', glyph: GATE_GLYPH, position: gateCenter(60) },

  { id: 'LOUNGE_ADMIRALS_D15', name: 'Admirals Club D15', shortName: 'Admirals Club', category: 'lounge', glyph: LOUNGE_GLYPH, position: poiCenter('LOUNGE_ADMIRALS_D15') },
  { id: 'LOUNGE_FLAGSHIP_D30', name: 'Flagship Lounge D30', shortName: 'Flagship Lounge', category: 'lounge', glyph: LOUNGE_GLYPH, position: poiCenter('LOUNGE_FLAGSHIP_D30') },
  { id: 'LOUNGE_CENTURION_D14', name: 'Amex Centurion D14', shortName: 'Centurion Lounge', category: 'lounge', glyph: LOUNGE_GLYPH, position: poiCenter('LOUNGE_CENTURION_D14') },

  { id: 'CAFE_STARBUCKS', name: 'Starbucks (D10)', shortName: 'Starbucks', category: 'cafe', glyph: CAFE_GLYPH, position: poiCenter('CAFE_STARBUCKS') },
  { id: 'RESTAURANT_CORONA', name: 'Corona Beach House (D12)', shortName: 'Corona Beach House', category: 'restaurant', glyph: RESTAURANT_GLYPH, position: poiCenter('RESTAURANT_CORONA') },
  { id: 'RESTAURANT_SHULAS', name: "Shula's Bar & Grill (D20)", shortName: "Shula's Bar & Grill", category: 'restaurant', glyph: RESTAURANT_GLYPH, position: poiCenter('RESTAURANT_SHULAS') },
]

export function findPoi(id: string): POI | undefined {
  return POIS.find((p) => p.id === id)
}

export function poiListLine(poi: POI): string {
  const label = `${poi.glyph} ${poi.shortName}`
  const tag = poi.category === 'gate' ? 'Gate' : poi.category === 'lounge' ? 'Lounge' : poi.category === 'cafe' ? 'Cafe' : 'Food'
  const padded = label.length >= 20 ? label : label + ' '.repeat(20 - label.length)
  return `${padded}${tag}`
}
