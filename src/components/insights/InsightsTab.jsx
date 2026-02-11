import React from 'react'
import InsightStatCards from './InsightStatCards'
import BelongingLineChart from './BelongingLineChart'
import WeeklyActivityChart from './WeeklyActivityChart'
import ConnectionsGrowthChart from './ConnectionsGrowthChart'
import QuestTypeBreakdown from './QuestTypeBreakdown'

export default function InsightsTab({
  stats,
  completedQuests,
  belongingScores,
  connections,
}) {
  return (
    <div>
      <InsightStatCards
        stats={stats}
        completedQuests={completedQuests}
        belongingScores={belongingScores}
      />
      <BelongingLineChart belongingScores={belongingScores} />
      <WeeklyActivityChart completedQuests={completedQuests} />
      <ConnectionsGrowthChart connections={connections} />
      <QuestTypeBreakdown completedQuests={completedQuests} />
    </div>
  )
}
