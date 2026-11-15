import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, PlusCircle, Trash2, Edit2, Sparkles, MapPin, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAppt, setEditingAppt] = useState(null);

  const { addToast } = useToast();

  const [form, setForm] = useState({
    providerName: '',
    specialty: 'General Physician',
    date: new Date().toISOString().split('T')[0],
    time: '10:30 AM',
    location: 'CareConnect Health Center',
    reason: '',
    notes: '',
    status: 'Upcoming'
  });

  const fetchAppointments = useCallback(async () => {
    setError(null);
    try {
      const res = await api.get('/appointments');
      setAppointments(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      if (err.response?.status !== 401) {
        addToast('Error fetching appointments', 'error');
        setError('Failed to load. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const openAddModal = () => {
    setEditingAppt(null);
    setForm({
      providerName: '',
      specialty: 'General Physician',
      date: new Date().toISOString().split('T')[0],
      time: '10:30 AM',
      location: 'CareConnect Health Center',
      reason: '',
      notes: '',
      status: 'Upcoming'
    });
    setShowAddModal(true);
  };

  const openEditModal = (a) => {
    setEditingAppt(a);
    setForm({
      providerName: a.providerName || '',
      specialty: a.specialty || 'General Physician',
      date: a.date || new Date().toISOString().split('T')[0],
      time: a.time || '10:30 AM',
      location: a.location || 'CareConnect Health Center',
      reason: a.reason || '',
      notes: a.notes || '',
      status: a.status || 'Upcoming'
    });
    setShowAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.providerName || !form.providerName.trim() || !form.date || !form.time) {
      addToast('Provider name, date and time are required', 'error');
      return;
    }

    if (!form.reason || !form.reason.trim()) {
      addToast('Reason for consultation is required.', 'error');
      return;
    }

    try {
      if (editingAppt) {
        await api.put(`/appointments/${editingAppt._id}`, form);
        addToast('Appointment updated', 'success');
      } else {
        await api.post('/appointments', form);
        addToast('Appointment scheduled & AI prep generated!', 'success');
      }
      setShowAddModal(false);
      setEditingAppt(null);
      setForm({
        providerName: '',
        specialty: 'General Physician',
        date: new Date().toISOString().split('T')[0],
        time: '10:30 AM',
        location: 'CareConnect Health Center',
        reason: '',
        notes: '',
        status: 'Upcoming'
      });
      fetchAppointments();
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || 'Error saving appointment', 'error');
    }
  };

  const handleStatusToggle = async (appt, newStatus) => {
    try {
      await api.put(`/appointments/${appt._id}`, { status: newStatus });
      addToast(`Appointment status updated to ${newStatus}`, 'info');
      fetchAppointments();
    } catch (err) {
      console.error(err);
      addToast('Failed to update status', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this appointment record?')) {
      try {
        await api.delete(`/appointments/${id}`);
        addToast('Appointment deleted', 'info');
        fetchAppointments();
      } catch (err) {
        console.error(err);
        addToast('Error deleting appointment', 'error');
      }
    }
  };

  const filteredAppts = appointments.filter(a => a.status === activeTab);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Appointments & Consultations</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Schedule doctor visits and generate AI preparation checklists.</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <PlusCircle size={16} /> Schedule Visit
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        {['Upcoming', 'Completed', 'Cancelled'].map(tab => (
          <button
            key={tab}
            className={`btn btn-sm ${activeTab === tab ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab(tab)}
            style={{ transition: 'all 0.2s ease' }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Error State */}
      {error && (
        <div className="card" style={{ borderLeft: '4px solid #ef4444', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <AlertCircle size={20} color="#ef4444" style={{ flexShrink: 0 }} />
          <p style={{ flex: 1, margin: 0, color: 'var(--text-main)' }}>{error}</p>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => { setError(null); fetchAppointments(); }}
          >
            Retry
          </button>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="skeleton skeleton-card" />
              <div className="skeleton skeleton-heading" />
              <div className="skeleton skeleton-text" />
              <div className="skeleton skeleton-text" style={{ width: '60%' }} />
            </div>
          ))}
        </div>
      ) : filteredAppts.length === 0 ? (
        <div className="empty-state">
          <Calendar size={40} color="var(--text-subtle)" style={{ marginBottom: '1rem' }} />
          <h3>No {activeTab.toLowerCase()} appointments</h3>
          <p>Schedule an appointment to automatically build customized AI question checklists.</p>
          <button className="btn btn-primary" onClick={openAddModal}>
            <PlusCircle size={16} /> Add Appointment
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filteredAppts.map((a, index) => (
            <div
              key={a._id}
              className="card card-hover animate-fadeInUp"
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', animationDelay: `${index * 60}ms` }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span className={`badge ${a.status === 'Completed' ? 'badge-completed' : a.status === 'Cancelled' ? 'badge-overdue' : 'badge-blue'}`}>
                    {a.status}
                  </span>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      onClick={() => openEditModal(a)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer', padding: '0.2rem' }}
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(a._id)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer', padding: '0.2rem' }}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.2rem' }}>{a.providerName}</h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-brand-600)', fontWeight: 600, marginBottom: '0.75rem' }}>
                  {a.specialty}
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Clock size={15} color="var(--text-subtle)" /> {a.date} at {a.time}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={15} color="var(--text-subtle)" /> {a.location || 'Main Clinic'}
                  </div>
                </div>

                {a.reason && (
                  <div style={{ fontSize: '0.85rem', backgroundColor: 'var(--bg-subtle)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                    <strong>Reason:</strong> {a.reason}
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <Link to={`/appointments/${a._id}/prepare`} className="btn btn-teal btn-sm" style={{ textDecoration: 'none', width: '100%' }}>
                  <Sparkles size={14} /> Prepare with AI Checklist
                </Link>

                {a.status === 'Upcoming' && (
                  <button className="btn btn-secondary btn-sm" onClick={() => handleStatusToggle(a, 'Completed')}>
                    <CheckCircle2 size={14} color="#15803d" /> Mark Completed
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Schedule / Edit Appointment */}
      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setEditingAppt(null); }}
        title={editingAppt ? 'Edit Appointment' : 'Schedule Healthcare Visit'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Doctor / Provider Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Dr. Sarah Jenkins"
              value={form.providerName}
              onChange={(e) => setForm({ ...form, providerName: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Medical Specialty</label>
              <select
                className="form-select"
                value={form.specialty}
                onChange={(e) => setForm({ ...form, specialty: e.target.value })}
              >
                <option value="General Physician">General Physician / Primary Care</option>
                <option value="Cardiologist">Cardiologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Endocrinologist">Endocrinologist</option>
                <option value="Gastroenterologist">Gastroenterologist</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Orthopedist">Orthopedist</option>
                <option value="Pediatrician">Pediatrician</option>
                <option value="Psychiatrist">Psychiatrist</option>
                <option value="Pulmonologist">Pulmonologist</option>
                <option value="Other">Other Specialty</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Clinic Location</label>
              <input
                type="text"
                className="form-input"
                placeholder="CareConnect Health Center"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Appointment Date *</label>
              <input
                type="date"
                className="form-input"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Appointment Time *</label>
              <input
                type="text"
                className="form-input"
                placeholder="10:30 AM"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Reason for Consultation *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Annual routine checkup & blood test review"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Personal Visit Notes (Optional)</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="e.g., Mention recent forehead headaches and knee stiffness..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            {editingAppt ? 'Update Appointment' : 'Save & Build AI Prep Checklist'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Appointments;
