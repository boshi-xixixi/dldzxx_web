import { apiUrl, fetchJSON } from './http'

export type SecuritySeverity = 'info' | 'low' | 'medium' | 'high' | 'critical'
export type SecurityEventStatus = 'open' | 'investigating' | 'mitigated' | 'resolved'

export type SecurityEvent = {
  id: string
  timestamp: string
  title: string
  type: string
  severity: SecuritySeverity
  status: SecurityEventStatus
  description: string
  recoveryProgress: number
  indicators: string[]
  source: { deviceId?: string; service?: string; ip?: string }
  timeline: Array<{ at: string; phase: string; message: string }>
}

export type SecurityTelemetrySample = {
  timestamp: string
  deviceId: string
  service: string
  trafficMbps: number
  rps: number
  errorRate: number
  latencyMs: number
}

export type IncidentReport = {
  eventId: string
  title: string
  severity: SecuritySeverity
  summary: string
  impact: string
  iocs: string[]
  recommendedFixes: string[]
  recoveryGuide: string[]
  generatedAt: string
  model: { provider: 'local' | 'online'; name: string; version: string }
}

export type DailySecurityReport = {
  generatedAt: string
  kpis: Record<string, number | string>
  charts: any
  highlights: string[]
  topEvents: SecurityEvent[]
}

export type ThreatDetectionConfig = {
  trafficMbps: { enabled: boolean; windowSize: number; multiplier: number; minAbsThreshold: number }
  rps: { enabled: boolean; windowSize: number; multiplier: number; minAbsThreshold: number }
  scriptInjection: { enabled: boolean; patterns: string[] }
}

export type AlertingConfig = {
  feishu: { enabled: boolean; webhookUrl?: string }
  wecom: { enabled: boolean; webhookUrl?: string }
  sms: { enabled: boolean; provider?: string }
}

export type AlertMessage = {
  channel: 'feishu' | 'wecom' | 'sms'
  title: string
  content: string
  severity: SecuritySeverity
  eventId?: string
  occurredAt: string
}

export type StoredDailySecurityReport = DailySecurityReport & { id: string }

export type StoredVulnerabilityScan = {
  id: string
  scanId: string
  startedAt: string
  findings: Array<{ id: string; title: string; severity: SecuritySeverity; affectedAsset: string; cve?: string }>
}

export type StoredComplianceAssessment = {
  id: string
  assessedAt: string
  controls: Array<{ id: string; name: string; status: 'pass' | 'fail' | 'warn'; requirement: string }>
}

export async function listSecurityEvents(limit: number = 200): Promise<SecurityEvent[]> {
  const res = await fetchJSON<{ success: boolean; data: SecurityEvent[] }>(apiUrl(`/api/security/events?limit=${limit}`))
  return res?.data || []
}

export async function getSecurityEvent(eventId: string): Promise<SecurityEvent | null> {
  const res = await fetchJSON<{ success: boolean; data: SecurityEvent }>(apiUrl(`/api/security/events/${encodeURIComponent(eventId)}`))
  return res?.data || null
}

export async function patchSecurityEvent(eventId: string, patch: Partial<Pick<SecurityEvent, 'status' | 'recoveryProgress'>> & { timelineAppend?: string }): Promise<SecurityEvent | null> {
  const res = await fetchJSON<{ success: boolean; data: SecurityEvent }>(apiUrl(`/api/security/events/${encodeURIComponent(eventId)}`), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
  return res?.data || null
}

export async function generateIncidentReport(eventId: string): Promise<IncidentReport | null> {
  const res = await fetchJSON<{ success: boolean; data: IncidentReport }>(apiUrl('/api/security/reports/incident'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventId }),
  })
  return res?.data || null
}

export async function getDailySecurityReport(): Promise<DailySecurityReport | null> {
  const res = await fetchJSON<{ success: boolean; data: DailySecurityReport }>(apiUrl('/api/security/reports/daily'))
  return res?.data || null
}

export async function generateDailySecurityReportAndStore(): Promise<StoredDailySecurityReport | null> {
  const res = await fetchJSON<{ success: boolean; data: StoredDailySecurityReport }>(apiUrl('/api/security/reports/daily/generate'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  })
  return res?.data || null
}

export async function listDailySecurityReportHistory(limit: number = 30): Promise<StoredDailySecurityReport[]> {
  const res = await fetchJSON<{ success: boolean; data: StoredDailySecurityReport[] }>(apiUrl(`/api/security/reports/daily/history?limit=${limit}`))
  return res?.data || []
}

export async function getDailySecurityReportById(id: string): Promise<StoredDailySecurityReport | null> {
  const res = await fetchJSON<{ success: boolean; data: StoredDailySecurityReport }>(apiUrl(`/api/security/reports/daily/${encodeURIComponent(id)}`))
  return res?.data || null
}

export async function runVulnerabilityScan(): Promise<StoredVulnerabilityScan | null> {
  const res = await fetchJSON<{ success: boolean; data: StoredVulnerabilityScan }>(apiUrl('/api/security/risk/vuln-scan'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  })
  return res?.data || null
}

export async function listVulnerabilityScanHistory(limit: number = 30): Promise<StoredVulnerabilityScan[]> {
  const res = await fetchJSON<{ success: boolean; data: StoredVulnerabilityScan[] }>(apiUrl(`/api/security/risk/vuln-scan/history?limit=${limit}`))
  return res?.data || []
}

export async function getVulnerabilityScanById(id: string): Promise<StoredVulnerabilityScan | null> {
  const res = await fetchJSON<{ success: boolean; data: StoredVulnerabilityScan }>(apiUrl(`/api/security/risk/vuln-scan/${encodeURIComponent(id)}`))
  return res?.data || null
}

export async function runComplianceAssessment(): Promise<StoredComplianceAssessment | null> {
  const res = await fetchJSON<{ success: boolean; data: StoredComplianceAssessment }>(apiUrl('/api/security/risk/compliance'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  })
  return res?.data || null
}

export async function listComplianceAssessmentHistory(limit: number = 30): Promise<StoredComplianceAssessment[]> {
  const res = await fetchJSON<{ success: boolean; data: StoredComplianceAssessment[] }>(apiUrl(`/api/security/risk/compliance/history?limit=${limit}`))
  return res?.data || []
}

export async function getComplianceAssessmentById(id: string): Promise<StoredComplianceAssessment | null> {
  const res = await fetchJSON<{ success: boolean; data: StoredComplianceAssessment }>(apiUrl(`/api/security/risk/compliance/${encodeURIComponent(id)}`))
  return res?.data || null
}

export async function listTelemetryHistory(limit: number = 300): Promise<SecurityTelemetrySample[]> {
  const res = await fetchJSON<{ success: boolean; data: SecurityTelemetrySample[] }>(apiUrl(`/api/security/telemetry/history?limit=${limit}`))
  return res?.data || []
}

export async function getThreatDetectionConfig(): Promise<ThreatDetectionConfig | null> {
  const res = await fetchJSON<{ success: boolean; data: ThreatDetectionConfig }>(apiUrl('/api/security/config/threat-detection'))
  return res?.data || null
}

export async function updateThreatDetectionConfig(patch: Partial<ThreatDetectionConfig>): Promise<ThreatDetectionConfig | null> {
  const res = await fetchJSON<{ success: boolean; data: any }>(apiUrl('/api/security/config/threat-detection'), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
  return res?.data || null
}

export async function getAlertingConfig(): Promise<AlertingConfig | null> {
  const res = await fetchJSON<{ success: boolean; data: AlertingConfig }>(apiUrl('/api/security/alerts/config'))
  return res?.data || null
}

export async function updateAlertingConfig(patch: Partial<AlertingConfig>): Promise<AlertingConfig | null> {
  const res = await fetchJSON<{ success: boolean; data: AlertingConfig }>(apiUrl('/api/security/alerts/config'), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
  return res?.data || null
}

export async function listAlertHistory(limit: number = 200): Promise<AlertMessage[]> {
  const res = await fetchJSON<{ success: boolean; data: AlertMessage[] }>(apiUrl(`/api/security/alerts/history?limit=${limit}`))
  return res?.data || []
}
