import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

function getPhotoSrc(photo) {
  return photo.imageUrl || photo.imageData || photo.imageBase64
}

export default function GroupPhotoGallery() {
  const navigate = useNavigate()
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState(null)

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const { data } = await api.get('/api/quests/photos/gallery')
        setPhotos(data.photos || [])
      } catch (err) {
        console.error('Failed to fetch gallery:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPhotos()
  }, [])

  const handleDownload = (photo) => {
    const src = getPhotoSrc(photo)
    if (photo.imageUrl) {
      window.open(src, '_blank')
    } else {
      const link = document.createElement('a')
      link.href = src
      link.download = `group-photo-${photo.id}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
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
        {loading ? (
          <div className="pixel-card p-8 text-center">
            <p className="text-pixel-light font-game animate-pulse">Loading photos...</p>
          </div>
        ) : photos.length === 0 ? (
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
                {photos.length} photo{photos.length !== 1 ? 's' : ''} from your quests
              </p>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {photos.map((photo) => (
                <button
                  key={photo.id}
                  onClick={() => setSelectedPhoto(photo)}
                  className="relative group overflow-hidden pixel-card hover:border-pixel-yellow transition-all"
                >
                  <img
                    src={getPhotoSrc(photo)}
                    alt="Quest photo"
                    className="w-full h-40 object-cover group-hover:opacity-80 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-end p-2">
                    <div className="text-left">
                      {photo.uploadedBy && (
                        <p className="text-xs font-game text-pixel-yellow leading-none">
                          by {photo.uploadedBy}
                        </p>
                      )}
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
                      src={getPhotoSrc(selectedPhoto)}
                      alt="Quest photo"
                      className="w-full max-h-96 object-cover pixel-card"
                    />
                  </div>

                  <div className="pixel-card p-3 bg-pixel-blue bg-opacity-20 mb-3">
                    <div className="flex items-start gap-2 mb-2">
                      <div>
                        <p className="text-xs text-pixel-blue font-game">
                          {selectedPhoto.groupSize} people
                          {selectedPhoto.uploadedBy && ` \u2022 by ${selectedPhoto.uploadedBy}`}
                        </p>
                      </div>
                    </div>
                    {selectedPhoto.groupMemory && (
                      <p className="text-xs text-pixel-light font-game">
                        Group felt: <span className="text-pixel-yellow">{selectedPhoto.groupMemory}</span>
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
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
