import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await db.execute({
      sql: 'SELECT g.id, g.status, g.resultUrl, g.createdAt, m.imageUrl as modelImageUrl FROM Generation g JOIN Model m ON g.modelId = m.id WHERE g.id = ?',
      args: [params.id],
    })

    if (!result.rows.length) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const row = result.rows[0]
    return NextResponse.json({
      id: row.id,
      status: row.status,
      resultUrl: row.resultUrl,
      modelImageUrl: row.modelImageUrl,
      createdAt: row.createdAt,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch generation' }, { status: 500 })
  }
}
