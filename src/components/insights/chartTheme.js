// Shared pixel-theme constants for all Insights charts

export const COLORS = {
  purple: '#4A3B8C',
  pink: '#FF6B9D',
  blue: '#5B9BFF',
  green: '#4ECDC4',
  yellow: '#FFE66D',
  dark: '#1A1A2E',
  light: '#F7F7F7',
}

export const PIE_COLORS = [
  COLORS.blue,
  COLORS.pink,
  COLORS.green,
  COLORS.yellow,
  COLORS.purple,
]

export const AXIS_STYLE = {
  tick: { fill: COLORS.light, fontFamily: '"VT323", monospace', fontSize: 14 },
  axisLine: { stroke: COLORS.purple },
  tickLine: { stroke: COLORS.purple },
}

export const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: COLORS.dark,
    border: `2px solid ${COLORS.purple}`,
    borderRadius: 4,
    fontFamily: '"VT323", monospace',
    fontSize: 14,
    color: COLORS.light,
  },
  itemStyle: { color: COLORS.light },
  labelStyle: { color: COLORS.yellow, fontFamily: '"VT323", monospace', fontSize: 14 },
}

export const GRID_STYLE = {
  strokeDasharray: '3 3',
  stroke: COLORS.purple,
  opacity: 0.4,
}
