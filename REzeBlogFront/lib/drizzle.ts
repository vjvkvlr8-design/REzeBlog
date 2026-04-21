// Drizzle ORM Client
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '@/db/schema'

const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/rezeblog'

// Connection for queries
const client = postgres(connectionString, {
  ssl: 'require',
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false, // REQUIRED for Supabase Transaction Pooler (PgBouncer)
})

// Drizzle instance with schema
export const db = drizzle(client, { schema })

// Re-export schema for convenience
export { schema }
export * from '@/db/schema'
