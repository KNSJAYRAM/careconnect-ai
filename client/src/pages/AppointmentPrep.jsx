import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, HelpCircle, Briefcase, MessageSquare, FileText, Calendar, AlertCircle } from 'lucide-react';
import api from '../services/api';
import DisclaimerBanner from '../components/DisclaimerBanner';

const AppointmentPrep = () => {
  const { id } = useParams();
  const [appt, setAppt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAppt = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/appointments/${id}`);
      setAppt(res.data);
    } catch (err) {
      console.error(err);
      setError('Appointment details could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAppt();
  }, [fetchAppt]);

  if (loading) return (
    <div>
      <div className="skeleton skeleton-heading" style={{ width: '50%', marginBottom: '0.5rem' }} />
      <div className="skeleton skeleton-text" style={{ width: '65%', marginBottom: '2rem' }} />
      {[1, 2].map(i => <div key={i} className="skeleton skeleton-card" style={{ marginBottom: '1.5rem' }} />)}
    </div>
  );

  if (error || !appt) return (
    <div className="card empty-state" style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <AlertCircle size={40} color="#ef4444" style={{ marginBottom: '1rem' }} />
      <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{error || 'Appointment Not Found'}</h3>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Unable to find or prepare this consultation checklist.</p>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
        <button className="btn btn-secondary btn-sm" onClick={fetchAppt}>Retry</button>
        <Link to="/appointments" className="btn btn-primary btn-sm">
          <ArrowLeft size={14} /> Back to Appointments
        </Link>
      </div>
    </div>
  );

  const prep = appt.aiPreparation || {
    questionsToAsk: ['What diagnostic steps do you recommend for my current symptoms?'],
    infoToBring: ['Current medication list', 'Recent lab test reports'],
    topicsToDiscuss: ['Preventative health strategy'],
    relevantDocuments: ['Blood Test Report']
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/appointments" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--color-brand-600)', fontWeight: 600, marginBottom: '0.75rem' }}>
          <ArrowLeft size={16} /> Back to Appointments
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>AI Appointment Preparation</h1>
          <span className="badge badge-teal">
            <Sparkles size={13} /> Tailored Checklist
          </span>
        </div>
      </div>

      {/* Appointment Context Card */}
      <div className="card" style={{ marginBottom: '1.5rem', backgroundColor: '#f8fafc', borderLeft: '4px solid var(--color-brand-600)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>{appt.providerName}</h2>
            <div style={{ fontSize: '0.9rem', color: 'var(--color-brand-600)', fontWeight: 600 }}>{appt.specialty}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
              <Calendar size={14} style={{ display: 'inline', marginRight: '0.3rem' }} />
              {appt.date} at {appt.time} • {appt.location}
            </div>
          </div>
          <div style={{ fontSize: '0.875rem', backgroundColor: 'var(--bg-surface)', padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <strong>Reason for Visit:</strong> {appt.reason || 'General Consultation'}
          </div>
        </div>
      </div>

      <DisclaimerBanner text="These appointment preparation checklists are AI-generated suggestions synthesized from your logged health concerns and documents. They are designed to assist consultation organization." />

      {/* 4 AI Sections Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* 1. Questions to Ask */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-brand-700)' }}>
            <HelpCircle size={20} color="var(--color-brand-600)" /> Questions to Ask Your Doctor
          </h3>
          <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {prep.questionsToAsk.map((q, idx) => (
              <li key={idx} style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                {q}
              </li>
            ))}
          </ul>
        </div>

        {/* 2. Information to Bring */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0d9488' }}>
            <Briefcase size={20} color="#0d9488" /> Information & Items to Bring
          </h3>
          <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {prep.infoToBring.map((info, idx) => (
              <li key={idx} style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {info}
              </li>
            ))}
          </ul>
        </div>

        {/* 3. Key Topics to Discuss */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#d97706' }}>
            <MessageSquare size={20} color="#d97706" /> Primary Topics to Cover
          </h3>
          <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {prep.topicsToDiscuss.map((topic, idx) => (
              <li key={idx} style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {topic}
              </li>
            ))}
          </ul>
        </div>

        {/* 4. Relevant Documents */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8b5cf6' }}>
            <FileText size={20} color="#8b5cf6" /> Relevant Medical Documents
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {prep.relevantDocuments.map((docName, idx) => (
              <div key={idx} style={{ padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)', fontSize: '0.85rem', fontWeight: 600 }}>
                📄 {docName}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentPrep;
