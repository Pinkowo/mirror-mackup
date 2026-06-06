import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const generation = await prisma.generation.findUnique({
      where: { id: params.id },
      include: { model: true },
    })

    if (!generation) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: generation.id,
      status: generation.status,
      resultUrl: generation.resultUrl,
      modelImageUrl: generation.model.imageUrl,
      createdAt: generation.createdAt,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch generation' }, { status: 500 })
  }
}
