import mongoose from 'mongoose';

const medicalDocumentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Blood Test', 'Scan', 'Prescription', 'Consultation Report', 'Discharge Summary', 'Other'],
    default: 'Blood Test'
  },
  fileUrl: { type: String, default: '' },
  uploadDate: { type: Date, default: Date.now },
  description: { type: String, default: '' },
  contentSnippet: { type: String, default: '' }, // Simulated extracted text for demo
  summary: {
    overview: { type: String, default: '' },
    keyInfo: [{ type: String }],
    importantValues: [{ type: String }],
    termsExplained: [{ term: String, explanation: String }],
    questionsToDiscuss: [{ type: String }],
    disclaimer: { 
      type: String, 
      default: 'AI-generated summaries are for informational purposes only and should not be considered medical advice, diagnosis, or treatment.' 
    }
  },
  createdAt: { type: Date, default: Date.now }
});

medicalDocumentSchema.index({ userId: 1, uploadDate: -1 });

export default mongoose.model('MedicalDocument', medicalDocumentSchema);
