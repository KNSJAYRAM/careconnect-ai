import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight, 
  FileText, 
  Sparkles, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  UserCheck, 
  FolderPlus, 
  HelpCircle, 
  ListChecks, 
  Layers
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-main)' }}>
      {/* Hero Section */}
      <section id="home" className="landing-hero" style={{
        padding: '5.25rem 0 4rem',
        background: 'radial-gradient(circle at 50% 0%, rgba(37, 99, 235, 0.08) 0%, rgba(248, 250, 252, 0) 70%)',
        textAlign: 'center'
      }}>
        <div className="container">
          <h1 style={{
            fontSize: 'clamp(2.3rem, 5.2vw, 3.8rem)',
            fontWeight: 800,
            lineHeight: 1.18,
            maxWidth: '920px',
            margin: '0 auto 1.35rem',
            letterSpacing: '-0.03em'
          }}>
            Your Health Information, <span style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #0d9488 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Organized. Understood. Ready.</span>
          </h1>

          <p style={{
            fontSize: 'clamp(1.05rem, 2vw, 1.2rem)',
            color: 'var(--text-muted)',
            maxWidth: '720px',
            margin: '0 auto 2.25rem',
            lineHeight: 1.65
          }}>
            CareConnect AI helps you organize healthcare information, understand medical documents, prepare for doctor consultations, and keep track of follow-ups — all in one secure platform.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '3.25rem' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding: '0.85rem 1.8rem', fontSize: '1rem' }}>
              Get Started <ArrowRight size={18} />
            </Link>
            <a href="#features" className="btn btn-secondary" style={{ padding: '0.85rem 1.8rem', fontSize: '1rem' }}>
              Explore Features
            </a>
          </div>

          {/* Product Dashboard UI Illustration Preview */}
          <div style={{
            maxWidth: '1000px',
            margin: '0 auto',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-surface)',
            boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.12)',
            overflow: 'hidden',
            padding: '1.25rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
              borderBottom: '1px solid var(--border-light)',
              paddingBottom: '0.75rem'
            }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#eab308' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginLeft: '1rem', fontWeight: 600 }}>CareConnect AI Patient Dashboard</span>
            </div>

            {/* Mock Dashboard Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', textAlign: 'left' }}>
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3b82f6', marginBottom: '0.3rem' }}>UPCOMING VISIT</div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Dr. Sarah Jenkins</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>12 Oct 2026 • 10:30 AM</div>
                <div style={{ fontSize: '0.75rem', color: '#0d9488', marginTop: '0.5rem', fontWeight: 600 }}>✓ AI Prep Ready</div>
              </div>

              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0d9488', marginBottom: '0.3rem' }}>DOCUMENTS SUMMARY</div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Blood Test Panel 2026</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Key terms explained & questions generated</div>
                <div style={{ fontSize: '0.75rem', color: '#2563eb', marginTop: '0.5rem', fontWeight: 600 }}>✓ AI Analyzed</div>
              </div>

              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706', marginBottom: '0.3rem' }}>FOLLOW-UP TRACKER</div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Lipid Review Consultation</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Due: Oct 12, 2026</div>
                <span className="badge badge-pending" style={{ marginTop: '0.4rem' }}>Pending</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: Problem */}
      <section className="landing-section" style={{ padding: '5rem 0', backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ maxWidth: '750px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>The Healthcare Information Challenge</h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2.5rem' }}>
              Healthcare information often becomes scattered across multiple medical reports, lab results, prescriptions, and follow-up notes. Patients frequently struggle to digest complex medical language and prepare effectively for doctor visits.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            <div className="card card-hover">
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <FolderPlus size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Scattered Records</h3>
              <p style={{ fontSize: '0.9rem' }}>Test reports, prescriptions, and consult notes spread across paper folders and different patient portals.</p>
            </div>

            <div className="card card-hover">
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#fffbeeb0', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <HelpCircle size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Complex Terminology</h3>
              <p style={{ fontSize: '0.9rem' }}>Difficult medical jargon in lab summaries leaving patients uncertain about key values.</p>
            </div>

            <div className="card card-hover">
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Clock size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Rushed Appointments</h3>
              <p style={{ fontSize: '0.9rem' }}>Limited doctor visit durations where key questions get forgotten due to lack of structured preparation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: CareConnect Approach */}
      <section className="landing-section" style={{ padding: '5rem 0', backgroundColor: 'var(--bg-app)', borderTop: '1px solid var(--border-color)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.8rem' }}>The CareConnect Approach</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', fontSize: '1.05rem' }}>
            Four streamlined steps to take total command of your healthcare journey.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
            position: 'relative'
          }}>
            <div className="card card-hover" style={{ textAlign: 'center', borderColor: '#bfdbfe' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-brand-600)', marginBottom: '0.5rem' }}>01</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>ORGANIZE</h3>
              <p style={{ fontSize: '0.875rem' }}>Store health profiles, concerns, and documents in one central hub.</p>
            </div>

            <div className="card card-hover" style={{ textAlign: 'center', borderColor: '#99f6e4' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-teal-600)', marginBottom: '0.5rem' }}>02</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>UNDERSTAND</h3>
              <p style={{ fontSize: '0.875rem' }}>Get AI-assisted plain-language summaries of medical documents.</p>
            </div>

            <div className="card card-hover" style={{ textAlign: 'center', borderColor: '#bfdbfe' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-brand-600)', marginBottom: '0.5rem' }}>03</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>PREPARE</h3>
              <p style={{ fontSize: '0.875rem' }}>Generate tailored question checklists ahead of doctor consultations.</p>
            </div>

            <div className="card card-hover" style={{ textAlign: 'center', borderColor: '#99f6e4' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-teal-600)', marginBottom: '0.5rem' }}>04</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>TRACK</h3>
              <p style={{ fontSize: '0.875rem' }}>Maintain a visual timeline and follow-up task reminders.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Features */}
      <section id="features" className="landing-section" style={{ padding: '5rem 0', backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3.5rem' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.8rem' }}>Comprehensive Healthcare Support Features</h2>
            <p style={{ color: 'var(--text-muted)' }}>Designed with patient clarity, security, and medical workflow simplicity in mind.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.75rem' }}>
            <div className="card card-hover">
              <UserCheck size={26} color="#2563eb" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>1. Health Profile</h3>
              <p style={{ fontSize: '0.875rem' }}>Manage blood group, known allergies, chronic conditions, emergency contacts, and medical preferences.</p>
            </div>

            <div className="card card-hover">
              <ShieldAlert size={26} color="#d97706" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>2. Health Concerns</h3>
              <p style={{ fontSize: '0.875rem' }}>Record symptoms, onset dates, and severity notes to review with your doctor.</p>
            </div>

            <div className="card card-hover">
              <FileText size={26} color="#0d9488" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>3. Medical Documents</h3>
              <p style={{ fontSize: '0.875rem' }}>Upload blood tests, imaging scans, prescriptions, and consult reports with search & filter tag organization.</p>
            </div>

            <div className="card card-hover">
              <Sparkles size={26} color="#2563eb" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>4. AI Report Summary</h3>
              <p style={{ fontSize: '0.875rem' }}>Structured document breakdown with key values, simplified medical terms, and suggested discussion questions.</p>
            </div>

            <div className="card card-hover">
              <Calendar size={26} color="#0d9488" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>5. Appointment Management</h3>
              <p style={{ fontSize: '0.875rem' }}>Schedule, track, and review upcoming, completed, or cancelled doctor appointments.</p>
            </div>

            <div className="card card-hover">
              <ListChecks size={26} color="#2563eb" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>6. Appointment Preparation</h3>
              <p style={{ fontSize: '0.875rem' }}>Generate customized checklists: questions to ask, documents to bring, and key topics to cover.</p>
            </div>

            <div className="card card-hover">
              <Clock size={26} color="#0d9488" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>7. Health Timeline</h3>
              <p style={{ fontSize: '0.875rem' }}>Interactive chronological timeline showing health events, test dates, and consultation records.</p>
            </div>

            <div className="card card-hover">
              <CheckCircle2 size={26} color="#2563eb" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>8. Follow-up Tracking</h3>
              <p style={{ fontSize: '0.875rem' }}>Create task reminders for post-visit instructions, lab re-checks, and medication reviews.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: How It Works */}
      <section id="how-it-works" className="landing-section" style={{ padding: '5rem 0', backgroundColor: 'var(--bg-app)', borderTop: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3.5rem' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.8rem' }}>How CareConnect AI Works</h2>
            <p style={{ color: 'var(--text-muted)' }}>Simple 6-step workflow designed for patients and caregivers.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {[
              { step: 'Step 1', title: 'Create your profile', desc: 'Sign up securely and add basic health details, allergies, and emergency contact.' },
              { step: 'Step 2', title: 'Add health information', desc: 'Log recurring symptoms or health concerns with user-reported severity.' },
              { step: 'Step 3', title: 'Upload or organize documents', desc: 'Add blood tests, radiology reports, or consult notes by category.' },
              { step: 'Step 4', title: 'Understand with AI assistance', desc: 'Read AI-generated document summaries explaining medical terms in plain language.' },
              { step: 'Step 5', title: 'Prepare for appointments', desc: 'Generate customized question checklists to bring to your doctor visit.' },
              { step: 'Step 6', title: 'Track follow-ups', desc: 'Set reminders for tests, prescription refills, or follow-up consults.' }
            ].map((item, idx) => (
              <div key={idx} className="card card-hover" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{
                  padding: '0.4rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-brand-100)',
                  color: 'var(--color-brand-700)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  flexShrink: 0
                }}>
                  {item.step}
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.3rem' }}>{item.title}</h4>
                  <p style={{ fontSize: '0.85rem' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: AI Safety */}
      <section id="safety" className="landing-section" style={{ padding: '4.5rem 0', backgroundColor: '#fffbeeb0', borderTop: '1px solid #fde68a', borderBottom: '1px solid #fde68a' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', maxWidth: '850px', margin: '0 auto', flexWrap: 'wrap' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '14px',
              backgroundColor: '#d97706',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <ShieldCheck size={30} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.25rem', color: '#92400e', marginBottom: '0.4rem' }}>Commitment to Patient Safety</h3>
              <p style={{ fontSize: '0.95rem', color: '#78350f', lineHeight: 1.6 }}>
                <strong>"AI assists with organization and understanding. It does not diagnose, prescribe, or replace healthcare professionals."</strong>
                <br />
                CareConnect AI is designed strictly to facilitate medical organization and doctor visit preparation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="landing-section" style={{ padding: '5rem 0', backgroundColor: 'var(--bg-surface)' }}>
        <div className="container">
          <div className="card card-hover" style={{ maxWidth: '850px', margin: '0 auto', background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity color="#2563eb" /> About CareConnect AI
            </h3>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              CareConnect AI is an intelligent healthcare navigation and patient support platform designed to help individuals organize medical records, understand complex clinical summaries, and prepare for doctor visits.
            </p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              The platform provides a modern full-stack application experience combining responsive React interfaces, secure Express backend services, protected patient data storage, and modular AI assistance for patient healthcare navigation.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 6: CTA */}
      <section className="landing-section" style={{
        padding: '5.5rem 0',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
        color: 'white',
        textAlign: 'center'
      }}>
        <div className="container">
          <h2 style={{ fontSize: '2.4rem', color: 'white', marginBottom: '1rem' }}>
            Take Control of Your Healthcare Information Today.
          </h2>
          <p style={{ color: '#bfdbfe', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
            Join CareConnect AI to organize your health records, summarize complex lab reports, and prepare for your next medical consultation.
          </p>
          <Link to="/register" className="btn btn-primary" style={{ padding: '0.9rem 2.2rem', fontSize: '1.05rem', backgroundColor: 'white', color: '#1e3a8a', borderColor: 'white' }}>
            Get Started Now <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
