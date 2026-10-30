# SRE Incident Response Runbook — PitchCraft AI

## 1. Severity Classifications

| Severity | Definition | Target Acknowledgment | Target Resolution |
| :--- | :--- | :--- | :--- |
| **P1 - Critical** | Total platform outage or database corrupted; all synthesis down. | < 15 minutes | < 2 hours |
| **P2 - Major** | Degraded performance; synthesis latency > 500ms or 429 surge on authorized users. | < 30 minutes | < 6 hours |
| **P3 - Minor** | Non-blocking UI defect, isolated trigger parsing edge case, or single export failure. | < 4 hours | Next sprint |

---

## 2. Playbook: Volumetric 429 Surge / Rate Limiter Saturation

### Symptoms:
- Client receives `429 Too Many Requests` status codes.
- `pitchcraft_http_requests_total{status="429"}` metric spiking in Prometheus.

### Diagnosis:
1. Inspect Prometheus rate metrics:
   ```bash
   curl -s http://localhost:4000/api/metrics | grep pitchcraft_http_requests_total
   ```
2. Identify calling IP addresses from reverse proxy / ALB access logs.

### Remediation:
- If a distributed DDoS attack is observed: Enable Cloudflare or AWS WAF rate-limiting rule at the edge.
- If legitimate batch outreach processing: Increase `RATE_LIMIT_MAX_REQUESTS` in container environment:
  ```bash
  # In docker-compose.yml or K8s deployment:
  RATE_LIMIT_MAX_REQUESTS=500
  ```

---

## 3. Playbook: Database WAL Lock Contention

### Symptoms:
- Error logs displaying `SQLITE_BUSY: database is locked`.
- `/api/health/ready` probe returning HTTP 503.

### Diagnosis:
1. Verify database process file handles:
   ```bash
   lsof /app/data/sales_pitch.db
   ```
2. Check for zombie WAL files (`sales_pitch.db-wal` exceeding 50MB).

### Remediation:
1. Check `PRAGMA busy_timeout`: PitchCraft AI sets `busy_timeout = 5000` (5 seconds) by default.
2. Force checkpointing if necessary via terminal:
   ```bash
   node -e "const { DatabaseSync } = require('node:sqlite'); const db = new DatabaseSync('/app/data/sales_pitch.db'); db.exec('PRAGMA wal_checkpoint(TRUNCATE);');"
   ```
3. Restart pod/container cleanly to release lingering locks.

---

## 4. Playbook: Container OOM / CrashLoopBackOff

### Symptoms:
- Pod restarts (`kubectl get pods` shows Restarts > 0).
- Exit code 137 (SIGKILL issued by OOM killer).

### Diagnosis:
1. Check heap usage:
   ```bash
   curl -s http://localhost:4000/api/metrics | grep nodejs_memory_heap_used_bytes
   ```
2. View Kubernetes termination reason:
   ```bash
   kubectl describe pod -l app=pitchcraft-ai
   ```

### Remediation:
- Increase container memory limit from `512Mi` to `1024Mi` in `deployment.yaml` or `docker-compose.yml`.
- Verify Node.js `--max-old-space-size=768` is configured for container memory budget.

---

## 5. Rollback Procedure

### Docker Compose:
```bash
docker compose down
docker pull pitchcraft-ai:previous-stable
docker compose up -d
```

### Kubernetes:
```bash
kubectl rollout undo deployment/pitchcraft-ai
kubectl rollout status deployment/pitchcraft-ai
```
