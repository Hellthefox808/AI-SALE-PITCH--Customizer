# ADR 0001: Deterministic In-House NLP, SQLite WAL Persistence, and Multi-Stage Alpine Containerization

## 1. Context & Background
PitchCraft AI is an account-based outbound sales pitch customizer that ingests corporate milestone events (funding rounds, leadership appointments, product launches, geographic expansions) and synthesizes multi-framework sales copy (`PAS`, `BAB`, `AIDA`, `QuickStrike`) alongside 4-touch progressive cadences. Enterprise compliance and reliability require:
1. Sub-50ms synthesis latency with zero external LLM token budget or third-party API outage exposure.
2. Complete data residency and auditability for sensitive corporate accounts and executive contact records.
3. Rapid, repeatable, and non-root containerized deployment across local workstations, Docker Compose, and Kubernetes clusters.

## 2. Problem Statement
Relying on external SaaS LLM APIs for cold outreach synthesis introduces operational fragility, unpredictability (hallucinations, variable latency, rate limit throttling), and token costs. Furthermore, running multi-tier separate Node and static file servers adds operational burden and attack surface.

## 3. Evaluated Alternatives
- **Alternative A: Pure External SaaS LLM (OpenAI / Anthropic REST APIs)**:
  - *Pros*: Natural language fluency.
  - *Cons*: High latency (1.5s–4s), non-deterministic responses, recurring per-token SaaS fees, rate limits, and risk of external provider data retention.
- **Alternative B: Distributed Microservices (Separate Backend, Auth Service, and Nginx)**:
  - *Pros*: Independent scaling.
  - *Cons*: Over-engineered for current single-tenant or mid-market enterprise deployments; increases networking hop latency and container footprint.
- **Alternative C: Hybrid Deterministic In-House Engine with SQLite WAL Mode & Single Unified Container (CHOSEN)**:
  - *Pros*: Sub-5ms execution time, 100% testable, zero token cost, self-contained single-container runtime, native SQLite WAL concurrency, and air-gap capability.
  - *Cons*: Advanced linguistic transformations must be engineered via rule-based templates and entity-extraction parsers.

## 4. Decision
We adopt **Alternative C**:
1. **Core Engines**: In-house deterministic regex and heuristic NLP (`nlpEngine.js`), multi-framework synthesis (`pitchEngine.js`), 11-day 4-touch cadence generation (`cadenceEngine.js`), and deliverability audit/sanitization (`qualityEngine.js`).
2. **Persistence**: Embedded `node:sqlite` database configured in Write-Ahead Logging (`WAL`) mode with foreign key constraints and `busy_timeout = 5000`.
3. **Deployment**: Unified multi-stage Alpine Docker container (`Dockerfile`) compiling the Vite React 18 client and serving both REST APIs and static SPA assets from a single port (`4000`), executing under an unprivileged `node` user.
4. **Observability**: Prometheus text exposition format at `GET /api/metrics`, alongside Kubernetes-native `/api/health/live` and `/api/health/ready` probes.

## 5. Reasoning & Justification
- **Determinism**: 100% reproducible test suites across 40 unit and integration tests executing in under 600ms.
- **Security & Least Privilege**: The container operates without root privileges (`USER node`), blocks privilege escalation (`no-new-privileges: true`), and isolates database files via Docker volume mounts.
- **Operational Simplicity**: Teams can deploy the entire application with a single `docker compose up -d` command with zero external database provisioning prerequisites.

## 6. Trade-offs & Limitations
- **Template Complexity**: Enhancing copywriting nuances requires maintaining vocabulary dictionaries and grammatical transformation rules.
- **Single-Node Persistence**: SQLite is optimized for single-instance or vertical scaling with persistent volumes; cross-region multi-master clustering would require transitioning to LiteFS or PostgreSQL.

## 7. Risks & Mitigations
- **Database Lock Contention**: Mitigated by SQLite WAL mode and busy timeout handling (`PRAGMA busy_timeout = 5000`).
- **High-Volume Abuse**: Mitigated by in-memory token-bucket rate limiters (`rateLimiter.js`) on synthesis and authentication endpoints.

## 8. Rollback Path
Should enterprise customers require hosted cloud LLM endpoints (e.g. OpenAI or Gemini Live), `pitchEngine.js` has a clean modular interface that allows plug-and-play adapter swapping without altering frontend contracts or database schemas.

## 9. Future Impact & Roadmap
- **v1.1**: Add LiteFS replication support for distributed multi-region edge deployments.
- **v1.2**: Add OpenTelemetry OTLP trace export support alongside existing Prometheus metrics.

