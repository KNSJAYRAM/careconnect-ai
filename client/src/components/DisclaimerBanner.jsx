import React from 'react';
import { ShieldAlert } from 'lucide-react';

const DisclaimerBanner = ({ text }) => {
  return (
    <div className="disclaimer-banner">
      <ShieldAlert size={20} className="disclaimer-icon" />
      <div>
        <strong>AI Safety Disclaimer:</strong>{' '}
        {text || 'AI assists with organization and understanding. It does not diagnose, prescribe, or replace healthcare professionals. Always consult a qualified physician for medical decisions.'}
      </div>
    </div>
  );
};

export default DisclaimerBanner;
