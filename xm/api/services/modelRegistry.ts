export type ModelProvider = 'local' | 'online'

export type ModelDescriptor = {
  id: string
  provider: ModelProvider
  name: string
  version: string
  capabilities: string[]
  active: boolean
  createdAt: string
}

type RegistryState = {
  models: ModelDescriptor[]
}

const registry: RegistryState = {
  models: [
    {
      id: 'local-secops-1.0.0',
      provider: 'local',
      name: 'local-secops',
      version: '1.0.0',
      capabilities: ['incident_report', 'daily_report', 'policy_query'],
      active: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'online-secops-2025-12',
      provider: 'online',
      name: 'online-secops',
      version: '2025-12',
      capabilities: ['incident_report', 'daily_report', 'ppt_generation'],
      active: true,
      createdAt: new Date().toISOString(),
    },
  ],
}

export function listModels(provider?: ModelProvider): ModelDescriptor[] {
  const ms = provider ? registry.models.filter((m) => m.provider === provider) : registry.models
  return ms.slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

export function registerModel(input: Omit<ModelDescriptor, 'active' | 'createdAt'> & Partial<Pick<ModelDescriptor, 'active'>>): ModelDescriptor {
  const createdAt = new Date().toISOString()
  const model: ModelDescriptor = {
    ...input,
    active: Boolean(input.active),
    createdAt,
  }
  registry.models = [model, ...registry.models].slice(0, 200)
  if (model.active) activateModel(model.provider, model.id)
  return model
}

export function activateModel(provider: ModelProvider, modelId: string): ModelDescriptor | null {
  const target = registry.models.find((m) => m.id === modelId && m.provider === provider)
  if (!target) return null
  registry.models = registry.models.map((m) => (m.provider === provider ? { ...m, active: m.id === modelId } : m))
  return registry.models.find((m) => m.id === modelId) || null
}

export function getActiveModel(provider: ModelProvider): ModelDescriptor {
  const active = registry.models.find((m) => m.provider === provider && m.active)
  if (active) return active
  const fallback = registry.models.find((m) => m.provider === provider)
  if (fallback) return fallback
  return {
    id: `${provider}-unknown`,
    provider,
    name: `${provider}-unknown`,
    version: '0',
    capabilities: [],
    active: true,
    createdAt: new Date().toISOString(),
  }
}

