import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useHubStore } from '../stores/hubStore'

// Mock hubs data (replace with real API later)
const MOCK_HUBS = [
  {
    id: 'hub_campus_main',
    name: 'Main Campus Hub',
    location: 'University Campus',
    distance: 0.5,
    activeUsers: 24,
    coordinates: { lat: 43.6532, lng: -79.3832 }
  },
  {
    id: 'hub_downtown',
    name: 'Downtown Community',
    location: 'Downtown Core',
    distance: 2.1,
    activeUsers: 18,
    coordinates: { lat: 43.6426, lng: -79.3871 }
  },
  {
    id: 'hub_eastside',
    name: 'East Side Neighborhood',
    location: 'East Toronto',
    distance: 3.8,
    activeUsers: 12,
    coordinates: { lat: 43.6629, lng: -79.3506 }
  },
  {
    id: 'hub_westend',
    name: 'West End Village',
    location: 'West Toronto',
    distance: 4.2,
    activeUsers: 15,
    coordinates: { lat: 43.6476, lng: -79.4163 }
  },
]

export default function HubSelection() {
  const navigate = useNavigate()
  const { user, setCurrentHub } = useAuthStore()
  const [location, setLocation] = useState(null)
  const [locationError, setLocationError] = useState(null)
  const [selectedHub, setSelectedHub] = useState(null)
  const [hubs, setHubs] = useState(MOCK_HUBS)
  const [isLoadingLocation, setIsLoadingLocation] = useState(true)

  useEffect(() => {
    // Try to get user's location
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          setIsLoadingLocation(false)
          
          // Auto-select nearest hub
          const nearest = MOCK_HUBS[0]
          setSelectedHub(nearest)
        },
        (error) => {
          console.error('Geolocation error:', error)
          setLocationError('Unable to access location. Please select a hub manually.')
          setIsLoadingLocation(false)
          
          // Auto-select first hub as default
          setSelectedHub(MOCK_HUBS[0])
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      )
    } else {
      setLocationError('Geolocation not supported. Please select a hub manually.')
      setIsLoadingLocation(false)
      setSelectedHub(MOCK_HUBS[0])
    }
  }, [])

  const handleJoinHub = () => {
    if (selectedHub) {
      setCurrentHub(selectedHub)
      navigate('/hub')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pixel-dark to-pixel-purple p-4">
      <div className="max-w-2xl mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-pixel text-xl md:text-2xl text-pixel-yellow mb-4">
            Choose Your Hub
          </h1>
          <p className="text-lg text-pixel-light font-game">
            Join a local community to start your adventure
          </p>
        </div>

        {/* Location Status */}
        {isLoadingLocation && (
          <div className="pixel-card p-4 mb-6 text-center">
            <div className="animate-pulse text-pixel-blue font-game">
              📍 Finding nearby hubs...
            </div>
          </div>
        )}

        {locationError && (
          <div className="pixel-card p-4 mb-6 bg-pixel-pink bg-opacity-20">
            <p className="text-pixel-yellow font-game text-sm">⚠️ {locationError}</p>
          </div>
        )}

        {location && (
          <div className="pixel-card p-4 mb-6 bg-pixel-green bg-opacity-20">
            <p className="text-pixel-green font-game text-sm">
              ✓ Location detected - showing nearby hubs
            </p>
          </div>
        )}

        {/* Hub List */}
        <div className="space-y-4 mb-8">
          {hubs.map((hub) => (
            <button
              key={hub.id}
              onClick={() => setSelectedHub(hub)}
              className={`w-full pixel-card p-6 text-left transition-all ${
                selectedHub?.id === hub.id
                  ? 'border-pixel-yellow bg-pixel-yellow bg-opacity-10'
                  : 'hover:border-pixel-blue'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-pixel text-sm md:text-base text-pixel-light mb-2">
                    {hub.name}
                  </h3>
                  <p className="text-pixel-blue font-game">📍 {hub.location}</p>
                </div>
                {selectedHub?.id === hub.id && (
                  <div className="text-2xl animate-pulse-slow">✓</div>
                )}
              </div>
              
              <div className="flex gap-4 mt-4 text-sm font-game">
                {location && (
                  <span className="text-pixel-green">
                    🚶 {hub.distance} km away
                  </span>
                )}
                <span className="text-pixel-pink">
                  👥 {hub.activeUsers} active
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Join Button */}
        <button
          onClick={handleJoinHub}
          disabled={!selectedHub}
          className="pixel-button bg-pixel-yellow hover:bg-pixel-pink text-pixel-dark w-full py-4 text-base"
        >
          Join {selectedHub?.name || 'Hub'}
        </button>

        {/* Info */}
        <div className="mt-8 pixel-card p-4 bg-pixel-purple bg-opacity-20">
          <p className="text-xs text-pixel-light font-game text-center">
            💡 You can switch hubs anytime from your profile
          </p>
        </div>
      </div>
    </div>
  )
}
