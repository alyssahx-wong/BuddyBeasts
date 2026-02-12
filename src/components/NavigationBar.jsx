import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useChatStore } from '../stores/chatStore'

export default function NavigationBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { getTotalUnreadCount, startBackgroundPolling, stopBackgroundPolling } = useChatStore()
  const totalUnread = getTotalUnreadCount()

  // Start background polling when component mounts
  useEffect(() => {
    if (location.pathname !== '/chat') {
      startBackgroundPolling()
    } else {
      stopBackgroundPolling()
    }
    
    return () => stopBackgroundPolling()
  }, [location.pathname, startBackgroundPolling, stopBackgroundPolling])

  const navItems = [
    { path: '/hub', icon: '🏠', label: 'Hub' },
    { path: '/quests', icon: '📋', label: 'Quests' },
    { path: '/chat', icon: '💬', label: 'Chat' },
    { path: '/gallery', icon: '📸', label: 'Gallery' },
    { path: '/profile', icon: '👾', label: 'Profile' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-pixel-dark border-t-4 border-pixel-purple z-50 pb-safe">
      <div className="max-w-4xl mx-auto flex justify-around items-center py-1 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`
                touch-target flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded transition-all min-w-[56px] relative
                ${isActive
                  ? 'bg-pixel-purple text-pixel-yellow'
                  : 'text-pixel-light hover:text-pixel-pink'
                }
              `}
              aria-label={item.label}
            >
              <span className="text-2xl" aria-hidden>{item.icon}</span>
              <span className="text-xs font-game">{item.label}</span>
              {item.path === '/chat' && totalUnread > 0 && (
                <span className="absolute top-0 right-1 w-5 h-5 bg-pixel-pink rounded-full text-white font-pixel text-[10px] flex items-center justify-center animate-pulse border-2 border-pixel-dark">
                  {totalUnread > 9 ? '9+' : totalUnread}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
