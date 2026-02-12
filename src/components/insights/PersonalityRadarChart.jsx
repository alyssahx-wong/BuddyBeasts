import React from 'react'
import {
  ResponsiveContainer, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip,
} from 'recharts'
import { COLORS, TOOLTIP_STYLE } from './chartTheme'

const TRAIT_LABELS = {
  curious: 'Curious',
  social: 'Social',
  creative: 'Creative',
  adventurous: 'Adventurous',
  calm: 'Calm',
}

export default function PersonalityRadarChart({ traitScores }) {
  if (!traitScores) {
    return (
      <div className="pixel-card p-6 mb-6 text-center">
        <h3 className="font-pixel text-xs text-pixel-yellow mb-3">Personality Profile</h3>
        <p className="text-xs font-game text-pixel-light opacity-70">
          Complete the personality quiz to see your profile.
        </p>
      </div>
    )
  }

  const data = Object.entries(TRAIT_LABELS).map(([key, label]) => ({
    trait: label,
    score: traitScores[key] || 0,
  }))

  return (
    <div className="pixel-card p-4 mb-6">
      <h3 className="font-pixel text-xs text-pixel-yellow mb-4 text-center">Personality Profile</h3>
      <ResponsiveContainer width="100%" height={260}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke={COLORS.purple} opacity={0.4} />
          <PolarAngleAxis
            dataKey="trait"
            tick={{ fill: COLORS.light, fontFamily: '"VT323", monospace', fontSize: 14 }}
          />
          <PolarRadiusAxis
            domain={[0, 10]}
            tickCount={6}
            tick={{ fill: COLORS.light, fontFamily: '"VT323", monospace', fontSize: 10 }}
            axisLine={false}
          />
          <Tooltip {...TOOLTIP_STYLE} />
          <Radar
            name="Score"
            dataKey="score"
            stroke={COLORS.pink}
            fill={COLORS.pink}
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
