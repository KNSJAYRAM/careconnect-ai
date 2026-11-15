import TimelineEvent from '../models/TimelineEvent.js';

export const getTimelineEvents = async (req, res) => {
  try {
    const userId = req.user._id;

    if (req.app.locals.useMemoryDb) {
      const db = req.app.locals.inMemoryDb;
      const list = db.timelineEvents
        .filter(t => String(t.userId) === String(userId))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      return res.json(list);
    }

    const events = await TimelineEvent.find({ userId }).sort({ date: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
