import express from 'express';
import { getFollowups, createFollowup, updateFollowup, deleteFollowup } from '../controllers/followupsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getFollowups)
  .post(protect, createFollowup);

router.route('/:id')
  .put(protect, updateFollowup)
  .delete(protect, deleteFollowup);

export default router;
