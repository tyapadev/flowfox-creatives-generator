export type CampaignTone = 'professional' | 'casual' | 'exciting' | 'trustworthy'

export interface CampaignFormData {
  name: string
  industry: string
  audience: string
  tone: CampaignTone
  description?: string
}

export interface HeadlineGenerationRequest {
  campaignId: string
  count: number
  context: {
    name: string
    industry: string
    audience: string
    tone: string
    description?: string
  }
}

export interface ImageGenerationRequest {
  campaignId: string
  count: number
  context?: {
    name?: string
    industry?: string
    audience?: string
    tone?: string
    description?: string
  }
}

export interface CreativePairingRequest {
  campaignId: string
  headlineId: string
  imageId: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

