import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { JWT_SECRET } from '../config/constants.js'

export class AuthService {
  constructor (repository) {
    this.repository = repository
  }

  async login (email, password) {
    const user = this.repository.findUserByEmail(email)
    if (!user) {
      throw new Error('Invalid email or password')
    }

    const isMatch = await bcrypt.compare(password, user.password_hash)
    if (!isMatch) {
      throw new Error('Invalid email or password')
    }

    const token = this.generateToken(user)
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }
  }

  generateToken (user) {
    return jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
  }

  verifyToken (token) {
    try {
      return jwt.verify(token, JWT_SECRET)
    } catch {
      return null
    }
  }

  // Middleware for checking authenticated user
  authMiddleware () {
    return (req, res, next) => {
      const authHeader = req.headers.authorization
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or malformed Authorization header' })
      }

      const token = authHeader.split(' ')[1]
      const decoded = this.verifyToken(token)
      if (!decoded) {
        return res.status(401).json({ error: 'Invalid or expired token' })
      }

      req.user = decoded
      next()
    }
  }

  // Middleware for checking specific roles
  roleMiddleware (allowedRoles = []) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' })
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          error: `Forbidden: role '${req.user.role}' lacks permission for this resource`
        })
      }

      next()
    }
  }
}
