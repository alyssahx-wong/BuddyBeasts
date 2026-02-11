import React from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { PIE_COLORS, TOOLTIP_STYLE } from './chartTheme'

function buildTypeData(completedQuests) {
  const counts = {}
  completedQuests.forEach((q) => {
    const type = q.questType || 'unknown'
    counts[type] = (counts[type] || 0) + 1
  })

  return Object.entries(counts)
    .map(([name, value]) => ({
      name: name.replace(/_/g, ' '),
      value,
    }))
    .sort((a, b) => b.value - a.value)
}

const RADIAN = Math.PI / 180
function renderLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.08) return null
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text
      x={x} y={y} fill="#F7F7F7"
      textAnchor="middle" dominantBaseline="central"
      style={{ fontFamily: '"VT323", monospace', fontSize: 13 }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export default function QuestTypeBreakdown({ completedQuests }) {
  if (!completedQuests || completedQuests.length === 0) {
    return (
      <div className="pixel-card p-6 mb-6 text-center">
        <h3 className="font-pixel text-xs text-pixel-yellow mb-3">Quest Types</h3>
        <p className="text-xs font-game text-pixel-light opacity-70">
          Complete quests to see your type breakdown.
        </p>
      </div>
    )
  }

  const data = buildTypeData(completedQuests)

  return (
    <div className="pixel-card p-4 mb-6">
      <h3 className="font-pixel text-xs text-pixel-yellow mb-4 text-center">Quest Types</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            labelLine={false}
            label={renderLabel}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip {...TOOLTIP_STYLE} />
        </PieChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div className="flex flex-wrap gap-2 justify-center mt-2">
        {data.map((entry, i) => (
          <div key={entry.name} className="flex items-center gap-1">
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
            />
            <span className="text-xs font-game text-pixel-light capitalize">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
