import { computed, ref } from 'vue'

export type DashboardWidgetId =
  | 'realtime_cards'
  | 'traffic_trend'
  | 'website_hot'
  | 'ai_insights'
  | 'system_resource'
  | 'department_stats'
  | 'recent_alerts'

export type DashboardWidgetLayout = {
  order: number
  colSpan: number
  rowSpan: number
  hidden?: boolean
}

export type DashboardTemplate = {
  id: string
  name: string
  updatedAt: string
  layout: Record<DashboardWidgetId, DashboardWidgetLayout>
}

const STORAGE_TEMPLATES_KEY = 'dashboard_layout_templates_v1'
const STORAGE_ACTIVE_ID_KEY = 'dashboard_layout_active_template_id_v1'

function clampInt(n: unknown, min: number, max: number, fallback: number): number {
  const v = typeof n === 'number' ? n : Number(n)
  if (!Number.isFinite(v)) return fallback
  const i = Math.round(v)
  return Math.max(min, Math.min(max, i))
}

function nowIso(): string {
  return new Date().toISOString()
}

function createDefaultTemplate(): DashboardTemplate {
  const layout: DashboardTemplate['layout'] = {
    realtime_cards: { order: 10, colSpan: 12, rowSpan: 1, hidden: false },
    traffic_trend: { order: 20, colSpan: 6, rowSpan: 1, hidden: false },
    website_hot: { order: 30, colSpan: 6, rowSpan: 1, hidden: false },
    ai_insights: { order: 40, colSpan: 12, rowSpan: 1, hidden: false },
    system_resource: { order: 50, colSpan: 4, rowSpan: 1, hidden: false },
    department_stats: { order: 60, colSpan: 4, rowSpan: 1, hidden: false },
    recent_alerts: { order: 70, colSpan: 4, rowSpan: 1, hidden: false },
  }
  return {
    id: 'default',
    name: '默认模板',
    updatedAt: nowIso(),
    layout,
  }
}

function safeParseJson<T>(input: string | null): T | null {
  if (!input) return null
  try {
    return JSON.parse(input) as T
  } catch (_) {
    return null
  }
}

function normalizeTemplate(input: any): DashboardTemplate | null {
  if (!input || typeof input !== 'object') return null
  if (typeof input.id !== 'string' || typeof input.name !== 'string') return null
  const base = createDefaultTemplate()
  const layoutIn = input.layout && typeof input.layout === 'object' ? input.layout : {}

  const nextLayout: DashboardTemplate['layout'] = { ...base.layout }
  ;(Object.keys(base.layout) as DashboardWidgetId[]).forEach((k) => {
    const raw = layoutIn[k] || {}
    nextLayout[k] = {
      order: clampInt(raw.order, 0, 9999, base.layout[k].order),
      colSpan: clampInt(raw.colSpan, 1, 12, base.layout[k].colSpan),
      rowSpan: clampInt(raw.rowSpan, 1, 6, base.layout[k].rowSpan),
      hidden: typeof raw.hidden === 'boolean' ? raw.hidden : base.layout[k].hidden,
    }
  })

  return {
    id: input.id,
    name: input.name,
    updatedAt: typeof input.updatedAt === 'string' ? input.updatedAt : nowIso(),
    layout: nextLayout,
  }
}

function loadTemplatesFromStorage(): DashboardTemplate[] {
  const parsed = safeParseJson<any[]>(localStorage.getItem(STORAGE_TEMPLATES_KEY))
  const list = Array.isArray(parsed) ? parsed.map(normalizeTemplate).filter(Boolean) as DashboardTemplate[] : []
  const hasDefault = list.some((t) => t.id === 'default')
  return hasDefault ? list : [createDefaultTemplate(), ...list]
}

function saveTemplatesToStorage(templates: DashboardTemplate[]): void {
  localStorage.setItem(STORAGE_TEMPLATES_KEY, JSON.stringify(templates))
}

function loadActiveIdFromStorage(): string | null {
  const id = localStorage.getItem(STORAGE_ACTIVE_ID_KEY)
  return typeof id === 'string' && id.trim().length > 0 ? id : null
}

function saveActiveIdToStorage(id: string): void {
  localStorage.setItem(STORAGE_ACTIVE_ID_KEY, id)
}

function createId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`
}

/**
 * useDashboardLayout
 * 管理大屏布局模板（本地持久化：模板列表 + 当前激活模板）。
 */
export function useDashboardLayout() {
  const templates = ref<DashboardTemplate[]>(loadTemplatesFromStorage())
  const activeTemplateId = ref<string>(loadActiveIdFromStorage() || 'default')

  const activeTemplate = computed(() => {
    return templates.value.find((t) => t.id === activeTemplateId.value) || templates.value[0] || createDefaultTemplate()
  })

  const widgets = computed(() => {
    const entries = Object.entries(activeTemplate.value.layout) as Array<[DashboardWidgetId, DashboardWidgetLayout]>
    return entries
      .map(([id, layout]) => ({ id, layout }))
      .sort((a, b) => (a.layout.order || 0) - (b.layout.order || 0))
  })

  function persist(nextTemplates?: DashboardTemplate[]): void {
    const list = nextTemplates || templates.value
    templates.value = list
    saveTemplatesToStorage(list)
    saveActiveIdToStorage(activeTemplateId.value)
  }

  function setActiveTemplate(id: string): void {
    activeTemplateId.value = id
    persist()
  }

  function updateActiveWidgetLayout(widgetId: DashboardWidgetId, patch: Partial<DashboardWidgetLayout>): void {
    const current = activeTemplate.value
    const next: DashboardTemplate = {
      ...current,
      updatedAt: nowIso(),
      layout: {
        ...current.layout,
        [widgetId]: {
          ...current.layout[widgetId],
          ...patch,
          colSpan: clampInt(patch.colSpan ?? current.layout[widgetId].colSpan, 1, 12, current.layout[widgetId].colSpan),
          rowSpan: clampInt(patch.rowSpan ?? current.layout[widgetId].rowSpan, 1, 6, current.layout[widgetId].rowSpan),
          order: clampInt(patch.order ?? current.layout[widgetId].order, 0, 9999, current.layout[widgetId].order),
        },
      },
    }

    const nextTemplates = templates.value.map((t) => (t.id === current.id ? next : t))
    persist(nextTemplates)
  }

  function reorderWidgets(sourceId: DashboardWidgetId, targetId: DashboardWidgetId): void {
    const current = activeTemplate.value
    const a = current.layout[sourceId]
    const b = current.layout[targetId]
    updateActiveWidgetLayout(sourceId, { order: b.order })
    updateActiveWidgetLayout(targetId, { order: a.order })
  }

  function resetActiveToDefaultLayout(): void {
    const base = createDefaultTemplate().layout
    const current = activeTemplate.value
    const next: DashboardTemplate = {
      ...current,
      updatedAt: nowIso(),
      layout: { ...base },
    }
    const nextTemplates = templates.value.map((t) => (t.id === current.id ? next : t))
    persist(nextTemplates)
  }

  function createTemplate(name: string): DashboardTemplate {
    const base = activeTemplate.value
    const t: DashboardTemplate = {
      id: createId('tpl'),
      name: name.trim() || '新模板',
      updatedAt: nowIso(),
      layout: JSON.parse(JSON.stringify(base.layout)) as DashboardTemplate['layout'],
    }
    const nextTemplates = [t, ...templates.value.filter((x) => x.id !== t.id)]
    templates.value = nextTemplates
    activeTemplateId.value = t.id
    persist(nextTemplates)
    return t
  }

  function renameTemplate(id: string, name: string): void {
    const nextTemplates = templates.value.map((t) =>
      t.id === id ? { ...t, name: name.trim() || t.name, updatedAt: nowIso() } : t,
    )
    persist(nextTemplates)
  }

  function deleteTemplate(id: string): void {
    if (id === 'default') return
    const nextTemplates = templates.value.filter((t) => t.id !== id)
    if (activeTemplateId.value === id) {
      activeTemplateId.value = 'default'
    }
    persist(nextTemplates.length > 0 ? nextTemplates : [createDefaultTemplate()])
  }

  return {
    templates,
    activeTemplateId,
    activeTemplate,
    widgets,
    setActiveTemplate,
    updateActiveWidgetLayout,
    reorderWidgets,
    resetActiveToDefaultLayout,
    createTemplate,
    renameTemplate,
    deleteTemplate,
  }
}

