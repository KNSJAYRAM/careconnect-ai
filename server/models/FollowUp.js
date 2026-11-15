import mongoose from 'mongoose';

const followUpSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  dueDate: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Completed', 'Overdue'],
    default: 'Pending'
  },
  createdAt: { type: Date, default: Date.now }
});

followUpSchema.index({ userId: 1, dueDate: 1 });

export default mongoose.model('FollowUp', followUpSchema);
