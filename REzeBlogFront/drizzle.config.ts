import type { Config } from 'drizzle-kit'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

export default {
  schema: './db/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/rezeblog',
  },
} satisfies Config
