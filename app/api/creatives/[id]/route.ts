import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Creative ID is required',
        },
        { status: 400 }
      )
    }

    const creative = await prisma.creative.findUnique({
      where: { id },
    })

    if (!creative) {
      return NextResponse.json(
        {
          success: false,
          error: 'Creative not found',
        },
        { status: 404 }
      )
    }

    // Delete creative (unpairing, headlines and images remain)
    await prisma.creative.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Creative pair removed successfully',
    })
  } catch (error) {
    console.error('Creative deletion error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete creative',
      },
      { status: 500 }
    )
  }
}

