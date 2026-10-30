export class MetricsService {
  constructor () {
    this.requestCounts = new Map()
    this.pitchesGenerated = 0
    this.cadencesGenerated = 0
    this.sanitizations = 0
    this.exportsCount = 0
    this.startTime = Date.now()
  }

  recordRequest (method, status) {
    const key = `${method.toUpperCase()}:${status}`
    const current = this.requestCounts.get(key) || 0
    this.requestCounts.set(key, current + 1)
  }

  recordPitchGeneration () {
    this.pitchesGenerated++
  }

  recordCadenceGeneration () {
    this.cadencesGenerated++
  }

  recordSanitization () {
    this.sanitizations++
  }

  recordExport () {
    this.exportsCount++
  }

  getPrometheusMetrics () {
    const uptimeSec = ((Date.now() - this.startTime) / 1000).toFixed(1)
    const mem = process.memoryUsage()

    const lines = [
      '# HELP process_uptime_seconds Process uptime in seconds',
      '# TYPE process_uptime_seconds gauge',
      `process_uptime_seconds ${uptimeSec}`,
      '',
      '# HELP nodejs_memory_heap_used_bytes Process heap memory used',
      '# TYPE nodejs_memory_heap_used_bytes gauge',
      `nodejs_memory_heap_used_bytes ${mem.heapUsed}`,
      '',
      '# HELP nodejs_memory_heap_total_bytes Process heap memory total',
      '# TYPE nodejs_memory_heap_total_bytes gauge',
      `nodejs_memory_heap_total_bytes ${mem.heapTotal}`,
      '',
      '# HELP pitchcraft_pitches_generated_total Total sales pitch suites synthesized',
      '# TYPE pitchcraft_pitches_generated_total counter',
      `pitchcraft_pitches_generated_total ${this.pitchesGenerated}`,
      '',
      '# HELP pitchcraft_cadences_generated_total Total multi-touch cadences synthesized',
      '# TYPE pitchcraft_cadences_generated_total counter',
      `pitchcraft_cadences_generated_total ${this.cadencesGenerated}`,
      '',
      '# HELP pitchcraft_sanitizations_total Total spam jargon auto-sanitizations applied',
      '# TYPE pitchcraft_sanitizations_total counter',
      `pitchcraft_sanitizations_total ${this.sanitizations}`,
      '',
      '# HELP pitchcraft_exports_total Total outreach artifact exports',
      '# TYPE pitchcraft_exports_total counter',
      `pitchcraft_exports_total ${this.exportsCount}`,
      '',
      '# HELP pitchcraft_http_requests_total Total HTTP requests handled by method and status',
      '# TYPE pitchcraft_http_requests_total counter'
    ]

    if (this.requestCounts.size === 0) {
      lines.push('pitchcraft_http_requests_total{method="GET",status="200"} 0')
    } else {
      for (const [key, count] of this.requestCounts.entries()) {
        const [method, status] = key.split(':')
        lines.push(`pitchcraft_http_requests_total{method="${method}",status="${status}"} ${count}`)
      }
    }

    return lines.join('\n') + '\n'
  }
}

export const metricsService = new MetricsService()
