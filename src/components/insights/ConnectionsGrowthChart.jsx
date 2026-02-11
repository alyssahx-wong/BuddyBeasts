import React from 'react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip,
} from 'recharts'
import { COLORS, AXIS_STYLE, TOOLTIP_STYLE, GRID_STYLE } from './chartTheme'

function buildCumulativeData(connections) {
  if (!connections || connections.length === 0) return []

  const sorted = [...connections].sort(
    (a, b) => new Date(a.connectedAt || a.createdAt) - new Date(b.connectedAt || b.createdAt)
  )

  return sorted.map((c, i) => {
    const d = new Date(c.connectedAt || c.createdAt)
    return {
      label: d.toLocaleDateString('default', { month: 'short', day: 'numeric' }),
      total: i + 1,
    }
  })
}

export default function ConnectionsGrowthChart({ connections }) {
  if (!connections || connections.length < 2) {
    return (
      <div className="pixel-card p-6 mb-6 text-center">
        <h3 className="font-pixel text-xs text-pixel-yellow mb-3">Connections Growth</h3>
        <p className="text-xs font-game text-pixel-light opacity-70">
          Make at least 2 connections to see your growth chart.
        </p>
      </div>
    )
  }

  const data = buildCumulativeData(connections)

  return (
    <div className="pixel-card p-4 mb-6">
      <h3 className="font-pixel text-xs text-pixel-yellow mb-4 text-center">Connections Growth</h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
          <defs>
            <linearGradient id="connGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.green} stopOpacity={0.4} />
              <stop offset="95%" stopColor={COLORS.green} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid {...GRID_STYLE} />
          <XAxis dataKey="label" {...AXIS_STYLE} />
          <YAxis allowDecimals={false} {...AXIS_STYLE} />
          <Tooltip {...TOOLTIP_STYLE} />
          <Area
            type="monotone"
            dataKey="total"
            stroke={COLORS.green}
            strokeWidth={3}
            fill="url(#connGrad)"
            dot={{ fill: COLORS.green, r: 3, strokeWidth: 0 }}
            activeDot={{ fill: COLORS.yellow, r: 5, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
