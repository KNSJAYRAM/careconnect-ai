import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, PlusCircle, Trash2, Edit2, Calendar, Sparkles, ShieldCheck, Tag } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';

const HealthConcerns = () => {
  const [concerns, setConcerns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingConcern, setEditingConcern] = useState(null);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'General',
    severity: 'Moderate',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const fetchConcerns = useCallback(async () => {
    setError(null);
    try {
      const res = await api.get('/concerns');
      setConcerns(res.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status !== 401) {
        addToast('Error fetching health concerns', 'error');
        setError('Failed to load concerns. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchConcerns();
  }, [fetchConcerns]);

  const openAddModal = () => {
    setEditingConcern(null);
    setForm({
      title: '',
      description: '',
      category: 'General',
      severity: 'Moderate',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setShowAddModal(true);
  };

  const openEditModal = (c) => {
    setEditingConcern(c);
    setForm({
      title: c.title || '',
      description: c.description || '',
      category: c.category || 'General',
      severity: c.severity || 'Moderate',
      date: c.date ? new Date(c.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      notes: c.notes || ''
    });
    setShowAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.title.trim()) {
      addToast('Concern title is required', 'error');
      return;
    }
    try {
      if (editingConcern) {
        await api.put(`/concerns/${editingConcern._id}`, form);
        addToast('Health concern updated successfully', 'success');
      } else {
        await api.post('/concerns', form);
        addToast('Health concern recorded successfully', 'success');
      }
      setShowAddModal(false);
      setEditingConcern(null);
      setForm({
        title: '',
        description: '',
        category: 'General',
        severity: 'Moderate',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      fetchConcerns();
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || 'Error saving health concern', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Remove this health concern from record?')) {
      try {
        await api.delete(`/concerns/${id}`);
        addToast('Health concern removed', 'info');
        fetchConcerns();
      } catch (err) {
        console.error(err);
        addToast('Error deleting concern', 'error');
      }
    }
  };

  const getSeverityBadgeClass = (sev) => {
    if (sev === 'Severe') return 'badge-overdue';
    if (sev === 'Moderate') return 'badge-pending';
    return 'badge-blue';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Health Concerns Log</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Record and organize symptoms to prepare for clinician visits.</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <PlusCircle size={16} /> Record Concern
        </button>
      </div>

      {/* Safety Notice Banner */}
      <div style={{
        backgroundColor: '#f0fdf4',
        border: '1px solid #99f6e4',
        borderRadius: 'var(--radius-lg)',
        padding: '1rem 1.25rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.9rem'
      }}>
        <ShieldCheck size={22} color="#0d9488" style={{ marginTop: '0.1rem', flexShrink: 0 }} />
        <div style={{ fontSize: '0.875rem', color: '#0f766e', lineHeight: 1.5 }}>
          <strong>Safety Guidance:</strong> Your health concerns are securely recorded for personal tracking and doctor visit preparation. CareConnect AI does not make diagnostic evaluations or treatment claims.
          <div style={{ marginTop: '0.3rem', fontWeight: 600, color: '#047857' }}>
            "Consider discussing persistent, severe, or worsening symptoms with a qualified healthcare professional."
          </div>
        </div>
      </div>

      {error && (
        <div className="card" style={{ borderLeft: '4px solid #ef4444', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <AlertCircle size={20} color="#ef4444" style={{ flexShrink: 0 }} />
          <p style={{ flex: 1, margin: 0 }}>{error}</p>
          <button className="btn btn-secondary btn-sm" onClick={() => { setError(null); fetchConcerns(); }}>Retry</button>
        </div>
      )}

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
      ) : concerns.length === 0 ? (
        <div className="card empty-state">
          <AlertCircle size={40} color="var(--text-subtle)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No health concerns recorded yet</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Log symptoms such as tension headaches or joint stiffness to keep your healthcare provider informed.
          </p>
          <button className="btn btn-primary" onClick={openAddModal}>
            <PlusCircle size={16} /> Add First Health Concern
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {concerns.map((c, index) => (
            <div key={c._id} className="card card-hover animate-fadeInUp" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', animationDelay: `${index * 60}ms` }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span className={`badge ${getSeverityBadgeClass(c.severity)}`}>
                    {c.severity} Severity
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Calendar size={12} /> {new Date(c.date).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => openEditModal(c)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer', padding: '0.2rem' }}
                      title="Edit concern"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(c._id)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer', padding: '0.2rem' }}
                      title="Delete concern"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem' }}>{c.title}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-brand-600)', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Tag size={13} /> {c.category}
                </div>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1rem' }}>
                  {c.description || 'No detailed description provided.'}
                </p>

                {c.notes && (
                  <div style={{ fontSize: '0.8rem', backgroundColor: 'var(--bg-subtle)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                    <strong>Notes:</strong> {c.notes}
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.9rem', marginTop: '0.5rem' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%' }}
                  onClick={() => navigate('/appointments')}
                >
                  <Sparkles size={14} color="#0d9488" /> Prepare for Doctor Visit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Record / Edit Concern */}
      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setEditingConcern(null); }}
        title={editingConcern ? 'Edit Health Concern' : 'Record Health Concern'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Concern Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Recurring Tension Headache"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="General">General</option>
                <option value="Pain">Pain</option>
                <option value="Digestion">Digestion</option>
                <option value="Respiratory">Respiratory</option>
                <option value="Cardiovascular">Cardiovascular</option>
                <option value="Joints & Bones">Joints & Bones</option>
                <option value="Skin">Skin</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">User-Reported Severity</label>
              <select
                className="form-select"
                value={form.severity}
                onChange={(e) => setForm({ ...form, severity: e.target.value })}
              >
                <option value="Low">Low</option>
                <option value="Moderate">Moderate</option>
                <option value="Severe">Severe</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Onset Date</label>
            <input
              type="date"
              className="form-input"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description & Symptoms</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Describe symptoms, frequency, triggers, or duration..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Personal Notes</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Noticeable on high screen-time workdays"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            {editingConcern ? 'Update Concern' : 'Save Concern to Health Record'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default HealthConcerns;
