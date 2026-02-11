import React from 'react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { COLORS, AXIS_STYLE, TOOLTIP_STYLE, GRID_STYLE } from './chartTheme'

function getWeekLabel(date) {
  const d = new Date(date)
  const month = d.toLocaleString('default', { month: 'short' })
  const day = d.getDate()
  return `${month} ${day}`
}

function buildWeeklyData(completedQuests) {
  const now = new Date()
  const weeks = []

  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - i * 7)
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)

    const questsInWeek = completedQuests.filter((q) => {
      const qDate = new Date(q.completedAt || q.createdAt)
      return qDate >= weekStart && qDate < weekEnd
    })

    weeks.push({
      week: getWeekLabel(weekStart),
      solo: questsInWeek.filter((q) => (q.groupSize || 1) <= 1).length,
      group: questsInWeek.filter((q) => (q.groupSize || 1) > 1).length,
    })
  }

  return weeks
}

export default function WeeklyActivityChart({ completedQuests }) {
  if (!completedQuests || completedQuests.length === 0) {
    return (
      <div className="pixel-card p-6 mb-6 text-center">
        <h3 className="font-pixel text-xs text-pixel-yellow mb-3">Weekly Activity</h3>
        <p className="text-xs font-game text-pixel-light opacity-70">
          Complete some quests to see your weekly activity.
        </p>
      </div>
    )
  }

  const data = buildWeeklyData(completedQuests)

  return (
    <div className="pixel-card p-4 mb-6">
      <h3 className="font-pixel text-xs text-pixel-yellow mb-4 text-center">Weekly Activity</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
          <CartesianGrid {...GRID_STYLE} />
          <XAxis dataKey="week" {...AXIS_STYLE} interval={0} tick={{ ...AXIS_STYLE.tick, fontSize: 11 }} />
          <YAxis allowDecimals={false} {...AXIS_STYLE} />
          <Tooltip {...TOOLTIP_STYLE} />
          <Legend
            wrapperStyle={{ fontFamily: '"VT323", monospace', fontSize: 14, color: COLORS.light }}
          />
          <Bar dataKey="solo" stackId="a" fill={COLORS.blue} name="Solo" radius={[0, 0, 0, 0]} />
          <Bar dataKey="group" stackId="a" fill={COLORS.green} name="Group" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
