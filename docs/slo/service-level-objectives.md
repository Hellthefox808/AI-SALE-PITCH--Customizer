# Service Level Objectives (SLOs) & Error Budgets — PitchCraft AI

## 1. Core Service Level Indicators (SLIs)

### SLI 1: API Availability
- **Definition**: The percentage of valid HTTP requests to `/api/*` returning non-5xx status codes over a 30-day rolling window.
- **Formula**:
  $$\text{Availability} = \frac{\sum \text{Requests}_{\text{status} < 500}}{\sum \text{Total Requests}} \times 100\%$$
- **SLO Target**: **99.9%** (Monthly Error Budget: 43.2 minutes of downtime).

### SLI 2: Pitch Synthesis Latency
- **Definition**: Time elapsed between receiving a valid `POST /api/pitches/generate` request and delivering the completed 3-variant suite.
- **SLO Target**:
  - **p95 Latency**: $\le 50\text{ms}$
  - **p99 Latency**: $\le 150\text{ms}$

### SLI 3: Cadence Sequence Generation Latency
- **Definition**: Time elapsed between receiving a valid `POST /api/pitches/cadence` request and delivering the 4-touch outreach sequence.
- **SLO Target**:
  - **p95 Latency**: $\le 40\text{ms}$
  - **p99 Latency**: $\le 100\text{ms}$

### SLI 4: Deliverability Deliverance Quality
- **Definition**: Percentage of generated pitch variants with an automated Spam Risk Score $\le 25 / 100$.
- **SLO Target**: **98.0%** clean copy without manual sanitization intervention.

---

## 2. Error Budget Burndown & Alerting Rules

| Threshold | Window | Severity | Action Triggered |
| :--- | :--- | :--- | :--- |
| **2% Budget Consumed** | 1 Hour | Warning | Automated Slack alert to on-call SRE; inspect slow queries. |
| **5% Budget Consumed** | 6 Hours | Major | Page secondary on-call engineer; inspect external network anomalies. |
| **10% Budget Consumed** | 24 Hours | Critical (P1) | Freeze feature deployments; route all traffic to standby replicas. |

