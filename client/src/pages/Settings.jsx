import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Sparkles, Trash2, Save, LogOut, CheckCircle, Shield } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';

const Settings = () => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Account');

  // Password Form
  const [passForm, setPassForm] = useState({ currentPass: '', newPass: '', confirmPass: '' });
  const [updatingPass, setUpdatingPass] = useState(false);

  // Notification & AI Preferences (Persisted in localStorage)
  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem('careconnect_settings');
      return saved ? JSON.parse(saved) : {
        appointmentReminders: true,
        followupAlerts: true,
        summaryNotifications: true,
        aiEngine: 'Gemini API (Auto-fallback to Smart Engine)'
      };
    } catch {
      return {
        appointmentReminders: true,
        followupAlerts: true,
        summaryNotifications: true,
        aiEngine: 'Gemini API (Auto-fallback to Smart Engine)'
      };
    }
  });

  const handleTogglePreference = (key) => {
    setPreferences(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem('careconnect_settings', JSON.stringify(updated));
      addToast('Notification preference saved', 'info');
      return updated;
    });
  };

  const handleAiEngineChange = (val) => {
    setPreferences(prev => {
      const updated = { ...prev, aiEngine: val };
      localStorage.setItem('careconnect_settings', JSON.stringify(updated));
      addToast('AI processing preference saved', 'info');
      return updated;
    });
  };

  // Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passForm.newPass !== passForm.confirmPass) {
      addToast('New passwords do not match', 'error');
      return;
    }

    if (passForm.newPass.length < 6) {
      addToast('New password must be at least 6 characters long', 'error');
      return;
    }

    setUpdatingPass(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passForm.currentPass,
        newPassword: passForm.newPass
      });
      addToast('Password updated successfully!', 'success');
      setPassForm({ currentPass: '', newPass: '', confirmPass: '' });
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || 'Failed to update password', 'error');
    } finally {
      setUpdatingPass(false);
    }
  };

  const handleLogout = () => {
    logout();
    addToast('You have been logged out of CareConnect AI.', 'info');
    navigate('/login');
  };

  const handleDeleteAccount = () => {
    addToast('Account deletion request canceled for security demonstration.', 'info');
    setShowDeleteModal(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Account & System Settings</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage security, notification preferences, and AI document settings.</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
        {['Account', 'Security', 'Notifications', 'Privacy', 'AI Preferences'].map(tab => (
          <button
            key={tab}
            className={`btn btn-sm ${activeTab === tab ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'Account' && (
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.6rem' }}>
            Account Overview
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px' }}>
            <div>
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" value={user?.name || ''} disabled />
            </div>
            <div>
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" value={user?.email || ''} disabled />
            </div>
            <div>
              <label className="form-label">Role / Subscription</label>
              <input type="text" className="form-input" value="Patient Standard Tier" disabled />
            </div>

            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
              <button className="btn btn-secondary" onClick={handleLogout} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <LogOut size={16} /> Sign Out of CareConnect AI
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Security' && (
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={18} color="var(--color-brand-600)" /> Security & Password Management
          </h3>
          <form onSubmit={handlePasswordSubmit} style={{ maxWidth: '500px' }}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter current password"
                value={passForm.currentPass}
                onChange={(e) => setPassForm({ ...passForm, currentPass: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">New Password (min 6 characters)</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter new password"
                value={passForm.newPass}
                onChange={(e) => setPassForm({ ...passForm, newPass: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Confirm new password"
                value={passForm.confirmPass}
                onChange={(e) => setPassForm({ ...passForm, confirmPass: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={updatingPass}>
              <Save size={16} /> {updatingPass ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'Notifications' && (
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.6rem' }}>
            Notification Preferences
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={preferences.appointmentReminders}
                onChange={() => handleTogglePreference('appointmentReminders')}
                style={{ width: '18px', height: '18px' }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Appointment Reminders</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Receive alerts prior to scheduled clinic consultations.</div>
              </div>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={preferences.followupAlerts}
                onChange={() => handleTogglePreference('followupAlerts')}
                style={{ width: '18px', height: '18px' }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Follow-up Task Alerts</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Alert when post-consultation tasks are near due date or overdue.</div>
              </div>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={preferences.summaryNotifications}
                onChange={() => handleTogglePreference('summaryNotifications')}
                style={{ width: '18px', height: '18px' }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>AI Summary Notifications</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Notify when plain-language document breakdowns are processed.</div>
              </div>
            </label>
          </div>
        </div>
      )}

      {activeTab === 'Privacy' && (
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={18} color="#0d9488" /> Data Privacy & Account Control
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Your uploaded documents and health data are restricted to your authenticated patient session. Multi-tenant access controls isolate user records.
          </p>
          <div style={{ borderTop: '1px solid #fecaca', paddingTop: '1.25rem' }}>
            <h4 style={{ color: '#ef4444', fontSize: '0.95rem', marginBottom: '0.5rem' }}>Danger Zone</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Permanently remove all medical records and profile details.</p>
            <button className="btn btn-danger btn-sm" onClick={() => setShowDeleteModal(true)}>
              <Trash2 size={16} /> Delete Account
            </button>
          </div>
        </div>
      )}

      {activeTab === 'AI Preferences' && (
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} color="#0d9488" /> AI Model & Summarization Preferences
          </h3>
          <div className="form-group" style={{ maxWidth: '500px' }}>
            <label className="form-label">Preferred AI Processing Mode</label>
            <select className="form-select" value={preferences.aiEngine} onChange={(e) => handleAiEngineChange(e.target.value)}>
              <option value="Gemini API (Auto-fallback to Smart Engine)">Gemini LLM API (Auto-fallback to Smart Engine)</option>
              <option value="OpenAI Compatible LLM Endpoint">OpenAI Compatible LLM Endpoint</option>
              <option value="Offline Smart Mock Service">Offline Smart Mock Service (Zero Network Calls)</option>
            </select>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Note: Configure <code style={{ backgroundColor: 'var(--bg-subtle)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>AI_API_KEY</code> in <code style={{ backgroundColor: 'var(--bg-subtle)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>server/.env</code> to connect live AI LLM APIs.
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Confirm Account Deletion">
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Are you sure you want to delete your CareConnect AI account? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowDeleteModal(false)}>Cancel</button>
          <button className="btn btn-danger btn-sm" onClick={handleDeleteAccount}>Confirm Delete</button>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;

