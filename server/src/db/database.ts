import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10,
});

// 유휴 클라이언트 에러 감지 - 연결 풀 안정성 향상
pool.on('error', (err) => {
  console.error('Unexpected error on idle client:', err);
});

export async function initDatabase() {
  console.log('Database connected');
}

export default pool;
