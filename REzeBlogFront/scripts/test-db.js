// DB 연결 테스트 스크립트
const { sql } = require('../lib/db.ts')

async function testConnection() {
  try {
    console.log('Testing DB connection...')
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set (using localhost)')
    
    const result = await sql`SELECT NOW() as time, current_database() as db`
    console.log('✅ DB Connected!')
    console.log('Server time:', result[0].time)
    console.log('Database:', result[0].db)
    
    // Test tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    console.log('Tables:', tables.map(t => t.table_name).join(', '))
    
    process.exit(0)
  } catch (error) {
    console.error('❌ DB Connection Failed:', error.message)
    console.log('Fallback mode will be used')
    process.exit(1)
  }
}

testConnection()
