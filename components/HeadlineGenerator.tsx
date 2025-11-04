'use client'

import { useState, useEffect } from 'react'

interface Headline {
  id: string
  text: string
}

interface HeadlineGeneratorProps {
  campaignId: string
  campaignContext: {
    name: string
    industry: string
    audience: string
    tone: string
    description?: string
  }
  onHeadlinesGenerated: () => void
}

export default function HeadlineGenerator({
  campaignId,
  campaignContext,
  onHeadlinesGenerated,
}: HeadlineGeneratorProps) {
  const [count, setCount] = useState(3)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [headlines, setHeadlines] = useState<Headline[]>([])

  useEffect(() => {
    fetchHeadlines()
  }, [campaignId])

  const fetchHeadlines = async () => {
    try {
      const response = await fetch(
        `/api/ai/headlines/generate?campaignId=${campaignId}`
      )
      const result = await response.json()
      if (result.success && result.data) {
        setHeadlines(result.data.headlines)
      }
    } catch (err) {
      console.error('Failed to fetch headlines:', err)
    }
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/headlines/generate', {
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
        throw new Error(result.error || 'Failed to generate headlines')
      }

      await fetchHeadlines()
      onHeadlinesGenerated()
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
          <option value={3} className="bg-slate-900">3 headlines</option>
          <option value={4} className="bg-slate-900">4 headlines</option>
          <option value={5} className="bg-slate-900">5 headlines</option>
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
            '✨ Generate Headlines'
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl backdrop-blur-sm">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {headlines.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-white">
              Generated Headlines ({headlines.length})
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {headlines.map((headline, index) => (
              <div
                key={headline.id}
                className="group relative p-5 bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-xl hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
              >
                <div className="absolute top-3 right-3 w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center text-xs font-bold text-purple-300">
                  {index + 1}
                </div>
                <p className="text-white/90 pr-10 leading-relaxed">
                  {headline.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
