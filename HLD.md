# CareConnect AI — High-Level Design (HLD)

---

## 1. System Overview

**CareConnect AI** is an AI-powered healthcare navigation and patient support platform architected as a modern, decoupled three-tier client-server application. It enables patients to centralize personal medical data, receive plain-language explanations of medical reports, prepare proactively for clinical appointments, and audit their entire health journey chronologically.

The platform follows a **Client-Server Architecture** utilizing a Single Page Application (SPA) frontend developed in **React 19**, a stateless RESTful API server powered by **Node.js and Express**, and a dual-mode persistence layer supporting **MongoDB (via Mongoose)** with an automated, zero-configuration **In-Memory Database fallback**.

---

## 2. High-Level System Architecture

The system consists of three primary tiers:

### Tier 1: Presentation Tier (Frontend)
- **Framework:** React 19 Single Page Application (SPA)
- **Build Tool & Dev Server:** Vite (with `/api` proxy targeting backend port 5000)
- **Routing:** React Router DOM v6 (declarative client-side routing, protected dashboard layout routes, and safe query redirect preserving)
- **HTTP Client:** Axios (configured with request interceptors for automatic Bearer JWT injection and response interceptors for 401 handling)

### Tier 2: Application Tier (Backend)
- **Runtime:** Node.js (v18+)
- **Web Framework:** Express.js (v4.19) implementing RESTful API architecture
- **Authentication:** Stateless JSON Web Token (JWT) verification and bcryptjs password hashing
- **Data Modeling:** Mongoose ODM schemas with field validation and pre-save hooks
- **Security & Middleware:** Helmet (secure HTTP headers), CORS (whitelisted origins), Morgan (HTTP logger), Multer (file uploads), centralized error middleware

### Tier 3: Database & External Integration Tier
- **Primary Database:** MongoDB NoSQL document store with indexing for fast multi-tenant queries
- **Fallback Database:** Built-in In-Memory Database engine (`inMemoryDb.js`) for instant zero-configuration evaluation if MongoDB is offline
- **AI Integration:** Google Gemini 1.5 Flash REST API with 8-second request timeout (`AbortController`), non-diagnostic prompt guardrails, and deterministic fallback engine

```mermaid
flowchart TD
    subgraph ClientTier ["Presentation Tier (Browser)"]
        UI["React 19 + Vite SPA"]
        Router["React Router DOM v6"]
        Context["AuthContext & ToastContext"]
        AxiosClient["Axios HTTP Client (JWT Interceptor)"]
        UI --> Router
        Router --> Context
        Context --> AxiosClient
    end

    subgraph ServerTier ["Application Tier (Node.js & Express)"]
        Proxy["Vite Proxy / Reverse Proxy"]
        Middleware["Security & Auth Middleware (Helmet, CORS, JWT Verify)"]
        Controllers["Module Controllers (Auth, Profile, Concerns, Docs, Appt)"]
        Proxy --> Middleware
        Middleware --> Controllers
    end

    subgraph DataAndAITier ["Data & Intelligence Tier"]
        DBRouter{"DB Mode Switcher"}
        MongoDB[("MongoDB (Mongoose ODM)")]
        InMemoryDB[("In-Memory Store (Zero-Config Fallback)")]
        AIService["AI Engine (Gemini 1.5 Flash + Smart Mock)"]
        
        Controllers --> DBRouter
        DBRouter -- "Local Mongo Available" --> MongoDB
        DBRouter -- "Mongo Offline" --> InMemoryDB
        Controllers --> AIService
    end

    AxiosClient <--> Proxy
```

---

## 3. Frontend Architecture

The frontend is built using **React 19** with **Vite** as the build tool and development server.

```mermaid
flowchart TD
    App["App.jsx (Router Hub)"]
    
    subgraph Layouts
        PublicLayout["PublicLayout (Landing, Login, Register)"]
        DashboardLayout["DashboardLayout (Protected Shell with Sidebar & Header)"]
    end

    subgraph StateManagement ["State Management"]
        AuthCtx["AuthContext (User state, login, logout, token sync)"]
        ToastCtx["ToastContext (Global notifications, error handling)"]
    end

    subgraph Pages ["Feature Pages"]
        P1["Dashboard.jsx"]
        P2["HealthProfile.jsx"]
        P3["HealthConcerns.jsx"]
        P4["MedicalDocuments.jsx & DocumentSummary.jsx"]
        P5["Appointments.jsx & AppointmentPrep.jsx"]
        P6["Followups.jsx"]
        P7["HealthTimeline.jsx"]
        P8["HealthcareNavigation.jsx"]
        P9["Notifications.jsx & Settings.jsx"]
    end

    App --> StateManagement
    StateManagement --> Layouts
    PublicLayout --> Landing["LandingPage, Login, Register, ForgotPassword"]
    DashboardLayout --> Pages
```

### Key Frontend Architectural Patterns:
- **Centralized API Client (`client/src/services/api.js`):** Intercepts outgoing requests to automatically inject the Bearer JWT token from `localStorage`. Intercepts incoming responses to catch `401 Unauthorized` errors and cleanly redirect expired sessions to the login view.
- **Context API State Providers:** `AuthContext` exposes authentication status, logged-in user profile, and session teardown functions throughout the tree. `ToastContext` provides unified toast alerts, suppressing duplicate error banners.
- **Atomic Layout Decomposition:** Public views use `PublicLayout`, while authenticated features inherit `DashboardLayout` containing a collapsible navigation `Sidebar`, global `Header` with search and notifications badge, and medical `DisclaimerBanner`.

---

## 4. Backend Architecture

The backend is built with **Node.js** and **Express.js**, adhering to the Model-View-Controller (MVC) architectural pattern.

```mermaid
flowchart LR
    Req(["HTTP Request"]) --> Security["Helmet & CORS"]
    Security --> Logger["Morgan HTTP Logger"]
    Logger --> BodyParse["express.json() & Multer"]
    BodyParse --> AuthCheck{"Protected Route?"}
    
    AuthCheck -- Yes --> JWTCheck["authMiddleware (Verify Bearer Token)"]
    AuthCheck -- No --> Router["Express Routes Layer"]
    JWTCheck --> Router
    
    Router --> Controller["Controller Layer (Business Logic)"]
    Controller --> Service["Service Layer (AI / Storage)"]
    Service --> Persistence[("MongoDB / In-Memory DB")]
    
    Controller --> Res(["HTTP JSON Response"])
    Controller -.-> ErrorCatch["Global Error Handler Middleware"]
    ErrorCatch --> Res
```

### Key Backend Architectural Patterns:
- **Synchronous Port Binding:** To prevent Vite proxy `ECONNREFUSED` connection drops, the server immediately binds to port 5000 synchronously before initiating asynchronous MongoDB database handshakes.
- **Graceful Persistence Fallback:** If local MongoDB is not running, the application gracefully initializes `inMemoryDb.js`, allowing full evaluation without manual database installation.
- **Tenant Isolation Barrier:** Controllers strictly query data by `userId: req.user._id`, ensuring complete multi-tenant security.

---

## 5. Database Architecture

The persistence model supports both MongoDB (via Mongoose) and an internal in-memory object store conforming to the exact same schema specifications:

```mermaid
erDiagram
    USER ||--o{ HEALTH_CONCERN : owns
    USER ||--o{ MEDICAL_DOCUMENT : uploads
    USER ||--o{ APPOINTMENT : books
    USER ||--o{ FOLLOW_UP : tracks
    USER ||--o{ TIMELINE_EVENT : logs
    APPOINTMENT ||--o{ FOLLOW_UP : generates

    USER {
        ObjectId _id PK
        string name
        string email UK
        string password
        string dob
        string phone
        object profile
        date createdAt
    }

    HEALTH_CONCERN {
        ObjectId _id PK
        ObjectId userId FK
        string title
        string category
        string severity
        string description
        date date
    }

    MEDICAL_DOCUMENT {
        ObjectId _id PK
        ObjectId userId FK
        string name
        string type
        string fileUrl
        string contentSnippet
        object summary
        date uploadDate
    }

    APPOINTMENT {
        ObjectId _id PK
        ObjectId userId FK
        string providerName
        string specialty
        string date
        string time
        string reason
        string status
        object aiPreparation
    }

    FOLLOW_UP {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId appointmentId FK
        string title
        string dueDate
        string status
    }

    TIMELINE_EVENT {
        ObjectId _id PK
        ObjectId userId FK
        string type
        string title
        string description
        date date
        string relatedId
    }
```

---

## 6. Authentication & Security Flow

Authentication relies on stateless **JSON Web Tokens (JWT)** and **bcryptjs** password encryption:

```mermaid
sequenceDiagram
    actor Patient as User (Browser)
    participant Client as React Client (AuthContext)
    participant API as Express Server (/api/auth)
    participant DB as Database (User Model)

    Note over Patient,DB: User Registration Flow
    Patient->>Client: Enters name, email, password
    Client->>API: POST /api/auth/register
    API->>DB: Check if email exists
    DB-->>API: Email available
    API->>API: bcrypt.hash(password, salt)
    API->>DB: Save new User document
    API-->>Client: 201 Created { user, token }
    Client->>Client: localStorage.setItem('careconnect_token', token)
    Client-->>Patient: Redirect to /dashboard

    Note over Patient,DB: Authenticated Request Flow
    Patient->>Client: Opens Medical Documents Page
    Client->>API: GET /api/documents (Headers: Bearer <token>)
    API->>API: authMiddleware verifies JWT signature
    API->>DB: MedicalDocument.find({ userId: req.user._id })
    DB-->>API: Returns user's records only
    API-->>Client: 200 OK [ documents ]
    Client-->>Patient: Renders Documents Table
```

---

## 7. AI Integration Architecture

CareConnect AI incorporates a modular AI service layer (`server/services/aiService.js`) designed for reliability, speed, and strict patient safety:

```mermaid
flowchart TD
    ClientReq["Client Request (Upload Document / Book Appointment)"] --> Controller["Controller Layer"]
    Controller --> AIServiceHub["aiService.js"]
    
    AIServiceHub --> CheckKey{"Is AI_API_KEY Configured in .env?"}
    
    CheckKey -- Yes --> GeminiAPI["Google Gemini 1.5 Flash REST API"]
    CheckKey -- No --> SmartMock["Deterministic Smart Mock AI Engine"]
    
    GeminiAPI --> ResponseCheck{"API Response OK?"}
    ResponseCheck -- Yes --> ParseJSON["Parse JSON & Inject Medical Disclaimer"]
    ResponseCheck -- Failure / Timeout --> SmartMock
    
    SmartMock --> FormatOutput["Format 6-Section Breakdown / Questions Checklist"]
    ParseJSON --> SaveDB[("Save to Document / Appointment Record")]
    FormatOutput --> SaveDB
    SaveDB --> Controller
    Controller --> ClientRes["Deliver Structured Response to Patient"]
```

### Strict Non-Diagnostic Guardrails:
1. **System Prompt Directives:** Prompts explicitly prohibit the model from diagnosing diseases, prescribing medications, or modifying dosages.
2. **Mandatory Disclaimer Injection:** Every AI response programmatically includes the standard legal disclaimer:
   > *"AI-generated summaries are for informational purposes only and should not be considered medical advice, diagnosis, or treatment."*
3. **Smart Mock Continuity:** If no API key is provided, the mock engine generates realistic, domain-specific health analyses (analyzing CBC, Lipid panels, X-rays) so all features function seamlessly without external dependencies.

---

## 8. End-to-End Data Flow

The following sequence details how an uploaded medical document is processed, summarized by AI, stored, and integrated into the timeline:

```mermaid
sequenceDiagram
    actor Patient as Patient
    participant UI as MedicalDocuments.jsx
    participant API as Express API (/api/documents)
    participant AI as aiService.js
    participant DB as MongoDB / In-Memory DB
    participant TL as Timeline Service

    Patient->>UI: Selects file (e.g., Blood_Test.pdf) & enters details
    UI->>API: POST /api/documents (Multipart / Form-Data)
    API->>API: Multer stores file in server/uploads/
    API->>AI: summarizeDocument({ name, type, description, snippet })
    AI->>AI: Generate 6-section plain-language summary & disclaimer
    AI-->>API: Return structured summary object
    API->>DB: Save MedicalDocument record with summary
    API->>TL: Create TimelineEvent(type='document', title, date)
    TL->>DB: Save TimelineEvent
    API-->>UI: 201 Created { document }
    UI-->>Patient: Render Document Summary Card & Timeline Badge
```

---

## 9. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | React 19 (Vite) | Single Page Application framework with high rendering efficiency |
| **Client Routing** | React Router DOM v6 | Declarative client-side route management |
| **Icons & Design** | Lucide React | Medical and navigation iconography |
| **HTTP Client** | Axios | REST API communication with automatic JWT injection |
| **Backend Runtime** | Node.js (v18+) | Server-side JavaScript runtime |
| **Web Framework** | Express.js (v4.19) | RESTful API routing, middleware chaining, and controller execution |
| **Database** | MongoDB & Mongoose | Flexible NoSQL document database with schema validation |
| **In-Memory Fallback** | Custom JavaScript Store | Zero-setup persistence for instant out-of-the-box evaluation |
| **Authentication** | JWT (`jsonwebtoken`) & `bcryptjs` | Secure stateless session management and password hashing |
| **File Handling** | Multer | Local multipart file upload middleware |
| **API Security** | Helmet & CORS | HTTP header security and controlled cross-origin access |
| **AI Integration** | Google Gemini 1.5 Flash REST | Fast LLM document parsing and question synthesis |

---

## 10. External Services and Integrations

1. **Google Gemini Generative Language API:** Invoked via standard HTTPS POST to `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent` using Bearer API keys.
2. **Local File System Storage:** Uploaded patient documents are written directly to `server/uploads/` via Multer storage engine.
3. **No External Black-Box Dependencies:** The system is fully self-contained; if Internet or external AI services are disconnected, internal fallback engines maintain complete platform availability.

