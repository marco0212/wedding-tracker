import { Response } from 'express';
import pool from '../db/database';
import { AuthRequest } from '../middleware/auth';

interface ScheduleRow {
  id: number;
  user_id: number;
  title: string;
  category: string;
  status: string;
  due_date: string | null;
  notes: string | null;
  created_at: string;
}

function formatSchedule(row: ScheduleRow) {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    category: row.category,
    status: row.status,
    dueDate: row.due_date,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

export async function getSchedules(req: AuthRequest, res: Response) {
  try {
    const result = await pool.query(
      'SELECT * FROM schedules ORDER BY due_date ASC NULLS LAST, created_at DESC'
    );

    res.json(result.rows.map(formatSchedule));
  } catch (error) {
    console.error('GetSchedules error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createSchedule(req: AuthRequest, res: Response) {
  const { title, category, status, dueDate, notes } = req.body;

  if (!title || !category) {
    return res.status(400).json({ error: 'Title and category are required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO schedules (user_id, title, category, status, due_date, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.userId, title, category, status || 'pending', dueDate || null, notes || null]
    );

    res.status(201).json(formatSchedule(result.rows[0]));
  } catch (error) {
    console.error('CreateSchedule error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateSchedule(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { title, category, status, dueDate, notes } = req.body;

  try {
    const existingResult = await pool.query(
      'SELECT * FROM schedules WHERE id = $1',
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    const existing = existingResult.rows[0] as ScheduleRow;

    const result = await pool.query(
      'UPDATE schedules SET title = $1, category = $2, status = $3, due_date = $4, notes = $5 WHERE id = $6 RETURNING *',
      [
        title ?? existing.title,
        category ?? existing.category,
        status ?? existing.status,
        dueDate !== undefined ? dueDate : existing.due_date,
        notes !== undefined ? notes : existing.notes,
        id
      ]
    );

    res.json(formatSchedule(result.rows[0]));
  } catch (error) {
    console.error('UpdateSchedule error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteSchedule(req: AuthRequest, res: Response) {
  const { id } = req.params;

  try {
    const existingResult = await pool.query(
      'SELECT id FROM schedules WHERE id = $1',
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    await pool.query('DELETE FROM schedules WHERE id = $1', [id]);

    res.json({ message: 'Schedule deleted' });
  } catch (error) {
    console.error('DeleteSchedule error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
