import mongoose from 'mongoose';
import Appointment from '../models/Appointment.js';
import HealthConcern from '../models/HealthConcern.js';
import TimelineEvent from '../models/TimelineEvent.js';
import { generateAppointmentQuestions } from '../services/aiService.js';

const safeTimestamp = (dateStr, timeStr = '') => {
  if (!dateStr) return 0;
  const combo = timeStr ? `${dateStr} ${timeStr}` : dateStr;
  const t = new Date(combo).getTime();
  return isNaN(t) ? 0 : t;
};

export const getAppointments = async (req, res) => {
  try {
    const userId = req.user._id;

    if (req.app.locals.useMemoryDb) {
      const db = req.app.locals.inMemoryDb;
      const list = db.appointments
        .filter(a => String(a.userId) === String(userId))
        .sort((a, b) => safeTimestamp(a.date, a.time) - safeTimestamp(b.date, b.time));
      return res.json(list);
    }

    const appointments = await Appointment.find({ userId }).sort({ date: 1, time: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getAppointmentById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (req.app.locals.useMemoryDb) {
      const db = req.app.locals.inMemoryDb;
      const apt = db.appointments.find(a => String(a._id) === String(id) && String(a.userId) === String(userId));
      if (!apt) return res.status(404).json({ message: 'Appointment not found' });
      return res.json(apt);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid appointment ID format' });
    }

    const appointment = await Appointment.findOne({ _id: id, userId });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAppointment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { providerName, specialty, date, time, location, reason, notes, status } = req.body;

    if (!providerName || !providerName.trim() || !date || !time) {
      return res.status(400).json({ message: 'Provider name, date and time are required' });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: 'Reason for consultation is required.' });
    }

    // Get user concerns for AI preparation
    let userConcerns = [];
    if (req.app.locals.useMemoryDb) {
      userConcerns = req.app.locals.inMemoryDb.concerns.filter(c => String(c.userId) === String(userId));
    } else {
      userConcerns = await HealthConcern.find({ userId });
    }

    // Generate AI Prep
    const aiPrep = await generateAppointmentQuestions({
      providerName: providerName.trim(),
      specialty: specialty || 'General Physician',
      reason: reason || 'Routine Checkup',
      notes: notes || '',
      healthConcerns: userConcerns
    });

    if (req.app.locals.useMemoryDb) {
      const db = req.app.locals.inMemoryDb;
      const newApt = {
        _id: 'apt_' + Date.now(),
        userId: String(userId),
        providerName: providerName.trim(),
        specialty: specialty || 'General Physician',
        date,
        time,
        location: location || 'Main Clinic',
        reason: reason || '',
        notes: notes || '',
        status: status || 'Upcoming',
        aiPreparation: aiPrep,
        createdAt: new Date()
      };

      db.appointments.push(newApt);

      db.timelineEvents.unshift({
        _id: 't_' + Date.now(),
        userId: String(userId),
        type: 'appointment',
        title: `Appointment Scheduled with ${providerName.trim()}`,
        description: `Date: ${date} at ${time}`,
        date: new Date(date),
        relatedId: newApt._id,
        createdAt: new Date()
      });

      return res.status(201).json(newApt);
    }

    const appointment = await Appointment.create({
      userId,
      providerName: providerName.trim(),
      specialty: specialty || 'General Physician',
      date,
      time,
      location: location || 'Main Clinic',
      reason: reason || '',
      notes: notes || '',
      status: status || 'Upcoming',
      aiPreparation: aiPrep
    });

    await TimelineEvent.create({
      userId,
      type: 'appointment',
      title: `Appointment Scheduled with ${providerName.trim()}`,
      description: `Date: ${date} at ${time}`,
      date: new Date(date),
      relatedId: appointment._id.toString()
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { providerName, specialty, date, time, location, reason, notes, status } = req.body;

    if (reason !== undefined && (!reason || !reason.trim())) {
      return res.status(400).json({ message: 'Reason for consultation cannot be empty.' });
    }

    if (req.app.locals.useMemoryDb) {
      const db = req.app.locals.inMemoryDb;
      const index = db.appointments.findIndex(a => String(a._id) === String(id) && String(a.userId) === String(userId));
      if (index === -1) return res.status(404).json({ message: 'Appointment not found' });

      if (providerName !== undefined) db.appointments[index].providerName = providerName.trim();
      if (specialty !== undefined) db.appointments[index].specialty = specialty;
      if (date !== undefined) db.appointments[index].date = date;
      if (time !== undefined) db.appointments[index].time = time;
      if (location !== undefined) db.appointments[index].location = location;
      if (reason !== undefined) db.appointments[index].reason = reason.trim();
      if (notes !== undefined) db.appointments[index].notes = notes;
      if (status !== undefined) db.appointments[index].status = status;

      return res.json(db.appointments[index]);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid appointment ID format' });
    }

    const appointment = await Appointment.findOne({ _id: id, userId });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    if (providerName !== undefined) appointment.providerName = providerName.trim();
    if (specialty !== undefined) appointment.specialty = specialty;
    if (date !== undefined) appointment.date = date;
    if (time !== undefined) appointment.time = time;
    if (location !== undefined) appointment.location = location;
    if (reason !== undefined) appointment.reason = reason.trim();
    if (notes !== undefined) appointment.notes = notes;
    if (status !== undefined) appointment.status = status;

    const updated = await appointment.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (req.app.locals.useMemoryDb) {
      const db = req.app.locals.inMemoryDb;
      const exists = db.appointments.some(a => String(a._id) === String(id) && String(a.userId) === String(userId));
      if (!exists) return res.status(404).json({ message: 'Appointment not found' });

      db.appointments = db.appointments.filter(a => !(String(a._id) === String(id) && String(a.userId) === String(userId)));
      db.timelineEvents = db.timelineEvents.filter(t => !(t.relatedId === String(id) && String(t.userId) === String(userId)));
      return res.json({ message: 'Appointment deleted successfully' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid appointment ID format' });
    }

    const appointment = await Appointment.findOneAndDelete({ _id: id, userId });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    await TimelineEvent.deleteMany({ relatedId: id, userId });
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
