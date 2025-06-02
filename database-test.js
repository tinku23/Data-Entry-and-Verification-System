const { Client } = require('pg');
require('dotenv').config({ path: './env' });

async function testConnection() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Connecting to Railway PostgreSQL...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    // Test query
    const result = await client.query('SELECT NOW() as current_time, version()');
    console.log('🕒 Current time:', result.rows[0].current_time);
    console.log('🗄️ Database version:', result.rows[0].version);
    
    // Check existing tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('📋 Existing tables:', tables.rows.map(row => row.table_name));
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  } finally {
    await client.end();
  }
}

testConnection();
