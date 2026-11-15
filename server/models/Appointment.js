import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  providerName: { type: String, required: true },
  specialty: { type: String, default: 'General Physician' },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  time: { type: String, required: true }, // Format: HH:MM AM/PM
  location: { type: String, default: 'Main Clinic' },
  reason: { type: String, default: '' },
  notes: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['Upcoming', 'Completed', 'Cancelled'],
    default: 'Upcoming'
  },
  aiPreparation: {
    questionsToAsk: [{ type: String }],
    infoToBring: [{ type: String }],
    topicsToDiscuss: [{ type: String }],
    relevantDocuments: [{ type: String }]
  },
  createdAt: { type: Date, default: Date.now }
});

appointmentSchema.index({ userId: 1, date: 1 });

export default mongoose.model('Appointment', appointmentSchema);
