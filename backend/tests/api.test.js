import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from '../src/server.js'
import { getDb, closeDb } from '../src/data/database.js'

describe('REST API End-to-End Integration Suite', () => {
  let server
  let baseUrl
  let sdrToken
  let managerToken
  let db

  before(async () => {
    db = getDb(':memory:')
    const appCtx = await createApp(db)
    await new Promise((resolve) => {
      server = appCtx.app.listen(0, () => {
        const port = server.address().port
        baseUrl = `http://localhost:${port}/api`
        resolve()
      })
    })

    // Get SDR Token
    const sdrRes = await fetch(`${baseUrl}/auth/switch-persona`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'sdr_rep' })
    })
    const sdrData = await sdrRes.json()
    sdrToken = sdrData.token

    // Get Manager Token
    const mgrRes = await fetch(`${baseUrl}/auth/switch-persona`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'sales_manager' })
    })
    const mgrData = await mgrRes.json()
    managerToken = mgrData.token
  })

  after(async () => {
    await new Promise(resolve => server.close(resolve))
    closeDb(db)
  })

  it('GET /api/health returns healthy status', async () => {
    const res = await fetch(`${baseUrl}/health`)
    assert.equal(res.status, 200)
    const data = await res.json()
    assert.equal(data.status, 'healthy')
  })

  it('GET /api/accounts lists seeded enterprise accounts', async () => {
    const res = await fetch(`${baseUrl}/accounts`, {
      headers: { Authorization: `Bearer ${sdrToken}` }
    })
    assert.equal(res.status, 200)
    const accounts = await res.json()
    assert.ok(accounts.length >= 8, 'Should return at least 8 seeded accounts')
  })

  it('GET /api/accounts/:id returns account detail with contacts and news', async () => {
    const res = await fetch(`${baseUrl}/accounts/acc-1`, {
      headers: { Authorization: `Bearer ${sdrToken}` }
    })
    assert.equal(res.status, 200)
    const account = await res.json()
    assert.equal(account.name, 'ApexCloud Networks')
    assert.ok(account.contacts.length >= 2)
    assert.ok(account.news_triggers.length >= 1)
  })

  it('POST /api/news-triggers/analyze extracts ad-hoc trigger data', async () => {
    const res = await fetch(`${baseUrl}/news-triggers/analyze`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sdrToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Acme Cloud Secures $50M Series B to Accelerate Global Footprint',
        summary: 'Expanding team by 100 engineers with 180% ARR growth.'
      })
    })
    assert.equal(res.status, 200)
    const data = await res.json()
    assert.equal(data.category, 'Funding')
    assert.ok(data.extractedMilestones.length >= 2)
  })

  it('POST /api/pitches/generate synthesizes 3 variants for target account', async () => {
    const res = await fetch(`${baseUrl}/pitches/generate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sdrToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        accountId: 'acc-1',
        contactId: 'con-1',
        newsTriggerId: 'trg-1',
        productId: 'prod-1',
        framework: 'PAS',
        tone: 'direct_roi'
      })
    })

    assert.equal(res.status, 200)
    const data = await res.json()
    assert.equal(data.framework, 'PAS')
    assert.equal(data.variants.length, 3)
    assert.ok(data.subjectLine.includes('ApexCloud'))
    assert.ok(data.spamScore <= 20)
  })

  it('POST /api/pitches saves a draft and PATCH updates feedback & status', async () => {
    const createRes = await fetch(`${baseUrl}/pitches`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sdrToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        accountId: 'acc-2',
        contactId: 'con-3',
        newsTriggerId: 'trg-2',
        productId: 'prod-2',
        framework: 'AIDA',
        tone: 'consultative',
        subjectLine: 'Diana - Welcome to DataPulse GTM',
        bodyContent: 'Hi Diana, congratulations on your appointment as CRO at DataPulse. Looking forward to connecting.',
        variants: [],
        spamScore: 8.0,
        readabilityGrade: 6.5,
        wordCount: 18,
        status: 'draft',
        feedbackRating: 4
      })
    })

    assert.equal(createRes.status, 201)
    const pitch = await createRes.json()
    assert.ok(pitch.id)

    // Manager approves pitch
    const updateRes = await fetch(`${baseUrl}/pitches/${pitch.id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${managerToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'approved',
        feedbackRating: 5
      })
    })

    assert.equal(updateRes.status, 200)
    const updated = await updateRes.json()
    assert.equal(updated.status, 'approved')
    assert.equal(updated.feedback_rating, 5)
  })

  it('GET /api/analytics/kpis returns executive metrics and time saved', async () => {
    const res = await fetch(`${baseUrl}/analytics/kpis`, {
      headers: { Authorization: `Bearer ${sdrToken}` }
    })
    assert.equal(res.status, 200)
    const metrics = await res.json()
    assert.ok(metrics.totalPitches >= 2)
    assert.ok(metrics.repHoursSaved > 0)
    assert.ok(metrics.personalizationDepthPct > 90)
  })

  it('POST /api/pitches/cadence generates 4-touch outreach sequence', async () => {
    const res = await fetch(`${baseUrl}/pitches/cadence`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sdrToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        accountId: 'acc-1',
        contactId: 'con-1',
        newsTriggerId: 'trg-1',
        productId: 'prod-1'
      })
    })

    assert.equal(res.status, 200)
    const data = await res.json()
    assert.equal(data.totalTouches, 4)
    assert.equal(data.steps.length, 4)
  })

  it('POST /api/pitches/sanitize replaces spam jargon with clean language', async () => {
    const res = await fetch(`${baseUrl}/pitches/sanitize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sdrToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: 'Act now for a 100% free guaranteed consultation!',
        subjectLine: 'Urgent proposal'
      })
    })

    assert.equal(res.status, 200)
    const data = await res.json()
    assert.ok(data.sanitizedText.includes('complimentary'))
    assert.ok(data.changesCount >= 2)
  })

  it('POST /api/pitches/export returns CSV payload with proper headers', async () => {
    const res = await fetch(`${baseUrl}/pitches/export`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sdrToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        format: 'csv',
        subjectLine: 'Test Subject',
        bodyContent: 'Test Body'
      })
    })

    assert.equal(res.status, 200)
    const csv = await res.text()
    assert.ok(csv.startsWith('Step,Channel,Day,Subject,Body'))
  })

  it('GET /api/health/live returns liveness probe', async () => {
    const res = await fetch(`${baseUrl}/health/live`)
    assert.equal(res.status, 200)
    const data = await res.json()
    assert.equal(data.status, 'alive')
    assert.ok(res.headers.get('x-request-id'))
  })

  it('GET /api/health/ready returns readiness probe with database verification', async () => {
    const res = await fetch(`${baseUrl}/health/ready`)
    assert.equal(res.status, 200)
    const data = await res.json()
    assert.equal(data.status, 'ready')
    assert.equal(data.database, 'connected')
  })

  it('GET /api/metrics returns Prometheus metrics in standard exposition format', async () => {
    const res = await fetch(`${baseUrl}/metrics`)
    assert.equal(res.status, 200)
    assert.ok(res.headers.get('content-type').includes('text/plain'))
    const metricsText = await res.text()
    assert.ok(metricsText.includes('pitchcraft_http_requests_total'))
    assert.ok(metricsText.includes('process_uptime_seconds'))
    assert.ok(metricsText.includes('nodejs_memory_heap_used_bytes'))
  })
})
