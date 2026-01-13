import { Response } from 'express';
import pool from '../db/database';
import { AuthRequest } from '../middleware/auth';

interface BudgetRow {
  id: number;
  user_id: number;
  category: string;
  item_name: string;
  budget_amount: number;
  actual_amount: number;
  is_paid: boolean;
  notes: string | null;
  created_at: string;
}

function formatBudget(row: BudgetRow) {
  return {
    id: row.id,
    userId: row.user_id,
    category: row.category,
    itemName: row.item_name,
    budgetAmount: row.budget_amount,
    actualAmount: row.actual_amount,
    isPaid: row.is_paid,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

export async function getBudgets(req: AuthRequest, res: Response) {
  try {
    const result = await pool.query(
      'SELECT * FROM budgets ORDER BY category ASC, created_at DESC'
    );

    res.json(result.rows.map(formatBudget));
  } catch (error) {
    console.error('GetBudgets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createBudget(req: AuthRequest, res: Response) {
  const { category, itemName, budgetAmount, actualAmount, isPaid, notes } = req.body;

  if (!category || !itemName) {
    return res.status(400).json({ error: 'Category and item name are required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO budgets (user_id, category, item_name, budget_amount, actual_amount, is_paid, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [
        req.userId,
        category,
        itemName,
        budgetAmount || 0,
        actualAmount || 0,
        isPaid || false,
        notes || null
      ]
    );

    res.status(201).json(formatBudget(result.rows[0]));
  } catch (error) {
    console.error('CreateBudget error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateBudget(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { category, itemName, budgetAmount, actualAmount, isPaid, notes } = req.body;

  try {
    const existingResult = await pool.query(
      'SELECT * FROM budgets WHERE id = $1',
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    const existing = existingResult.rows[0] as BudgetRow;

    const result = await pool.query(
      'UPDATE budgets SET category = $1, item_name = $2, budget_amount = $3, actual_amount = $4, is_paid = $5, notes = $6 WHERE id = $7 RETURNING *',
      [
        category ?? existing.category,
        itemName ?? existing.item_name,
        budgetAmount ?? existing.budget_amount,
        actualAmount ?? existing.actual_amount,
        isPaid !== undefined ? isPaid : existing.is_paid,
        notes !== undefined ? notes : existing.notes,
        id
      ]
    );

    res.json(formatBudget(result.rows[0]));
  } catch (error) {
    console.error('UpdateBudget error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteBudget(req: AuthRequest, res: Response) {
  const { id } = req.params;

  try {
    const existingResult = await pool.query(
      'SELECT id FROM budgets WHERE id = $1',
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    await pool.query('DELETE FROM budgets WHERE id = $1', [id]);

    res.json({ message: 'Budget deleted' });
  } catch (error) {
    console.error('DeleteBudget error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getBudgetSummary(req: AuthRequest, res: Response) {
  try {
    const byCategory = await pool.query(
      'SELECT category, SUM(budget_amount) as total_budget, SUM(actual_amount) as total_actual FROM budgets GROUP BY category'
    );

    const totals = await pool.query(
      'SELECT COALESCE(SUM(budget_amount), 0) as total_budget, COALESCE(SUM(actual_amount), 0) as total_actual FROM budgets'
    );

    res.json({
      totalBudget: Number(totals.rows[0].total_budget) || 0,
      totalActual: Number(totals.rows[0].total_actual) || 0,
      byCategory: byCategory.rows.map((b) => ({
        category: b.category,
        budget: Number(b.total_budget),
        actual: Number(b.total_actual),
      })),
    });
  } catch (error) {
    console.error('GetBudgetSummary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
