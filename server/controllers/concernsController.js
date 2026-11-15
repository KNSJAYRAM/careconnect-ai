import mongoose from 'mongoose';
import HealthConcern from '../models/HealthConcern.js';
import TimelineEvent from '../models/TimelineEvent.js';

export const getConcerns = async (req, res) => {
  try {
    const userId = req.user._id;

    if (req.app.locals.useMemoryDb) {
      const db = req.app.locals.inMemoryDb;
      const list = db.concerns
        .filter(c => String(c.userId) === String(userId))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      return res.json(list);
    }

    const concerns = await HealthConcern.find({ userId }).sort({ date: -1 });
    res.json(concerns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createConcern = async (req, res) => {
  try {
    const userId = req.user._id;
    const { title, description, category, severity, date, notes } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const cleanTitle = title.trim();

    if (req.app.locals.useMemoryDb) {
      const db = req.app.locals.inMemoryDb;
      const newConcern = {
        _id: 'c_' + Date.now(),
        userId: String(userId),
        title: cleanTitle,
        description: description || '',
        category: category || 'General',
        severity: severity || 'Moderate',
        date: date ? new Date(date) : new Date(),
        notes: notes || '',
        createdAt: new Date()
      };
      db.concerns.unshift(newConcern);

      // Add timeline event
      db.timelineEvents.unshift({
        _id: 't_' + Date.now(),
        userId: String(userId),
        type: 'concern',
        title: `Health Concern Added: ${cleanTitle}`,
        description: description || 'New health concern recorded.',
        date: newConcern.date,
        relatedId: newConcern._id,
        createdAt: new Date()
      });

      return res.status(201).json(newConcern);
    }

    const concern = await HealthConcern.create({
      userId,
      title: cleanTitle,
      description: description || '',
      category: category || 'General',
      severity: severity || 'Moderate',
      date: date || Date.now(),
      notes: notes || ''
    });

    await TimelineEvent.create({
      userId,
      type: 'concern',
      title: `Health Concern Added: ${cleanTitle}`,
      description: description || 'New health concern recorded.',
      date: concern.date,
      relatedId: concern._id.toString()
    });

    res.status(201).json(concern);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateConcern = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { title, description, category, severity, date, notes } = req.body;

    if (req.app.locals.useMemoryDb) {
      const db = req.app.locals.inMemoryDb;
      const index = db.concerns.findIndex(c => String(c._id) === String(id) && String(c.userId) === String(userId));
      if (index === -1) return res.status(404).json({ message: 'Concern not found' });

      if (title !== undefined) db.concerns[index].title = title.trim();
      if (description !== undefined) db.concerns[index].description = description;
      if (category !== undefined) db.concerns[index].category = category;
      if (severity !== undefined) db.concerns[index].severity = severity;
      if (date !== undefined) db.concerns[index].date = new Date(date);
      if (notes !== undefined) db.concerns[index].notes = notes;

      // Also update timeline event if exists
      const tIndex = db.timelineEvents.findIndex(t => String(t.relatedId) === String(id) && String(t.userId) === String(userId));
      if (tIndex !== -1 && title !== undefined) {
        db.timelineEvents[tIndex].title = `Health Concern: ${title.trim()}`;
        if (description !== undefined) db.timelineEvents[tIndex].description = description;
      }

      return res.json(db.concerns[index]);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid concern ID format' });
    }

    const concern = await HealthConcern.findOne({ _id: id, userId });
    if (!concern) return res.status(404).json({ message: 'Concern not found' });

    if (title !== undefined) concern.title = title.trim();
    if (description !== undefined) concern.description = description;
    if (category !== undefined) concern.category = category;
    if (severity !== undefined) concern.severity = severity;
    if (date !== undefined) concern.date = date;
    if (notes !== undefined) concern.notes = notes;

    const updated = await concern.save();

    if (title !== undefined) {
      await TimelineEvent.updateMany(
        { relatedId: id, userId },
        { title: `Health Concern: ${title.trim()}`, description: description || concern.description }
      );
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteConcern = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (req.app.locals.useMemoryDb) {
      const db = req.app.locals.inMemoryDb;
      const exists = db.concerns.some(c => String(c._id) === String(id) && String(c.userId) === String(userId));
      if (!exists) return res.status(404).json({ message: 'Concern not found' });

      db.concerns = db.concerns.filter(c => !(String(c._id) === String(id) && String(c.userId) === String(userId)));
      db.timelineEvents = db.timelineEvents.filter(t => !(t.relatedId === String(id) && String(t.userId) === String(userId)));
      return res.json({ message: 'Concern removed successfully' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid concern ID format' });
    }

    const concern = await HealthConcern.findOneAndDelete({ _id: id, userId });
    if (!concern) return res.status(404).json({ message: 'Concern not found' });

    await TimelineEvent.deleteMany({ relatedId: id, userId });
    res.json({ message: 'Concern removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
