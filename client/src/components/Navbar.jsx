import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0.9rem 0'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.66rem', textDecoration: 'none' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #2563eb 0%, #0d9488 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 4px 10px rgba(37, 99, 235, 0.25)'
          }}>
            <Activity size={22} />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              CareConnect <span style={{ color: 'var(--color-brand-600)' }}>AI</span>
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="desktop-links" style={{ display: 'flex', alignItems: 'center', gap: '1.8rem' }}>
          <a href="#home" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>Home</a>
          <a href="#features" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>Features</a>
          <a href="#how-it-works" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>How It Works</a>
          <a href="#safety" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>Safety</a>
          <a href="#about" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>About</a>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isAuthenticated ? (
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
              Go to Dashboard <ArrowRight size={16} />
            </button>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
