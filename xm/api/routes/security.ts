import { Router, type Router as ExpressRouter } from 'express'
import {
  addSecuritySseClient,
  broadcastSse,
  createPostmortem,
  generateDailySecurityReport,
  generateAndStoreDailySecurityReport,
  generateIncidentReport,
  getAlertingConfig,
  getComplianceAssessmentById,
  getDailySecurityReportById,
  getSecurityEventById,
  getSecurityRuntimeSnapshot,
  getThreatDetectionConfig,
  getVulnerabilityScanById,
  ingestRawTelemetry,
  listAlertHistory,
  listComplianceAssessments,
  listDailySecurityReports,
  listKnowledgeBase,
  listSecurityEvents,
  listTelemetryHistory,
  listVulnerabilityScans,
  routeModel,
  runComplianceAssessment,
  runVulnerabilityScan,
  sendMultiChannelAlert,
  startSecurityRuntime,
  updateSecurityEvent,
  updateAlertingConfig,
  updateThreatDetectionConfig,
} from '../services/securityRuntime.js'
import { activateModel, getActiveModel, listModels, registerModel } from '../services/modelRegistry.js'

const router: ExpressRouter = Router()

startSecurityRuntime()

router.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  ;(res as any).flushHeaders?.()

  addSecuritySseClient(res)
  res.write(`data: ${JSON.stringify({ kind: 'snapshot', data: getSecurityRuntimeSnapshot() })}\n\n`)

  const keepAlive = setInterval(() => {
    try {
      res.write(`event: ping\ndata: ${Date.now()}\n\n`)
    } catch (_) {
      clearInterval(keepAlive)
    }
  }, 15000)

  res.on('close', () => {
    clearInterval(keepAlive)
  })
})

router.get('/telemetry/history', (req, res) => {
  const limit = Number(req.query.limit || 300)
  res.json({ success: true, data: listTelemetryHistory(limit) })
})

router.post('/telemetry/ingest', (req, res) => {
  try {
    const sample = ingestRawTelemetry(req.body || {})
    res.json({ success: true, data: sample })
  } catch (e) {
    res.status(400).json({ success: false, message: '数据格式无效' })
  }
})

router.get('/events', (req, res) => {
  const limit = Number(req.query.limit || 200)
  res.json({ success: true, data: listSecurityEvents(limit) })
})

router.get('/events/:id', (req, res) => {
  const event = getSecurityEventById(req.params.id)
  if (!event) return res.status(404).json({ success: false, message: '事件不存在' })
  res.json({ success: true, data: event })
})

router.patch('/events/:id', (req, res) => {
  const { status, recoveryProgress, timelineAppend } = req.body || {}
  const event = getSecurityEventById(req.params.id)
  if (!event) return res.status(404).json({ success: false, message: '事件不存在' })

  const nextTimeline =
    typeof timelineAppend === 'string' && timelineAppend.trim().length > 0
      ? [...event.timeline, { at: new Date().toISOString(), phase: String(status || event.status), message: timelineAppend }]
      : undefined

  const updated = updateSecurityEvent(req.params.id, {
    status,
    recoveryProgress,
    timeline: nextTimeline,
  })
  if (!updated) return res.status(500).json({ success: false, message: '更新失败' })
  res.json({ success: true, data: updated })
})

router.post('/reports/incident', (req, res) => {
  const { eventId, modelRoute } = req.body || {}
  if (!eventId) return res.status(400).json({ success: false, message: 'eventId 不能为空' })
  const event = getSecurityEventById(eventId)
  if (!event) return res.status(404).json({ success: false, message: '事件不存在' })

  const decision = modelRoute || routeModel({ taskType: 'incident_report', content: JSON.stringify(event), sensitivity: 'public' })
  const report = generateIncidentReport(event, decision)
  res.json({ success: true, data: report })
})

router.get('/reports/daily', (req, res) => {
  res.json({ success: true, data: generateDailySecurityReport() })
})

router.post('/reports/daily/generate', (req, res) => {
  res.json({ success: true, data: generateAndStoreDailySecurityReport() })
})

router.get('/reports/daily/history', (req, res) => {
  const limit = Number(req.query.limit || 30)
  res.json({ success: true, data: listDailySecurityReports(limit) })
})

router.get('/reports/daily/:id', (req, res) => {
  const item = getDailySecurityReportById(req.params.id)
  if (!item) return res.status(404).json({ success: false, message: '日报不存在' })
  res.json({ success: true, data: item })
})

router.post('/risk/vuln-scan', (req, res) => {
  res.json({ success: true, data: runVulnerabilityScan() })
})

router.get('/risk/vuln-scan/history', (req, res) => {
  const limit = Number(req.query.limit || 30)
  res.json({ success: true, data: listVulnerabilityScans(limit) })
})

router.get('/risk/vuln-scan/:id', (req, res) => {
  const item = getVulnerabilityScanById(req.params.id)
  if (!item) return res.status(404).json({ success: false, message: '扫描不存在' })
  res.json({ success: true, data: item })
})

router.post('/risk/compliance', (req, res) => {
  res.json({ success: true, data: runComplianceAssessment() })
})

router.get('/risk/compliance/history', (req, res) => {
  const limit = Number(req.query.limit || 30)
  res.json({ success: true, data: listComplianceAssessments(limit) })
})

router.get('/risk/compliance/:id', (req, res) => {
  const item = getComplianceAssessmentById(req.params.id)
  if (!item) return res.status(404).json({ success: false, message: '评估不存在' })
  res.json({ success: true, data: item })
})

router.get('/config/threat-detection', (req, res) => {
  res.json({ success: true, data: getThreatDetectionConfig() })
})

router.patch('/config/threat-detection', (req, res) => {
  try {
    res.json({ success: true, data: updateThreatDetectionConfig(req.body || {}) })
  } catch (e) {
    res.status(400).json({ success: false, message: '配置更新失败' })
  }
})

router.get('/alerts/config', (req, res) => {
  res.json({ success: true, data: getAlertingConfig() })
})

router.patch('/alerts/config', (req, res) => {
  try {
    res.json({ success: true, data: updateAlertingConfig(req.body || {}) })
  } catch (e) {
    res.status(400).json({ success: false, message: '配置更新失败' })
  }
})

router.get('/alerts/history', (req, res) => {
  const limit = Number(req.query.limit || 200)
  res.json({ success: true, data: listAlertHistory(limit) })
})

router.post('/alerts/send', async (req, res) => {
  const { channel, title, content, severity, eventId } = req.body || {}
  if (!channel || !title || !content) return res.status(400).json({ success: false, message: 'channel/title/content 不能为空' })
  if (channel !== 'feishu' && channel !== 'wecom' && channel !== 'sms') return res.status(400).json({ success: false, message: 'channel 必须是 feishu/wecom/sms' })
  const result = await sendMultiChannelAlert({
    channel,
    title: String(title),
    content: String(content),
    severity: severity || 'medium',
    eventId,
    occurredAt: new Date().toISOString(),
  })
  res.json({ success: true, data: result })
})

router.post('/model/route', (req, res) => {
  const { taskType, content, sensitivity } = req.body || {}
  if (!taskType || !content) return res.status(400).json({ success: false, message: 'taskType/content 不能为空' })
  res.json({ success: true, data: routeModel({ taskType, content, sensitivity }) })
})

router.get('/model/registry', (req, res) => {
  const provider = req.query.provider
  if (provider === 'local' || provider === 'online') {
    return res.json({ success: true, data: listModels(provider) })
  }
  res.json({ success: true, data: listModels() })
})

router.get('/model/active', (req, res) => {
  const provider = req.query.provider
  if (provider !== 'local' && provider !== 'online') return res.status(400).json({ success: false, message: 'provider 必须是 local/online' })
  res.json({ success: true, data: getActiveModel(provider) })
})

router.post('/model/register', (req, res) => {
  const { id, provider, name, version, capabilities, active } = req.body || {}
  if (!id || !provider || !name || !version) return res.status(400).json({ success: false, message: 'id/provider/name/version 不能为空' })
  if (provider !== 'local' && provider !== 'online') return res.status(400).json({ success: false, message: 'provider 必须是 local/online' })
  const model = registerModel({
    id: String(id),
    provider,
    name: String(name),
    version: String(version),
    capabilities: Array.isArray(capabilities) ? capabilities.map(String) : [],
    active: Boolean(active),
  })
  res.json({ success: true, data: model })
})

router.post('/model/activate', (req, res) => {
  const { provider, modelId } = req.body || {}
  if (!provider || !modelId) return res.status(400).json({ success: false, message: 'provider/modelId 不能为空' })
  if (provider !== 'local' && provider !== 'online') return res.status(400).json({ success: false, message: 'provider 必须是 local/online' })
  const model = activateModel(provider, String(modelId))
  if (!model) return res.status(404).json({ success: false, message: '模型不存在' })
  res.json({ success: true, data: model })
})

router.post('/postmortems', (req, res) => {
  const { eventId, rootCause, timeline, whatWentWell, whatWentWrong, actionItems } = req.body || {}
  if (!eventId || !rootCause) return res.status(400).json({ success: false, message: 'eventId/rootCause 不能为空' })
  const pm = createPostmortem(eventId, {
    rootCause,
    timeline: Array.isArray(timeline) ? timeline : [],
    whatWentWell: Array.isArray(whatWentWell) ? whatWentWell : [],
    whatWentWrong: Array.isArray(whatWentWrong) ? whatWentWrong : [],
    actionItems: Array.isArray(actionItems) ? actionItems : [],
  })
  if (!pm) return res.status(404).json({ success: false, message: '事件不存在' })
  broadcastSse({ kind: 'postmortem_created', data: pm })
  res.json({ success: true, data: pm })
})

router.get('/knowledge-base', (req, res) => {
  const limit = Number(req.query.limit || 50)
  res.json({ success: true, data: listKnowledgeBase(limit) })
})

export default router
