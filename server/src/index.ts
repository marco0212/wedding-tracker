import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pool, { initDatabase } from './db/database';
import authRoutes from './routes/auth';
import scheduleRoutes from './routes/schedules';
import budgetRoutes from './routes/budgets';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

initDatabase();

app.use('/api/auth', authRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/budgets', budgetRoutes);

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);

  // Keep-alive ping (Render 휴면 방지)
  const RENDER_URL = process.env.RENDER_EXTERNAL_URL;
  if (RENDER_URL) {
    const INTERVAL = 14 * 60 * 1000; // 14분
    setInterval(async () => {
      try {
        await pool.query('SELECT 1');
        await fetch(`${RENDER_URL}/api/health`);
        console.log('[Keep-Alive] Ping sent');
      } catch (error) {
        console.error('[Keep-Alive] Ping failed:', error);
      }
    }, INTERVAL);
    console.log('[Keep-Alive] Self-ping enabled');
  }
});
