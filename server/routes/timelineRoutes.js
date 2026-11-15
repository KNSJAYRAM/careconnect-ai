import express from 'express';
import { getTimelineEvents } from '../controllers/timelineController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getTimelineEvents);

export default router;
