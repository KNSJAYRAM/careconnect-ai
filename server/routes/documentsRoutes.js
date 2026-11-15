import express from 'express';
import { getDocuments, createDocument, getDocumentById, deleteDocument } from '../controllers/documentsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getDocuments)
  .post(protect, upload.single('file'), createDocument);

router.route('/:id')
  .get(protect, getDocumentById)
  .delete(protect, deleteDocument);

export default router;
