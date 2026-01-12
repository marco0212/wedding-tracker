import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDatabase } from './db/database';
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
});
