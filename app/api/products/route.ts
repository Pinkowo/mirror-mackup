import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')

  try {
    const result = category
      ? await db.execute({ sql: 'SELECT id, name, brand, category, colorHex, colorHexes, imageUrl, price, promptDescription, createdAt FROM Product WHERE category = ? ORDER BY name ASC', args: [category] })
      : await db.execute('SELECT id, name, brand, category, colorHex, colorHexes, imageUrl, price, promptDescription, createdAt FROM Product ORDER BY name ASC')
    return NextResponse.json(result.rows)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
