import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { openai } from '@/lib/openai'
import { z } from 'zod'

const generateSchema = z.object({
  campaignId: z.string(),
  count: z.number().min(1).max(5),
  context: z.object({
    name: z.string(),
    industry: z.string(),
    audience: z.string(),
    tone: z.string(),
    description: z.string().optional(),
  }),
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

    // Generate German headlines using OpenAI
    const prompt = `Generate ${count} German marketing headlines for a campaign.

Campaign Details:
- Name: ${context.name}
- Industry: ${context.industry}
- Target Audience: ${context.audience}
- Tone: ${context.tone}
${context.description ? `- Description: ${context.description}` : ''}

Requirements:
- Each headline should be 8-15 words
- Action-oriented and benefit-focused
- Written in German
- Suitable for the ${context.industry} industry
- Match the ${context.tone} tone

Return ONLY the headlines, one per line, without numbering or bullet points.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'You are a professional German marketing copywriter. Generate compelling headlines.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
    })

    const headlinesText =
      completion.choices[0]?.message?.content || ''
    const headlinesArray = headlinesText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .slice(0, count)

    // Save headlines to database using interactive transaction
    // Using interactive transaction for better compatibility with connection pooling
    const createdHeadlines = await prisma.$transaction(async (tx) => {
      return Promise.all(
        headlinesArray.map((text) =>
          tx.headline.create({
            data: {
              text,
              campaignId,
            },
          })
        )
      )
    })

    return NextResponse.json({
      success: true,
      data: {
        headlines: createdHeadlines.map((h) => ({
          id: h.id,
          text: h.text,
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

    console.error('Headline generation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate headlines',
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
      const headlines = await prisma.headline.findMany({
        where: {
          campaignId,
          status: 'active',
        },
        orderBy: { createdAt: 'desc' },
      })

      return NextResponse.json({
        success: true,
        data: { headlines },
      })
    } catch (dbError) {
      // If table doesn't exist or other DB error, return empty array
      console.error('Database error fetching headlines:', dbError)
      return NextResponse.json({
        success: true,
        data: { headlines: [] },
      })
    }
  } catch (error) {
    console.error('Failed to fetch headlines:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch headlines',
      },
      { status: 500 }
    )
  }
}

