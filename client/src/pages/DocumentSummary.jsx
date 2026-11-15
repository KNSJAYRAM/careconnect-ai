import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, FileText, CheckCircle2, HelpCircle, BookOpen, AlertCircle, ShieldAlert } from 'lucide-react';
import api from '../services/api';
import DisclaimerBanner from '../components/DisclaimerBanner';

const DocumentSummary = () => {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDoc = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/documents/${id}`);
      setDoc(res.data);
    } catch (err) {
      console.error('Error fetching document summary:', err);
      setError('Document not found or error loading document summary.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDoc();
  }, [fetchDoc]);

  if (loading) return (
    <div>
      <div className="skeleton skeleton-heading" style={{ width: '55%', marginBottom: '0.5rem' }} />
      <div className="skeleton skeleton-text" style={{ width: '70%', marginBottom: '2rem' }} />
      {[1, 2, 3].map(i => <div key={i} className="skeleton skeleton-card" style={{ marginBottom: '1.5rem' }} />)}
    </div>
  );

  if (error || !doc) return (
    <div className="card empty-state" style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <AlertCircle size={40} color="#ef4444" style={{ marginBottom: '1rem' }} />
      <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{error || 'Document Not Found'}</h3>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>The requested medical document summary could not be retrieved.</p>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
        <button className="btn btn-secondary btn-sm" onClick={fetchDoc}>Retry</button>
        <Link to="/documents" className="btn btn-primary btn-sm">
          <ArrowLeft size={14} /> Back to Documents
        </Link>
      </div>
    </div>
  );

  const { summary } = doc;

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/documents" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--color-brand-600)', fontWeight: 600, marginBottom: '0.75rem' }}>
          <ArrowLeft size={16} /> Back to Medical Documents
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>AI Document Summary</h1>
          <span className="badge badge-teal">
            <Sparkles size={13} /> {doc.type}
          </span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Document: <strong>{doc.name}</strong> • Uploaded {new Date(doc.uploadDate).toLocaleDateString()}
        </p>
      </div>

      {/* Mandatory AI Disclaimer Alert Banner */}
      <DisclaimerBanner text={summary?.disclaimer} />

      {/* 6 Structured Sections Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Section 1: Document Overview */}
        <div className="card" style={{ borderLeft: '4px solid var(--color-brand-600)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-brand-700)' }}>
            <FileText size={20} /> 1. Document Overview
          </h3>
          <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-main)' }}>
            {summary?.overview || 'Overview summary available for patient review.'}
          </p>
        </div>

        {/* Section 2: Key Information */}
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={20} color="#0d9488" /> 2. Key Information
          </h3>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {summary?.keyInfo && summary.keyInfo.length > 0 ? (
              summary.keyInfo.map((item, idx) => (
                <li key={idx} style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{item}</li>
              ))
            ) : (
              <li style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>No additional key points flagged.</li>
            )}
          </ul>
        </div>

        {/* Section 3: Important Values Mentioned */}
        <div className="card" style={{ backgroundColor: '#f8fafc' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={20} color="#d97706" /> 3. Important Values Mentioned
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {summary?.importantValues && summary.importantValues.length > 0 ? (
              summary.importantValues.map((val, idx) => (
                <div key={idx} style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: 'var(--text-main)'
                }}>
                  {val}
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>No numeric lab values highlighted.</p>
            )}
          </div>
        </div>

        {/* Section 4: Terms Explained */}
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={20} color="#2563eb" /> 4. Terms Explained
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {summary?.termsExplained && summary.termsExplained.length > 0 ? (
              summary.termsExplained.map((t, idx) => (
                <div key={idx} style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-app)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--color-brand-700)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                    {t.term}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                    {t.explanation}
                  </div>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>No medical terms required simplified explanation.</p>
            )}
          </div>
        </div>

        {/* Section 5: Questions to Discuss With a Doctor */}
        <div className="card" style={{ border: '1px solid #bfdbfe', backgroundColor: '#eff6ff' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-brand-900)' }}>
            <HelpCircle size={20} color="var(--color-brand-600)" /> 5. Questions to Discuss With Your Doctor
          </h3>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {summary?.questionsToDiscuss && summary.questionsToDiscuss.length > 0 ? (
              summary.questionsToDiscuss.map((q, idx) => (
                <li key={idx} style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>{q}</li>
              ))
            ) : (
              <li style={{ fontSize: '0.9rem' }}>What are the next steps based on this report?</li>
            )}
          </ul>
        </div>

        {/* Section 6: Original Document / Metadata */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            6. Original Document & Extracted Snippet
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            {doc.description || 'Uploaded document record.'}
          </p>
          <div style={{
            backgroundColor: 'var(--bg-app)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            whiteSpace: 'pre-wrap'
          }}>
            {doc.contentSnippet || 'Simulated PDF report content.'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentSummary;
