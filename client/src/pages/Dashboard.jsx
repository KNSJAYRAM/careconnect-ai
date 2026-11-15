import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Calendar, 
  FileText, 
  CheckSquare, 
  Clock, 
  PlusCircle, 
  Upload, 
  AlertCircle, 
  ArrowRight, 
  Sparkles,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';

const Dashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state for quick actions
  const [showAddConcernModal, setShowAddConcernModal] = useState(false);
  const [showAddApptModal, setShowAddApptModal] = useState(false);
  
  // Concern form
  const [concernForm, setConcernForm] = useState({ title: '', description: '', category: 'General', severity: 'Moderate' });
  // Appt form
  const [apptForm, setApptForm] = useState({ providerName: '', specialty: 'General Physician', date: '', time: '', reason: '' });

  const fetchDashboard = useCallback(async () => {
    setError(null);
    try {
      const res = await api.get('/dashboard');
      setDashboardData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      // If 401, the response interceptor automatically handles redirect to login
      if (err.response?.status !== 401) {
        addToast('Failed to fetch dashboard summary', 'error');
        setError('Unable to load dashboard summary. Please check your connection and retry.');
      }
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleAddConcernSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/concerns', concernForm);
      addToast('Health concern recorded successfully', 'success');
      setShowAddConcernModal(false);
      setConcernForm({ title: '', description: '', category: 'General', severity: 'Moderate' });
      fetchDashboard();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error saving concern', 'error');
    }
  };

  const handleAddApptSubmit = async (e) => {
    e.preventDefault();
    if (!apptForm.providerName || !apptForm.providerName.trim() || !apptForm.date || !apptForm.time) {
      addToast('Provider name, date and time are required', 'error');
      return;
    }
    if (!apptForm.reason || !apptForm.reason.trim()) {
      addToast('Reason for consultation is required.', 'error');
      return;
    }
    try {
      await api.post('/appointments', apptForm);
      addToast('Appointment scheduled successfully', 'success');
      setShowAddApptModal(false);
      setApptForm({ providerName: '', specialty: 'General Physician', date: '', time: '', reason: '' });
      fetchDashboard();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error saving appointment', 'error');
    }
  };

  if (loading) {
    return (
      <div className="page-transition" style={{ padding: '1.5rem' }}>
        {/* Skeleton heading */}
        <div className="skeleton skeleton-heading" style={{ marginBottom: '0.5rem' }} />
        <div className="skeleton skeleton-text" style={{ width: '40%', marginBottom: '2rem' }} />
        {/* Skeleton cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <div className="skeleton skeleton-card" />
          <div className="skeleton skeleton-card" />
          <div className="skeleton skeleton-card" />
          <div className="skeleton skeleton-card" />
        </div>
        {/* Skeleton second section */}
        <div className="skeleton skeleton-heading" style={{ width: '50%', marginBottom: '1rem' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          <div className="skeleton skeleton-card" style={{ height: '160px' }} />
          <div className="skeleton skeleton-card" style={{ height: '160px' }} />
        </div>
      </div>
    );
  }

  const { upcomingAppointment, totalDocuments, pendingFollowups, totalHealthEvents, recentDocuments, recentActivity } = dashboardData || {};

  return (
    <div className="page-transition">
      {/* Error State */}
      {error && (
        <div className="card" style={{ borderLeft: '4px solid #ef4444', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <AlertCircle size={22} color="#ef4444" style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: '0.9rem', color: 'var(--text-main)' }}>{error}</span>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => { setLoading(true); fetchDashboard(); }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.3rem' }}>
            {(() => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; })()}, {user?.name || dashboardData?.userName || 'User'} 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            Here's an overview of your healthcare information.
          </p>
        </div>
      </div>

      {/* Overview Metric Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        {/* Card 1: Upcoming Appointment */}
        <div className="animate-fadeInUp" style={{ animationDelay: '0ms' }}>
          <div className="card card-hover" style={{ borderLeft: '4px solid var(--color-brand-600)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>
                Upcoming Visit
              </span>
              <Calendar size={20} color="var(--color-brand-600)" />
            </div>
            {upcomingAppointment ? (
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                  {upcomingAppointment.providerName}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                  {upcomingAppointment.specialty} • {upcomingAppointment.date} ({upcomingAppointment.time})
                </div>
                <Link 
                  to={`/appointments/${upcomingAppointment._id}/prepare`}
                  className="badge badge-teal"
                  style={{ textDecoration: 'none' }}
                >
                  <Sparkles size={12} /> AI Prep Checklist Ready
                </Link>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>No upcoming visits scheduled</div>
                <button onClick={() => setShowAddApptModal(true)} className="btn btn-secondary btn-sm">
                  + Schedule Visit
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Recent Documents */}
        <div className="animate-fadeInUp" style={{ animationDelay: '75ms' }}>
          <div className="card card-hover" style={{ borderLeft: '4px solid #0d9488' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>
                Medical Documents
              </span>
              <FileText size={20} color="#0d9488" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
              {totalDocuments || 0} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>Files</span>
            </div>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Organized with AI Document Summarizer
            </div>
          </div>
        </div>

        {/* Card 3: Pending Follow-ups */}
        <div className="animate-fadeInUp" style={{ animationDelay: '150ms' }}>
          <div className="card card-hover" style={{ borderLeft: '4px solid #d97706' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>
                Pending Follow-ups
              </span>
              <CheckSquare size={20} color="#d97706" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
              {pendingFollowups || 0} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>Tasks</span>
            </div>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Action items post-doctor visits
            </div>
          </div>
        </div>

        {/* Card 4: Health Events */}
        <div className="animate-fadeInUp" style={{ animationDelay: '225ms' }}>
          <div className="card card-hover" style={{ borderLeft: '4px solid #8b5cf6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>
                Timeline History
              </span>
              <Clock size={20} color="#8b5cf6" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
              {totalHealthEvents || 0} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>Events</span>
            </div>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Chronological patient record
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
          Quick Actions:
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowAddConcernModal(true)}>
            <PlusCircle size={16} /> Add Health Concern
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/documents')}>
            <Upload size={16} /> Upload Document
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowAddApptModal(true)}>
            <Calendar size={16} /> Add Appointment
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/timeline')}>
            <Clock size={16} /> View Timeline
          </button>
        </div>
      </div>

      {/* Main Content Split Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Left Column: Recent Documents */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recent Medical Documents</h3>
            <Link to="/documents" style={{ fontSize: '0.85rem', color: 'var(--color-brand-600)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              View All <ChevronRight size={14} />
            </Link>
          </div>

          {recentDocuments && recentDocuments.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {recentDocuments.map((doc) => (
                <div key={doc._id} style={{
                  padding: '0.9rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-app)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', backgroundColor: '#eff6ff', color: '#2563eb' }}>
                      <FileText size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{doc.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {doc.type} • {new Date(doc.uploadDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Link to={`/documents/${doc._id}/summary`} className="btn btn-teal btn-sm">
                    <Sparkles size={14} /> AI Summary
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No documents uploaded yet.</p>
          )}
        </div>

        {/* Right Column: Recent Health Activity */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recent Health Activity</h3>
            <Link to="/timeline" style={{ fontSize: '0.85rem', color: 'var(--color-brand-600)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              Full Timeline <ChevronRight size={14} />
            </Link>
          </div>

          {recentActivity && recentActivity.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {recentActivity.map((act) => (
                <div key={act._id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-brand-600)',
                    marginTop: '0.4rem',
                    flexShrink: 0
                  }} />
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      {act.title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {act.description}
                    </div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-subtle)', marginTop: '0.1rem' }}>
                      {new Date(act.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No recent activity logged.</p>
          )}
        </div>
      </div>

      {/* Modal 1: Add Health Concern */}
      <Modal isOpen={showAddConcernModal} onClose={() => setShowAddConcernModal(false)} title="Record New Health Concern">
        <form onSubmit={handleAddConcernSubmit}>
          <div className="form-group">
            <label className="form-label">Concern Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Recurring Tension Headache"
              value={concernForm.title}
              onChange={(e) => setConcernForm({ ...concernForm, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={concernForm.category}
              onChange={(e) => setConcernForm({ ...concernForm, category: e.target.value })}
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
              value={concernForm.severity}
              onChange={(e) => setConcernForm({ ...concernForm, severity: e.target.value })}
            >
              <option value="Low">Low</option>
              <option value="Moderate">Moderate</option>
              <option value="Severe">Severe</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Description & Symptoms</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Describe when symptoms occur, duration, or triggers..."
              value={concernForm.description}
              onChange={(e) => setConcernForm({ ...concernForm, description: e.target.value })}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Save Health Concern
          </button>
        </form>
      </Modal>

      {/* Modal 2: Add Appointment */}
      <Modal isOpen={showAddApptModal} onClose={() => setShowAddApptModal(false)} title="Schedule Doctor Appointment">
        <form onSubmit={handleAddApptSubmit}>
          <div className="form-group">
            <label className="form-label">Doctor / Provider Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Dr. Sarah Jenkins"
              value={apptForm.providerName}
              onChange={(e) => setApptForm({ ...apptForm, providerName: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Specialty</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., General Physician / Orthopedist"
              value={apptForm.specialty}
              onChange={(e) => setApptForm({ ...apptForm, specialty: e.target.value })}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input
                type="date"
                className="form-input"
                value={apptForm.date}
                onChange={(e) => setApptForm({ ...apptForm, date: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Time *</label>
              <input
                type="text"
                className="form-input"
                placeholder="10:30 AM"
                value={apptForm.time}
                onChange={(e) => setApptForm({ ...apptForm, time: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Reason for Consultation *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Routine Annual Wellness Exam"
              value={apptForm.reason}
              onChange={(e) => setApptForm({ ...apptForm, reason: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Save & Generate AI Prep
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;
