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

const ITEM_EMOJIS = {
  hat_wizard: '🧙‍♂️',
  hat_cap: '🧢',
  hat_crown: '👑',
  outfit_hoodie: '🧥',
  outfit_armor: '🛡️',
  outfit_dress: '👗',
}

export default function PixelMonster({
  evolution = 'baby',
  size = 'medium',
  animated = false,
  isPlayer = false,
  skin = 'default',
  className = '',
  equippedItems = {},
  monsterId = null,
  usePixelArt = true,
}) {
  const sprite = MONSTER_SPRITES[evolution]?.[size] || MONSTER_SPRITES.baby[size]

  const sizeClasses = {
    small: 'text-2xl h-8',
    medium: 'text-4xl h-16',
    large: 'text-6xl h-24',
  }

  const skinClass = SKIN_STYLES[skin] || SKIN_STYLES.default

  // Use pixel art image if monsterId is provided and usePixelArt is true
  const shouldUsePixelArt = usePixelArt && monsterId

  return (
    <div
      className={`
        pixelated inline-block relative
        ${animated ? 'animate-float' : ''}
        ${isPlayer ? 'drop-shadow-lg' : ''}
        ${shouldUsePixelArt ? '' : sizeClasses[size]}
        ${skinClass}
        ${className}
      `}
      style={{
        filter: isPlayer ? 'drop-shadow(0 0 8px rgba(255, 230, 109, 0.6))' : 'none',
        imageRendering: 'pixelated',
      }}
    >
      {shouldUsePixelArt ? (
        <img
          src={`/src/monster_imgs/${monsterId}.png`}
          alt={`Monster ${monsterId}`}
          className={`object-contain ${
            size === 'small' ? 'h-8' : size === 'medium' ? 'h-16' : 'h-24'
          }`}
          style={{ imageRendering: 'pixelated' }}
        />
      ) : (
        sprite
      )}
      {equippedItems?.hat && (
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl">
          {ITEM_EMOJIS[equippedItems.hat] || '🎩'}
        </span>
      )}
      {equippedItems?.outfit && (
        <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-xl">
          {ITEM_EMOJIS[equippedItems.outfit] || '🧥'}
        </span>
      )}
    </div>
  )
}
