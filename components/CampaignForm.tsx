'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CampaignTone } from '@/types'

const campaignSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  industry: z.string().min(1, 'Industry is required'),
  audience: z.string().min(1, 'Target audience is required'),
  tone: z.enum(['professional', 'casual', 'exciting', 'trustworthy']),
  description: z.string().optional(),
})

type CampaignFormData = z.infer<typeof campaignSchema>

interface CampaignFormProps {
  onSuccess: (campaignId: string) => void
}

export default function CampaignForm({ onSuccess }: CampaignFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
  })

  const onSubmit = async (data: CampaignFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to create campaign')
      }

      reset()
      onSuccess(result.data.campaign.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-white/90 mb-2"
          >
            Campaign Name <span className="text-pink-400">*</span>
          </label>
          <input
            {...register('name')}
            type="text"
            id="name"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            placeholder="Enter campaign name"
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="mt-2 text-sm text-pink-400">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="industry"
            className="block text-sm font-medium text-white/90 mb-2"
          >
            Industry <span className="text-pink-400">*</span>
          </label>
          <input
            {...register('industry')}
            type="text"
            id="industry"
            placeholder="Insurance, SaaS, Real Estate..."
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            disabled={isSubmitting}
          />
          {errors.industry && (
            <p className="mt-2 text-sm text-pink-400">
              {errors.industry.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="audience"
            className="block text-sm font-medium text-white/90 mb-2"
          >
            Target Audience <span className="text-pink-400">*</span>
          </label>
          <input
            {...register('audience')}
            type="text"
            id="audience"
            placeholder="Young professionals, Small businesses..."
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            disabled={isSubmitting}
          />
          {errors.audience && (
            <p className="mt-2 text-sm text-pink-400">
              {errors.audience.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="tone"
            className="block text-sm font-medium text-white/90 mb-2"
          >
            Tone <span className="text-pink-400">*</span>
          </label>
          <select
            {...register('tone')}
            id="tone"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            disabled={isSubmitting}
          >
            <option value="" className="bg-slate-900">Select tone...</option>
            <option value="professional" className="bg-slate-900">Professional</option>
            <option value="casual" className="bg-slate-900">Casual</option>
            <option value="exciting" className="bg-slate-900">Exciting</option>
            <option value="trustworthy" className="bg-slate-900">Trustworthy</option>
          </select>
          {errors.tone && (
            <p className="mt-2 text-sm text-pink-400">{errors.tone.message}</p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-white/90 mb-2"
        >
          Description <span className="text-slate-500 text-xs">(Optional)</span>
        </label>
        <textarea
          {...register('description')}
          id="description"
          rows={4}
          placeholder="Add additional context about your campaign..."
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
          disabled={isSubmitting}
        />
      </div>

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl backdrop-blur-sm">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⚡</span>
            Creating Campaign...
          </span>
        ) : (
          '🚀 Create Campaign'
        )}
      </button>
    </form>
  )
}
