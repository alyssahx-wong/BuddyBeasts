import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import api from '../api'

export default function HubSelection() {
  const navigate = useNavigate()
  const { user, setCurrentHub } = useAuthStore()
  const [location, setLocation] = useState(null)
  const [locationError, setLocationError] = useState(null)
  const [selectedHub, setSelectedHub] = useState(null)
  const [hubs, setHubs] = useState([])
  const [isLoadingLocation, setIsLoadingLocation] = useState(true)
  const [joining, setJoining] = useState(false)

  // Fetch hubs from backend, optionally with user coordinates
  const fetchHubs = async (coords) => {
    try {
      const params = {}
      if (coords) {
        params.lat = coords.lat
        params.lng = coords.lng
      }
      const { data } = await api.get('/api/hubs', { params })
      setHubs(data)
      if (data.length > 0) {
        setSelectedHub(data[0])
      }
    } catch (err) {
      console.error('Failed to fetch hubs:', err)
    }
  }

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setLocation(coords)
          setIsLoadingLocation(false)
          fetchHubs(coords)
        },
        (error) => {
          console.error('Geolocation error:', error)
          setLocationError('Unable to access location. Please select a hub manually.')
          setIsLoadingLocation(false)
          fetchHubs(null)
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
      fetchHubs(null)
    }
  }, [])

  const handleJoinHub = async () => {
    if (!selectedHub) return
    try {
      setJoining(true)
      await api.post(`/api/hubs/${selectedHub.id}/join`)
      setCurrentHub(selectedHub)
      navigate('/hub')
    } catch (err) {
      console.error('Failed to join hub:', err)
    } finally {
      setJoining(false)
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
          disabled={!selectedHub || joining}
          className="pixel-button bg-pixel-yellow hover:bg-pixel-pink text-pixel-dark w-full py-4 text-base disabled:opacity-50"
        >
          {joining ? 'Joining...' : `Join ${selectedHub?.name || 'Hub'}`}
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
