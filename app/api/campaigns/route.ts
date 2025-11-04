import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const campaignSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  industry: z.string().min(1, 'Industry is required'),
  audience: z.string().min(1, 'Target audience is required'),
  tone: z.enum(['professional', 'casual', 'exciting', 'trustworthy']),
  description: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = campaignSchema.parse(body)

    const campaign = await prisma.campaign.create({
      data: validatedData,
    })

    return NextResponse.json({
      success: true,
      data: { campaign },
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

    console.error('Campaign creation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create campaign',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        headlines: true,
        images: true,
        creatives: {
          include: {
            headline: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: { campaigns },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch campaigns',
      },
      { status: 500 }
    )
  }
}

