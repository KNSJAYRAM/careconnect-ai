import mongoose from 'mongoose';
import Appointment from '../models/Appointment.js';
import MedicalDocument from '../models/MedicalDocument.js';
import FollowUp from '../models/FollowUp.js';
import TimelineEvent from '../models/TimelineEvent.js';
import HealthConcern from '../models/HealthConcern.js';

const safeTimestamp = (dateStr, timeStr = '') => {
  if (!dateStr) return 0;
  const combo = timeStr ? `${dateStr} ${timeStr}` : dateStr;
  const t = new Date(combo).getTime();
  return isNaN(t) ? 0 : t;
};

export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (req.app.locals.useMemoryDb) {
      const db = req.app.locals.inMemoryDb;
      const userAppointments = (db.appointments || [])
        .filter(a => String(a.userId) === String(userId))
        .sort((a, b) => safeTimestamp(a.date, a.time) - safeTimestamp(b.date, b.time));

      const userDocs = (db.documents || [])
        .filter(d => String(d.userId) === String(userId))
        .sort((a, b) => safeTimestamp(b.uploadDate) - safeTimestamp(a.uploadDate));

      const userFollowups = (db.followups || []).filter(f => String(f.userId) === String(userId));
      const userTimeline = (db.timelineEvents || [])
        .filter(t => String(t.userId) === String(userId))
        .sort((a, b) => safeTimestamp(b.date) - safeTimestamp(a.date));

      const userConcerns = (db.concerns || []).filter(c => String(c.userId) === String(userId));

      const nextAppointment = userAppointments.find(a => a.status === 'Upcoming') || null;
      const pendingFollowupsCount = userFollowups.filter(f => f.status === 'Pending' || f.status === 'Overdue').length;

      return res.json({
        userName: req.user.name || 'User',
        upcomingAppointment: nextAppointment,
        totalDocuments: userDocs.length,
        pendingFollowups: pendingFollowupsCount,
        totalHealthEvents: userTimeline.length,
        totalConcerns: userConcerns.length,
        recentDocuments: userDocs.slice(0, 3),
        recentActivity: userTimeline.slice(0, 5)
      });
    }

    // MongoDB validation
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user identifier' });
    }

    const upcomingAppointment = await Appointment.findOne({ userId, status: 'Upcoming' }).sort({ date: 1, time: 1 });
    const totalDocuments = await MedicalDocument.countDocuments({ userId });
    const pendingFollowups = await FollowUp.countDocuments({ userId, status: { $in: ['Pending', 'Overdue'] } });
    const totalHealthEvents = await TimelineEvent.countDocuments({ userId });
    const totalConcerns = await HealthConcern.countDocuments({ userId });
    const recentDocuments = await MedicalDocument.find({ userId }).sort({ uploadDate: -1 }).limit(3);
    const recentActivity = await TimelineEvent.find({ userId }).sort({ date: -1 }).limit(5);

    res.json({
      userName: req.user.name || 'User',
      upcomingAppointment,
      totalDocuments,
      pendingFollowups,
      totalHealthEvents,
      totalConcerns,
      recentDocuments,
      recentActivity
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ message: error.message || 'Error generating dashboard summary' });
  }
};
