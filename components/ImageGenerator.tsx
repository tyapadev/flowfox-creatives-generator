'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface ImageItem {
  id: string
  imageUrl: string
  prompt: string
}

interface ImageGeneratorProps {
  campaignId: string
  campaignContext?: {
    name?: string
    industry?: string
    audience?: string
    tone?: string
    description?: string
  }
  onImagesGenerated: () => void
}

export default function ImageGenerator({
  campaignId,
  campaignContext,
  onImagesGenerated,
}: ImageGeneratorProps) {
  const [count, setCount] = useState(3)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [images, setImages] = useState<ImageItem[]>([])

  useEffect(() => {
    fetchImages()
  }, [campaignId])

  const fetchImages = async () => {
    try {
      const response = await fetch(
        `/api/ai/images/generate?campaignId=${campaignId}`
      )
      const result = await response.json()
      if (result.success && result.data) {
        setImages(result.data.images)
      }
    } catch (err) {
      console.error('Failed to fetch images:', err)
    }
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/images/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId,
          count,
          context: campaignContext,
        }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate images')
      }

      await fetchImages()
      onImagesGenerated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <label className="text-white/90 font-medium">
          Generate:
        </label>
        <select
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          disabled={isGenerating}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
        >
          <option value={1} className="bg-slate-900">1 image</option>
          <option value={2} className="bg-slate-900">2 images</option>
          <option value={3} className="bg-slate-900">3 images</option>
          <option value={4} className="bg-slate-900">4 images</option>
          <option value={5} className="bg-slate-900">5 images</option>
        </select>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-purple-500/25"
        >
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⚡</span>
              Generating...
            </span>
          ) : (
            '🎨 Generate Images'
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl backdrop-blur-sm">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {images.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">
            Generated Images ({images.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((img) => (
              <div
                key={img.id}
                className="group relative aspect-video bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
              >
                <Image
                  src={img.imageUrl}
                  alt={img.prompt}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-xs text-white/90 line-clamp-2">
                      {img.prompt}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
