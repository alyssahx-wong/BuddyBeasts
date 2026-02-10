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

<<<<<<< HEAD
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
=======
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
>>>>>>> 466c87e841ca528527bbd806b5ef8bef8ee848fd
}

export default function PixelMonster({
  evolution = 'baby',
<<<<<<< HEAD
  monsterType = null,
=======
>>>>>>> 466c87e841ca528527bbd806b5ef8bef8ee848fd
  size = 'medium',
  animated = false,
  isPlayer = false,
  skin = 'default',
  className = '',
  equippedItems = {},
  monsterId = null,
  usePixelArt = true,
}) {
<<<<<<< HEAD
  const sizeMap = {
    small: 48,
    medium: 72,
    large: 112
=======
  const sprite = MONSTER_SPRITES[evolution]?.[size] || MONSTER_SPRITES.baby[size]

  const sizeClasses = {
    small: 'text-2xl h-8',
    medium: 'text-4xl h-16',
    large: 'text-6xl h-24',
>>>>>>> 466c87e841ca528527bbd806b5ef8bef8ee848fd
  }
  const px = sizeMap[size] || sizeMap.medium

  const type = monsterType && MONSTER_TYPES[monsterType] ? monsterType : 1
  const monsterData = MONSTER_TYPES[type]

  // Use evolved sprite if evolution is teen or above AND an evolved form exists
  const isEvolved = evolution !== 'baby' && monsterData.evolved
  const spriteSrc = isEvolved ? monsterData.evolved : monsterData.src

  const skinClass = SKIN_STYLES[skin] || SKIN_STYLES.default

  // Use pixel art image if monsterId is provided and usePixelArt is true
  const shouldUsePixelArt = usePixelArt && monsterId

  return (
    <div
<<<<<<< HEAD
      className={`inline-block ${animated ? 'animate-float' : ''} ${isPlayer ? 'drop-shadow-lg' : ''} ${className}`}
=======
      className={`
        pixelated inline-block relative
        ${animated ? 'animate-float' : ''}
        ${isPlayer ? 'drop-shadow-lg' : ''}
        ${shouldUsePixelArt ? '' : sizeClasses[size]}
        ${skinClass}
        ${className}
      `}
>>>>>>> 466c87e841ca528527bbd806b5ef8bef8ee848fd
      style={{
        filter: isPlayer ? 'drop-shadow(0 0 8px rgba(255, 230, 109, 0.6))' : 'none',
        imageRendering: 'pixelated',
      }}
    >
<<<<<<< HEAD
      <img
        src={spriteSrc}
        alt={monsterData.name}
        width={px}
        height={px}
        style={{
          imageRendering: 'pixelated',
          mixBlendMode: 'multiply',
        }}
        draggable={false}
      />
=======
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
>>>>>>> 466c87e841ca528527bbd806b5ef8bef8ee848fd
    </div>
  )
}
