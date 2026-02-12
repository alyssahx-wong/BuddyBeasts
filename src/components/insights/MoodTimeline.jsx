import React, { useState } from 'react'
import { useCompanionStore } from '../../stores/companionStore'

const MOOD_CONFIG = {
  happy:     { emoji: '😊', color: 'bg-pixel-green', label: 'Happy' },
  excited:   { emoji: '🤩', color: 'bg-pixel-yellow', label: 'Excited' },
  calm:      { emoji: '😌', color: 'bg-pixel-blue', label: 'Calm' },
  neutral:   { emoji: '😐', color: 'bg-gray-400', label: 'Neutral' },
  tired:     { emoji: '😴', color: 'bg-yellow-600', label: 'Tired' },
  stressed:  { emoji: '😰', color: 'bg-orange-400', label: 'Stressed' },
  sad:       { emoji: '😢', color: 'bg-pixel-pink', label: 'Sad' },
  anxious:   { emoji: '😟', color: 'bg-orange-500', label: 'Anxious' },
  angry:     { emoji: '😠', color: 'bg-red-500', label: 'Angry' },
  lonely:    { emoji: '🥺', color: 'bg-purple-400', label: 'Lonely' },
}

function formatDate(timestamp) {
  const d = new Date(timestamp)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatDateTime(timestamp) {
  const d = new Date(timestamp)
  return d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}

export default function MoodTimeline() {
  const { moodHistory } = useCompanionStore()
  const [range, setRange] = useState(7)

  const cutoff = Date.now() - range * 24 * 60 * 60 * 1000
  const filtered = moodHistory
    .filter((e) => e.timestamp >= cutoff)
    .sort((a, b) => b.timestamp - a.timestamp)

  // Mood frequency for summary
  const moodCounts = {}
  filtered.forEach((e) => {
    moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1
  })
  const topMoods = Object.entries(moodCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  if (moodHistory.length === 0) {
    return (
      <div className="pixel-card p-6 mb-6">
        <h3 className="font-pixel text-sm text-pixel-yellow mb-3">Mood Timeline</h3>
        <p className="text-xs font-game text-pixel-light opacity-60 text-center py-4">
          No mood data yet. Chat with your monster to start tracking!
        </p>
      </div>
    )
  }

  return (
    <div className="pixel-card p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-pixel text-sm text-pixel-yellow">Mood Timeline</h3>
        <div className="flex gap-1">
          {[7, 30].map((d) => (
            <button
              key={d}
              onClick={() => setRange(d)}
              className={`px-2 py-1 text-xs font-game rounded transition-colors ${
                range === d
                  ? 'bg-pixel-purple text-pixel-yellow'
                  : 'text-pixel-light opacity-50 hover:opacity-80'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Top moods summary */}
      {topMoods.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {topMoods.map(([mood, count]) => {
            const config = MOOD_CONFIG[mood] || MOOD_CONFIG.neutral
            return (
              <span
                key={mood}
                className="inline-flex items-center gap-1 px-2 py-1 bg-pixel-purple bg-opacity-30 rounded text-xs font-game text-pixel-light"
              >
                <span>{config.emoji}</span>
                <span>{config.label}</span>
                <span className="text-pixel-blue">x{count}</span>
              </span>
            )
          })}
        </div>
      )}

      {/* Timeline entries */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-xs font-game text-pixel-light opacity-40 text-center py-2">
            No entries in this time range.
          </p>
        ) : (
          filtered.map((entry, i) => {
            const config = MOOD_CONFIG[entry.mood] || MOOD_CONFIG.neutral
            return (
              <div
                key={`${entry.timestamp}_${i}`}
                className="flex items-center gap-3 p-2 bg-pixel-purple bg-opacity-10 rounded"
              >
                <span className="text-lg">{config.emoji}</span>
                <div className={`w-2 h-2 rounded-full ${config.color} shrink-0`} />
                <span className="text-xs font-game text-pixel-light flex-1">
                  {config.label}
                </span>
                <span className="text-[10px] font-game text-pixel-light opacity-40">
                  {formatDateTime(entry.timestamp)}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
