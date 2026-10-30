export function createRateLimiter ({ windowMs = 60000, max = 100 } = {}) {
  const ipStore = new Map()

  // Periodic cleanup of expired entries
  setInterval(() => {
    const now = Date.now()
    for (const [ip, record] of ipStore.entries()) {
      if (now > record.resetTime) {
        ipStore.delete(ip)
      }
    }
  }, 120000).unref()

  return function rateLimiter (req, res, next) {
    if (process.env.NODE_ENV === 'test') {
      return next()
    }

    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1'
    const now = Date.now()

    let record = ipStore.get(ip)
    if (!record || now > record.resetTime) {
      record = { count: 0, resetTime: now + windowMs }
      ipStore.set(ip, record)
    }

    record.count++
    const remaining = Math.max(0, max - record.count)
    const resetSec = Math.ceil((record.resetTime - now) / 1000)

    res.setHeader('X-RateLimit-Limit', max)
    res.setHeader('X-RateLimit-Remaining', remaining)
    res.setHeader('X-RateLimit-Reset', resetSec)

    if (record.count > max) {
      return res.status(429).json({
        error: 'Too many requests. Please slow down and try again later.',
        retryAfterSeconds: resetSec
      })
    }

    next()
  }
}
