import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { getDb, closeDb } from '../src/data/database.js'
import { seedDatabase } from '../src/data/seedData.js'
import { Repository } from '../src/data/repository.js'
import { AuthService } from '../src/service/authService.js'

describe('AuthService — Authentication, Token Lifecycle & Verification', () => {
  let db
  let repository
  let authService

  before(async () => {
    db = getDb(':memory:')
    await seedDatabase(db)
    repository = new Repository(db)
    authService = new AuthService(repository)
  })

  after(() => {
    closeDb(db)
  })

  it('authenticates valid user with correct password', async () => {
    const res = await authService.login('sdr@pitchcraft.io', 'password123')
    assert.ok(res.token, 'Should return JWT token')
    assert.equal(res.user.email, 'sdr@pitchcraft.io')
    assert.equal(res.user.role, 'sdr_rep')
  })

  it('rejects invalid password', async () => {
    await assert.rejects(
      async () => {
        await authService.login('sdr@pitchcraft.io', 'wrongpassword')
      },
      /Invalid email or password/
    )
  })

  it('rejects unknown user email', async () => {
    await assert.rejects(
      async () => {
        await authService.login('unknown@pitchcraft.io', 'password123')
      },
      /Invalid email or password/
    )
  })

  it('generates and verifies valid token payload', () => {
    const user = { id: 'usr-123', name: 'Test User', email: 'test@pitchcraft.io', role: 'admin' }
    const token = authService.generateToken(user)
    const decoded = authService.verifyToken(token)

    assert.equal(decoded.id, user.id)
    assert.equal(decoded.email, user.email)
    assert.equal(decoded.role, user.role)
  })
})
