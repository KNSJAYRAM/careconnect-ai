import Appointment from '../models/Appointment.js';
import FollowUp from '../models/FollowUp.js';
import MedicalDocument from '../models/MedicalDocument.js';

const safeTimestamp = (dateStr, timeStr = '') => {
  if (!dateStr) return 0;
  const combo = timeStr ? `${dateStr} ${timeStr}` : dateStr;
  const t = new Date(combo).getTime();
  return isNaN(t) ? 0 : t;
};

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = [];

    if (req.app.locals.useMemoryDb) {
      const db = req.app.locals.inMemoryDb;
      const todayStr = new Date().toISOString().split('T')[0];

      // 1. Upcoming appointments
      const userAppointments = (db.appointments || [])
        .filter(a => String(a.userId) === String(userId) && a.status === 'Upcoming')
        .sort((a, b) => safeTimestamp(a.date, a.time) - safeTimestamp(b.date, b.time));

      userAppointments.slice(0, 3).forEach((a, idx) => {
        notifications.push({
          id: `apt_notif_${a._id || idx}`,
          type: 'appointment',
          title: `Upcoming Consultation: ${a.providerName}`,
          desc: `${a.specialty} appointment scheduled for ${a.date} (${a.time}).`,
          time: 'Upcoming Visit',
          unread: true,
          link: `/appointments/${a._id}/prepare`
        });
      });

      // 2. Follow-ups
      const userFollowups = (db.followups || []).filter(f => String(f.userId) === String(userId) && f.status !== 'Completed');
      userFollowups.slice(0, 3).forEach((f, idx) => {
        const isOverdue = f.status === 'Overdue' || f.dueDate < todayStr;
        notifications.push({
          id: `f_notif_${f._id || idx}`,
          type: 'followup',
          title: isOverdue ? `Follow-up Overdue: ${f.title}` : `Follow-up Reminder: ${f.title}`,
          desc: `Action item due ${f.dueDate}. ${f.description || ''}`,
          time: isOverdue ? 'Action Required' : 'Due Soon',
          unread: true,
          link: '/followups'
        });
      });

      // 3. Documents
      const userDocs = (db.documents || [])
        .filter(d => String(d.userId) === String(userId))
        .sort((a, b) => safeTimestamp(b.uploadDate) - safeTimestamp(a.uploadDate));

      if (userDocs.length > 0) {
        const latestDoc = userDocs[0];
        notifications.push({
          id: `doc_notif_${latestDoc._id}`,
          type: 'document',
          title: `AI Document Summary Ready`,
          desc: `Plain-language breakdown prepared for "${latestDoc.name}".`,
          time: 'AI Verified',
          unread: false,
          link: `/documents/${latestDoc._id}/summary`
        });
      }

      return res.json(notifications);
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // MongoDB Mode
    const upcomingAppointments = await Appointment.find({ userId, status: 'Upcoming' })
      .sort({ date: 1, time: 1 })
      .limit(3);

    upcomingAppointments.forEach((a) => {
      notifications.push({
        id: `apt_notif_${a._id}`,
        type: 'appointment',
        title: `Upcoming Consultation: ${a.providerName}`,
        desc: `${a.specialty} appointment scheduled for ${a.date} (${a.time}).`,
        time: 'Upcoming Visit',
        unread: true,
        link: `/appointments/${a._id}/prepare`
      });
    });

    const pendingFollowups = await FollowUp.find({ userId, status: { $ne: 'Completed' } })
      .sort({ dueDate: 1 })
      .limit(3);

    pendingFollowups.forEach((f) => {
      const isOverdue = f.status === 'Overdue' || f.dueDate < todayStr;
      notifications.push({
        id: `f_notif_${f._id}`,
        type: 'followup',
        title: isOverdue ? `Follow-up Overdue: ${f.title}` : `Follow-up Reminder: ${f.title}`,
        desc: `Action item due ${f.dueDate}. ${f.description || ''}`,
        time: isOverdue ? 'Action Required' : 'Due Soon',
        unread: true,
        link: '/followups'
      });
    });

    const latestDoc = await MedicalDocument.findOne({ userId }).sort({ uploadDate: -1 });
    if (latestDoc) {
      notifications.push({
        id: `doc_notif_${latestDoc._id}`,
        type: 'document',
        title: `AI Document Summary Ready`,
        desc: `Plain-language breakdown prepared for "${latestDoc.name}".`,
        time: 'AI Verified',
        unread: false,
        link: `/documents/${latestDoc._id}/summary`
      });
    }

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

