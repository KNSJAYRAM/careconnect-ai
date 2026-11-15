import React, { useState } from 'react';
import { Compass, Sparkles, Send, ShieldAlert, ArrowRight, HelpCircle, FileText, Calendar, AlertCircle } from 'lucide-react';
import api from '../services/api';
import DisclaimerBanner from '../components/DisclaimerBanner';

const HealthcareNavigation = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const suggestionChips = [
    'How do I understand a blood test report?',
    'What should I prepare before visiting a doctor?',
    'How do I track recurring tension headaches?',
    'What health information should I bring to an appointment?'
  ];

  const handleSearch = async (qText) => {
    const textToSearch = qText || query;
    if (!textToSearch.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/ai/organize-information', { query: textToSearch });
      setResponse(res.data);
    } catch (err) {
      console.error(err);
      setError('Unable to retrieve healthcare guidance at this time. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Healthcare Navigation Assistant</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Get informational guidance on organizing records, preparing for consultations, and navigating care.
          </p>
        </div>
      </div>

      <DisclaimerBanner text="CareConnect AI provides informational guidance only. It does not diagnose medical conditions, prescribe treatment, or replace advice from a licensed physician." />

      {/* Query Search Card */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Compass size={22} color="var(--color-brand-600)" /> What do you need help with?
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Ask how to organize lab records, prepare questions for your doctor, or navigate your healthcare workflow.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Type your healthcare navigation question..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ flex: 1, padding: '0.8rem 1rem', fontSize: '0.95rem' }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0 1.5rem' }} disabled={loading}>
            {loading ? 'Processing...' : 'Get Guidance'} <Send size={16} />
          </button>
        </form>

        {/* Suggestion Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-subtle)' }}>Suggestions:</span>
          {suggestionChips.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => { setQuery(chip); handleSearch(chip); }}
              style={{ fontSize: '0.78rem' }}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="card" style={{ borderLeft: '4px solid #ef4444', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <AlertCircle size={20} color="#ef4444" style={{ flexShrink: 0 }} />
          <p style={{ flex: 1, margin: 0 }}>{error}</p>
          <button className="btn btn-secondary btn-sm" onClick={() => handleSearch()}>Retry</button>
        </div>
      )}

      {/* Guidance Output Card */}
      {response && (
        <div className="card card-hover animate-fadeInUp" style={{ borderLeft: '4px solid #0d9488' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
            <div>
              <span className="badge badge-teal">
                <Sparkles size={12} /> {response.category}
              </span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '0.4rem', color: 'var(--text-main)' }}>
                Informational Guidance
              </h3>
            </div>
          </div>

          <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            {response.guidance}
          </p>

          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-brand-700)' }}>
            Recommended Navigation Steps:
          </h4>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
            {response.suggestedSteps.map((step, idx) => (
              <li key={idx} style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {step}
              </li>
            ))}
          </ul>

          <div style={{ backgroundColor: '#fffbeeb0', border: '1px solid #fde68a', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.825rem', color: '#92400e' }}>
            <strong>Important Safety Notice:</strong> Consider contacting a qualified healthcare professional, especially if symptoms are severe, persistent, or worsening.
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthcareNavigation;
