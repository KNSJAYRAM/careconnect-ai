import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Code-split pages for lightning-fast initial load times
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));

const Dashboard = lazy(() => import('./pages/Dashboard'));
const HealthProfile = lazy(() => import('./pages/HealthProfile'));
const HealthConcerns = lazy(() => import('./pages/HealthConcerns'));
const MedicalDocuments = lazy(() => import('./pages/MedicalDocuments'));
const DocumentSummary = lazy(() => import('./pages/DocumentSummary'));
const Appointments = lazy(() => import('./pages/Appointments'));
const AppointmentPrep = lazy(() => import('./pages/AppointmentPrep'));
const HealthTimeline = lazy(() => import('./pages/HealthTimeline'));
const Followups = lazy(() => import('./pages/Followups'));
const HealthcareNavigation = lazy(() => import('./pages/HealthcareNavigation'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Settings = lazy(() => import('./pages/Settings'));

// Ultra-fast lightweight route fallback spinner
const PageLoadingFallback = () => (
  <div style={{
    minHeight: '60vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: '1rem',
    color: 'var(--text-muted)'
  }}>
    <div style={{
      width: '36px',
      height: '36px',
      border: '3px solid var(--color-brand-100)',
      borderTopColor: 'var(--color-brand-600)',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Loading CareConnect AI...</span>
  </div>
);

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <Suspense fallback={<PageLoadingFallback />}>
            <Routes>
              {/* Public Landing & Auth Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<LandingPage />} />
              </Route>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Protected App Workspace Routes */}
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<HealthProfile />} />
                <Route path="/concerns" element={<HealthConcerns />} />
                <Route path="/documents" element={<MedicalDocuments />} />
                <Route path="/documents/:id/summary" element={<DocumentSummary />} />
                <Route path="/appointments" element={<Appointments />} />
                <Route path="/appointments/:id/prepare" element={<AppointmentPrep />} />
                <Route path="/timeline" element={<HealthTimeline />} />
                <Route path="/followups" element={<Followups />} />
                <Route path="/navigation" element={<HealthcareNavigation />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
