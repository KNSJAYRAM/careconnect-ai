import React from 'react';
import { Activity, ShieldCheck, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: '#0f172a',
      color: '#cbd5e1',
      padding: '4rem 0 2rem',
      borderTop: '1px solid #1e293b'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#ffffff', marginBottom: '1rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #2563eb 0%, #0d9488 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <Activity size={18} />
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>CareConnect AI</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.65 }}>
              Organize. Understand. Prepare. Track. Your intelligent, patient-centric healthcare information companion.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '1rem', fontSize: '0.8rem', color: '#38bdf8', fontWeight: 500 }}>
              <ShieldCheck size={16} /> Intelligent Patient Support Platform
            </div>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>Platform Features</h4>
            <ul style={{ listStyle: 'none', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', padding: 0, color: '#cbd5e1' }}>
              <li>Health Profile & Concerns</li>
              <li>Medical Document Storage</li>
              <li>AI Document Summaries</li>
              <li>Appointment Preparation</li>
              <li>Health Timeline & Follow-ups</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>Medical Disclaimer</h4>
            <p style={{ fontSize: '0.825rem', lineHeight: 1.6, color: '#cbd5e1' }}>
              CareConnect AI is strictly an informational and organizational platform. It does not provide medical diagnosis, clinical treatment suggestions, or medication prescriptions. Always consult a qualified healthcare provider for medical decisions.
            </p>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid #1e293b',
          paddingTop: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.825rem',
          color: '#94a3b8',
          gap: '0.75rem'
        }}>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
