'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface Creative {
  id: string
  headline: {
    id: string
    text: string
  }
  image: {
    id: string
    imageUrl: string
    prompt: string
  }
}

interface CreativesGalleryProps {
  campaignId: string
}

export default function CreativesGallery({
  campaignId,
}: CreativesGalleryProps) {
  const [creatives, setCreatives] = useState<Creative[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchCreatives()
  }, [campaignId])

  const fetchCreatives = async () => {
    try {
      const response = await fetch(`/api/creatives?campaignId=${campaignId}`)
      const result = await response.json()

      if (result.success && result.data) {
        setCreatives(result.data.creatives)
      }
    } catch (err) {
      console.error('Failed to fetch creatives:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this creative pair?')) {
      return
    }

    setDeletingId(id)

    try {
      const response = await fetch(`/api/creatives/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete creative')
      }

      await fetchCreatives()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <span className="text-4xl animate-spin">⚡</span>
          <p className="text-slate-400">Loading creatives...</p>
        </div>
      </div>
    )
  }

  if (creatives.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white/5 border-2 border-dashed border-white/10 rounded-2xl backdrop-blur-sm">
        <div className="text-6xl mb-4">🎨</div>
        <p className="text-xl font-semibold text-white mb-2">
          No creatives yet
        </p>
        <p className="text-slate-400 text-center max-w-md">
          Pair headlines with images to create your first creative masterpiece
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {creatives.map((creative) => (
        <div
          key={creative.id}
          className="group relative bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20"
        >
          <div className="relative aspect-video bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            <Image
              src={creative.image.imageUrl}
              alt={creative.headline.text}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-sm font-medium text-white leading-relaxed line-clamp-2">
                  {creative.headline.text}
                </p>
              </div>
            </div>
          </div>
          <div className="p-4">
            <p className="text-sm font-medium text-white/90 mb-4 line-clamp-2">
              {creative.headline.text}
            </p>
            <button
              onClick={() => handleDelete(creative.id)}
              disabled={deletingId === creative.id}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-medium hover:from-red-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-red-500/25 text-sm"
            >
              {deletingId === creative.id ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⚡</span>
                  Removing...
                </span>
              ) : (
                '🗑️ Remove Pair'
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
