import React, { useEffect, useState } from 'react';
import { Clock, AlertCircle, FileText, Calendar, CheckSquare, MessageSquare, RefreshCw } from 'lucide-react';
import api from '../services/api';

const HealthTimeline = () => {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTimeline = async () => {
    setError(null);
    try {
      const res = await api.get('/timeline');
      setTimeline(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load timeline. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, []);

  const getEventIcon = (type) => {
    switch (type) {
      case 'concern': return <AlertCircle size={18} color="#d97706" />;
      case 'document': return <FileText size={18} color="#0d9488" />;
      case 'appointment': return <Calendar size={18} color="#2563eb" />;
      case 'followup': return <CheckSquare size={18} color="#16a34a" />;
      default: return <MessageSquare size={18} color="#8b5cf6" />;
    }
  };

  const getEventBg = (type) => {
    switch (type) {
      case 'concern': return '#fffbeeb0';
      case 'document': return '#f0fdf4';
      case 'appointment': return '#eff6ff';
      case 'followup': return '#f0fdf4';
      default: return '#f3e8ff';
    }
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Health Timeline</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Chronological history of medical documents, symptoms, appointments, and follow-ups.</p>
        </div>
      </div>

      {error && (
        <div className="card" style={{ borderLeft: '4px solid #ef4444', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <AlertCircle size={20} color="#ef4444" style={{ flexShrink: 0 }} />
          <p style={{ flex: 1, margin: 0 }}>{error}</p>
          <button className="btn btn-secondary btn-sm" onClick={() => { setError(null); setLoading(true); fetchTimeline(); }}>
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ position: 'relative', paddingLeft: '2rem', maxWidth: '800px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ position: 'relative', marginBottom: '1.75rem' }}>
              <div style={{ position: 'absolute', left: '-2rem', top: '0.2rem', width: '32px', height: '32px', borderRadius: '50%' }} className="skeleton" />
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div className="skeleton skeleton-text-sm" style={{ width: '20%' }} />
                <div className="skeleton skeleton-heading" style={{ width: '55%' }} />
                <div className="skeleton skeleton-text" />
              </div>
            </div>
          ))}
        </div>
      ) : timeline.length === 0 ? (
        <div className="card empty-state">
          <Clock size={40} color="var(--text-subtle)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Your health timeline is empty</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Events will automatically populate when you record concerns, upload lab reports, or schedule visits.
          </p>
        </div>
      ) : (
        <div style={{ position: 'relative', paddingLeft: '2rem', maxWidth: '800px' }}>
          {/* Vertical Connecting Line */}
          <div style={{
            position: 'absolute',
            left: '15px',
            top: '10px',
            bottom: '10px',
            width: '2px',
            backgroundColor: 'var(--border-color)'
          }} />

          {timeline.map((item, idx) => (
            <div key={item._id || idx} className="animate-fadeInUp" style={{ position: 'relative', marginBottom: '1.75rem', animationDelay: `${idx * 60}ms` }}>
              {/* Timeline Icon Node */}
              <div style={{
                position: 'absolute',
                left: '-2rem',
                top: '0.2rem',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: getEventBg(item.type),
                border: '2px solid var(--bg-surface)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {getEventIcon(item.type)}
              </div>

              {/* Event Card */}
              <div className="card" style={{ padding: '1.1rem 1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-subtle)' }}>
                    {item.type}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                    {new Date(item.date).toLocaleDateString()}
                  </span>
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.2rem', color: 'var(--text-main)' }}>
                  {item.title}
                </h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HealthTimeline;
