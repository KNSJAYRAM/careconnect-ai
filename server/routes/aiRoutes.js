import express from 'express';
import { summarizeDocumentController, appointmentQuestionsController, organizeInformationController } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/summarize-document', protect, summarizeDocumentController);
router.post('/appointment-questions', protect, appointmentQuestionsController);
router.post('/organize-information', protect, organizeInformationController);

export default router;
