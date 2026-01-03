/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import networkRoutes from './routes/network.js'
import employeeRoutes from './routes/employees.js'
import aiRoutes from './routes/ai.js'
import reportRoutes from './routes/reports.js'
import geoRoutes from './routes/geo.js'
import securityRoutes from './routes/security.js'

// for esm mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load env
dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'no-referrer')
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  res.setHeader('X-XSS-Protection', '0')
  next()
})

type RateBucket = { tokens: number; updatedAt: number }
const buckets = new Map<string, RateBucket>()
const RATE_PER_SEC = 10
const BURST = 30

app.use((req: Request, res: Response, next: NextFunction) => {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown'
  const now = Date.now()
  const b = buckets.get(ip) || { tokens: BURST, updatedAt: now }
  const delta = Math.max(0, now - b.updatedAt)
  const refill = (delta / 1000) * RATE_PER_SEC
  b.tokens = Math.min(BURST, b.tokens + refill)
  b.updatedAt = now
  if (b.tokens < 1) {
    buckets.set(ip, b)
    return res.status(429).json({ success: false, error: 'Too Many Requests' })
  }
  b.tokens -= 1
  buckets.set(ip, b)
  next()
})

/**
 * API Routes
 */
app.use('/api/auth', authRoutes)
app.use('/api/network', networkRoutes)
app.use('/api/employees', employeeRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/geo', geoRoutes)
app.use('/api/security', securityRoutes)

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'Enterprise Network Monitoring System API is running',
    })
  },
)

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
