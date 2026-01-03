import type { Response } from 'express'
import {
  type SecurityEvent,
  type SecuritySeverity,
  type SecurityEventStatus,
  type SecurityTelemetrySample,
  generateSecurityTelemetrySample,
  generateVulnerabilityFindings,
  generateComplianceAssessment,
} from '../data/mockData.js'
import { getActiveModel } from './modelRegistry.js'

export type RawTelemetryRecord = Record<string, unknown>

type AlertChannel = 'feishu' | 'wecom' | 'sms'

type AlertMessage = {
  channel: AlertChannel
  title: string
  content: string
  severity: SecuritySeverity
  eventId?: string
  occurredAt: string
}

type AlertingChannelConfig = {
  enabled: boolean
  webhookUrl?: string
}

type AlertingConfig = {
  feishu: AlertingChannelConfig
  wecom: AlertingChannelConfig
  sms: { enabled: boolean; provider?: string }
}

type IncidentReport = {
  eventId: string
  title: string
  severity: SecuritySeverity
  summary: string
  impact: string
  iocs: string[]
  recommendedFixes: string[]
  recoveryGuide: string[]
  generatedAt: string
  model: {
    provider: 'local' | 'online'
    name: string
    version: string
  }
}

type Postmortem = {
  eventId: string
  createdAt: string
  rootCause: string
  timeline: Array<{ at: string; note: string }>
  whatWentWell: string[]
  whatWentWrong: string[]
  actionItems: Array<{ owner: string; item: string; dueAt: string; status: 'open' | 'done' }>
  knowledgeBaseEntryId: string
}

type KnowledgeBaseEntry = {
  id: string
  createdAt: string
  title: string
  tags: string[]
  content: string
}

type ModelRouteDecision = {
  provider: 'local' | 'online'
  reason: string
  isolation: {
    allowNetwork: boolean
    allowPersistence: boolean
    redactSecrets: boolean
  }
}

type ThreatDetectionConfig = {
  trafficMbps: {
    enabled: boolean
    windowSize: number
    multiplier: number
    minAbsThreshold: number
  }
  rps: {
    enabled: boolean
    windowSize: number
    multiplier: number
    minAbsThreshold: number
  }
  scriptInjection: {
    enabled: boolean
    patterns: RegExp[]
  }
}

type SecurityRuntimeState = {
  started: boolean
  telemetryHistory: SecurityTelemetrySample[]
  events: SecurityEvent[]
  postmortems: Postmortem[]
  knowledgeBase: KnowledgeBaseEntry[]
  dailyReports: Array<(ReturnType<typeof generateDailySecurityReport> & { id: string })>
  vulnerabilityScans: Array<(ReturnType<typeof runVulnerabilityScan> & { id: string })>
  complianceAssessments: Array<(ReturnType<typeof runComplianceAssessment> & { id: string })>
  alertHistory: AlertMessage[]
  alertingConfig: AlertingConfig
  sseClients: Set<Response>
  config: ThreatDetectionConfig
  baselines: {
    trafficMbps: number[]
    rps: number[]
  }
}

const state: SecurityRuntimeState = {
  started: false,
  telemetryHistory: [],
  events: [],
  postmortems: [],
  knowledgeBase: [],
  dailyReports: [],
  vulnerabilityScans: [],
  complianceAssessments: [],
  alertHistory: [],
  alertingConfig: {
    feishu: { enabled: true, webhookUrl: '' },
    wecom: { enabled: true, webhookUrl: '' },
    sms: { enabled: false, provider: '' },
  },
  sseClients: new Set(),
  config: {
    trafficMbps: { enabled: true, windowSize: 40, multiplier: 2.2, minAbsThreshold: 450 },
    rps: { enabled: true, windowSize: 40, multiplier: 2.5, minAbsThreshold: 900 },
    scriptInjection: {
      enabled: true,
      patterns: [/<script\b/i, /onerror\s*=/i, /onload\s*=/i, /javascript:/i, /drop\s+table/i],
    },
  },
  baselines: {
    trafficMbps: [],
    rps: [],
  },
}

function clampNumber(n: unknown, min: number, max: number, fallback: number): number {
  const v = typeof n === 'number' ? n : Number(n)
  if (!Number.isFinite(v)) return fallback
  return Math.max(min, Math.min(max, v))
}

function normalizeThreatConfigPatch(patch: any): Partial<ThreatDetectionConfig> {
  const next: Partial<ThreatDetectionConfig> = {}
  if (patch && typeof patch === 'object') {
    if (patch.trafficMbps && typeof patch.trafficMbps === 'object') {
      next.trafficMbps = {
        enabled: typeof patch.trafficMbps.enabled === 'boolean' ? patch.trafficMbps.enabled : state.config.trafficMbps.enabled,
        windowSize: Math.round(clampNumber(patch.trafficMbps.windowSize, 5, 500, state.config.trafficMbps.windowSize)),
        multiplier: clampNumber(patch.trafficMbps.multiplier, 1, 20, state.config.trafficMbps.multiplier),
        minAbsThreshold: Math.round(clampNumber(patch.trafficMbps.minAbsThreshold, 0, 999999, state.config.trafficMbps.minAbsThreshold)),
      }
    }
    if (patch.rps && typeof patch.rps === 'object') {
      next.rps = {
        enabled: typeof patch.rps.enabled === 'boolean' ? patch.rps.enabled : state.config.rps.enabled,
        windowSize: Math.round(clampNumber(patch.rps.windowSize, 5, 500, state.config.rps.windowSize)),
        multiplier: clampNumber(patch.rps.multiplier, 1, 20, state.config.rps.multiplier),
        minAbsThreshold: Math.round(clampNumber(patch.rps.minAbsThreshold, 0, 999999, state.config.rps.minAbsThreshold)),
      }
    }
    if (patch.scriptInjection && typeof patch.scriptInjection === 'object') {
      const patterns = Array.isArray(patch.scriptInjection.patterns) ? patch.scriptInjection.patterns : null
      const compiled = patterns
        ? patterns
            .map((x: any) => String(x || '').trim())
            .filter((x: string) => x.length > 0)
            .slice(0, 20)
            .map((s: string) => {
              try {
                return new RegExp(s, 'i')
              } catch (_) {
                return null
              }
            })
            .filter(Boolean) as RegExp[]
        : state.config.scriptInjection.patterns
      next.scriptInjection = {
        enabled: typeof patch.scriptInjection.enabled === 'boolean' ? patch.scriptInjection.enabled : state.config.scriptInjection.enabled,
        patterns: compiled.length > 0 ? compiled : state.config.scriptInjection.patterns,
      }
    }
  }
  return next
}

function createHistoryId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`
}

export function getThreatDetectionConfig(): {
  trafficMbps: ThreatDetectionConfig['trafficMbps']
  rps: ThreatDetectionConfig['rps']
  scriptInjection: { enabled: boolean; patterns: string[] }
} {
  return {
    trafficMbps: state.config.trafficMbps,
    rps: state.config.rps,
    scriptInjection: { enabled: state.config.scriptInjection.enabled, patterns: state.config.scriptInjection.patterns.map((r) => r.source) },
  }
}

export function updateThreatDetectionConfig(patch: any): typeof state.config {
  const next = normalizeThreatConfigPatch(patch)
  state.config = {
    trafficMbps: next.trafficMbps || state.config.trafficMbps,
    rps: next.rps || state.config.rps,
    scriptInjection: next.scriptInjection || state.config.scriptInjection,
  }
  return state.config
}

export function getAlertingConfig(): AlertingConfig {
  return state.alertingConfig
}

export function updateAlertingConfig(patch: any): AlertingConfig {
  const next = { ...state.alertingConfig }
  if (patch && typeof patch === 'object') {
    for (const k of ['feishu', 'wecom'] as const) {
      if (patch[k] && typeof patch[k] === 'object') {
        next[k] = {
          enabled: typeof patch[k].enabled === 'boolean' ? patch[k].enabled : next[k].enabled,
          webhookUrl: typeof patch[k].webhookUrl === 'string' ? patch[k].webhookUrl : next[k].webhookUrl,
        }
      }
    }
    if (patch.sms && typeof patch.sms === 'object') {
      next.sms = {
        enabled: typeof patch.sms.enabled === 'boolean' ? patch.sms.enabled : next.sms.enabled,
        provider: typeof patch.sms.provider === 'string' ? patch.sms.provider : next.sms.provider,
      }
    }
  }
  state.alertingConfig = next
  return state.alertingConfig
}

export function listAlertHistory(limit: number = 200): AlertMessage[] {
  return state.alertHistory.slice(0, Math.max(1, Math.min(2000, limit)))
}

export function generateAndStoreDailySecurityReport(): ReturnType<typeof generateDailySecurityReport> & { id: string } {
  const data = generateDailySecurityReport()
  const entry = { ...data, id: createHistoryId('daily') }
  state.dailyReports.unshift(entry)
  state.dailyReports = state.dailyReports.slice(0, 60)
  return entry
}

export function listDailySecurityReports(limit: number = 30): Array<ReturnType<typeof generateDailySecurityReport> & { id: string }> {
  return state.dailyReports.slice(0, Math.max(1, Math.min(200, limit)))
}

export function getDailySecurityReportById(id: string): (ReturnType<typeof generateDailySecurityReport> & { id: string }) | null {
  return state.dailyReports.find((x) => x.id === id) || null
}

export function listVulnerabilityScans(limit: number = 30): Array<ReturnType<typeof runVulnerabilityScan> & { id: string }> {
  return state.vulnerabilityScans.slice(0, Math.max(1, Math.min(200, limit)))
}

export function getVulnerabilityScanById(id: string): (ReturnType<typeof runVulnerabilityScan> & { id: string }) | null {
  return state.vulnerabilityScans.find((x) => x.id === id) || null
}

export function listComplianceAssessments(limit: number = 30): Array<ReturnType<typeof runComplianceAssessment> & { id: string }> {
  return state.complianceAssessments.slice(0, Math.max(1, Math.min(200, limit)))
}

export function getComplianceAssessmentById(id: string): (ReturnType<typeof runComplianceAssessment> & { id: string }) | null {
  return state.complianceAssessments.find((x) => x.id === id) || null
}

export function transformRawTelemetryToSample(raw: RawTelemetryRecord): SecurityTelemetrySample {
  const now = new Date().toISOString()
  const deviceId = typeof raw.deviceId === 'string' ? raw.deviceId : 'unknown'
  const service = typeof raw.service === 'string' ? raw.service : 'unknown'

  const trafficMbps = typeof raw.trafficMbps === 'number' ? raw.trafficMbps : 0
  const rps = typeof raw.rps === 'number' ? raw.rps : 0
  const errorRate = typeof raw.errorRate === 'number' ? raw.errorRate : 0
  const latencyMs = typeof raw.latencyMs === 'number' ? raw.latencyMs : 0

  const httpSamples = Array.isArray(raw.httpSamples)
    ? (raw.httpSamples as any[]).slice(0, 20).map((x) => ({
        method: (x?.method || 'GET') as any,
        path: typeof x?.path === 'string' ? x.path : '/',
        status: typeof x?.status === 'number' ? x.status : 200,
        userAgent: typeof x?.userAgent === 'string' ? x.userAgent : 'unknown',
        bodySnippet: typeof x?.bodySnippet === 'string' ? x.bodySnippet : undefined,
      }))
    : []

  return {
    timestamp: typeof raw.timestamp === 'string' ? raw.timestamp : now,
    deviceId,
    service,
    trafficMbps,
    rps,
    errorRate,
    latencyMs,
    httpSamples,
  }
}

export function ingestTelemetrySample(sample: SecurityTelemetrySample): void {
  state.telemetryHistory.push(sample)
  state.telemetryHistory = state.telemetryHistory.slice(-2000)
  broadcastSse({ kind: 'telemetry', data: sample })
  tickThreatDetection(sample)
}

export function ingestRawTelemetry(raw: RawTelemetryRecord): SecurityTelemetrySample {
  const sample = transformRawTelemetryToSample(raw)
  ingestTelemetrySample(sample)
  return sample
}

export function getSecurityRuntimeSnapshot(): Pick<SecurityRuntimeState, 'telemetryHistory' | 'events'> {
  return {
    telemetryHistory: state.telemetryHistory.slice(-300),
    events: state.events.slice(0, 200),
  }
}

export function listTelemetryHistory(limit: number = 300): SecurityTelemetrySample[] {
  return state.telemetryHistory.slice(-Math.max(1, Math.min(2000, limit)))
}

export function listSecurityEvents(limit: number = 200): SecurityEvent[] {
  return state.events.slice(0, Math.max(1, Math.min(500, limit)))
}

export function getSecurityEventById(eventId: string): SecurityEvent | null {
  return state.events.find((e) => e.id === eventId) || null
}

export function updateSecurityEvent(eventId: string, patch: Partial<Pick<SecurityEvent, 'status' | 'recoveryProgress' | 'timeline'>>): SecurityEvent | null {
  const idx = state.events.findIndex((e) => e.id === eventId)
  if (idx === -1) return null
  const next: SecurityEvent = {
    ...state.events[idx],
    ...patch,
    timeline: patch.timeline ?? state.events[idx].timeline,
  }
  state.events[idx] = next
  broadcastSse({ kind: 'event_updated', data: next })
  return next
}

export function addSecuritySseClient(res: Response): void {
  state.sseClients.add(res)
  res.on('close', () => {
    state.sseClients.delete(res)
  })
}

export function broadcastSse(payload: unknown): void {
  const data = `data: ${JSON.stringify(payload)}\n\n`
  for (const client of state.sseClients) {
    try {
      client.write(data)
    } catch (_) {
      state.sseClients.delete(client)
    }
  }
}

function pushBaseline(series: number[], value: number, windowSize: number): number {
  series.push(value)
  while (series.length > windowSize) series.shift()
  const avg = series.reduce((s, v) => s + v, 0) / Math.max(1, series.length)
  return avg
}

function chooseSeverityByMultiplier(multiplier: number): SecuritySeverity {
  if (multiplier >= 4) return 'critical'
  if (multiplier >= 3) return 'high'
  if (multiplier >= 2.2) return 'medium'
  return 'low'
}

function createEventId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`
}

function createEventBase(params: {
  type: SecurityEvent['type']
  severity: SecuritySeverity
  title: string
  description: string
  source: SecurityEvent['source']
  indicators: string[]
}): SecurityEvent {
  const now = new Date().toISOString()
  return {
    id: createEventId('evt'),
    timestamp: now,
    type: params.type,
    severity: params.severity,
    status: 'open',
    title: params.title,
    description: params.description,
    source: params.source,
    indicators: params.indicators,
    recoveryProgress: 0,
    timeline: [
      { at: now, phase: 'detect', message: '检测到可疑行为，已自动立案' },
      { at: now, phase: 'triage', message: '开始自动归因与影响评估' },
    ],
  }
}

function maybeAddEvent(event: SecurityEvent): void {
  state.events.unshift(event)
  state.events = state.events.slice(0, 500)
  broadcastSse({ kind: 'event_created', data: event })
  void sendMultiChannelAlert({
    channel: Math.random() > 0.5 ? 'feishu' : 'wecom',
    title: `[${event.severity.toUpperCase()}] ${event.title}`,
    content: event.description,
    severity: event.severity,
    eventId: event.id,
    occurredAt: event.timestamp,
  })
}

function hasScriptInjection(sample: SecurityTelemetrySample, patterns: RegExp[]): { hit: boolean; iocs: string[] } {
  const iocs: string[] = []
  for (const http of sample.httpSamples) {
    const body = http.bodySnippet || ''
    for (const p of patterns) {
      if (p.test(body)) {
        iocs.push(`${http.method} ${http.path} body~/${p.source}/`)
      }
    }
  }
  return { hit: iocs.length > 0, iocs }
}

function tickThreatDetection(sample: SecurityTelemetrySample): void {
  const trafficAvg = pushBaseline(state.baselines.trafficMbps, sample.trafficMbps, state.config.trafficMbps.windowSize)
  const rpsAvg = pushBaseline(state.baselines.rps, sample.rps, state.config.rps.windowSize)

  if (state.config.trafficMbps.enabled && sample.trafficMbps >= Math.max(state.config.trafficMbps.minAbsThreshold, trafficAvg * state.config.trafficMbps.multiplier)) {
    const multiplier = sample.trafficMbps / Math.max(1, trafficAvg)
    const sev = chooseSeverityByMultiplier(multiplier)
    maybeAddEvent(
      createEventBase({
        type: 'traffic_spike',
        severity: sev,
        title: '疑似异常流量峰值',
        description: `检测到 ${sample.service} 流量峰值：${sample.trafficMbps}Mbps（基线≈${Math.round(trafficAvg)}Mbps）`,
        source: { deviceId: sample.deviceId, service: sample.service },
        indicators: [`trafficMbps=${sample.trafficMbps}`, `baselineTraffic≈${Math.round(trafficAvg)}`],
      }),
    )
  }

  if (state.config.rps.enabled && sample.rps >= Math.max(state.config.rps.minAbsThreshold, rpsAvg * state.config.rps.multiplier)) {
    const multiplier = sample.rps / Math.max(1, rpsAvg)
    const sev = chooseSeverityByMultiplier(multiplier)
    maybeAddEvent(
      createEventBase({
        type: 'dynamic_threshold',
        severity: sev,
        title: '动态阈值触发（请求速率异常）',
        description: `检测到 ${sample.service} 请求速率异常：${sample.rps}rps（基线≈${Math.round(rpsAvg)}rps）`,
        source: { deviceId: sample.deviceId, service: sample.service },
        indicators: [`rps=${sample.rps}`, `baselineRps≈${Math.round(rpsAvg)}`],
      }),
    )
  }

  if (state.config.scriptInjection.enabled) {
    const { hit, iocs } = hasScriptInjection(sample, state.config.scriptInjection.patterns)
    if (hit) {
      maybeAddEvent(
        createEventBase({
          type: 'script_injection',
          severity: 'high',
          title: '脚本注入特征命中',
          description: `检测到疑似脚本注入/恶意载荷特征，建议立即核查 WAF 日志与会话`,
          source: { deviceId: sample.deviceId, service: sample.service },
          indicators: iocs.slice(0, 8),
        }),
      )
    }
  }
}

function evolveOpenIncidents(): void {
  const now = new Date().toISOString()
  for (const e of state.events) {
    if (e.status === 'resolved') continue
    if (e.recoveryProgress >= 100) continue

    const nextProgress = Math.min(100, e.recoveryProgress + (Math.random() > 0.6 ? 8 : 3))
    const nextStatus: SecurityEventStatus =
      nextProgress >= 100 ? 'resolved' : nextProgress >= 70 ? 'mitigated' : nextProgress >= 25 ? 'investigating' : e.status

    const timelineAppendChance = Math.random()
    const nextTimeline = timelineAppendChance > 0.65
      ? [
          ...e.timeline,
          {
            at: now,
            phase: nextStatus,
            message:
              nextStatus === 'investigating'
                ? '已定位可疑来源并开始封禁/限流'
                : nextStatus === 'mitigated'
                  ? '已完成主要缓解措施，持续观察回归'
                  : '恢复完成，进入复盘与知识沉淀',
          },
        ]
      : e.timeline

    if (nextProgress !== e.recoveryProgress || nextStatus !== e.status || nextTimeline !== e.timeline) {
      updateSecurityEvent(e.id, { recoveryProgress: nextProgress, status: nextStatus, timeline: nextTimeline })
    }
  }
}

export function startSecurityRuntime(): void {
  const disabled = (process.env.SECURITY_RUNTIME_ENABLED || '').toLowerCase() === 'false'
  if (disabled) return
  if (state.started) return
  state.started = true

  setInterval(() => {
    const sample = generateSecurityTelemetrySample()
    state.telemetryHistory.push(sample)
    state.telemetryHistory = state.telemetryHistory.slice(-2000)
    broadcastSse({ kind: 'telemetry', data: sample })
    tickThreatDetection(sample)
  }, 1000)

  setInterval(() => {
    evolveOpenIncidents()
  }, 2500)
}

export function generateIncidentReport(event: SecurityEvent, route: ModelRouteDecision): IncidentReport {
  const iocs = event.indicators.slice(0, 12)
  const recommendedFixes = [
    '确认告警来源与影响范围，优先保护关键业务链路',
    '对相关来源 IP/账号执行封禁或限流，开启更严格 WAF 规则',
    '检索同类 IOC 在最近 24h 的出现频次，判定是否为持续性攻击',
    '对受影响资产进行补丁核验与配置加固，补齐审计与告警规则',
  ]
  const recoveryGuide = [
    '将流量切换到健康实例或启用降级策略',
    '验证核心接口成功率、延迟、错误率回归基线',
    '复核告警是否恢复稳定，记录关键时间点与处置操作',
  ]

  return {
    eventId: event.id,
    title: event.title,
    severity: event.severity,
    summary: `系统检测到「${event.type}」类事件，当前状态：${event.status}，恢复进度：${event.recoveryProgress}%`,
    impact: `可能影响 ${event.source.service || '关键业务'} 的可用性/数据安全，建议根据业务优先级进行分级处置。`,
    iocs,
    recommendedFixes,
    recoveryGuide,
    generatedAt: new Date().toISOString(),
    model: {
      provider: route.provider,
      name: getActiveModel(route.provider).name,
      version: getActiveModel(route.provider).version,
    },
  }
}

export function generateDailySecurityReport(): {
  generatedAt: string
  kpis: Record<string, number | string>
  charts: any
  highlights: string[]
  topEvents: SecurityEvent[]
} {
  const recentEvents = state.events.slice(0, 10)
  const total = Math.max(1, state.events.length)
  const highCount = state.events.filter((e) => e.severity === 'high' || e.severity === 'critical').length
  const openCount = state.events.filter((e) => e.status !== 'resolved').length

  return {
    generatedAt: new Date().toISOString(),
    kpis: {
      totalEvents: state.events.length,
      highSeverityRate: Number(((highCount / total) * 100).toFixed(2)),
      openIncidents: openCount,
      telemetrySamples24h: Math.min(state.telemetryHistory.length, 24 * 3600),
    },
    charts: {
      severityDistribution: ['info', 'low', 'medium', 'high', 'critical'].map((s) => ({
        severity: s,
        count: state.events.filter((e) => e.severity === s).length,
      })),
      statusDistribution: ['open', 'investigating', 'mitigated', 'resolved'].map((s) => ({
        status: s,
        count: state.events.filter((e) => e.status === s).length,
      })),
    },
    highlights: [
      highCount > 0 ? `高危/严重事件 ${highCount} 起，建议优先复核处置闭环` : '未检测到高危事件',
      openCount > 0 ? `仍有 ${openCount} 起事件未闭环，建议更新恢复进度与复盘条目` : '事件闭环情况良好',
      '建议将复盘经验沉淀到知识库，形成可复用的处置剧本',
    ],
    topEvents: recentEvents,
  }
}

export function runVulnerabilityScan(): { id: string; scanId: string; startedAt: string; findings: ReturnType<typeof generateVulnerabilityFindings> } {
  const scanId = `scan_${Date.now()}`
  const startedAt = new Date().toISOString()
  const findings = generateVulnerabilityFindings()
  if (findings.length > 0) {
    maybeAddEvent(
      createEventBase({
        type: 'vulnerability',
        severity: findings.some((f) => f.severity === 'critical') ? 'critical' : 'high',
        title: '联网漏洞扫描发现风险',
        description: `漏洞扫描发现 ${findings.length} 项风险，建议尽快修复并验证`,
        source: { service: 'vuln_scan' },
        indicators: findings.slice(0, 6).map((f) => `${f.cve || 'NO-CVE'}:${f.affectedAsset}`),
      }),
    )
  }
  const entry = { id: createHistoryId('vuln'), scanId, startedAt, findings }
  state.vulnerabilityScans.unshift(entry)
  state.vulnerabilityScans = state.vulnerabilityScans.slice(0, 60)
  return entry
}

export function runComplianceAssessment(): { id: string; assessedAt: string; controls: ReturnType<typeof generateComplianceAssessment> } {
  const assessedAt = new Date().toISOString()
  const controls = generateComplianceAssessment()
  const fail = controls.filter((c) => c.status === 'fail').length
  if (fail > 0) {
    maybeAddEvent(
      createEventBase({
        type: 'compliance',
        severity: 'medium',
        title: '合规风险评估存在缺口',
        description: `等保2.0三级评估发现 ${fail} 项未通过控制项，建议制定整改计划`,
        source: { service: 'compliance' },
        indicators: controls.filter((c) => c.status !== 'pass').map((c) => c.id).slice(0, 10),
      }),
    )
  }
  const entry = { id: createHistoryId('compliance'), assessedAt, controls }
  state.complianceAssessments.unshift(entry)
  state.complianceAssessments = state.complianceAssessments.slice(0, 60)
  return entry
}

export function createPostmortem(eventId: string, input: Omit<Postmortem, 'eventId' | 'createdAt' | 'knowledgeBaseEntryId'>): Postmortem | null {
  const event = getSecurityEventById(eventId)
  if (!event) return null

  const kbId = `kb_${Date.now()}_${Math.floor(Math.random() * 100000)}`
  const kb: KnowledgeBaseEntry = {
    id: kbId,
    createdAt: new Date().toISOString(),
    title: `复盘：${event.title}`,
    tags: ['postmortem', event.type, event.severity],
    content: JSON.stringify({ event, postmortem: input }, null, 2),
  }
  state.knowledgeBase.unshift(kb)
  state.knowledgeBase = state.knowledgeBase.slice(0, 200)

  const pm: Postmortem = {
    eventId,
    createdAt: new Date().toISOString(),
    knowledgeBaseEntryId: kbId,
    ...input,
  }
  state.postmortems.unshift(pm)
  state.postmortems = state.postmortems.slice(0, 200)
  return pm
}

export function listKnowledgeBase(limit: number = 50): KnowledgeBaseEntry[] {
  return state.knowledgeBase.slice(0, Math.max(1, Math.min(200, limit)))
}

export function routeModel(input: { taskType: string; content: string; sensitivity?: 'internal' | 'public' }): ModelRouteDecision {
  const content = (input.content || '').toLowerCase()
  const internalKeywords = ['校规', '课程', '学生', '成绩', '内部', '涉密', '账号', '密码', 'secret', 'token']
  const looksInternal = input.sensitivity === 'internal' || internalKeywords.some((k) => content.includes(k.toLowerCase()))

  if (looksInternal) {
    return {
      provider: 'local',
      reason: '命中内部敏感语义或显式标记为内部需求，强制本地模型处理',
      isolation: { allowNetwork: false, allowPersistence: true, redactSecrets: true },
    }
  }

  return {
    provider: 'online',
    reason: '通用需求，允许在线模型处理以获得更强能力与更广知识',
    isolation: { allowNetwork: true, allowPersistence: false, redactSecrets: true },
  }
}

export async function sendMultiChannelAlert(msg: AlertMessage): Promise<{ ok: boolean; channel: AlertChannel }> {
  const runtimeEnabled = (process.env.ALERTING_ENABLED || '').toLowerCase() !== 'false'
  const channelEnabled =
    msg.channel === 'feishu'
      ? state.alertingConfig.feishu.enabled
      : msg.channel === 'wecom'
        ? state.alertingConfig.wecom.enabled
        : state.alertingConfig.sms.enabled

  state.alertHistory.unshift(msg)
  state.alertHistory = state.alertHistory.slice(0, 2000)

  if (!runtimeEnabled) return { ok: true, channel: msg.channel }
  if (!channelEnabled) return { ok: false, channel: msg.channel }
  return { ok: true, channel: msg.channel }
}
