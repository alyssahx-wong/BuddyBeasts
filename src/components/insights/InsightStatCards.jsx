import React from 'react'

export default function InsightStatCards({ stats, completedQuests, belongingScores }) {
  const totalQuests = completedQuests.length
  const avgGroupSize = totalQuests > 0
    ? (completedQuests.reduce((sum, q) => sum + (q.groupSize || 1), 0) / totalQuests).toFixed(1)
    : '0'
  const socialScore = stats.socialScore || 0
  const avgBelonging = belongingScores.length > 0
    ? (belongingScores.reduce((sum, s) => sum + s.score, 0) / belongingScores.length).toFixed(1)
    : 'N/A'

  const cards = [
    { label: 'Total Quests', value: totalQuests, icon: '🎯', color: 'text-pixel-blue' },
    { label: 'Avg Group Size', value: avgGroupSize, icon: '👥', color: 'text-pixel-green' },
    { label: 'Social Score', value: socialScore, icon: '⭐', color: 'text-pixel-yellow' },
    { label: 'Avg Belonging', value: avgBelonging, icon: '💙', color: 'text-pixel-pink' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="pixel-card p-4 text-center bg-pixel-purple bg-opacity-20"
        >
          <p className="text-2xl mb-1">{card.icon}</p>
          <p className={`text-2xl font-game ${card.color}`}>{card.value}</p>
          <p className="text-xs font-game text-pixel-blue mt-1">{card.label}</p>
        </div>
      ))}
    </div>
  )
}
