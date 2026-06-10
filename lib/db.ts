import { createClient } from '@libsql/client'

const globalForDb = globalThis as unknown as { db: ReturnType<typeof createClient> | undefined }

function createDbClient() {
  const url = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? 'file:dev.db'
  const authToken = process.env.TURSO_AUTH_TOKEN
  return createClient({ url, authToken })
}

export const db = globalForDb.db ?? createDbClient()

if (process.env.NODE_ENV !== 'production') globalForDb.db = db
