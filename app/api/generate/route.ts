import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { buildMakeupPrompt, generateMakeup } from '@/lib/fal'
import { randomUUID } from 'crypto'

export async function POST(request: Request) {
  try {
    const { modelId, productIds } = await request.json()

    if (!modelId || !productIds?.length) {
      return NextResponse.json({ error: 'modelId and productIds required' }, { status: 400 })
    }

    const modelResult = await db.execute({ sql: 'SELECT id, imageUrl FROM Model WHERE id = ?', args: [modelId] })
    if (!modelResult.rows.length) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 })
    }
    const model = modelResult.rows[0]

    const placeholders = productIds.map(() => '?').join(',')
    const productsResult = await db.execute({ sql: `SELECT id, category, promptDescription FROM Product WHERE id IN (${placeholders})`, args: productIds })

    const prompt = buildMakeupPrompt(
      productsResult.rows.map((p) => ({ category: p.category as string, description: p.promptDescription as string }))
    )

    const generationId = randomUUID()
    const now = new Date().toISOString()
    await db.execute({
      sql: 'INSERT INTO Generation (id, modelId, productIds, prompt, status, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
      args: [generationId, modelId, JSON.stringify(productIds), prompt, 'processing', now],
    })

    console.log(`[generate] calling OpenAI — generationId: ${generationId}`)
    generateMakeup(model.imageUrl as string, prompt)
      .then(async ({ imageUrl }) => {
        await db.execute({ sql: 'UPDATE Generation SET status = ?, resultUrl = ? WHERE id = ?', args: ['done', imageUrl, generationId] })
      })
      .catch(async (err) => {
        console.error('[generate] FAL error:', err)
        await db.execute({ sql: 'UPDATE Generation SET status = ? WHERE id = ?', args: ['error', generationId] })
      })

    return NextResponse.json({ generationId })
  } catch {
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
