# Security Policy — PitchCraft AI

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.1.x   | :white_check_mark: |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

The PitchCraft AI team takes software security and customer data privacy seriously. If you discover a security vulnerability or security defect in PitchCraft AI, please report it privately:

1. **Email**: Send detailed disclosure to `security@pitchcraft.io`.
2. **Contents of Report**:
   - Description of the vulnerability and attack vector.
   - Exact steps to reproduce or proof-of-concept (PoC) payload.
   - Affected components (backend API, NLP engine, rate limiter, or frontend).
   - Recommended remediation if available.
3. **Response Timeline**:
   - **Initial Acknowledgement**: Within 24 hours.
   - **Assessment & Triage**: Within 48 hours.
   - **Remediation & Patch Release**: Within 7 business days for high/critical vulnerabilities.

## Security Posture & Guardrails

- **Zero External LLM Token Exfiltration**: All copywriting algorithms and trigger analyses run locally and deterministically. No prompt or customer data is transmitted to external AI APIs.
- **Least-Privilege Containerization**: Docker containers execute under unprivileged `USER node` with non-root security context and `no-new-privileges: true`.
- **Cryptographic Storage**: User passwords are encrypted with `bcrypt` (10 rounds). JWT tokens are signed using SHA-256 HMAC with strict expiration intervals.
- **Defensive Rate Limiting**: In-memory token-bucket limiters prevent volumetric credential stuffing and API abuse.

