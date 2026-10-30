# Threat Model & Risk Assessment — PitchCraft AI

## 1. Methodology
This document uses the **STRIDE** methodology (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege) to model risks across the PitchCraft AI sales automation architecture.

---

## 2. STRIDE Threat Analysis Matrix

| Threat Category | Specific Attack Vector | Severity | Existing Defense & Mitigation | Residual Risk |
| :--- | :--- | :---: | :--- | :---: |
| **Spoofing** | Forged JWT bearer tokens or unauthorized persona assumption. | High | Cryptographically verified HMAC SHA-256 tokens; role validated on every request. | Low |
| **Tampering** | Manipulation of pitch body content or approval status in transit. | Medium | Transport Layer Security (TLS 1.3); strict parameter sanitization; SQLite parameter binding. | Low |
| **Repudiation** | Sales rep modifies or deletes pitch without attribution. | Medium | Dedicated `audit_logs` table recording user ID, role, action, and JSON diffs on all state changes. | Low |
| **Information Disclosure** | Data exfiltration of proprietary executive contact emails or enterprise notes. | High | In-house deterministic NLP engine with zero third-party cloud API data transmission; non-root filesystem isolation. | Low |
| **Denial of Service** | Volumetric flooding on `/api/pitches/generate` or `/api/auth/login`. | High | Sliding-window token-bucket rate limiter returning HTTP 429 when threshold exceeded. | Low |
| **Elevation of Privilege** | SDR rep attempting to approve pitches or view manager audit logs. | High | RBAC middleware (`requireRole`) strictly enforcing 403 Forbidden for unauthorized roles. | Low |

---

## 3. Supply Chain & Container Security
1. **Minimal Base Image**: Built on `node:22-alpine` with zero legacy toolchains or unneeded utilities.
2. **Non-Root Execution**: Container explicitly switches to `USER node` (UID 1000).
3. **Immutability**: Read-only container root file system option in Kubernetes with writable emptyDir restricted to `/app/data`.
4. **Dependency Auditing**: Automated CI/CD dependency vulnerability checks on all pull requests.
