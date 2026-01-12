import { Router } from 'express';
import { getSchedules, createSchedule, updateSchedule, deleteSchedule } from '../controllers/scheduleController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', getSchedules);
router.post('/', createSchedule);
router.put('/:id', updateSchedule);
router.delete('/:id', deleteSchedule);

export default router;
