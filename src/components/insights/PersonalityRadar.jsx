import React from 'react'
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { COLORS, TOOLTIP_STYLE } from './chartTheme'

const TRAIT_LABELS = {
  social: 'Social',
  creative: 'Creative',
  adventurous: 'Adventurous',
  calm: 'Calm',
  nurturing: 'Nurturing',
}

export default function PersonalityRadar({ personalityScores }) {
  if (!personalityScores) {
    return (
      <div className="pixel-card p-6 mb-6 text-center">
        <h3 className="font-pixel text-sm text-pixel-yellow mb-3">Personality</h3>
        <p className="text-xs font-game text-pixel-light opacity-60">
          Retake the personality quiz to see your trait breakdown.
        </p>
      </div>
    )
  }

  const data = Object.entries(TRAIT_LABELS).map(([key, label]) => ({
    trait: label,
    score: personalityScores[key] || 0,
  }))

  return (
    <div className="pixel-card p-6 mb-6">
      <h3 className="font-pixel text-sm text-pixel-yellow mb-4 text-center">
        Personality
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke={COLORS.purple} />
          <PolarAngleAxis
            dataKey="trait"
            tick={{ fill: COLORS.yellow, fontFamily: '"VT323", monospace', fontSize: 14 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 5]}
            tickCount={6}
            tick={{ fill: COLORS.light, fontFamily: '"VT323", monospace', fontSize: 12 }}
            axisLine={false}
          />
          <Radar
            dataKey="score"
            stroke={COLORS.pink}
            fill={COLORS.pink}
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Tooltip {...TOOLTIP_STYLE} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
