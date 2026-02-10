import React from 'react'

const MONSTER_SPRITES = {
  baby: {
    small: '🥚',
    medium: '🐣',
    large: '🐥'
  },
  teen: {
    small: '🐤',
    medium: '🦆',
    large: '🦜'
  },
  adult: {
    small: '🦉',
    medium: '🦅',
    large: '🦚'
  },
  leader: {
    small: '👑',
    medium: '🦁',
    large: '🐉'
  },
  support: {
    small: '💝',
    medium: '🦄',
    large: '🌟'
  }
}

export default function PixelMonster({ 
  evolution = 'baby', 
  size = 'medium', 
  animated = false,
  isPlayer = false,
  className = ''
}) {
  const sprite = MONSTER_SPRITES[evolution]?.[size] || MONSTER_SPRITES.baby[size]
  
  const sizeClasses = {
    small: 'text-2xl',
    medium: 'text-4xl',
    large: 'text-6xl'
  }

  return (
    <div 
      className={`
        pixel-border inline-block
        ${animated ? 'animate-float' : ''}
        ${isPlayer ? 'drop-shadow-lg' : ''}
        ${sizeClasses[size]}
        ${className}
      `}
      style={{
        filter: isPlayer ? 'drop-shadow(0 0 8px rgba(255, 230, 109, 0.6))' : 'none'
      }}
    >
      {sprite}
    </div>
  )
}
