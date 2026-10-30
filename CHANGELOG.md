# Changelog — PitchCraft AI

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-10-30

### Added
- **4-Touch Omnichannel Cadence Sequencer**: Synthesizes 11-day multi-channel outreach campaigns across Day 1 Hook, Day 3 Tactical Asset, Day 7 Peer Proof, and Day 11 Graceful Exit.
- **Predictive Engagement Scoring**: Real-time modeling of Open Rate %, Reply Rate %, and Call-To-Action (CTA) friction indices.
- **Consultative Auto-Sanitizer**: Deterministic replacement of deliverability-degrading sales spam jargon with consultative value phrasing.
- **Outreach Artifact Exporter**: Multi-channel export to RFC 4180 CSV, RFC 822 EML, Gmail clipboard, and JSON manifests.
- **Enterprise Containerization**: Production multi-stage Alpine `Dockerfile` with non-root user execution (`USER node`) and `docker-compose.yml`.
- **Cloud Orchestration & K8s**: Kubernetes deployment and ClusterIP service manifests with liveness/readiness probes.
- **SRE & Prometheus Observability**: Built-in metrics exposition at `GET /api/metrics`, `/api/health/live`, `/api/health/ready`, and request correlation IDs (`x-request-id`).
- **Defensive Rate Limiting**: In-memory token-bucket sliding window rate limiters protecting authentication and synthesis routes.
- **GitHub Actions CI/CD Pipeline**: Multi-version Node.js matrix test runner and container build verification.

### Changed
- Expanded automated test coverage to 42 passing unit and integration tests across 8 suites.
- Upgraded Executive KPI bar with interactive Copywriting Framework Conversion drawer.

---

## [1.0.0] - 2026-10-30

### Added
- Initial production release of PitchCraft AI.
- Multi-framework synthesis engine (`PAS`, `BAB`, `AIDA`, `QuickStrike`).
- SQLite 3 persistence with Write-Ahead Logging (`WAL`) mode via `node:sqlite`.
- Account-based news trigger event entity extraction engine (`nlpEngine.js`).
- Deliverability audit and Flesch-Kincaid readability scoring (`qualityEngine.js`).
- 4D-inspired time-evolving canvas telemetry system ($w(t) = \sin(t \cdot \omega)$).
- Role-based access control with live persona switching (`sdr_rep`, `sales_manager`, `admin`).
- Dark glassmorphism UI inspired by Apple human interface guidelines.
