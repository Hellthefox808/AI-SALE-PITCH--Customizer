import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import crypto from 'node:crypto'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { getDb, closeDb } from './data/database.js'
import { seedDatabase } from './data/seedData.js'
import { Repository } from './data/repository.js'
import { AuthService } from './service/authService.js'
import { createRouter } from './presentation/routes.js'
import { metricsService } from './service/metricsService.js'
import { PORT } from './config/constants.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function createApp (customDb = null) {
  const db = customDb || getDb()
  await seedDatabase(db)

  const repository = new Repository(db)
  const authService = new AuthService(repository)

  const app = express()

  app.use(helmet({
    contentSecurityPolicy: false
  }))
  app.use(cors())
  app.use(express.json())

  // Tracing & Request ID Middleware
  app.use((req, res, next) => {
    req.id = req.headers['x-request-id'] || crypto.randomUUID()
    res.setHeader('x-request-id', req.id)

    // Telemetry metric hook
    res.on('finish', () => {
      metricsService.recordRequest(req.method, res.statusCode)
    })
    next()
  })

  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'))
  }

  // Mount API router
  const apiRouter = createRouter(repository, authService)
  app.use('/api', apiRouter)

  // Production Frontend Static Asset Hosting (Single Container Deployment)
  const frontendDist = path.resolve(__dirname, '../../frontend/dist')
  if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist))
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next()
      }
      res.sendFile(path.resolve(frontendDist, 'index.html'))
    })
  }

  // 404 Fallback
  app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.url} not found` })
  })

  // Global Error Handler
  app.use((err, req, res, next) => {
    console.error('Unhandled server error:', err)
    res.status(500).json({ error: 'Internal server error', details: err.message })
  })

  return { app, db, repository, authService }
}

let serverInstance = null

export async function startServer (port = PORT) {
  const { app, db } = await createApp()
  return new Promise((resolve) => {
    serverInstance = app.listen(port, () => {
      console.log(`[PitchCraft AI Backend] Running at http://localhost:${port}`)
      resolve({ server: serverInstance, app, db })
    })

    const shutdown = () => {
      console.log('Received termination signal, shutting down PitchCraft AI gracefully...')
      if (serverInstance) {
        serverInstance.close(() => {
          closeDb(db)
          console.log('PitchCraft AI HTTP server closed and database finalized.')
          process.exit(0)
        })
      } else {
        closeDb(db)
        process.exit(0)
      }
    }

    process.on('SIGTERM', shutdown)
    process.on('SIGINT', shutdown)
  })
}

// Auto-start if executed directly
if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}`) {
  startServer(PORT).catch((err) => {
    console.error('Fatal startup error:', err)
    process.exit(1)
  })
}
