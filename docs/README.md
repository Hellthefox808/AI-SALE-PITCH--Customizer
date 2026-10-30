# PitchCraft AI — Enterprise Architecture & Operations Index

Welcome to the PitchCraft AI technical documentation registry. This directory contains production engineering contracts, architectural decision records, reliability runbooks, and security threat models governing the platform.

---

## 📚 Documentation Registry

### 1. Architecture Decision Records (ADR)
- **[`adr/0001-hybrid-in-memory-nlp-and-containerized-deployment.md`](./adr/0001-hybrid-in-memory-nlp-and-containerized-deployment.md)**:
  - Technical justification for deterministic in-house NLP engines, SQLite Write-Ahead Logging (`WAL`), and multi-stage Alpine containerization over fragile third-party cloud LLM APIs.

### 2. SRE & Operational Reliability
- **[`runbooks/incident-response.md`](./runbooks/incident-response.md)**:
  - Diagnostic and remediation runbooks for P1–P3 incidents, database WAL lock contention resolution, volumetric 429 surge handling, container OOM debugging, and instant rollbacks.
- **[`slo/service-level-objectives.md`](./slo/service-level-objectives.md)**:
  - Quantitative Service Level Indicators (SLIs) and Objectives (SLOs) covering 99.9% API availability, sub-50ms synthesis latency (p95), and automated error budget burndown policies.

### 3. Security & Governance
- **[`security/threat-model.md`](./security/threat-model.md)**:
  - STRIDE threat modeling assessment matrix covering spoofing, tampering, repudiation, information disclosure, denial-of-service, and elevation-of-privilege vectors with verified mitigations.

---

## 🛠️ Infrastructure Directory Map

```
infra/
├── helm/                      # Cloud-native Kubernetes packaging (Chart.yaml, values.yaml, templates)
│   ├── templates/
│   │   ├── deployment.yaml   # Deployment with non-root securityContext and probes
│   │   ├── hpa.yaml          # Horizontal Pod Autoscaler (2 to 10 replicas)
│   │   └── service.yaml      # ClusterIP service binding
│   ├── Chart.yaml
│   └── values.yaml
├── k8s/                       # Raw Kubernetes manifests
│   ├── deployment.yaml       # Production deployment with liveness/readiness probes
│   └── service.yaml          # ClusterIP service on port 80/4000
└── terraform/                 # Infrastructure as Code (AWS ECS Fargate + ALB + VPC)
    ├── main.tf               # VPC, dual public subnets, ALB, security groups, ECS Fargate
    ├── variables.tf          # Parameterized CPU, memory, replica count
    └── outputs.tf            # ALB DNS hostname and healthcheck URL outputs
```

