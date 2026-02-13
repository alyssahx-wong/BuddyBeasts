import React, { useEffect, useState, useMemo } from 'react'
import eggShaking from '../characters/egg-shaking.gif'
import eggCracking from '../characters/egg-cracking.gif'

/**
 * Evolution overlay with egg-based animation sequence.
 *
 * Phases:
 *   1. "flash"       – white flash (0.6s)
 *   2. "baby"        – show current baby/pre-evolution monster image (1.5s)
 *   3. "egg-shaking" – egg shaking GIF overlays the monster, loops while waiting (stays until AI done)
 *   4. "egg-ready"   – new evolved image placed behind egg (brief pause 0.8s)
 *   5. "egg-crack"   – egg cracking GIF plays, halves split revealing new form (3s)
 *   6. "showcase"    – new evolved form displayed with celebration text (3s)
 *   7. "done"        – overlay dismissed
 *
 * Props:
 *   babyImageUrl   – current monster image (AI-generated data URI or null)
 *   babySpriteSrc  – fallback GIF sprite for the baby monster
 *   monsterName    – display name
 *   evolvedImageUrl – new AI-generated image (null until Sogni finishes)
 *   generationError – error string if Sogni failed
 *   onComplete     – called when the full sequence finishes
 */
export default function EvolutionOverlay({
  babyImageUrl,
  babySpriteSrc,
  monsterName,
  evolvedImageUrl,
  generationError,
  onComplete,
}) {
  const [phase, setPhase] = useState('flash')

  // The baby image to show — prefer AI image, fall back to sprite GIF
  const babyImg = babyImageUrl || babySpriteSrc

  // Phase 1 → 2: flash → baby
  useEffect(() => {
    const t = setTimeout(() => setPhase('baby'), 600)
    return () => clearTimeout(t)
  }, [])

  // Phase 2 → 3: baby → egg-shaking (after showing the baby briefly)
  useEffect(() => {
    if (phase !== 'baby') return
    const t = setTimeout(() => setPhase('egg-shaking'), 1500)
    return () => clearTimeout(t)
  }, [phase])

  // Phase 3 → 4: once Sogni finishes (or errors), move to egg-ready
  useEffect(() => {
    if (phase !== 'egg-shaking') return
    if (evolvedImageUrl) {
      setPhase('egg-ready')
    } else if (generationError) {
      // On error, skip to showcase with whatever we have
      setPhase('showcase')
    }
  }, [phase, evolvedImageUrl, generationError])

  // Phase 4 → 5: brief pause then crack
  useEffect(() => {
    if (phase !== 'egg-ready') return
    const t = setTimeout(() => setPhase('egg-crack'), 800)
    return () => clearTimeout(t)
  }, [phase])

  // Phase 5 → 6: egg crack plays for 3s then showcase
  useEffect(() => {
    if (phase !== 'egg-crack') return
    const t = setTimeout(() => setPhase('showcase'), 3000)
    return () => clearTimeout(t)
  }, [phase])

  // Phase 6 → 7: showcase for 3s then done
  useEffect(() => {
    if (phase !== 'showcase') return
    const t = setTimeout(() => {
      setPhase('done')
      onComplete?.()
    }, 3000)
    return () => clearTimeout(t)
  }, [phase, onComplete])

  // Force the egg-cracking GIF to restart each time by cache-busting
  const eggCrackSrc = useMemo(
    () => `${eggCracking}?t=${Date.now()}`,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [phase === 'egg-crack']
  )

  if (phase === 'done') return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)' }}
    >
      {/* Phase 1: White flash */}
      {phase === 'flash' && (
        <div
          className="absolute inset-0 bg-white"
          style={{ animation: 'flash-fade 0.6s ease-out forwards' }}
        />
      )}

      {/* Phase 2: Baby monster display */}
      {phase === 'baby' && babyImg && (
        <div className="flex flex-col items-center gap-4 animate-float">
          <img
            src={babyImg}
            alt={monsterName}
            className="w-40 h-40 md:w-56 md:h-56"
            style={{ imageRendering: 'pixelated' }}
          />
          <p className="font-pixel text-xs text-pixel-light opacity-70">
            {monsterName} is evolving...
          </p>
        </div>
      )}

      {/* Phase 3: Egg shaking over the monster — waiting for AI */}
      {phase === 'egg-shaking' && (
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
            {/* Baby monster behind the egg (dimmed) */}
            {babyImg && (
              <img
                src={babyImg}
                alt={monsterName}
                className="absolute w-32 h-32 md:w-44 md:h-44 opacity-30"
                style={{ imageRendering: 'pixelated' }}
              />
            )}
            {/* Egg shaking GIF on top */}
            <img
              src={eggShaking}
              alt="Egg shaking"
              className="relative w-48 h-48 md:w-64 md:h-64"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
          <div className="text-center">
            <p className="font-pixel text-[10px] text-pixel-yellow animate-pulse">
              Generating your evolved monster...
            </p>
            <p className="font-game text-xs text-pixel-light/60 mt-1">
              Based on your personality traits
            </p>
          </div>
          {/* Pulsing glow behind the egg */}
          <div
            className="absolute w-64 h-64 rounded-full opacity-20 pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(168,130,255,0.5) 0%, rgba(100,180,255,0.3) 50%, transparent 70%)',
              animation: 'egg-glow-pulse 2s ease-in-out infinite',
            }}
          />
        </div>
      )}

      {/* Phase 4: Egg with new image behind it (brief pause) */}
      {phase === 'egg-ready' && (
        <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
          {evolvedImageUrl && (
            <img
              src={evolvedImageUrl}
              alt="Evolved form"
              className="absolute w-36 h-36 md:w-48 md:h-48 opacity-0"
              style={{ imageRendering: 'pixelated' }}
            />
          )}
          <img
            src={eggShaking}
            alt="Egg"
            className="relative w-48 h-48 md:w-64 md:h-64"
            style={{ imageRendering: 'pixelated' }}
          />
          <div
            className="absolute w-72 h-72 rounded-full opacity-30 pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(168,130,255,0.6) 0%, rgba(100,180,255,0.4) 40%, transparent 70%)',
            }}
          />
        </div>
      )}

      {/* Phase 5: Egg cracking open — new form revealed behind */}
      {phase === 'egg-crack' && (
        <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
          {/* New evolved image behind the cracking egg */}
          {evolvedImageUrl && (
            <img
              src={evolvedImageUrl}
              alt="Evolved form"
              className="absolute w-36 h-36 md:w-48 md:h-48"
              style={{
                imageRendering: 'pixelated',
                animation: 'evolved-reveal 2.5s ease-out forwards',
              }}
            />
          )}
          {/* Egg cracking GIF on top */}
          <img
            src={eggCrackSrc}
            alt="Egg cracking"
            className="relative w-48 h-48 md:w-64 md:h-64"
            style={{ imageRendering: 'pixelated' }}
          />
          {/* Glow intensifies */}
          <div
            className="absolute w-80 h-80 rounded-full opacity-40 pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(255,230,109,0.5) 0%, rgba(168,130,255,0.4) 40%, transparent 70%)',
              animation: 'egg-glow-burst 1.5s ease-out forwards',
            }}
          />
        </div>
      )}

      {/* Phase 6: Showcase the new form */}
      {phase === 'showcase' && (
        <div className="flex flex-col items-center gap-5 animate-float">
          {evolvedImageUrl ? (
            <img
              src={evolvedImageUrl}
              alt="New evolved form"
              className="w-48 h-48 md:w-64 md:h-64 drop-shadow-[0_0_20px_rgba(168,130,255,0.6)]"
              style={{ imageRendering: 'pixelated' }}
            />
          ) : babyImg ? (
            <img
              src={babyImg}
              alt={monsterName}
              className="w-48 h-48 md:w-64 md:h-64"
              style={{ imageRendering: 'pixelated' }}
            />
          ) : null}
          <div className="text-center">
            <p className="font-pixel text-lg text-pixel-yellow mb-2">
              {generationError ? '⚠ Evolution Complete!' : '✨ NEW FORM UNLOCKED! ✨'}
            </p>
            <p className="font-game text-sm text-pixel-light">
              {generationError
                ? `${monsterName} evolved! (Image generation failed)`
                : `${monsterName} has reached a new form!`}
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes flash-fade {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes egg-glow-pulse {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.15); opacity: 0.35; }
        }
        @keyframes egg-glow-burst {
          0% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.3); opacity: 0.6; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes evolved-reveal {
          0% { opacity: 0; transform: scale(0.8); }
          60% { opacity: 0.3; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
