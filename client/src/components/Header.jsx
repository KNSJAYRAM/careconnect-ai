import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Sparkles, Menu, ChevronDown } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Header = ({ mobileOpen, setMobileOpen }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const navigate = useNavigate();
  const notifRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        if (Array.isArray(res.data) && res.data.length > 0) {
          setNotifications(res.data);
        } else {
          setNotifications([
            { id: 'n1', title: 'Healthcare Workspace Ready', desc: 'Welcome to CareConnect AI Patient Support Platform.', time: 'Just now', unread: false, link: '/dashboard' }
          ]);
        }
      } catch (err) {
        console.warn('Could not fetch notifications:', err.message);
      }
    };

    fetchNotifications();
  }, []);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header style={{
      height: '64px',
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      gap: '1rem',
      boxShadow: '0 1px 0 var(--border-color)'
    }}>
      {/* Left: Hamburger (mobile) + Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
        {/* Mobile hamburger button */}
        <button
          onClick={() => setMobileOpen && setMobileOpen(!mobileOpen)}
          style={{
            display: 'none',
            background: 'none',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            width: '38px',
            height: '38px',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            flexShrink: 0,
            transition: 'all 0.15s ease'
          }}
          className="mobile-menu-btn"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>

        {/* Global Search */}
        <form onSubmit={handleSearchSubmit} style={{ maxWidth: '340px', width: '100%', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: searchFocused ? 'var(--color-brand-500)' : 'var(--text-subtle)', pointerEvents: 'none', transition: 'color 0.15s ease' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search documents, appointments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{ paddingLeft: '2.4rem', height: '40px', fontSize: '0.85rem' }}
          />
        </form>
      </div>

      {/* Right: AI Badge + Notifications + User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
        {/* AI Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.78rem',
          fontWeight: 600,
          color: '#0d9488',
          backgroundColor: '#f0fdf4',
          border: '1px solid #99f6e4',
          padding: '0.35rem 0.75rem',
          borderRadius: 'var(--radius-full)',
          whiteSpace: 'nowrap'
        }} className="ai-badge-header">
          <Sparkles size={14} /> AI Active
        </div>

        {/* Notifications */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              position: 'relative',
              background: 'none',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: showNotifications ? 'var(--color-brand-600)' : 'var(--text-muted)',
              backgroundColor: showNotifications ? 'var(--color-brand-50)' : 'transparent',
              transition: 'all 0.15s ease'
            }}
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '17px',
                height: '17px',
                backgroundColor: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                fontSize: '0.65rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--bg-surface)'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '48px',
              width: '320px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-xl)',
              padding: '1rem',
              zIndex: 100,
              animation: 'fadeInScale 0.2s ease-out'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.6rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Notifications ({notifications.length})</span>
                <button
                  onClick={() => { setShowNotifications(false); navigate('/notifications'); }}
                  style={{ fontSize: '0.78rem', color: 'var(--color-brand-600)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                  View All →
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.map(n => (
                  <div
                    key={n.id}
                    style={{
                      padding: '0.65rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: n.unread ? 'var(--color-brand-50)' : 'transparent',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      border: `1px solid ${n.unread ? 'var(--color-brand-100)' : 'var(--border-light)'}`,
                      transition: 'background 0.15s ease'
                    }}
                    onClick={() => {
                      setShowNotifications(false);
                      if (n.link) navigate(n.link);
                      else navigate('/notifications');
                    }}
                    onMouseEnter={(e) => { if (!n.unread) e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'; }}
                    onMouseLeave={(e) => { if (!n.unread) e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.15rem' }}>{n.title}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{n.desc}</div>
                    <div style={{ color: 'var(--text-subtle)', fontSize: '0.7rem', marginTop: '0.3rem' }}>{n.time}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Pill */}
        <div
          onClick={() => navigate('/profile')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            padding: '0.3rem 0.65rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            transition: 'all 0.15s ease',
            userSelect: 'none'
          }}
          role="button"
          aria-label="Go to profile"
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-brand-600), #0d9488)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.8rem',
            flexShrink: 0
          }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className="hide-mobile">
            {user?.name || 'User'}
          </span>
          <ChevronDown size={14} color="var(--text-subtle)" className="hide-mobile" />
        </div>
      </div>
    </header>
  );
};

export default Header;
