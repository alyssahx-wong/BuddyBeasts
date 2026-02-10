import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function NavigationBar() {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { path: '/hub', icon: '🏠', label: 'Hub' },
    { path: '/quests', icon: '📋', label: 'Quests' },
    { path: '/chat', icon: '💬', label: 'Chat' },
    { path: '/profile', icon: '👾', label: 'Profile' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-pixel-dark border-t-4 border-pixel-purple z-50">
      <div className="max-w-4xl mx-auto flex justify-around items-center py-3 px-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`
                flex flex-col items-center gap-1 px-4 py-2 rounded transition-all
                ${isActive 
                  ? 'bg-pixel-purple text-pixel-yellow' 
                  : 'text-pixel-light hover:text-pixel-pink'
                }
              `}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs font-game">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
