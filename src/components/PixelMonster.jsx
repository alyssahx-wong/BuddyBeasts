import React from 'react'

const MONSTER_SPRITES = {
  baby: { small: '🥚', medium: '🐣', large: '🐥' },
  teen: { small: '🐤', medium: '🦆', large: '🦜' },
  adult: { small: '🦉', medium: '🦅', large: '🦚' },
  leader: { small: '👑', medium: '🦁', large: '🐉' },
  support: { small: '💝', medium: '🦄', large: '🌟' },
}

const SKIN_STYLES = {
  default: '',
  star: 'pixel-skin-star',
  leaf: 'pixel-skin-leaf',
  crystal: 'pixel-skin-crystal',
}

export default function PixelMonster({
  evolution = 'baby',
  size = 'medium',
  animated = false,
  isPlayer = false,
  skin = 'default',
  className = '',
}) {
  const sprite = MONSTER_SPRITES[evolution]?.[size] || MONSTER_SPRITES.baby[size]
  const sizeClasses = {
    small: 'text-2xl',
    medium: 'text-4xl',
    large: 'text-6xl',
  }
  const skinClass = SKIN_STYLES[skin] || SKIN_STYLES.default

  return (
    <div
      className={`
        pixel-monster-frame inline-block
        pixel-border
        ${animated ? 'animate-float' : ''}
        ${isPlayer ? 'drop-shadow-lg' : ''}
        ${sizeClasses[size]}
        ${skinClass}
        ${className}
      `}
      style={{
        filter: isPlayer ? 'drop-shadow(0 0 8px rgba(255, 230, 109, 0.6))' : undefined,
      }}
    >
      {sprite}
    </div>
  )
}
