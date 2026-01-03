import { generateEmployees, generateNetworkTraffic, generateWebsiteVisits, generateRealtimeData, generateAIAnalysis, generateAIChatResponse, generateEmployeeReport, generateCompanyReport, generateAIUsageReport } from '../mock/mockData'
const shouldMock = ((import.meta as any).env?.VITE_USE_MOCK) !== 'false'

const originalFetch = window.fetch.bind(window)

function jsonResponse(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function notFound() {
  return jsonResponse({ success: false, error: 'API not found' }, 404)
}

if (shouldMock) {
  const employeesCache: any[] | null = generateEmployees(50)

  const reports: any[] = [
    {
      id: 'rpt_001',
      type: 'employee_behavior',
      title: '张三员工上网行为报告',
      description: '2024年1月15日张三的详细上网行为分析',
      status: 'completed',
      createdAt: '2024-01-15T09:00:00Z',
      completedAt: '2024-01-15T09:05:00Z',
      parameters: { employeeId: 'emp_001', employeeName: '张三', startDate: '2024-01-15', endDate: '2024-01-15' },
    },
    {
      id: 'rpt_002',
      type: 'company_behavior',
      title: '全员上网行为汇总报告',
      description: '2024年1月15日全公司员工上网行为汇总分析',
      status: 'completed',
      createdAt: '2024-01-15T10:00:00Z',
      completedAt: '2024-01-15T10:15:00Z',
      parameters: { startDate: '2024-01-15', endDate: '2024-01-15' },
    },
    {
      id: 'rpt_003',
      type: 'ai_usage',
      title: 'AI使用行为故事报告',
      description: '2024年1月15日AI工具使用情况的故事化呈现',
      status: 'generating',
      createdAt: '2024-01-15T11:00:00Z',
      parameters: { startDate: '2024-01-15', endDate: '2024-01-15' },
    },
  ]

  type SecuritySeverity = 'info' | 'low' | 'medium' | 'high' | 'critical'
  type SecurityEventStatus = 'open' | 'investigating' | 'mitigated' | 'resolved'
  type SecurityEvent = {
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

  const parseJsonBody = (init?: RequestInit): any => {
    if (!init?.body || typeof init.body !== 'string') return {}
    try {
      return JSON.parse(init.body)
    } catch (_) {
      return {}
    }
  }

  const parseFormBody = (init?: RequestInit): Record<string, string> => {
    if (!init?.body || typeof init.body !== 'string') return {}
    const params = new URLSearchParams(init.body)
    const out: Record<string, string> = {}
    for (const [k, v] of params.entries()) out[k] = v
    return out
  }

  const getHeaderValue = (headers: RequestInit['headers'], name: string): string => {
    if (!headers) return ''
    if (typeof (headers as any).get === 'function') return String((headers as any).get(name) || '')
    const record = headers as Record<string, any>
    return String(record?.[name] || record?.[name.toLowerCase()] || '')
  }

  const getBearerToken = (init?: RequestInit): string => {
    const raw = getHeaderValue(init?.headers, 'Authorization')
    if (!raw.startsWith('Bearer ')) return ''
    return raw.slice('Bearer '.length).trim()
  }

  const createId = (prefix: string): string => {
    return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`
  }

  const pick = <T,>(list: T[]): T => {
    return list[Math.floor(Math.random() * list.length)]
  }

  const createMockSecurityEvent = (): SecurityEvent => {
    const now = new Date().toISOString()
    const severities: SecuritySeverity[] = ['info', 'low', 'medium', 'high', 'critical']
    const types = ['traffic_spike', 'dynamic_threshold', 'script_injection', 'vulnerability', 'compliance']
    const type = pick(types)
    const severity = pick(severities)
    const title =
      type === 'traffic_spike'
        ? '疑似异常流量峰值'
        : type === 'dynamic_threshold'
          ? '动态阈值触发（请求速率异常）'
          : type === 'script_injection'
            ? '脚本注入特征命中'
            : type === 'vulnerability'
              ? '联网漏洞扫描发现风险'
              : '合规风险评估存在缺口'
    const description =
      type === 'traffic_spike'
        ? '监测到关键业务链路流量明显偏离基线'
        : type === 'dynamic_threshold'
          ? '请求速率超过动态阈值，疑似异常请求风暴'
          : type === 'script_injection'
            ? '疑似脚本注入/恶意载荷特征命中'
            : type === 'vulnerability'
              ? '漏洞扫描发现高危风险，建议尽快修复'
              : '等保评估发现多项控制项未通过'

    const progress = Math.floor(Math.random() * 90)
    const status: SecurityEventStatus = progress > 70 ? 'mitigated' : progress > 25 ? 'investigating' : 'open'

    return {
      id: createId('evt'),
      timestamp: now,
      title,
      type,
      severity,
      status,
      description,
      recoveryProgress: progress,
      indicators: [`type=${type}`, `sev=${severity}`],
      source: { service: type, deviceId: `dev_${Math.floor(Math.random() * 6) + 1}` },
      timeline: [
        { at: now, phase: 'detect', message: '检测到可疑行为，已自动立案' },
        { at: now, phase: status, message: '处置进展已记录' },
      ],
    }
  }

  const securityEvents: SecurityEvent[] = Array.from({ length: 18 }, () => createMockSecurityEvent())
  const dailyReports: any[] = []
  const vulnerabilityScans: any[] = []
  const complianceAssessments: any[] = []

  const llmUsers = new Map<string, { id: string; username: string; email: string; password: string; role: string }>()
  const llmTokens = new Map<string, { username: string }>()
  const llmConversations: any[] = []

  let threatConfig: any = {
    trafficMbps: { enabled: true, windowSize: 20, multiplier: 2.8, minAbsThreshold: 450 },
    rps: { enabled: true, windowSize: 20, multiplier: 2.6, minAbsThreshold: 900 },
    scriptInjection: { enabled: true, patterns: ['<script\\\\b', 'onerror\\\\s*=\\\\s*'] },
  }

  let alertingConfig: any = {
    feishu: { enabled: true, webhookUrl: '' },
    wecom: { enabled: true, webhookUrl: '' },
    sms: { enabled: false, provider: 'mock' },
  }

  const alertHistory: any[] = []

  const createDailyReport = (): any => {
    const now = new Date().toISOString()
    const total = securityEvents.length
    const openIncidents = securityEvents.filter((e) => e.status !== 'resolved').length
    const highCount = securityEvents.filter((e) => e.severity === 'high' || e.severity === 'critical').length
    return {
      id: createId('daily'),
      generatedAt: now,
      kpis: {
        totalEvents: total,
        openIncidents,
        highSeverityRate: total > 0 ? Number(((highCount / total) * 100).toFixed(2)) : 0,
        telemetrySamples24h: 86400,
      },
      charts: {},
      highlights: [
        highCount > 0 ? `高危/严重事件 ${highCount} 起，建议优先复核处置闭环` : '未检测到高危事件',
        openIncidents > 0 ? `仍有 ${openIncidents} 起事件未闭环，建议更新恢复进度与复盘条目` : '事件闭环情况良好',
      ],
      topEvents: securityEvents.slice(0, 5),
    }
  }

  const createVulnerabilityScan = (): any => {
    const scanId = `scan_${Date.now()}`
    const startedAt = new Date().toISOString()
    const severities: SecuritySeverity[] = ['low', 'medium', 'high', 'critical']
    const findings = Array.from({ length: Math.floor(Math.random() * 8) + 3 }, (_, idx) => ({
      id: `vuln_${Date.now()}_${idx}`,
      title: pick(['弱口令风险', '未打补丁组件漏洞', '不安全的TLS配置', '目录遍历风险', '高危组件版本暴露']),
      severity: pick(severities),
      affectedAsset: pick(['web-01', 'api-02', 'db-01', 'gateway', 'bastion']),
      cve: Math.random() > 0.4 ? `CVE-2024-${Math.floor(Math.random() * 9000) + 1000}` : undefined,
    }))
    const entry = { id: createId('vuln'), scanId, startedAt, findings }
    vulnerabilityScans.unshift(entry)
    return entry
  }

  const createComplianceAssessment = (): any => {
    const assessedAt = new Date().toISOString()
    const controls = Array.from({ length: 10 }, (_, idx) => ({
      id: `C-${String(idx + 1).padStart(2, '0')}`,
      name: pick(['访问控制', '审计日志', '口令策略', '主机加固', '边界防护']),
      status: pick(['pass', 'warn', 'fail']),
      requirement: pick(['满足等保2.0三级要求', '建议补齐审计策略', '建议开启MFA与最小权限']),
    }))
    const entry = { id: createId('compliance'), assessedAt, controls }
    complianceAssessments.unshift(entry)
    return entry
  }

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const urlStr = typeof input === 'string' ? input : (input as URL).toString()
      const u = new URL(urlStr, window.location.origin)
      const method = (init?.method || 'GET').toUpperCase()
      const path = u.pathname

      if (!path.startsWith('/api/')) {
        return originalFetch(input, init)
      }

      // LLM backend compatible mocks
      if (path.startsWith('/api/v1/')) {
        if (path === '/api/v1/auth/register' && method === 'POST') {
          const body = parseJsonBody(init)
          const username = String(body?.username || '').trim()
          const email = String(body?.email || '').trim()
          const password = String(body?.password || '')
          if (!username || !email || !password) {
            return jsonResponse({ detail: 'invalid payload' }, 400)
          }
          if (!llmUsers.has(username)) {
            llmUsers.set(username, { id: createId('user'), username, email, password, role: 'user' })
          }
          const u = llmUsers.get(username)!
          return jsonResponse({ id: u.id, username: u.username, email: u.email, role: u.role })
        }

        if (path === '/api/v1/auth/login' && method === 'POST') {
          const form = parseFormBody(init)
          const username = String(form?.username || '').trim()
          const password = String(form?.password || '')
          const u = llmUsers.get(username)
          if (!u || u.password !== password) {
            return jsonResponse({ detail: 'invalid credentials' }, 401)
          }
          const token = `mock_${createId('token')}`
          llmTokens.set(token, { username })
          return jsonResponse({ access_token: token, token_type: 'bearer' })
        }

        if (path === '/api/v1/conversations' && method === 'POST') {
          const token = getBearerToken(init)
          if (!token || !llmTokens.has(token)) return jsonResponse({ detail: 'unauthorized' }, 401)
          const id = createId('conv')
          const now = new Date().toISOString()
          llmConversations.unshift({ id, created_at: now, updated_at: now })
          return jsonResponse({ id })
        }

        if (path === '/api/v1/conversations' && method === 'GET') {
          const token = getBearerToken(init)
          if (!token || !llmTokens.has(token)) return jsonResponse({ detail: 'unauthorized' }, 401)
          return jsonResponse(llmConversations)
        }

        const msgMatch = path.match(/^\/api\/v1\/conversations\/([^/]+)\/messages$/)
        if (msgMatch && method === 'POST') {
          const token = getBearerToken(init)
          if (!token || !llmTokens.has(token)) return jsonResponse({ detail: 'unauthorized' }, 401)
          const body = parseJsonBody(init)
          const content = String(body?.content || '')
          const assistant_response = generateAIChatResponse(content)
          return jsonResponse({ contains_sensitive_words: false, sensitive_words_found: [], assistant_response })
        }
      }

      // network
      if (method === 'GET' && path === '/api/network/realtime') {
        return jsonResponse({ success: true, data: generateRealtimeData() })
      }
      if (method === 'GET' && path === '/api/network/traffic') {
        const hours = parseInt(u.searchParams.get('hours') || '24')
        return jsonResponse({ success: true, data: generateNetworkTraffic(hours) })
      }
      if (method === 'GET' && path === '/api/network/websites') {
        return jsonResponse({ success: true, data: generateWebsiteVisits() })
      }

      // employees list
      if (method === 'GET' && path === '/api/employees') {
        const page = parseInt(u.searchParams.get('page') || '1')
        const limit = parseInt(u.searchParams.get('limit') || '10')
        const department = u.searchParams.get('department') || ''
        const riskLevel = u.searchParams.get('riskLevel') || ''
        let list = employeesCache || []
        if (department) list = list.filter((e) => e.department === department)
        if (riskLevel) list = list.filter((e) => e.riskLevel === riskLevel)
        const start = (page - 1) * limit
        const end = start + limit
        const slice = list.slice(start, end).map((e, idx) => ({
          id: e.id,
          employeeId: `E${String(start + idx + 1).padStart(4, '0')}`,
          name: e.name,
          department: e.department,
          position: e.position,
          email: e.email,
          isOnline: e.isOnline,
          todayTraffic: e.todayTraffic,
          riskLevel: e.riskLevel,
          lastActiveTime: e.lastActivity,
          websiteVisits: Math.floor(Math.random() * 30) + 5,
          onlineHours: Math.floor(Math.random() * 8) + 1,
        }))
        return jsonResponse({ success: true, data: { employees: slice, total: list.length, currentPage: page, totalPages: Math.ceil(list.length / limit) } })
      }
      if (method === 'GET' && path === '/api/employees/stats/departments') {
        const stats: Record<string, any> = {};
        (employeesCache || []).forEach((e) => {
          const d = e.department
          stats[d] ||= { totalEmployees: 0, onlineEmployees: 0, totalTraffic: 0, highRiskCount: 0 }
          stats[d].totalEmployees++
          if (e.isOnline) stats[d].onlineEmployees++
          stats[d].totalTraffic += e.todayTraffic
          if (e.riskLevel === 'high') stats[d].highRiskCount++
        })
        return jsonResponse({ success: true, data: stats })
      }

      // AI analysis (overview stats)
      if (method === 'GET' && path === '/api/ai/stats') {
        const data = {
          anomalyCount: Math.floor(Math.random() * 40) + 10,
          anomalyIncrease: Math.floor(Math.random() * 20),
          riskScore: Math.floor(Math.random() * 40) + 50,
          modelAccuracy: Math.floor(Math.random() * 5) + 92,
          dataProcessed: Math.floor(Math.random() * 800) + 900,
        }
        return jsonResponse({ success: true, data })
      }
      if (method === 'GET' && path === '/api/ai/behavior-analysis') {
        const patterns = [
          { id: 1, description: '大量文件下载', severity: 'high', affectedEmployees: 12, confidence: 86 },
          { id: 2, description: '非工作时间访问', severity: 'medium', affectedEmployees: 19, confidence: 78 },
          { id: 3, description: '异常网络流量', severity: 'high', affectedEmployees: 7, confidence: 81 },
          { id: 4, description: '敏感数据访问', severity: 'medium', affectedEmployees: 15, confidence: 74 },
        ]
        const riskMetrics = { dataLeakage: 15, malware: 8, unauthorizedAccess: 23 }
        return jsonResponse({ success: true, data: { patterns, riskMetrics } })
      }
      if (method === 'GET' && path === '/api/ai/high-risk-employees') {
        const list = [
          { id: 'emp_1', name: '李明', department: '技术部', riskScore: 85, riskReason: '频繁访问敏感数据' },
          { id: 'emp_2', name: '王芳', department: '财务部', riskScore: 78, riskReason: '异常下载行为' },
          { id: 'emp_3', name: '张强', department: '市场部', riskScore: 72, riskReason: '非工作时间活跃' },
          { id: 'emp_4', name: '刘娜', department: '人事部', riskScore: 69, riskReason: '访问未授权网站' },
          { id: 'emp_5', name: '陈伟', department: '技术部', riskScore: 65, riskReason: '大量数据传输' },
        ]
        return jsonResponse({ success: true, data: list })
      }
      if (method === 'GET' && path === '/api/ai/security-suggestions') {
        const list = [
          { id: 1, title: '加强敏感数据访问控制', description: '建议实施更严格的权限管理和访问审计机制', priority: 'high' },
          { id: 2, title: '优化网络安全策略', description: '更新防火墙规则并加强网络监控', priority: 'high' },
          { id: 3, title: '员工安全培训', description: '开展网络安全意识培训', priority: 'medium' },
          { id: 4, title: '系统漏洞修复', description: '及时更新系统补丁', priority: 'medium' },
          { id: 5, title: '数据备份策略优化', description: '增加备份频次并验证完整性', priority: 'low' },
        ]
        return jsonResponse({ success: true, data: list })
      }
      if (method === 'GET' && path === '/api/ai/analytics-stats') {
        const data = {
          totalAnalyses: Math.floor(Math.random() * 1000) + 500,
          todayAnalyses: Math.floor(Math.random() * 50) + 20,
          riskDetections: Math.floor(Math.random() * 100) + 50,
          accuracyRate: 95.5 + Math.random() * 3,
          processingTime: Math.floor(Math.random() * 500) + 100,
          modelVersion: '2.1.0',
          lastUpdate: new Date().toISOString(),
        }
        return jsonResponse({ success: true, data })
      }
      if (path === '/api/ai/chat' && method === 'POST') {
        let body: any = {}
        if (init?.body && typeof init.body === 'string') {
          try { body = JSON.parse(init.body) } catch {}
        }
        const reply = generateAIChatResponse(body?.message || '')
        return jsonResponse({ success: true, data: { reply, suggestions: ['查看员工行为报告','设置安全策略','导出分析数据'], timestamp: new Date().toISOString() } })
      }
      if (path === '/api/ai/feedback' && method === 'POST') {
        return jsonResponse({ success: true, message: '反馈已收到' })
      }

      // reports
      if (method === 'GET' && path === '/api/reports') {
        const page = parseInt(u.searchParams.get('page') || '1')
        const limit = parseInt(u.searchParams.get('limit') || '10')
        const type = u.searchParams.get('type')
        const status = u.searchParams.get('status')
        let list = [...reports]
        if (type) list = list.filter((r) => r.type === type)
        if (status) list = list.filter((r) => r.status === status)
        const start = (page - 1) * limit
        const end = start + limit
        const paginated = list.slice(start, end)
        return jsonResponse({ success: true, data: { reports: paginated, total: list.length, page, limit, totalPages: Math.ceil(list.length / limit) } })
      }
      if (path === '/api/reports' && method === 'POST') {
        let body: any = {}
        if (init?.body && typeof init.body === 'string') {
          try { body = JSON.parse(init.body) } catch {}
        }
        const type = body?.type
        const parameters = body?.parameters || {}
        const id = `rpt_${Date.now()}`
        let title = ''
        let description = ''
        if (type === 'employee_behavior') {
          title = `${parameters.employeeName || '员工'}员工上网行为报告`
          description = `${parameters.startDate}至${parameters.endDate}期间${parameters.employeeName || ''}的详细上网行为分析`
        } else if (type === 'company_behavior') {
          title = '全员上网行为汇总报告'
          description = `${parameters.startDate}至${parameters.endDate}期间全公司员工上网行为汇总分析`
        } else if (type === 'ai_usage') {
          title = 'AI使用行为故事报告'
          description = `${parameters.startDate}至${parameters.endDate}期间AI工具使用情况的故事化呈现`
        }
        const newReport = { id, type, title, description, status: 'generating', createdAt: new Date().toISOString(), parameters }
        reports.unshift(newReport)
        setTimeout(() => {
          const idx = reports.findIndex((r) => r.id === id)
          if (idx !== -1) {
            reports[idx].status = 'completed'
            reports[idx].completedAt = new Date().toISOString()
          }
        }, 1500)
        return jsonResponse({ success: true, data: newReport, message: '报告生成任务已创建，正在后台处理' })
      }
      if (path.startsWith('/api/reports/') && method === 'GET') {
        const id = path.split('/').pop() as string
        const r = reports.find((x) => x.id === id)
        if (!r) return notFound()
        if (r.status === 'completed' && !r.data) {
          if (r.type === 'employee_behavior') r.data = generateEmployeeReport(r.parameters?.employeeId || 'emp_001')
          else if (r.type === 'company_behavior') r.data = generateCompanyReport()
          else if (r.type === 'ai_usage') r.data = generateAIUsageReport()
        }
        return jsonResponse({ success: true, data: r })
      }
      if (path.startsWith('/api/reports/') && method === 'DELETE') {
        const id = path.split('/').pop() as string
        const idx = reports.findIndex((x) => x.id === id)
        if (idx === -1) return notFound()
        reports.splice(idx, 1)
        return jsonResponse({ success: true, message: '报告删除成功' })
      }

      // security ops
      if (path === '/api/security/events' && method === 'GET') {
        const limit = parseInt(u.searchParams.get('limit') || '200')
        return jsonResponse({ success: true, data: securityEvents.slice(0, limit) })
      }
      if (path.startsWith('/api/security/events/') && method === 'GET') {
        const id = path.split('/').pop() as string
        const item = securityEvents.find((x) => x.id === id)
        if (!item) return jsonResponse({ success: false, message: '事件不存在' }, 404)
        return jsonResponse({ success: true, data: item })
      }
      if (path.startsWith('/api/security/events/') && method === 'PATCH') {
        const id = path.split('/').pop() as string
        const patch = parseJsonBody(init)
        const idx = securityEvents.findIndex((x) => x.id === id)
        if (idx === -1) return jsonResponse({ success: false, message: '事件不存在' }, 404)
        const current = securityEvents[idx]
        const next = { ...current, ...patch }
        if (typeof patch?.timelineAppend === 'string' && patch.timelineAppend.trim().length > 0) {
          next.timeline = [...(current.timeline || []), { at: new Date().toISOString(), phase: String(next.status || current.status), message: patch.timelineAppend }]
        }
        securityEvents[idx] = next
        return jsonResponse({ success: true, data: next })
      }
      if (path === '/api/security/reports/incident' && method === 'POST') {
        const body = parseJsonBody(init)
        const eventId = body?.eventId
        const e = securityEvents.find((x) => x.id === eventId)
        if (!e) return jsonResponse({ success: false, message: '事件不存在' }, 404)
        const report = {
          eventId: e.id,
          title: e.title,
          severity: e.severity,
          summary: `系统检测到「${e.type}」类事件，当前状态：${e.status}，恢复进度：${e.recoveryProgress}%`,
          impact: '可能影响关键业务的可用性/数据安全，建议根据业务优先级进行分级处置。',
          iocs: (e.indicators || []).slice(0, 12),
          recommendedFixes: ['确认告警来源与影响范围', '封禁/限流可疑来源', '检索同类IOC', '补丁核验与配置加固'],
          recoveryGuide: ['启用降级策略', '验证核心接口指标回归基线', '复核告警稳定性并记录关键时间点'],
          generatedAt: new Date().toISOString(),
          model: { provider: 'local', name: 'mock', version: '0.0.0' },
        }
        return jsonResponse({ success: true, data: report })
      }
      if (path === '/api/security/reports/daily' && method === 'GET') {
        const data = createDailyReport()
        return jsonResponse({ success: true, data })
      }
      if (path === '/api/security/reports/daily/generate' && method === 'POST') {
        const entry = createDailyReport()
        dailyReports.unshift(entry)
        return jsonResponse({ success: true, data: entry })
      }
      if (path === '/api/security/reports/daily/history' && method === 'GET') {
        const limit = parseInt(u.searchParams.get('limit') || '30')
        return jsonResponse({ success: true, data: dailyReports.slice(0, limit) })
      }
      if (path.startsWith('/api/security/reports/daily/') && method === 'GET') {
        const id = path.split('/').pop() as string
        const item = dailyReports.find((x) => x.id === id)
        if (!item) return jsonResponse({ success: false, message: '日报不存在' }, 404)
        return jsonResponse({ success: true, data: item })
      }
      if (path === '/api/security/risk/vuln-scan' && method === 'POST') {
        const entry = createVulnerabilityScan()
        return jsonResponse({ success: true, data: entry })
      }
      if (path === '/api/security/risk/vuln-scan/history' && method === 'GET') {
        const limit = parseInt(u.searchParams.get('limit') || '30')
        return jsonResponse({ success: true, data: vulnerabilityScans.slice(0, limit) })
      }
      if (path.startsWith('/api/security/risk/vuln-scan/') && method === 'GET') {
        const id = path.split('/').pop() as string
        const item = vulnerabilityScans.find((x) => x.id === id)
        if (!item) return jsonResponse({ success: false, message: '扫描不存在' }, 404)
        return jsonResponse({ success: true, data: item })
      }
      if (path === '/api/security/risk/compliance' && method === 'POST') {
        const entry = createComplianceAssessment()
        return jsonResponse({ success: true, data: entry })
      }
      if (path === '/api/security/risk/compliance/history' && method === 'GET') {
        const limit = parseInt(u.searchParams.get('limit') || '30')
        return jsonResponse({ success: true, data: complianceAssessments.slice(0, limit) })
      }
      if (path.startsWith('/api/security/risk/compliance/') && method === 'GET') {
        const id = path.split('/').pop() as string
        const item = complianceAssessments.find((x) => x.id === id)
        if (!item) return jsonResponse({ success: false, message: '评估不存在' }, 404)
        return jsonResponse({ success: true, data: item })
      }
      if (path === '/api/security/config/threat-detection' && method === 'GET') {
        return jsonResponse({ success: true, data: threatConfig })
      }
      if (path === '/api/security/config/threat-detection' && method === 'PATCH') {
        const patch = parseJsonBody(init)
        threatConfig = { ...threatConfig, ...(patch || {}) }
        return jsonResponse({ success: true, data: threatConfig })
      }
      if (path === '/api/security/alerts/config' && method === 'GET') {
        return jsonResponse({ success: true, data: alertingConfig })
      }
      if (path === '/api/security/alerts/config' && method === 'PATCH') {
        const patch = parseJsonBody(init)
        alertingConfig = { ...alertingConfig, ...(patch || {}) }
        return jsonResponse({ success: true, data: alertingConfig })
      }
      if (path === '/api/security/alerts/history' && method === 'GET') {
        const limit = parseInt(u.searchParams.get('limit') || '100')
        return jsonResponse({ success: true, data: alertHistory.slice(0, limit) })
      }
      if (path === '/api/security/postmortems' && method === 'POST') {
        const body = parseJsonBody(init)
        alertHistory.unshift({
          channel: 'feishu',
          title: '复盘已创建',
          content: `eventId=${body?.eventId || ''}`,
          severity: 'info',
          occurredAt: new Date().toISOString(),
        })
        return jsonResponse({ success: true, data: { ok: true } })
      }

      return notFound()
    } catch (e) {
      return jsonResponse({ success: false, error: 'Mock error' }, 500)
    }
  }
}
