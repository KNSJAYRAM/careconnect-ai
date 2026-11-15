import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, FileText, Calendar, AlertCircle, CheckSquare, Clock } from 'lucide-react';
import api from '../services/api';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState({ docs: [], appts: [], concerns: [], followups: [], timeline: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [docsRes, apptsRes, concernsRes, followupsRes, timelineRes] = await Promise.all([
        api.get('/documents'),
        api.get('/appointments'),
        api.get('/concerns'),
        api.get('/followups'),
        api.get('/timeline')
      ]);

      const q = query.toLowerCase();

      setResults({
        docs: docsRes.data.filter(d => (d.name || '').toLowerCase().includes(q) || (d.type || '').toLowerCase().includes(q) || (d.description || '').toLowerCase().includes(q)),
        appts: apptsRes.data.filter(a => (a.providerName || '').toLowerCase().includes(q) || (a.specialty || '').toLowerCase().includes(q) || (a.reason || '').toLowerCase().includes(q)),
        concerns: concernsRes.data.filter(c => (c.title || '').toLowerCase().includes(q) || (c.category || '').toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q)),
        followups: followupsRes.data.filter(f => (f.title || '').toLowerCase().includes(q) || (f.description || '').toLowerCase().includes(q)),
        timeline: timelineRes.data.filter(t => (t.title || '').toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q))
      });
    } catch (err) {
      console.error(err);
      setError('Failed to search workspace. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    if (query) {
      fetchAllData();
    } else {
      setLoading(false);
    }
  }, [query, fetchAllData]);

  const totalCount = results.docs.length + results.appts.length + results.concerns.length + results.followups.length + results.timeline.length;

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Global Search Results</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Query: <strong>"{query}"</strong> • {totalCount} matching items found
          </p>
        </div>
      </div>

      {error && (
        <div className="card" style={{ borderLeft: '4px solid #ef4444', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <AlertCircle size={20} color="#ef4444" style={{ flexShrink: 0 }} />
          <p style={{ flex: 1, margin: 0 }}>{error}</p>
          <button className="btn btn-secondary btn-sm" onClick={fetchAllData}>Retry</button>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {[1, 2].map(i => (
            <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="skeleton skeleton-heading" style={{ width: '30%' }} />
              {[1, 2, 3].map(j => <div key={j} className="skeleton skeleton-text" />)}
            </div>
          ))}
        </div>
      ) : totalCount === 0 ? (
        <div className="card empty-state">
          <Search size={40} color="var(--text-subtle)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No results match "{query}"</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Try searching for a doctor name, document category (e.g. Blood Test), or concern title.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Medical Documents Matches */}
          {results.docs.length > 0 && (
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0d9488' }}>
                <FileText size={20} /> Medical Documents ({results.docs.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {results.docs.map(d => (
                  <div key={d._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-app)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{d.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.type} • Uploaded {new Date(d.uploadDate).toLocaleDateString()}</div>
                    </div>
                    <Link to={`/documents/${d._id}/summary`} className="btn btn-teal btn-sm" style={{ textDecoration: 'none' }}>
                      AI Summary
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Appointments Matches */}
          {results.appts.length > 0 && (
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-brand-600)' }}>
                <Calendar size={20} /> Appointments ({results.appts.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {results.appts.map(a => (
                  <div key={a._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-app)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{a.providerName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.specialty} • {a.date} ({a.time})</div>
                    </div>
                    <Link to={`/appointments/${a._id}/prepare`} className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
                      Prepare AI Checklist
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Health Concerns Matches */}
          {results.concerns.length > 0 && (
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#d97706' }}>
                <AlertCircle size={20} /> Health Concerns ({results.concerns.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {results.concerns.map(c => (
                  <div key={c._id} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-app)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.category} • Severity: {c.severity}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Follow-up Tasks Matches */}
          {results.followups.length > 0 && (
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#7c3aed' }}>
                <CheckSquare size={20} /> Follow-up Tasks ({results.followups.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {results.followups.map(f => (
                  <div key={f._id} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-app)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{f.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Due: {f.dueDate} •{' '}
                      <span style={{ color: f.status === 'Overdue' ? '#ef4444' : f.status === 'Completed' ? '#16a34a' : '#d97706', fontWeight: 600 }}>
                        {f.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline Events Matches */}
          {results.timeline.length > 0 && (
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8b5cf6' }}>
                <Clock size={20} /> Timeline Events ({results.timeline.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {results.timeline.map(t => (
                  <div key={t._id} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-app)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {t.description} • {new Date(t.date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
