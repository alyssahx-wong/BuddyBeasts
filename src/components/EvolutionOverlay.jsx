import React, { useEffect, useState } from 'react'

export default function EvolutionOverlay({ animSrc, monsterName, onComplete }) {
  const [phase, setPhase] = useState('flash') // flash → anim → reveal → done

  useEffect(() => {
    // Phase 1: white flash (0.6s)
    const t1 = setTimeout(() => setPhase('anim'), 600)
    // Phase 2: play evolution GIF (3.5s)
    const t2 = setTimeout(() => setPhase('reveal'), 4100)
    // Phase 3: reveal text (2s)
    const t3 = setTimeout(() => {
      setPhase('done')
      onComplete?.()
    }, 6100)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.55)' }}>
      {/* White flash */}
      {phase === 'flash' && (
        <div className="absolute inset-0 bg-white animate-pulse" style={{ animation: 'flash-fade 0.6s ease-out forwards' }} />
      )}

      {/* Evolution animation GIF */}
      {(phase === 'anim' || phase === 'reveal') && (
        <div className="flex flex-col items-center gap-6">
          <img
            src={animSrc}
            alt="Evolution"
            className="w-48 h-48 md:w-64 md:h-64"
            style={{ imageRendering: 'pixelated' }}
          />
          {phase === 'reveal' && (
            <div className="text-center animate-float">
              <p className="font-pixel text-lg text-pixel-yellow mb-2">
                ✨ EVOLVED! ✨
              </p>
              <p className="font-cute text-sm text-pixel-light">
                {monsterName} reached a new form!
              </p>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes flash-fade {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
