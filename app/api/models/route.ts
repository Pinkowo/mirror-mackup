import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const result = await db.execute('SELECT id, name, imageUrl, skinTone, description, createdAt FROM Model ORDER BY name ASC')
    return NextResponse.json(result.rows)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 })
  }
}
