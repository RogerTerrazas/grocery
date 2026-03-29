import type { Config } from 'drizzle-kit'

export default {
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    // @ts-ignore
    url: process.env['DATABASE_URL']!,
  },
} satisfies Config
