import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createRateLimiter } from '../src/presentation/rateLimiter.js'

describe('RateLimiter — Sliding Window Token Bucket Guard', () => {
  it('allows requests within the configured threshold and sets rate limit headers', () => {
    const limiter = createRateLimiter({ windowMs: 10000, max: 3 })
    const headers = {}
    const mockReq = {
      ip: '192.168.1.100',
      headers: {},
      socket: {}
    }
    const mockRes = {
      setHeader: (name, val) => {
        headers[name] = val
      },
      status: () => mockRes,
      json: () => {}
    }

    let nextCalled = false
    const next = () => { nextCalled = true }

    // Temporarily bypass test environment bypass
    const origEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'

    try {
      limiter(mockReq, mockRes, next)
      assert.equal(nextCalled, true)
      assert.equal(headers['X-RateLimit-Limit'], 3)
      assert.equal(headers['X-RateLimit-Remaining'], 2)
      assert.ok(headers['X-RateLimit-Reset'] > 0)
    } finally {
      process.env.NODE_ENV = origEnv
    }
  })

  it('blocks requests and returns 429 when threshold is exceeded', () => {
    const limiter = createRateLimiter({ windowMs: 10000, max: 2 })
    const mockReq = {
      ip: '10.0.0.50',
      headers: {},
      socket: {}
    }
    let statusCode = 200
    let responseBody = null

    const mockRes = {
      setHeader: () => {},
      status: (code) => {
        statusCode = code
        return mockRes
      },
      json: (data) => {
        responseBody = data
      }
    }

    const origEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'

    try {
      // 1st request - ok
      limiter(mockReq, mockRes, () => {})
      assert.equal(statusCode, 200)

      // 2nd request - ok
      limiter(mockReq, mockRes, () => {})
      assert.equal(statusCode, 200)

      // 3rd request - should be blocked with 429
      let blockedNextCalled = false
      limiter(mockReq, mockRes, () => { blockedNextCalled = true })

      assert.equal(blockedNextCalled, false)
      assert.equal(statusCode, 429)
      assert.ok(responseBody.error.includes('Too many requests'))
      assert.ok(responseBody.retryAfterSeconds > 0)
    } finally {
      process.env.NODE_ENV = origEnv
    }
  })
})
