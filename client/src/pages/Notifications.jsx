import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle2, Trash2 } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const Notifications = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        if (Array.isArray(res.data) && res.data.length > 0) {
          setNotifications(res.data);
        } else {
          setNotifications([
            { id: 'n1', title: 'Healthcare Workspace Active', desc: 'Welcome to CareConnect AI. Your health data is securely loaded.', time: 'Just now', unread: false, link: '/dashboard' }
          ]);
        }
      } catch (err) {
        console.warn('Failed to load notifications:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
    addToast('All notifications marked as read', 'info');
  };

  const handleClearAll = () => {
    setNotifications([]);
    addToast('Notifications cleared', 'info');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>System Notifications</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Live reminders for upcoming visits, follow-up deadlines, and AI report summaries.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={handleMarkAllRead}>
            <CheckCircle2 size={14} /> Mark All Read
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleClearAll}>
            <Trash2 size={14} /> Clear All
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div className="skeleton" style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div className="skeleton skeleton-heading" style={{ width: '45%' }} />
                <div className="skeleton skeleton-text" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="card empty-state">
          <Bell size={40} color="var(--text-subtle)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No notifications</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>You're all caught up with your healthcare schedule!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {notifications.map(n => (
            <div
              key={n.id}
              className="card card-hover"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                backgroundColor: n.unread ? 'var(--color-brand-50)' : 'var(--bg-surface)',
                borderColor: n.unread ? 'var(--color-brand-100)' : 'var(--border-color)',
                cursor: n.link ? 'pointer' : 'default'
              }}
              onClick={() => {
                if (n.link) navigate(n.link);
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: n.unread ? '#2563eb' : 'var(--bg-subtle)',
                color: n.unread ? 'white' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Bell size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>{n.title}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>{n.time}</span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{n.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
