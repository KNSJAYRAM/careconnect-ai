import mongoose from 'mongoose';

const timelineEventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['concern', 'document', 'appointment', 'followup', 'note'],
    required: true
  },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  date: { type: Date, default: Date.now },
  relatedId: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

timelineEventSchema.index({ userId: 1, date: -1 });

export default mongoose.model('TimelineEvent', timelineEventSchema);
