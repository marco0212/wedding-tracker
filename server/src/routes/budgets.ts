import { Router } from 'express';
import { getBudgets, createBudget, updateBudget, deleteBudget, getBudgetSummary } from '../controllers/budgetController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', getBudgets);
router.get('/summary', getBudgetSummary);
router.post('/', createBudget);
router.put('/:id', updateBudget);
router.delete('/:id', deleteBudget);

export default router;
