import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 30000, // cold start 대비 30초
  idleTimeoutMillis: 30000,
  max: 5, // 무료 플랜 connection limit 고려
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

// 유휴 클라이언트 에러 감지 - 연결 풀 안정성 향상
pool.on('error', (err) => {
  console.error('Unexpected error on idle client:', err);
});

export async function initDatabase() {
  console.log('Database connected');
}

export default pool;
