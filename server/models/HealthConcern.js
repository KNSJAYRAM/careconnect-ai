import mongoose from 'mongoose';

const healthConcernSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, default: 'General' }, // General, Pain, Digestion, Respiratory, Cardiovascular, Skin, Other
  severity: { type: String, default: 'Moderate' }, // Low, Moderate, Severe
  date: { type: Date, default: Date.now },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

healthConcernSchema.index({ userId: 1, date: -1 });

export default mongoose.model('HealthConcern', healthConcernSchema);
