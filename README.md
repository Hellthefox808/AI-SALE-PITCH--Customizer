# PitchCraft AI — AI Sales Pitch Customizer

A production-grade, portfolio-ready B2B marketing automation platform that analyzes enterprise client trigger events (press releases, funding rounds, leadership hires, product launches, market expansions) and synthesizes hyper-personalized cold outreach pitches with real-time spam scoring, readability metrics, and multi-framework copy generation.

---

## 🌟 Executive Summary & Key Capabilities

- **Account-Based Trigger Event Personalization**: Scans enterprise press releases and extracts critical business catalysts ($M funding, % YoY growth, executive appointments, M&A acquisitions, market expansions).
- **Multi-Framework Copy Generation**: Synthesizes cold emails across 4 battle-tested copywriting frameworks:
  - **PAS**: Problem $\rightarrow$ Agitate $\rightarrow$ Solve
  - **BAB**: Before $\rightarrow$ After $\rightarrow$ Bridge
  - **AIDA**: Attention $\rightarrow$ Interest $\rightarrow$ Desire $\rightarrow$ Action
  - **QuickStrike**: 3-Sentence high-velocity mobile pitch (<70 words)
- **3 Parallel Pitch Variants**: Generates Direct & Quantitative ROI, Consultative Peer, and Visionary Strategic angles in sub-50ms with zero token cost.
- **Deliverability & Spam Inspector**: Algorithmic spam risk scoring (0–100), trigger phrase detection, and Flesch-Kincaid reading grade analysis.
- **4D-Inspired Intent Signal Telemetry Canvas**: Mathematical $4D \rightarrow 3D \rightarrow 2D$ spatial particle system evolving over time ($w(t) = \sin(t \cdot \omega)$) with pointer proximity interaction and `prefers-reduced-motion` compliance.
- **Enterprise RBAC**: Role-based access control with live persona switching between SDR Rep (`sdr_rep`), Sales Manager (`sales_manager`), and Administrator (`admin`).

---

## 🏗️ Architecture Overview

```
ai-sales-pitch-customizer/
├── backend/
│   ├── src/
│   │   ├── config/constants.js        # Frameworks, spam keywords, roles, tokens
│   │   ├── data/
│   │   │   ├── database.js            # SQLite3 via native node:sqlite (WAL mode)
│   │   │   ├── seedData.js            # 8 accounts, 12 contacts, 8 news triggers, 5 products
│   │   │   └── repository.js          # SQLite transaction and query layer
│   │   ├── service/
│   │   │   ├── nlpEngine.js           # Entity extraction & trigger categorization
│   │   │   ├── pitchEngine.js         # Multi-framework 3-variant synthesis
│   │   │   ├── qualityEngine.js       # Spam scoring & Flesch-Kincaid readability
│   │   │   └── authService.js         # bcrypt password hashing & JWT bearer tokens
│   │   ├── presentation/routes.js     # REST API router with RBAC guards
│   │   └── server.js                  # Express ESM server
│   ├── tests/                         # 31 unit & integration tests (100% pass)
│   │   ├── nlpEngine.test.js
│   │   ├── qualityEngine.test.js
│   │   ├── pitchEngine.test.js
│   │   ├── auth.test.js
│   │   ├── api.test.js
│   │   └── security.test.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/client.js              # Robust fetch client with JWT injection
│   │   ├── components/
│   │   │   ├── PitchParticleCanvas.jsx# 4D time-evolving intent signal canvas
│   │   │   ├── Navbar.jsx             # Floating glass nav & role switcher
│   │   │   ├── ExecutiveKpiBar.jsx    # Real-time telemetry & hours saved
│   │   │   ├── PitchStudio.jsx        # Flagship interactive customizer studio
│   │   │   ├── AccountExplorer.jsx    # Accounts, triggers & ad-hoc NLP analyzer
│   │   │   ├── ReviewLab.jsx          # Governance, A/B review & manager approvals
│   │   │   ├── ProductCatalog.jsx     # Value prop matrix & product manager
│   │   │   └── AuditFeed.jsx          # Security audit feed & role trace
│   │   ├── styles/index.css           # Apple-inspired glassmorphism design system
│   │   ├── App.jsx                    # Root application controller
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## 🚀 Quickstart & Setup Instructions

### Prerequisites
- Node.js >= 22.5.0 (Node 22+ includes native `node:sqlite` and `node:test`)
- npm >= 10.0.0

### 1. Backend Setup
```bash
cd backend
npm install
npm test          # Run all 31 unit and integration test suites
npm run lint      # Verify clean JavaScript Standard Style
npm start         # Starts backend API on http://localhost:4000
```

### 2. Frontend Setup
In a separate terminal:
```bash
cd frontend
npm install
npm run lint      # Verify clean JavaScript Standard Style
npm run build     # Test production bundle creation (Vite)
npm run dev       # Starts interactive dev server on http://localhost:5173
```

Open `http://localhost:5173` in your browser.

---

## 🧪 Automated Test Verification

All 31 automated tests pass cleanly using native `node:test`:

```
▶ REST API End-to-End Integration Suite
  ✔ GET /api/health returns healthy status
  ✔ GET /api/accounts lists seeded enterprise accounts
  ✔ GET /api/accounts/:id returns account detail with contacts and news
  ✔ POST /api/news-triggers/analyze extracts ad-hoc trigger data
  ✔ POST /api/pitches/generate synthesizes 3 variants for target account
  ✔ POST /api/pitches saves a draft and PATCH updates feedback & status
  ✔ GET /api/analytics/kpis returns executive metrics and time saved
✔ REST API End-to-End Integration Suite (224ms)

▶ AuthService — Authentication, Token Lifecycle & Verification
  ✔ authenticates valid user with correct password
  ✔ rejects invalid password
  ✔ rejects unknown user email
  ✔ generates and verifies valid token payload
✔ AuthService (241ms)

▶ NlpEngine — Entity Extraction & Trigger Classification
  ✔ extracts currency sums, percentages, and headcount milestones
  ✔ correctly classifies funding triggers
  ✔ correctly classifies leadership appointments
  ✔ correctly classifies product launches
  ✔ correctly identifies urgency sentiment in latency spikes or outages
  ✔ computes positive semantic relevance between product value and trigger
✔ NlpEngine (4.5ms)

▶ PitchEngine — Multi-Framework & 3-Variant Pitch Synthesis
  ✔ generates 3 distinct variants across PAS framework
  ✔ generates BAB framework with before/after/bridge contrast
  ✔ generates QuickStrike 3-sentence concise cold email
✔ PitchEngine (7.5ms)

▶ QualityEngine — Deliverability, Spam & Readability Metrics
  ✔ identifies clean cold emails with low baseline spam score
  ✔ detects high-risk spam keywords and flags them
  ✔ computes Flesch-Kincaid Grade Level within reasonable bounds
  ✔ accurately computes word count and reading time
  ✔ measures personalization depth ratio
✔ QualityEngine (4.7ms)

▶ Security & RBAC Enforcement Suite
  ✔ rejects unauthenticated requests to protected endpoints with 401
  ✔ rejects invalid or tampered bearer tokens with 401
  ✔ prevents SDR reps from approving pitches (returns 403)
  ✔ prevents SDR reps from deleting pitches (returns 403)
  ✔ prevents SDR reps from accessing audit logs (returns 403)
  ✔ allows Sales Managers to access audit logs (returns 200)
✔ Security & RBAC (212ms)

31 passed, 0 failed (581ms total duration)
```

---

## 🔒 Security & RBAC Matrix

| Endpoint | Method | SDR Rep | Sales Manager | Admin | Description |
|---|---|:---:|:---:|:---:|---|
| `/api/auth/login` | POST | Public | Public | Public | Authenticates credentials |
| `/api/auth/switch-persona` | POST | Public | Public | Public | Instant persona token issue |
| `/api/accounts` | GET | ✅ | ✅ | ✅ | List enterprise accounts |
| `/api/news-triggers` | GET | ✅ | ✅ | ✅ | List trigger events |
| `/api/news-triggers/analyze` | POST | ✅ | ✅ | ✅ | Ad-hoc NLP entity extraction |
| `/api/pitches/generate` | POST | ✅ | ✅ | ✅ | Synthesize 3 pitch variants |
| `/api/pitches` | POST | ✅ | ✅ | ✅ | Save draft pitch |
| `/api/pitches/:id` (Approve) | PATCH | ❌ (403) | ✅ | ✅ | Approve pitch for sending |
| `/api/pitches/:id` (Delete) | DELETE | ❌ (403) | ✅ | ✅ | Delete pitch record |
| `/api/products` (Create) | POST | ❌ (403) | ✅ | ✅ | Add new value proposition |
| `/api/audit-logs` | GET | ❌ (403) | ✅ | ✅ | Inspect security audit trail |

---

## ⌨️ Global Keyboard Shortcuts

- `1`: Jump to **Pitch Studio**
- `2`: Jump to **Accounts & News Trigger Explorer**
- `3`: Jump to **Outreach Governance & Review Lab**
- `4`: Jump to **Product & Value Proposition Matrix**
- `5`: Jump to **Security & Activity Audit Logs**
- `P`: Pause / Resume 4D Particle Telemetry
- `R`: Refresh live telemetry data from server
