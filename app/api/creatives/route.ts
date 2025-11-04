import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const pairingSchema = z.object({
  campaignId: z.string(),
  headlineId: z.string(),
  imageId: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = pairingSchema.parse(body)

    const { campaignId, headlineId, imageId } = validatedData

    // Check if resources exist (read operations executed sequentially to avoid connection pooling issues)
    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } })
    const headline = await prisma.headline.findUnique({ where: { id: headlineId } })
    const image = await prisma.image.findUnique({ where: { id: imageId } })

    if (!campaign) {
      return NextResponse.json(
        {
          success: false,
          error: 'Campaign not found',
        },
        { status: 404 }
      )
    }

    if (!headline) {
      return NextResponse.json(
        {
          success: false,
          error: 'Headline not found',
        },
        { status: 404 }
      )
    }

    if (!image) {
      return NextResponse.json(
        {
          success: false,
          error: 'Image not found',
        },
        { status: 404 }
      )
    }

    // Check if pair already exists (sequentially to avoid connection pooling issues)
    const existingCreative = await prisma.creative.findUnique({
      where: {
        headlineId_imageId_campaignId: {
          headlineId,
          imageId,
          campaignId,
        },
      },
    })

    if (existingCreative) {
      return NextResponse.json(
        {
          success: false,
          error: 'Creative pair already exists',
        },
        { status: 400 }
      )
    }

    // Create creative pair
    const creative = await prisma.creative.create({
      data: {
        campaignId,
        headlineId,
        imageId,
      },
    })

    return NextResponse.json({
      success: true,
      data: { creative },
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

    // Handle uniqueness error
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Creative pair already exists',
        },
        { status: 400 }
      )
    }

    console.error('Creative pairing error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create creative pair',
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

    const creatives = await prisma.creative.findMany({
      where: {
        campaignId,
        status: 'active',
      },
      include: {
        headline: true,
        image: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: { creatives },
    })
  } catch (error) {
    console.error('Failed to fetch creatives:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch creatives',
      },
      { status: 500 }
    )
  }
}

