import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMonsterStore } from '../stores/monsterStore'
import api from '../api'

console.log('🎨 GroupPhotoGallery.jsx loaded!')

export default function GroupPhotoGallery() {
  const navigate = useNavigate()
  const { deleteGroupPhoto } = useMonsterStore()
  const [groupPhotos, setGroupPhotos] = useState([])
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [loadingStatus, setLoadingStatus] = useState('Loading photos...')
  const fetchedRef = useRef(false)

  useEffect(() => {
    // Fetch directly from backend API
    if (!fetchedRef.current) {
      fetchedRef.current = true
      console.log('🎨 GroupPhotoGallery mounted, fetching photos from API...')
      setLoadingStatus('Fetching from API...')
      
      api.get('/api/quests/photos/gallery')
        .then((response) => {
          console.log('✅ API Response:', response.data)
          setLoadingStatus(`Got ${response.data?.photos?.length || 0} photos`)
          if (response.data && response.data.photos) {
            const photos = response.data.photos.map((photo) => ({
              id: photo.id,
              imageUrl: photo.imageUrl,  // Cloud storage URL from S3
              questTitle: photo.questId,
              questIcon: '📸',
              groupMemory: photo.groupMemory,
              groupSize: photo.groupSize,
              timestamp: photo.timestamp,
            }))
            console.log('📷 Setting', photos.length, 'photos')
            setLoadingStatus(`Loaded ${photos.length} photos`)
            setGroupPhotos(photos)
          }
        })
        .catch((err) => {
          console.error('❌ Failed to fetch photos:', err)
          setLoadingStatus(`Error: ${err.message}`)
        })
    }
  }, [])

  const handleDownload = (photo) => {
    // For S3 URLs, open in new tab or download directly
    const link = document.createElement('a')
    link.href = photo.imageUrl
    link.download = `group-photo-${photo.id}.jpg`
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDelete = (photoId) => {
    if (window.confirm('Delete this photo? This cannot be undone.')) {
      deleteGroupPhoto(photoId)
      setSelectedPhoto(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pixel-dark via-pixel-purple to-pixel-dark pb-20">
      {/* Header */}
      <div className="bg-pixel-dark border-b-4 border-pixel-purple p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="font-pixel text-sm md:text-base text-pixel-yellow">
              Group Photo Gallery
            </h1>
            <button
              onClick={() => navigate('/hub')}
              className="text-pixel-pink hover:text-pixel-light text-sm font-game"
            >
              Back
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-4 p-2 bg-pixel-purple text-pixel-yellow font-pixel text-xs">
          Status: {loadingStatus}
        </div>
        {(() => {
          console.log('🎨 RENDERING GALLERY - groupPhotos count:', groupPhotos?.length || 0)
          return null
        })()}
        {console.log('🖼️ Rendering gallery with', groupPhotos.length, 'photos')}
        {groupPhotos.length === 0 ? (
          <div className="pixel-card p-8 text-center">
            <p className="text-4xl mb-3">📷</p>
            <h2 className="font-pixel text-base text-pixel-yellow mb-2">
              No group photos yet
            </h2>
            <p className="text-xs text-pixel-light font-game mb-4">
              Complete a quest together and upload a photo to see it here!
            </p>
            <button
              onClick={() => navigate('/quests')}
              className="pixel-button bg-pixel-blue text-white px-6 py-3"
            >
              Go to Quests
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-xs text-pixel-light font-game">
                {groupPhotos.length} photo{groupPhotos.length !== 1 ? 's' : ''} saved
              </p>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {groupPhotos.map((photo) => (
                <button
                  key={photo.id}
                  onClick={() => setSelectedPhoto(photo)}
                  className="relative group overflow-hidden pixel-card hover:border-pixel-yellow transition-all"
                >
                  <img
                    src={photo.imageUrl}
                    alt={photo.questTitle}
                    className="w-full h-40 object-cover group-hover:opacity-80 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-end p-2">
                    <div className="text-left">
                      <p className="text-xs font-pixel text-pixel-yellow leading-none">
                        {photo.questIcon}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Lightbox Modal */}
            {selectedPhoto && (
              <div
                className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                onClick={() => setSelectedPhoto(null)}
              >
                <div
                  className="pixel-card bg-pixel-dark p-4 max-w-2xl w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="mb-3">
                    <img
                      src={selectedPhoto.imageUrl}
                      alt={selectedPhoto.questTitle}
                      className="w-full max-h-96 object-cover pixel-card"
                    />
                  </div>

                  <div className="pixel-card p-3 bg-pixel-blue bg-opacity-20 mb-3">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-2xl">{selectedPhoto.questIcon}</span>
                      <div>
                        <h3 className="font-pixel text-xs text-pixel-yellow">
                          {selectedPhoto.questTitle}
                        </h3>
                        <p className="text-xs text-pixel-blue font-game">
                          {selectedPhoto.groupSize} people • {selectedPhoto.date}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-pixel-light font-game">
                      Group felt: <span className="text-pixel-yellow">{selectedPhoto.groupMemory}</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setSelectedPhoto(null)}
                      className="pixel-button bg-pixel-gray text-white text-xs py-2"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => handleDownload(selectedPhoto)}
                      className="pixel-button bg-pixel-blue text-white text-xs py-2"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(selectedPhoto.id)}
                      className="pixel-button bg-pixel-pink text-white text-xs py-2"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
