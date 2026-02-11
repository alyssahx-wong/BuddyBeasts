import React from 'react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine,
} from 'recharts'
import { COLORS, AXIS_STYLE, TOOLTIP_STYLE, GRID_STYLE } from './chartTheme'

export default function BelongingLineChart({ belongingScores }) {
  if (!belongingScores || belongingScores.length < 2) {
    return (
      <div className="pixel-card p-6 mb-6 text-center">
        <h3 className="font-pixel text-xs text-pixel-yellow mb-3">Belonging Trend</h3>
        <p className="text-xs font-game text-pixel-light opacity-70">
          Complete at least 2 belonging surveys to see your trend.
        </p>
      </div>
    )
  }

  const avg = belongingScores.reduce((s, d) => s + d.score, 0) / belongingScores.length

  const data = belongingScores.map((s, i) => ({
    label: `#${i + 1}`,
    score: s.score,
  }))

  return (
    <div className="pixel-card p-4 mb-6">
      <h3 className="font-pixel text-xs text-pixel-yellow mb-4 text-center">Belonging Trend</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
          <CartesianGrid {...GRID_STYLE} />
          <XAxis dataKey="label" {...AXIS_STYLE} />
          <YAxis domain={[1, 10]} {...AXIS_STYLE} />
          <Tooltip {...TOOLTIP_STYLE} />
          <ReferenceLine
            y={avg}
            stroke={COLORS.yellow}
            strokeDasharray="6 3"
            label={{ value: `avg ${avg.toFixed(1)}`, fill: COLORS.yellow, fontSize: 12, fontFamily: '"VT323", monospace' }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke={COLORS.pink}
            strokeWidth={3}
            dot={{ fill: COLORS.pink, r: 4, strokeWidth: 0 }}
            activeDot={{ fill: COLORS.yellow, r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
