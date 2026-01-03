<template>
  <div id="app" class="min-h-screen bg-[#0a0f1c] text-gray-100 font-sans selection:bg-blue-500/30 selection:text-blue-200">
    <!-- 导航栏 -->
    <nav class="bg-[#0a0f1c]/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-[2147483647]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Logo和标题 -->
          <div class="flex items-center gap-4">
            <div class="flex-shrink-0 flex items-center group cursor-pointer" @click="router.push('/')">
              <div class="relative">
                <div class="absolute inset-0 bg-blue-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <ShieldIcon class="relative w-7 h-7 text-blue-500 mr-3 transform group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h1 class="text-lg font-bold text-white tracking-wide">企业网络监控系统</h1>
            </div>
            
            <!-- 分隔符 -->
            <div class="h-6 w-px bg-white/10 mx-2 hidden md:block"></div>
            
            <!-- 导航菜单 -->
            <div class="hidden md:flex items-center gap-1">
              <router-link
                v-for="route in primaryNavigationRoutes"
                :key="route.name"
                :to="{ name: route.name }"
                class="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap"
                :class="isActiveRoute(route.name) 
                  ? 'text-white bg-blue-500/10 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'"
              >
                <component 
                  :is="getIcon(route.meta.icon)" 
                  class="w-4 h-4 transition-colors duration-200"
                  :class="isActiveRoute(route.name) ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'"
                />
                <span>{{ route.meta.title }}</span>
              </router-link>

              <t-dropdown
                v-for="g in navGroups"
                :key="g.key"
                :options="g.options"
                @click="handleGroupMenuClick"
              >
                <button
                  class="group flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap border"
                  :class="g.active
                    ? 'text-white bg-blue-500/10 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border-transparent'"
                >
                  <component
                    :is="getIcon(g.icon)"
                    class="w-4 h-4 transition-colors duration-200"
                    :class="g.active ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'"
                  />
                  <span>{{ g.title }}</span>
                </button>
              </t-dropdown>
            </div>

            <div class="flex md:hidden items-center">
              <t-dropdown :options="mobileMenuOptions" @click="handleGroupMenuClick">
                <button class="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap text-gray-200 hover:text-white hover:bg-white/5 border border-white/10">
                  <span>菜单</span>
                </button>
              </t-dropdown>
            </div>
          </div>

          <!-- 用户信息 -->
          <div class="flex items-center gap-4">
            <!-- 通知图标 -->
            <button class="relative p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5">
              <BellIcon class="w-5 h-5" />
              <span class="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse"></span>
            </button>

            <!-- 用户头像 -->
            <div class="flex items-center gap-3 pl-4 border-l border-white/5">
              <div class="flex flex-col items-end hidden sm:flex">
                <span class="text-sm font-medium text-white">管理员</span>
                <span class="text-xs text-gray-500">安全运维部</span>
              </div>
              <div class="relative group cursor-pointer">
                <div class="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div class="relative w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-colors">
                  <UserIcon class="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主要内容区域 -->
    <main class="flex-1 relative">
      <!-- 背景装饰 -->
      <div class="fixed inset-0 pointer-events-none z-0">
        <div class="absolute top-0 left-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-[128px]"></div>
        <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-[128px]"></div>
      </div>
      
      <div class="relative z-10">
        <router-view />
      </div>
    </main>

    <SecurityIncidentPopup
      :visible="incidentPopupVisible"
      :event="incidentPopupEvent"
      @dismiss="incidentPopupVisible = false"
      @open="openIncident"
    />

    <!-- 页脚 -->
    <footer class="bg-[#0a0f1c] border-t border-white/5 py-6 mt-auto relative z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4">
          <p class="text-gray-500 text-sm">
            © 2024 企业网络监控系统. All rights reserved.
          </p>
          <div class="flex items-center space-x-6 text-sm">
            <div class="flex items-center space-x-2 text-gray-500">
              <span>系统状态:</span>
              <span class="flex items-center text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full border border-green-400/20">
                <span class="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5 animate-pulse"></span>
                正常运行
              </span>
            </div>
            <div class="text-gray-600">v1.0.0</div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  ShieldIcon, 
  MonitorIcon, 
  UsersIcon, 
  BrainIcon, 
  MessageCircleIcon,
  BellIcon,
  UserIcon
} from 'lucide-vue-next'
import SecurityIncidentPopup from './components/SecurityIncidentPopup.vue'
import type { SecurityEvent } from './lib/securityApi'
import { apiUrl } from './lib/http'

const route = useRoute()
const router = useRouter()

// 启用 TDesign 暗色模式
onMounted(() => {
  document.documentElement.setAttribute('theme-mode', 'dark')
})

const incidentPopupVisible = ref(false)
const incidentPopupEvent = ref<SecurityEvent | null>(null)
let sse: EventSource | null = null
const lastPopupAt = ref(0)
const lastPopupEventId = ref<string | null>(null)

// 导航路由配置
const navigationRoutes = computed(() => {
  return router.getRoutes().filter(route => 
    route.meta && 
    route.meta.title && 
    route.name !== 'home' &&
    !route.meta.hideFromNav &&
    // 排除需要参数的详情页路由
    !route.path.includes(':id')
  )
})

const primaryNavOrder = ['dashboard', 'employees', 'ai-analysis', 'ai-chat', 'security-ops'] as const

const primaryNavigationRoutes = computed(() => {
  const byName = new Map<string, any>()
  for (const r of navigationRoutes.value) {
    if (typeof r.name === 'string') byName.set(r.name, r)
  }
  return primaryNavOrder.map((name) => byName.get(name)).filter(Boolean)
})

const navGroups = computed(() => {
  const byName = new Map<string, any>()
  for (const r of navigationRoutes.value) {
    if (typeof r.name === 'string') byName.set(r.name, r)
  }

  const groups = [
    { key: 'kanban', title: '看板', icon: 'monitor', routeNames: ['kanban', 'dashboard-layout'] },
    { key: 'reports', title: '报表', icon: 'file-text', routeNames: ['reports', 'reports-generate'] },
  ] as const

  return groups.map((g) => {
    const routes = g.routeNames.map((n) => byName.get(n)).filter(Boolean)
    return {
      key: g.key,
      title: g.title,
      icon: g.icon,
      active: routes.some((r: any) => r?.name === route.name),
      options: routes.map((r: any) => ({
        content: String(r.meta?.title || r.name || ''),
        value: String(r.name || ''),
      })),
    }
  })
})

const mobileMenuOptions = computed(() => {
  const primary = primaryNavigationRoutes.value.map((r: any) => ({
    content: String(r?.meta?.title || r?.name || ''),
    value: String(r?.name || ''),
  }))

  const grouped = navGroups.value.flatMap((g: any) =>
    (g.options || []).map((opt: any) => ({
      content: `${String(g.title)} · ${String(opt.content)}`,
      value: String(opt.value),
    })),
  )

  return [...primary, ...grouped].filter((x) => x.value)
})

/**
 * 判断当前路由是否激活
 */
const isActiveRoute = (routeName: string | symbol | null | undefined) => {
  return route.name === routeName
}

/**
 * 获取图标组件
 */
const getIcon = (iconName: unknown) => {
  const iconMap: Record<string, any> = {
    'monitor': MonitorIcon,
    'users': UsersIcon,
    'brain': BrainIcon,
    'message-circle': MessageCircleIcon,
    'shield': ShieldIcon,
    'file-text': BrainIcon, // 暂时使用 BrainIcon，后续可以添加 FileTextIcon
    'file-plus': BrainIcon,
    'plus': BrainIcon // 暂时使用 BrainIcon，后续可以添加 PlusIcon
  }
  return iconMap[iconName as string] || MonitorIcon
}

function openIncident(eventId: string) {
  incidentPopupVisible.value = false
  router.push({ name: 'security-ops', query: { eventId } })
}

function shouldPopup(event: SecurityEvent) {
  return (event.severity === 'high' || event.severity === 'critical') && event.status !== 'resolved'
}

function allowPopup(event: SecurityEvent) {
  if (incidentPopupVisible.value) return false
  if (!event?.id) return false
  if (lastPopupEventId.value === event.id) return false
  const now = Date.now()
  const cooldownMs = event.severity === 'critical' ? 30_000 : 120_000
  if (now - lastPopupAt.value < cooldownMs) return false
  lastPopupAt.value = now
  lastPopupEventId.value = event.id
  return true
}

function handleGroupMenuClick(v: any) {
  const name = v?.value
  if (typeof name !== 'string' || !name) return
  router.push({ name })
}

function initSecurityStream() {
  try {
    const url = apiUrl('/api/security/stream')
    sse = new EventSource(url)
    sse.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data || '{}')
        if (payload?.kind === 'event_created' && payload?.data) {
          const event: SecurityEvent = payload.data
          if (shouldPopup(event) && allowPopup(event)) {
            incidentPopupEvent.value = event
            incidentPopupVisible.value = true
          }
        } else if (payload?.kind === 'event_updated' && payload?.data) {
          const event: SecurityEvent = payload.data
          if (incidentPopupEvent.value?.id === event.id) {
            incidentPopupEvent.value = event
            if (event.status === 'resolved') incidentPopupVisible.value = false
          }
        }
      } catch (_) {}
    }
  } catch (_) {}
}

onMounted(() => {
  initSecurityStream()
})

onBeforeUnmount(() => {
  try {
    sse?.close()
  } catch (_) {}
  sse = null
})
</script>

<style scoped>
#app {
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}

/* 路由链接动画效果 */
.router-link-active {
  background-color: rgb(37 99 235);
  color: white;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>
