import express from 'express';
import { getConcerns, createConcern, updateConcern, deleteConcern } from '../controllers/concernsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getConcerns)
  .post(protect, createConcern);

router.route('/:id')
  .put(protect, updateConcern)
  .delete(protect, deleteConcern);

export default router;
