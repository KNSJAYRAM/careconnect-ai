import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Activity, 
  LayoutDashboard, 
  User, 
  AlertCircle, 
  FileText, 
  Calendar, 
  CheckSquare, 
  Clock, 
  Compass, 
  Bell, 
  Settings, 
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobile = () => {
    if (setMobileOpen) setMobileOpen(false);
  };

  const navItemStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.6rem 0.9rem',
    paddingLeft: isActive ? '0.7rem' : '0.9rem',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.875rem',
    fontWeight: isActive ? 600 : 500,
    color: isActive ? 'var(--color-brand-700)' : 'var(--text-muted)',
    backgroundColor: isActive ? 'var(--color-brand-50)' : 'transparent',
    borderLeft: isActive ? '3px solid var(--color-brand-600)' : '3px solid transparent',
    transition: 'all 0.15s ease',
    textDecoration: 'none',
  });

  const navSections = [
    {
      label: 'MAIN',
      items: [
        { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
        { to: '/profile', icon: <User size={18} />, label: 'Health Profile' },
        { to: '/concerns', icon: <AlertCircle size={18} />, label: 'Health Concerns' },
        { to: '/documents', icon: <FileText size={18} />, label: 'Documents' },
        { to: '/appointments', icon: <Calendar size={18} />, label: 'Appointments' },
        { to: '/followups', icon: <CheckSquare size={18} />, label: 'Follow-ups' },
        { to: '/timeline', icon: <Clock size={18} />, label: 'Health Timeline' },
        { to: '/navigation', icon: <Compass size={18} />, label: 'AI Navigation' },
      ]
    },
    {
      label: 'SYSTEM',
      items: [
        { to: '/notifications', icon: <Bell size={18} />, label: 'Notifications' },
        { to: '/settings', icon: <Settings size={18} />, label: 'Settings' },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          onClick={closeMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15,23,42,0.5)',
            zIndex: 45,
            display: 'block',
            backdropFilter: 'blur(2px)',
            animation: 'fadeIn 0.2s ease-out'
          }}
          aria-hidden="true"
        />
      )}

      <aside
        style={{
          width: '256px',
          minWidth: '256px',
          backgroundColor: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          transition: 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
          flexShrink: 0
        }}
        className={`sidebar-root${mobileOpen ? ' sidebar-mobile-open' : ''}`}
      >
        {/* Brand Logo */}
        <div style={{ padding: '1.25rem 1.25rem 1rem', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <NavLink to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }} onClick={closeMobile}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #2563eb 0%, #0d9488 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 3px 10px rgba(37, 99, 235, 0.3)',
              flexShrink: 0
            }}>
              <Activity size={18} />
            </div>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
              CareConnect <span style={{ color: 'var(--color-brand-600)' }}>AI</span>
            </span>
          </NavLink>

          {/* Mobile close button */}
          <button
            onClick={closeMobile}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: 'var(--text-subtle)',
              cursor: 'pointer',
              padding: '0.25rem',
              borderRadius: 'var(--radius-sm)'
            }}
            className="sidebar-close-btn"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 0.75rem' }}>
          {navSections.map((section) => (
            <div key={section.label} style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.07em', marginBottom: '0.5rem', paddingLeft: '0.9rem', textTransform: 'uppercase' }}>
                {section.label}
              </div>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                {section.items.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    style={navItemStyle}
                    onClick={closeMobile}
                    title={item.label}
                  >
                    {item.icon} {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>
          ))}
        </div>

        {/* User Footer */}
        <div style={{
          padding: '0.9rem 1rem',
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-brand-100) 0%, #dbeafe 100%)',
              color: 'var(--color-brand-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.875rem',
              flexShrink: 0,
              border: '1.5px solid var(--color-brand-200, #bfdbfe)'
            }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={{ overflow: 'hidden', minWidth: 0 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.name || 'Patient User'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.email || ''}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-subtle)',
              cursor: 'pointer',
              padding: '0.4rem',
              borderRadius: 'var(--radius-sm)',
              flexShrink: 0,
              transition: 'color 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-subtle)'}
            aria-label="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
