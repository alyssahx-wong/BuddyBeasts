import React from 'react'
import penguin from '../characters/penguin-penguin-dancing.gif'
import seal from '../characters/torp-the-seal.gif'
import cleffa from '../characters/pokemon-cleffa.gif'
import duck from '../characters/dancing-duck-karlo.gif'
import cutePixel from '../characters/cute-pixel.gif'
import follony from '../characters/follony-side-1-yume-nikki.gif'
import hamster from '../characters/hamster-hamtaro.gif'
import cutePixel2 from '../characters/cute-pixel-2.gif'
import excited from '../characters/excited-happy.gif'

// Evolved forms
import penguinEvolved from '../characters/AFKEPeng.gif'

// Evolution animations (played once during the evolution moment)
import penguinEvolveAnim from '../characters/penguinE.gif'

// Each monster type has a base form and optionally an evolved form.
// To add evolution for another monster, just add an `evolved` key.
const MONSTER_TYPES = {
  1: { name: 'Penguin',  src: penguin,    evolved: penguinEvolved, evolveAnim: penguinEvolveAnim },
  2: { name: 'Seal',     src: seal,       evolved: null, evolveAnim: null },
  3: { name: 'Cleffa',   src: cleffa,     evolved: null, evolveAnim: null },
  4: { name: 'Duck',     src: duck,       evolved: null, evolveAnim: null },
  5: { name: 'Pixie',    src: cutePixel,  evolved: null, evolveAnim: null },
  6: { name: 'Follony',  src: follony,    evolved: null, evolveAnim: null },
  7: { name: 'Hamster',  src: hamster,    evolved: null, evolveAnim: null },
  8: { name: 'Pixie2',   src: cutePixel2, evolved: null, evolveAnim: null },
  9: { name: 'Excited',  src: excited,    evolved: null, evolveAnim: null },
}

const TYPE_COUNT = Object.keys(MONSTER_TYPES).length

export function getMonsterName(monsterType) {
  return MONSTER_TYPES[monsterType]?.name || 'Unknown'
}

export function getMonsterTypeCount() {
  return TYPE_COUNT
}

export function getEvolveAnim(monsterType) {
  // Use the monster's own evolve animation if available, otherwise fall back to penguin's
  return MONSTER_TYPES[monsterType]?.evolveAnim || penguinEvolveAnim
}

export default function PixelMonster({
  evolution = 'baby',
  monsterType = null,
  customImageUrl = null,
  size = 'medium',
  animated = false,
  isPlayer = false,
  className = '',
}) {
  const sizeMap = {
    small: 48,
    medium: 72,
    large: 112,
  }
  const px = sizeMap[size] || sizeMap.medium

  const type = monsterType && MONSTER_TYPES[monsterType] ? monsterType : 1
  const monsterData = MONSTER_TYPES[type]

  // Use evolved sprite if evolution is teen or above AND an evolved form exists
  const isEvolved = evolution !== 'baby' && monsterData.evolved
  const defaultSrc = isEvolved ? monsterData.evolved : monsterData.src

  // If a custom AI-generated character image exists, use it; otherwise use the default sprite
  const spriteSrc = customImageUrl || defaultSrc
  const altText = customImageUrl ? 'Your character' : monsterData.name

  return (
    <div
      className={`inline-block ${animated ? 'animate-float' : ''} ${isPlayer ? 'drop-shadow-lg' : ''} ${className}`}
      style={{
        filter: isPlayer ? 'drop-shadow(0 0 8px rgba(255, 230, 109, 0.6))' : 'none',
      }}
    >
      <img
        src={spriteSrc}
        alt={altText}
        width={px}
        height={px}
        style={{
          imageRendering: 'pixelated',
          mixBlendMode: customImageUrl ? 'normal' : 'multiply',
          borderRadius: customImageUrl ? '8px' : '0',
          objectFit: 'contain',
        }}
        draggable={false}
      />
    </div>
  )
}
