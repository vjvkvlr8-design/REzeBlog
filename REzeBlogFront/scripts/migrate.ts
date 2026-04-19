// DB Migration Script - Execute drizzle SQL directly
import postgres from 'postgres'
import { readFileSync } from 'fs'
import { join } from 'path'

const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/rezeblog'

const sql = postgres(connectionString, {
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 1,
})

async function migrate() {
  try {
    console.log('Running migration...')
    const sqlFile = readFileSync(join(process.cwd(), 'drizzle', '0000_wandering_talos.sql'), 'utf-8')
    
    // Split by statement-breakpoint and execute each
    const statements = sqlFile.split('--> statement-breakpoint').map(s => s.trim()).filter(Boolean)
    
    for (const statement of statements) {
      console.log('Executing:', statement.substring(0, 50) + '...')
      await sql.unsafe(statement)
    }
    
    console.log('Migration completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  } finally {
    await sql.end()
  }
}

migrate()
