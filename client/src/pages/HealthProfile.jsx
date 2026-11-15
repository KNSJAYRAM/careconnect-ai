import React, { useEffect, useState, useCallback } from 'react';
import { User, Activity, Edit2, Save, X, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const HealthProfile = () => {
  const { updateUserState } = useAuth();
  const { addToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dob: '',
    phone: '',
    bloodGroup: 'Not specified',
    allergies: '',
    existingConditions: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    relevantNotes: ''
  });

  const fetchProfile = useCallback(async () => {
    setError(null);
    try {
      const res = await api.get('/profile');
      const p = res.data;
      setFormData({
        name: p.name || '',
        email: p.email || '',
        dob: p.dob || '',
        phone: p.phone || '',
        bloodGroup: p.profile?.bloodGroup || 'Not specified',
        allergies: Array.isArray(p.profile?.allergies) ? p.profile.allergies.join(', ') : '',
        existingConditions: Array.isArray(p.profile?.existingConditions) ? p.profile.existingConditions.join(', ') : '',
        emergencyContactName: p.profile?.emergencyContact?.name || '',
        emergencyContactPhone: p.profile?.emergencyContact?.phone || '',
        emergencyContactRelation: p.profile?.emergencyContact?.relation || '',
        relevantNotes: p.profile?.relevantNotes || ''
      });
    } catch (err) {
      console.error(err);
      if (err.response?.status !== 401) {
        addToast('Error loading health profile', 'error');
        setError('Unable to load health profile. Please check connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        dob: formData.dob,
        phone: formData.phone,
        bloodGroup: formData.bloodGroup,
        allergies: formData.allergies,
        existingConditions: formData.existingConditions,
        emergencyContact: {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
          relation: formData.emergencyContactRelation
        },
        relevantNotes: formData.relevantNotes
      };
      const res = await api.put('/profile', payload);
      updateUserState(res.data);
      addToast('Health Profile updated successfully!', 'success');
      setEditing(false);
    } catch (err) {
      console.error(err);
      addToast('Failed to update profile', 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '0.5rem' }}>
        <div className="skeleton skeleton-heading" style={{ width: '45%', marginBottom: '0.5rem' }} />
        <div className="skeleton skeleton-text" style={{ width: '65%', marginBottom: '2rem' }} />
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="skeleton skeleton-heading" style={{ width: '40%', marginBottom: '1.5rem' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {[1,2,3,4].map(i => <div key={i}><div className="skeleton skeleton-text-sm" style={{ marginBottom: '0.4rem' }} /><div className="skeleton" style={{ height: '2.6rem', borderRadius: 'var(--radius-md)' }} /></div>)}
          </div>
        </div>
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="skeleton skeleton-heading" style={{ width: '35%', marginBottom: '1.5rem' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {[1,2,3].map(i => <div key={i}><div className="skeleton skeleton-text-sm" style={{ marginBottom: '0.4rem' }} /><div className="skeleton" style={{ height: '2.6rem', borderRadius: 'var(--radius-md)' }} /></div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Health Profile</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage personal metrics, medical conditions, and emergency contacts.</p>
        </div>
        {!editing ? (
          <button className="btn btn-primary" onClick={() => setEditing(true)}>
            <Edit2 size={16} /> Edit Profile
          </button>
        ) : (
          <button className="btn btn-secondary" onClick={() => setEditing(false)}>
            <X size={16} /> Cancel Editing
          </button>
        )}
      </div>

      {error && (
        <div className="card" style={{ borderLeft: '4px solid #ef4444', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <AlertCircle size={20} color="#ef4444" style={{ flexShrink: 0 }} />
          <p style={{ flex: 1, margin: 0 }}>{error}</p>
          <button className="btn btn-secondary btn-sm" onClick={() => { setError(null); fetchProfile(); }}>Retry</button>
        </div>
      )}

      {/* Profile Completeness Card */}
      {(() => {
        let score = 0;
        const total = 7;
        if (formData.name?.trim()) score++;
        if (formData.dob?.trim()) score++;
        if (formData.phone?.trim()) score++;
        if (formData.bloodGroup && formData.bloodGroup !== 'Not specified') score++;
        if (formData.allergies?.trim() || formData.existingConditions?.trim()) score++;
        if (formData.emergencyContactName?.trim()) score++;
        if (formData.emergencyContactPhone?.trim()) score++;
        const percent = Math.round((score / total) * 100);

        return (
          <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem 1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Profile Completeness
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: percent === 100 ? '#16a34a' : 'var(--color-brand-600)' }}>
                {percent}% Completed
              </span>
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{
                width: `${percent}%`,
                height: '100%',
                backgroundColor: percent === 100 ? '#16a34a' : 'var(--color-brand-600)',
                borderRadius: '999px',
                transition: 'width 0.4s ease'
              }} />
            </div>
            {percent < 100 && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 }}>
                Complete your health metrics and emergency contacts for personalized consultation preparation.
              </p>
            )}
          </div>
        );
      })()}

      <form onSubmit={handleSubmit}>
        {/* Card 1: Personal Details */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={20} color="var(--color-brand-600)" /> Personal Information
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!editing}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                disabled
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input
                type="date"
                className="form-input"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                disabled={!editing}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!editing}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Health Info & Allergies */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} color="#0d9488" /> Health Overview
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Blood Group</label>
              <select
                className="form-select"
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                disabled={!editing}
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="Not specified">Not specified</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Allergies (comma separated)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Penicillin, Dust Mites, Peanuts"
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                disabled={!editing}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Existing Health Conditions (comma separated)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Mild Asthma, Hypertension, Diabetes"
                value={formData.existingConditions}
                onChange={(e) => setFormData({ ...formData, existingConditions: e.target.value })}
                disabled={!editing}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Emergency Contact & Notes */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.6rem' }}>
            Emergency Contact & Preferences
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Contact Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Anita Kumar"
                value={formData.emergencyContactName}
                onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                disabled={!editing}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input
                type="text"
                className="form-input"
                placeholder="+91 98765 43211"
                value={formData.emergencyContactPhone}
                onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                disabled={!editing}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Relationship</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Mother, Spouse, Guardian"
                value={formData.emergencyContactRelation}
                onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
                disabled={!editing}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Relevant Medical Notes & Preferences</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="e.g., Prefers morning consultations. Annual physical examination due in October."
                value={formData.relevantNotes}
                onChange={(e) => setFormData({ ...formData, relevantNotes: e.target.value })}
                disabled={!editing}
              />
            </div>
          </div>
        </div>

        {editing && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} /> Save Changes
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default HealthProfile;
