import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import MedicalDocument from '../models/MedicalDocument.js';
import TimelineEvent from '../models/TimelineEvent.js';
import { summarizeDocument } from '../services/aiService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const removeFileIfExists = (fileUrl) => {
  if (fileUrl && fileUrl.startsWith('/uploads/')) {
    const filename = fileUrl.replace('/uploads/', '');
    const filePath = path.join(__dirname, '../uploads', filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.warn('Could not remove file on disk:', err.message);
      }
    }
  }
};

export const getDocuments = async (req, res) => {
  try {
    const userId = req.user._id;

    if (req.app.locals.useMemoryDb) {
      const db = req.app.locals.inMemoryDb;
      const list = db.documents
        .filter(d => String(d.userId) === String(userId))
        .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
      return res.json(list);
    }

    const docs = await MedicalDocument.find({ userId }).sort({ uploadDate: -1 });
    res.json(docs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDocumentById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (req.app.locals.useMemoryDb) {
      const db = req.app.locals.inMemoryDb;
      const doc = db.documents.find(d => String(d._id) === String(id) && String(d.userId) === String(userId));
      if (!doc) return res.status(404).json({ message: 'Document not found' });
      return res.json(doc);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid document ID format' });
    }

    const doc = await MedicalDocument.findOne({ _id: id, userId });
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    res.json(doc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createDocument = async (req, res) => {
  try {
    const userId = req.user._id;
    let { name, type, description, contentSnippet, uploadDate } = req.body;

    if (!name && req.file) {
      name = req.file.originalname;
    }

    if (!name) {
      return res.status(400).json({ message: 'Document name is required' });
    }

    const validTypes = ['Blood Test', 'Scan', 'Prescription', 'Consultation Report', 'Discharge Summary', 'Other'];
    const docType = validTypes.includes(type) ? type : 'Blood Test';
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : '';

    // Generate AI Summary
    const aiSummary = await summarizeDocument({
      name,
      type: docType,
      description: description || '',
      contentSnippet: contentSnippet || (req.file ? `Uploaded file: ${req.file.originalname}` : '')
    });

    if (req.app.locals.useMemoryDb) {
      const db = req.app.locals.inMemoryDb;
      const newDoc = {
        _id: 'doc_' + Date.now(),
        userId: String(userId),
        name,
        type: docType,
        fileUrl: fileUrl || '/uploads/sample_report.pdf',
        uploadDate: uploadDate ? new Date(uploadDate) : new Date(),
        description: description || '',
        contentSnippet: contentSnippet || '',
        summary: aiSummary,
        createdAt: new Date()
      };

      db.documents.unshift(newDoc);

      db.timelineEvents.unshift({
        _id: 't_' + Date.now(),
        userId: String(userId),
        type: 'document',
        title: `Medical Document Uploaded: ${name}`,
        description: `Category: ${docType}`,
        date: newDoc.uploadDate,
        relatedId: newDoc._id,
        createdAt: new Date()
      });

      return res.status(201).json(newDoc);
    }

    const doc = await MedicalDocument.create({
      userId,
      name,
      type: docType,
      fileUrl: fileUrl || '/uploads/sample_report.pdf',
      uploadDate: uploadDate ? new Date(uploadDate) : new Date(),
      description: description || '',
      contentSnippet: contentSnippet || '',
      summary: aiSummary
    });

    await TimelineEvent.create({
      userId,
      type: 'document',
      title: `Medical Document Uploaded: ${name}`,
      description: `Category: ${docType}`,
      date: doc.uploadDate,
      relatedId: doc._id.toString()
    });

    res.status(201).json(doc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (req.app.locals.useMemoryDb) {
      const db = req.app.locals.inMemoryDb;
      const targetDoc = db.documents.find(d => String(d._id) === String(id) && String(d.userId) === String(userId));
      if (!targetDoc) return res.status(404).json({ message: 'Document not found' });

      removeFileIfExists(targetDoc.fileUrl);
      db.documents = db.documents.filter(d => !(String(d._id) === String(id) && String(d.userId) === String(userId)));
      db.timelineEvents = db.timelineEvents.filter(t => !(t.relatedId === String(id) && String(t.userId) === String(userId)));

      return res.json({ message: 'Document removed successfully' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid document ID format' });
    }

    const doc = await MedicalDocument.findOneAndDelete({ _id: id, userId });
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    removeFileIfExists(doc.fileUrl);
    await TimelineEvent.deleteMany({ relatedId: id, userId });

    res.json({ message: 'Document removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
