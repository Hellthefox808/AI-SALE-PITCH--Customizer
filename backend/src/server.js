import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { getDb } from './data/database.js'
import { seedDatabase } from './data/seedData.js'
import { Repository } from './data/repository.js'
import { AuthService } from './service/authService.js'
import { createRouter } from './presentation/routes.js'
import { PORT } from './config/constants.js'

export async function createApp (customDb = null) {
  const db = customDb || getDb()
  await seedDatabase(db)

  const repository = new Repository(db)
  const authService = new AuthService(repository)

  const app = express()

  app.use(helmet({
    contentSecurityPolicy: false // Allow modern frontend dev proxies
  }))
  app.use(cors())
  app.use(express.json())

  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'))
  }

  // Mount API router
  const apiRouter = createRouter(repository, authService)
  app.use('/api', apiRouter)

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
  })
}

// Auto-start if executed directly
if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}`) {
  startServer(PORT).catch((err) => {
    console.error('Fatal startup error:', err)
    process.exit(1)
  })
}
