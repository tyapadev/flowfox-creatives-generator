'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface Headline {
  id: string
  text: string
}

interface ImageItem {
  id: string
  imageUrl: string
  prompt: string
}

interface Creative {
  id: string
  headlineId: string
  imageId: string
  headline: Headline
  image: ImageItem
}

interface PairingInterfaceProps {
  campaignId: string
}

export default function PairingInterface({
  campaignId,
}: PairingInterfaceProps) {
  const [headlines, setHeadlines] = useState<Headline[]>([])
  const [images, setImages] = useState<ImageItem[]>([])
  const [creatives, setCreatives] = useState<Creative[]>([])
  const [selectedHeadlineId, setSelectedHeadlineId] = useState<string | null>(
    null
  )
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)
  const [isPairing, setIsPairing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [campaignId])

  const fetchData = async () => {
    try {
      const [headlinesRes, imagesRes, creativesRes] = await Promise.all([
        fetch(`/api/ai/headlines/generate?campaignId=${campaignId}`),
        fetch(`/api/ai/images/generate?campaignId=${campaignId}`),
        fetch(`/api/creatives?campaignId=${campaignId}`),
      ])

      const headlinesData = await headlinesRes.json()
      const imagesData = await imagesRes.json()
      const creativesData = await creativesRes.json()

      if (headlinesData.success) {
        setHeadlines(headlinesData.data.headlines)
      }
      if (imagesData.success) {
        setImages(imagesData.data.images)
      }
      if (creativesData.success) {
        setCreatives(creativesData.data.creatives)
      }
    } catch (err) {
      console.error('Failed to fetch data:', err)
    }
  }

  const handlePair = async () => {
    if (!selectedHeadlineId || !selectedImageId) {
      setError('Please select both a headline and an image')
      return
    }

    setIsPairing(true)
    setError(null)

    try {
      const response = await fetch('/api/creatives', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId,
          headlineId: selectedHeadlineId,
          imageId: selectedImageId,
        }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to create pair')
      }

      setSelectedHeadlineId(null)
      setSelectedImageId(null)
      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsPairing(false)
    }
  }

  const getPairedHeadlineIds = () => {
    return new Set(creatives.map((c) => c.headlineId))
  }

  const getPairedImageIds = () => {
    return new Set(creatives.map((c) => c.imageId))
  }

  const pairedHeadlineIds = getPairedHeadlineIds()
  const pairedImageIds = getPairedImageIds()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          Pair Headlines with Images
        </h2>
        <button
          onClick={handlePair}
          disabled={!selectedHeadlineId || !selectedImageId || isPairing}
          className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-green-500/25"
        >
          {isPairing ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⚡</span>
              Pairing...
            </span>
          ) : (
            '🔗 Create Pair'
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl backdrop-blur-sm">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Headlines Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white">Headlines</h3>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {headlines.length === 0 ? (
              <div className="p-6 bg-white/5 border border-white/10 rounded-xl text-center">
                <p className="text-slate-400">No headlines generated yet</p>
              </div>
            ) : (
              headlines.map((headline) => {
                const isPaired = pairedHeadlineIds.has(headline.id)
                const isSelected = selectedHeadlineId === headline.id

                return (
                  <div
                    key={headline.id}
                    onClick={() => setSelectedHeadlineId(headline.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/25'
                        : isPaired
                        ? 'border-green-500/50 bg-green-500/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <p className="text-white/90 text-sm leading-relaxed">
                      {headline.text}
                    </p>
                    {isPaired && (
                      <span className="inline-block mt-2 text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-full">
                        ✓ Paired
                      </span>
                    )}
                    {isSelected && (
                      <span className="inline-block mt-2 text-xs text-purple-300 bg-purple-500/30 px-2 py-1 rounded-full ml-2">
                        Selected
                      </span>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Images Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white">Images</h3>
          <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-2">
            {images.length === 0 ? (
              <div className="p-6 bg-white/5 border border-white/10 rounded-xl text-center">
                <p className="text-slate-400">No images generated yet</p>
              </div>
            ) : (
              images.map((img) => {
                const isPaired = pairedImageIds.has(img.id)
                const isSelected = selectedImageId === img.id

                return (
                  <div
                    key={img.id}
                    onClick={() => setSelectedImageId(img.id)}
                    className={`group relative aspect-video bg-white/5 rounded-xl overflow-hidden border-2 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-purple-500 shadow-lg shadow-purple-500/25'
                        : isPaired
                        ? 'border-green-500/50'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <Image
                      src={img.imageUrl}
                      alt={img.prompt}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-xs text-white/90 line-clamp-2">
                          {img.prompt}
                        </p>
                      </div>
                    </div>
                    {isPaired && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                        ✓ Paired
                      </div>
                    )}
                    {isSelected && (
                      <div className="absolute top-2 left-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                        Selected
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
