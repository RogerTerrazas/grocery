import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'

import * as schema from './schema'

function getDb() {
  const url = process.env['DATABASE_URL']
  if (!url) {
    throw new Error(
      'DATABASE_URL environment variable is not set. Add it to .env.local'
    )
  }
  const sql = neon(url)
  return drizzle(sql, { schema })
}

// Lazy singleton — only instantiated when first used at request time
let _db: ReturnType<typeof getDb> | undefined

export function getDbClient() {
  if (!_db) _db = getDb()
  return _db
}

// Convenience export — use getDbClient() in server code that runs at request time
export const db = new Proxy({} as ReturnType<typeof getDb>, {
  get(_target, prop) {
    // @ts-ignore
    return getDbClient()[prop]
  },
})
