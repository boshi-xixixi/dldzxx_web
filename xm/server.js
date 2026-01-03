import express from 'express'
import cors from 'cors'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT ? Number(process.env.PORT) : 8080

app.use(cors())

// 静态资源服务
const distDir = path.resolve(__dirname, 'dist')
app.use(express.static(distDir, { maxAge: '1h', extensions: ['html'] }))

// 简易 API 兜底，避免前端解析报错（返回 204 无内容）
app.use('/api', (_req, res) => {
  res.status(204).end()
})

// SPA 路由回退
app.get('*', (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Static server listening on http://localhost:${PORT}`)
})

