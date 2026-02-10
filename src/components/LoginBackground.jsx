import React from 'react'

/**
 * Animated background pattern for login page
 * Can be replaced with PixelLab generated tileset backgrounds
 */
export default function LoginBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-pixel-dark via-pixel-purple to-pixel-dark opacity-80" />

      {/* Animated pixels */}
      <div className="absolute inset-0">
        {/* Floating pixel squares - background layer */}
        <div className="absolute top-10 left-10 w-4 h-4 bg-pixel-pink opacity-20 animate-float" />
        <div className="absolute top-1/4 right-20 w-6 h-6 bg-pixel-blue opacity-15 animate-pulse-slow" />
        <div className="absolute bottom-1/3 left-1/4 w-3 h-3 bg-pixel-green opacity-20 animate-bounce" />
        <div className="absolute top-1/3 right-1/3 w-5 h-5 bg-pixel-yellow opacity-10" />

        {/* Pixel art decorations */}
        <div className="absolute bottom-20 left-5 text-6xl opacity-20">🌳</div>
        <div className="absolute top-20 right-10 text-4xl opacity-30">☁️</div>
        <div className="absolute bottom-40 right-20 text-5xl opacity-20">🌳</div>
        <div className="absolute top-1/2 left-1/4 text-3xl opacity-25">☁️</div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>
    </div>
  )
}
