import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from '../src/server.js'
import { getDb, closeDb } from '../src/data/database.js'

describe('Security & RBAC Enforcement Suite', () => {
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

    const sdrRes = await fetch(`${baseUrl}/auth/switch-persona`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'sdr_rep' })
    })
    sdrToken = (await sdrRes.json()).token

    const mgrRes = await fetch(`${baseUrl}/auth/switch-persona`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'sales_manager' })
    })
    managerToken = (await mgrRes.json()).token
  })

  after(async () => {
    await new Promise(resolve => server.close(resolve))
    closeDb(db)
  })

  it('rejects unauthenticated requests to protected endpoints with 401', async () => {
    const res = await fetch(`${baseUrl}/accounts`)
    assert.equal(res.status, 401)
  })

  it('rejects invalid or tampered bearer tokens with 401', async () => {
    const res = await fetch(`${baseUrl}/accounts`, {
      headers: { Authorization: 'Bearer this.is.invalid.token' }
    })
    assert.equal(res.status, 401)
  })

  it('prevents SDR reps from approving pitches (returns 403)', async () => {
    const res = await fetch(`${baseUrl}/pitches/pch-1`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${sdrToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'approved' })
    })
    assert.equal(res.status, 403)
  })

  it('prevents SDR reps from deleting pitches (returns 403)', async () => {
    const res = await fetch(`${baseUrl}/pitches/pch-1`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${sdrToken}` }
    })
    assert.equal(res.status, 403)
  })

  it('prevents SDR reps from accessing audit logs (returns 403)', async () => {
    const res = await fetch(`${baseUrl}/audit-logs`, {
      headers: { Authorization: `Bearer ${sdrToken}` }
    })
    assert.equal(res.status, 403)
  })

  it('allows Sales Managers to access audit logs (returns 200)', async () => {
    const res = await fetch(`${baseUrl}/audit-logs`, {
      headers: { Authorization: `Bearer ${managerToken}` }
    })
    assert.equal(res.status, 200)
    const logs = await res.json()
    assert.ok(Array.isArray(logs))
  })
})
