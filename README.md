# CareConnect AI 🏥✨
### AI-Powered Healthcare Navigation & Patient Support Platform

**CareConnect AI** is a patient-facing healthcare navigation and support platform built as an **Individual B.Tech Computer Science & Engineering (CSE) Capstone Project at SRM University AP**.

The platform helps patients **ORGANIZE → UNDERSTAND → PREPARE → TRACK** their healthcare information from a central, intuitive web interface.

---

## 📌 1. Project Purpose & Problem Statement

### The Problem
Healthcare information often becomes scattered across paper reports, lab test PDFs, prescriptions, consultation notes, and multiple hospital portals. Patients frequently face:
1. **Difficulty Digesting Complex Medical Jargon:** Struggling to interpret lab reference ranges and radiological terms.
2. **Rushed Consultations:** Forgetting critical questions during brief doctor visits due to lack of structured preparation.
3. **Loss of Follow-up Care:** Missing post-consultation test dates or prescription reviews.

### The CareConnect Approach
CareConnect AI empowers patients to:
- **ORGANIZE:** Maintain a central health profile, log recurring health concerns, and store medical documents.
- **UNDERSTAND:** Read AI-assisted, plain-language summaries of medical documents (lab panels, radiology scans, consult notes).
- **PREPARE:** Generate customized question checklists and document lists before doctor appointments.
- **TRACK:** View an interactive chronological health timeline and manage follow-up tasks.

---

## 🛠️ 2. Technology Stack

### Frontend
- **Framework:** React 19 (Vite)
- **Routing:** React Router DOM v6
- **Styling:** Custom Vanilla CSS Design System (SaaS aesthetic, dark/light contrast, glassmorphism, responsive cards)
- **Icons:** Lucide React
- **API Client:** Axios (with JWT interceptor)

### Backend
- **Runtime:** Node.js & Express.js (REST APIs)
- **Database:** MongoDB & Mongoose (with hybrid fallback to In-Memory Database Mode for immediate out-of-the-box evaluation)
- **Authentication:** JSON Web Tokens (JWT) & bcrypt password hashing
- **Security:** Helmet, CORS, Morgan logger

### AI Service Layer
- **Modular AI Service (`server/services/aiService.js`):** Integrates Gemini API / LLM endpoints via `.env` configuration.
- **Smart Fallback Engine:** Features an intelligent mock AI generator that produces structured, realistic plain-language summaries and preparation checklists even without active API keys.

---

## 📁 3. Application Structure

```
c:\Users\knsja\OneDrive\Desktop\AI-Powered Healthcare Navigation & Patient Support Platform\
│
├── client/                     # React + Vite Frontend
│   ├── src/
│   │   ├── components/         # Navbar, Footer, Sidebar, Header, Modal, DisclaimerBanner
│   │   ├── context/            # AuthContext, ToastContext
│   │   ├── layouts/            # PublicLayout, DashboardLayout
│   │   ├── pages/              # LandingPage, Login, Register, Dashboard, HealthProfile, 
│   │   │                       # HealthConcerns, MedicalDocuments, DocumentSummary, 
│   │   │                       # Appointments, AppointmentPrep, HealthTimeline, 
│   │   │                       # Followups, HealthcareNavigation, SearchResults, 
│   │   │                       # Notifications, Settings
│   │   ├── services/           # Axios API configuration
│   │   ├── App.jsx             # React Router hierarchy
│   │   ├── main.jsx            # Entry point
│   │   └── index.css           # Modern Healthcare SaaS styling system
│   └── package.json
│
├── server/                     # Node.js + Express Backend
│   ├── controllers/            # Auth, Profile, Concerns, Documents, Appointments, 
│   │                           # Followups, Timeline, Dashboard, AI controllers
│   ├── middleware/             # JWT Auth protection, Error handling
│   ├── models/                 # Mongoose Schemas (User, HealthConcern, MedicalDocument, 
│   │                           # Appointment, FollowUp, TimelineEvent)
│   ├── routes/                 # Express REST endpoint routes
│   ├── services/               # aiService.js & inMemoryDb.js
│   ├── utils/                  # seed.js database seeder
│   ├── .env                    # Environment configuration
│   ├── server.js               # Main Express app entry point
│   └── package.json
│
├── .env.example                # Template environment variables
├── package.json                # Root package for script orchestration
└── README.md                   # Complete project documentation
```

---

## 🚀 4. Installation & Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- *(Optional)* MongoDB (If MongoDB is not running locally, CareConnect AI automatically operates in **In-Memory Database Mode** for instant out-of-the-box review!)

### Installation Steps

1. **Install Dependencies:**
   Run from the root directory:
   ```bash
   npm run install-all
   ```

2. **Configure Environment Variables:**
   Copy `.env.example` to `server/.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/careconnect_ai
   JWT_SECRET=careconnect_super_secret_jwt_key_2026_srm_ap
   AI_API_KEY=your_gemini_or_llm_api_key_here
   USE_IN_MEMORY_DB=true
   ```

3. **(Optional) Seed MongoDB:**
   ```bash
   npm run seed
   ```

---

## 🏃 5. Running the Application

### Option A: Run Both Server & Client Together (Recommended)
From the root directory, simply run:
```bash
npm run dev
```
This runs both the Express backend (`http://localhost:5000`) and the React client (`http://localhost:5173`) concurrently in a single terminal.

### Option B: Run in Separate Terminals
**Terminal 1 (Backend Server):**
```bash
npm run server
```

**Terminal 2 (React Client):**
```bash
npm run client
```

---

## 🔑 6. Quick Demo Credentials for Academic Review

To test all protected dashboard features immediately, use the pre-seeded demo user:

- **Email:** `jayram@example.com`
- **Password:** `password123`

*(Alternatively, use the "Fill Demo" button on the `/login` page for one-click authentication!)*

---

## 🔌 7. REST API Architecture Overview

| Module | Method | Endpoint | Description |
|---|---|---|---|
| **Auth** | POST | `/api/auth/register` | Register new patient account |
| **Auth** | POST | `/api/auth/login` | Authenticate user & receive JWT |
| **Auth** | GET | `/api/auth/me` | Fetch active user credentials |
| **Profile** | GET / PUT | `/api/profile` | View and edit personal & medical details |
| **Concerns** | GET / POST | `/api/concerns` | List and log health concerns |
| **Concerns** | PUT / DELETE | `/api/concerns/:id` | Update or remove health concerns |
| **Documents** | GET / POST | `/api/documents` | Upload records & auto-generate AI summaries |
| **Documents** | GET / DELETE | `/api/documents/:id` | View specific document & AI breakdown |
| **Appointments** | GET / POST | `/api/appointments` | Schedule visits & auto-generate AI prep |
| **Appointments** | PUT / DELETE | `/api/appointments/:id` | Edit, complete, or cancel appointments |
| **Follow-ups** | GET / POST | `/api/followups` | Manage post-visit tasks & status badges |
| **Timeline** | GET | `/api/timeline` | Fetch chronological patient timeline |
| **Dashboard** | GET | `/api/dashboard` | Fetch aggregated dashboard metrics |
| **AI Service** | POST | `/api/ai/summarize-document` | Generate 6-section document summary |
| **AI Service** | POST | `/api/ai/appointment-questions` | Generate consultation preparation checklist |
| **AI Service** | POST | `/api/ai/organize-information` | Get informational healthcare guidance |

---

## 🛡️ 8. AI Safety & Non-Diagnostic Disclaimer

> **IMPORTANT:** CareConnect AI is NOT an AI doctor.
> 
> The system strictly does **NOT**:
> - Diagnose medical diseases or conditions
> - Prescribe pharmaceuticals or medications
> - Recommend dosage changes
> - Make autonomous treatment decisions
> 
> AI functionality is restricted to text organization, plain-language document summarization, appointment preparation, and healthcare workflow navigation. Prominent safety disclaimers are enforced across all AI views.

---

## 🎓 9. Project Attribution

- **Project:** CareConnect AI (Individual B.Tech CSE Project)
- **Institution:** SRM University AP
- **Department:** Computer Science & Engineering
- **Author:** Jayram Kumar
