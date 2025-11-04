'use client'

import { useState } from 'react'
import CampaignForm from '@/components/CampaignForm'
import HeadlineGenerator from '@/components/HeadlineGenerator'
import ImageGenerator from '@/components/ImageGenerator'
import PairingInterface from '@/components/PairingInterface'
import CreativesGallery from '@/components/CreativesGallery'

interface Campaign {
  id: string
  name: string
  industry: string
  audience: string
  tone: string
  description?: string
}

export default function Home() {
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null)
  const [activeTab, setActiveTab] = useState<
    'form' | 'generate' | 'pair' | 'gallery'
  >('form')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleCampaignCreated = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/campaigns`)
      const result = await response.json()

      if (result.success && result.data) {
        const campaign = result.data.campaigns.find(
          (c: Campaign) => c.id === campaignId
        )
        if (campaign) {
          setActiveCampaign(campaign)
          setActiveTab('generate')
        }
      }
    } catch (error) {
      console.error('Failed to fetch campaign:', error)
    }
  }

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 backdrop-blur-xl bg-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  FlowFox Creatives
                </h1>
                <p className="text-slate-400 mt-1">AI-Powered Marketing Content Studio</p>
              </div>
              {activeCampaign && (
                <button
                  onClick={() => {
                    setActiveCampaign(null)
                    setActiveTab('form')
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-medium text-white hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg shadow-purple-500/25"
                >
                  + New Campaign
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!activeCampaign ? (
            <div className="max-w-2xl mx-auto">
              <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-8 shadow-2xl">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Create Your Campaign
                  </h2>
                  <p className="text-slate-400">
                    Start by defining your campaign parameters to generate amazing creatives
                  </p>
                </div>
                <CampaignForm onSuccess={handleCampaignCreated} />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Campaign Header Card */}
              <div className="backdrop-blur-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl border border-white/10 p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {activeCampaign.name}
                    </h2>
                    <div className="flex flex-wrap gap-3">
                      <span className="px-3 py-1 bg-white/10 rounded-full text-sm text-white/90 backdrop-blur-sm">
                        {activeCampaign.industry}
                      </span>
                      <span className="px-3 py-1 bg-white/10 rounded-full text-sm text-white/90 backdrop-blur-sm">
                        {activeCampaign.audience}
                      </span>
                      <span className="px-3 py-1 bg-white/10 rounded-full text-sm text-white/90 backdrop-blur-sm capitalize">
                        {activeCampaign.tone}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-2 inline-flex">
                <button
                  onClick={() => setActiveTab('generate')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === 'generate'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  ✨ Generate
                </button>
                <button
                  onClick={() => setActiveTab('pair')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === 'pair'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  🔗 Pair
                </button>
                <button
                  onClick={() => setActiveTab('gallery')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === 'gallery'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  🎨 Gallery
                </button>
              </div>

              {/* Tab Content */}
              <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-8 shadow-2xl">
                {activeTab === 'generate' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="text-3xl">📝</span>
                        Generate Headlines
                      </h3>
                      <HeadlineGenerator
                        key={`headlines-${refreshKey}`}
                        campaignId={activeCampaign.id}
                        campaignContext={{
                          name: activeCampaign.name,
                          industry: activeCampaign.industry,
                          audience: activeCampaign.audience,
                          tone: activeCampaign.tone,
                          description: activeCampaign.description,
                        }}
                        onHeadlinesGenerated={handleRefresh}
                      />
                    </div>

                    <div className="border-t border-white/10 pt-8">
                      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="text-3xl">🖼️</span>
                        Generate Images
                      </h3>
                      <ImageGenerator
                        key={`images-${refreshKey}`}
                        campaignId={activeCampaign.id}
                        campaignContext={{
                          name: activeCampaign.name,
                          industry: activeCampaign.industry,
                          audience: activeCampaign.audience,
                          tone: activeCampaign.tone,
                          description: activeCampaign.description,
                        }}
                        onImagesGenerated={handleRefresh}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'pair' && (
                  <PairingInterface
                    key={`pairing-${refreshKey}`}
                    campaignId={activeCampaign.id}
                  />
                )}

                {activeTab === 'gallery' && (
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      <span className="text-3xl">🎨</span>
                      Creatives Gallery
                    </h3>
                    <CreativesGallery
                      key={`gallery-${refreshKey}`}
                      campaignId={activeCampaign.id}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
