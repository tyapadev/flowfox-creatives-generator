import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { openai } from '@/lib/openai'
import { z } from 'zod'

const generateSchema = z.object({
  campaignId: z.string(),
  count: z.number().min(1).max(5),
  context: z
    .object({
      name: z.string().optional(),
      industry: z.string().optional(),
      audience: z.string().optional(),
      tone: z.string().optional(),
      description: z.string().optional(),
    })
    .optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = generateSchema.parse(body)

    const { campaignId, count, context } = validatedData

    // Check if campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    })

    if (!campaign) {
      return NextResponse.json(
        {
          success: false,
          error: 'Campaign not found',
        },
        { status: 404 }
      )
    }

    // Prepare prompt for image generation
    const imageContext = context || {
      industry: campaign.industry,
      audience: campaign.audience,
      tone: campaign.tone,
      description: campaign.description,
    }

    const prompt = `Create a professional marketing image for:
- Industry: ${imageContext.industry || campaign.industry}
- Target Audience: ${imageContext.audience || campaign.audience}
- Tone: ${imageContext.tone || campaign.tone}
${imageContext.description ? `- Description: ${imageContext.description}` : ''}

The image should be brand-safe, professional, visually appealing, and suitable for marketing purposes.`

    // Generate images using OpenAI Image API
    const images = await Promise.all(
      Array.from({ length: count }).map(async () => {
        const response = await openai.images.generate({
          model: 'dall-e-3',
          prompt,
          size: '1792x1024', // 16:9 aspect ratio
          quality: 'standard',
          n: 1,
        })

        if (!response.data || response.data.length === 0) {
          throw new Error('Failed to generate image URL')
        }

        const imageUrl = response.data[0]?.url
        if (!imageUrl) {
          throw new Error('Failed to generate image URL')
        }

        return {
          imageUrl,
          prompt,
        }
      })
    )

    // Save images to database using interactive transaction
    // Using interactive transaction for better compatibility with connection pooling
    const createdImages = await prisma.$transaction(async (tx) => {
      return Promise.all(
        images.map((img) =>
          tx.image.create({
            data: {
              imageUrl: img.imageUrl,
              prompt: img.prompt,
              campaignId,
            },
          })
        )
      )
    })

    return NextResponse.json({
      success: true,
      data: {
        images: createdImages.map((img) => ({
          id: img.id,
          imageUrl: img.imageUrl,
          prompt: img.prompt,
        })),
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: error.issues[0]?.message || 'Validation error',
        },
        { status: 400 }
      )
    }

    console.error('Image generation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate images',
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('campaignId')

    if (!campaignId) {
      return NextResponse.json(
        {
          success: false,
          error: 'campaignId is required',
        },
        { status: 400 }
      )
    }

    try {
      const images = await prisma.image.findMany({
        where: {
          campaignId,
          status: 'active',
        },
        orderBy: { createdAt: 'desc' },
      })

      return NextResponse.json({
        success: true,
        data: { images },
      })
    } catch (dbError) {
      // If table doesn't exist or other DB error, return empty array
      console.error('Database error fetching images:', dbError)
      return NextResponse.json({
        success: true,
        data: { images: [] },
      })
    }
  } catch (error) {
    console.error('Failed to fetch images:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch images',
      },
      { status: 500 }
    )
  }
}

