import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { buildMakeupPrompt, generateMakeup } from '@/lib/fal'

export async function POST(request: Request) {
  try {
    const { modelId, productIds } = await request.json()

    if (!modelId || !productIds?.length) {
      return NextResponse.json({ error: 'modelId and productIds required' }, { status: 400 })
    }

    const model = await prisma.model.findUnique({ where: { id: modelId } })
    if (!model) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 })
    }

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    })

    const prompt = buildMakeupPrompt(products.map((p) => p.promptDescription))

    const generation = await prisma.generation.create({
      data: {
        modelId,
        productIds: JSON.stringify(productIds),
        prompt,
        status: 'processing',
      },
    })

    generateMakeup(model.imageUrl, prompt)
      .then(async ({ imageUrl }) => {
        await prisma.generation.update({
          where: { id: generation.id },
          data: { status: 'done', resultUrl: imageUrl },
        })
      })
      .catch(async () => {
        await prisma.generation.update({
          where: { id: generation.id },
          data: { status: 'error' },
        })
      })

    return NextResponse.json({ generationId: generation.id })
  } catch {
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
