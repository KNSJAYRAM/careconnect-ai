import mongoose from 'mongoose';
import FollowUp from '../models/FollowUp.js';
import TimelineEvent from '../models/TimelineEvent.js';

export const getFollowups = async (req, res) => {
  try {
    const userId = req.user._id;

    if (req.app.locals.useMemoryDb) {
      const db = req.app.locals.inMemoryDb;
      const todayStr = new Date().toISOString().split('T')[0];

      // Update overdue items on read
      db.followups.forEach(f => {
        if (String(f.userId) === String(userId) && f.status === 'Pending' && f.dueDate < todayStr) {
          f.status = 'Overdue';
        }
      });

      const list = db.followups
        .filter(f => String(f.userId) === String(userId))
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      return res.json(list);
    }

    const todayStr = new Date().toISOString().split('T')[0];
    await FollowUp.updateMany(
      { userId, status: 'Pending', dueDate: { $lt: todayStr } },
      { $set: { status: 'Overdue' } }
    );

    const followups = await FollowUp.find({ userId }).sort({ dueDate: 1 });
    res.json(followups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createFollowup = async (req, res) => {
  try {
    const userId = req.user._id;
    const { appointmentId, title, description, dueDate, status } = req.body;

    if (!title || !title.trim() || !dueDate) {
      return res.status(400).json({ message: 'Title and due date are required' });
    }

    const cleanTitle = title.trim();
    const todayStr = new Date().toISOString().split('T')[0];
    const initialStatus = status || (dueDate < todayStr ? 'Overdue' : 'Pending');

    const validApptId = (appointmentId && mongoose.Types.ObjectId.isValid(appointmentId)) ? appointmentId : undefined;

    if (req.app.locals.useMemoryDb) {
      const db = req.app.locals.inMemoryDb;
      const newFollowup = {
        _id: 'f_' + Date.now(),
        userId: String(userId),
        appointmentId: appointmentId || null,
        title: cleanTitle,
        description: description || '',
        dueDate,
        status: initialStatus,
        createdAt: new Date()
      };

      db.followups.push(newFollowup);

      db.timelineEvents.unshift({
        _id: 't_' + Date.now(),
        userId: String(userId),
        type: 'followup',
        title: `Follow-up Task Created: ${cleanTitle}`,
        description: `Due Date: ${dueDate}`,
        date: new Date(dueDate),
        relatedId: newFollowup._id,
        createdAt: new Date()
      });

      return res.status(201).json(newFollowup);
    }

    const followup = await FollowUp.create({
      userId,
      appointmentId: validApptId,
      title: cleanTitle,
      description: description || '',
      dueDate,
      status: initialStatus
    });

    await TimelineEvent.create({
      userId,
      type: 'followup',
      title: `Follow-up Task Created: ${cleanTitle}`,
      description: `Due Date: ${dueDate}`,
      date: new Date(dueDate),
      relatedId: followup._id.toString()
    });

    res.status(201).json(followup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateFollowup = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { title, description, dueDate, status, appointmentId } = req.body;

    if (req.app.locals.useMemoryDb) {
      const db = req.app.locals.inMemoryDb;
      const index = db.followups.findIndex(f => String(f._id) === String(id) && String(f.userId) === String(userId));
      if (index === -1) return res.status(404).json({ message: 'Follow-up not found' });

      if (title !== undefined) db.followups[index].title = title.trim();
      if (description !== undefined) db.followups[index].description = description;
      if (dueDate !== undefined) db.followups[index].dueDate = dueDate;
      if (status !== undefined) db.followups[index].status = status;
      if (appointmentId !== undefined) db.followups[index].appointmentId = appointmentId;

      return res.json(db.followups[index]);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid follow-up ID format' });
    }

    const followup = await FollowUp.findOne({ _id: id, userId });
    if (!followup) return res.status(404).json({ message: 'Follow-up not found' });

    if (title !== undefined) followup.title = title.trim();
    if (description !== undefined) followup.description = description;
    if (dueDate !== undefined) followup.dueDate = dueDate;
    if (status !== undefined) followup.status = status;
    if (appointmentId !== undefined) {
      followup.appointmentId = (appointmentId && mongoose.Types.ObjectId.isValid(appointmentId)) ? appointmentId : null;
    }

    const updated = await followup.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteFollowup = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (req.app.locals.useMemoryDb) {
      const db = req.app.locals.inMemoryDb;
      const exists = db.followups.some(f => String(f._id) === String(id) && String(f.userId) === String(userId));
      if (!exists) return res.status(404).json({ message: 'Follow-up not found' });

      db.followups = db.followups.filter(f => !(String(f._id) === String(id) && String(f.userId) === String(userId)));
      db.timelineEvents = db.timelineEvents.filter(t => !(t.relatedId === String(id) && String(t.userId) === String(userId)));
      return res.json({ message: 'Follow-up removed successfully' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid follow-up ID format' });
    }

    const followup = await FollowUp.findOneAndDelete({ _id: id, userId });
    if (!followup) return res.status(404).json({ message: 'Follow-up not found' });

    await TimelineEvent.deleteMany({ relatedId: id, userId });
    res.json({ message: 'Follow-up removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
