<template>
  <div v-if="visible && event" class="fixed top-24 right-4 z-[60] pointer-events-none transition-all duration-500 ease-in-out transform translate-x-0">
    <div class="pointer-events-auto w-[400px] bg-[#0a0f1c]/95 backdrop-blur-md border border-white/10 rounded-xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden ring-1 ring-white/5">
      
      <!-- Header with Severity Color Accent -->
      <div class="relative p-4 pb-3">
        <!-- Severity Glow -->
        <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl -z-10" :class="severityGlow(event.severity)"></div>

        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-2">
              <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border shadow-sm" :class="severityBadge(event.severity)">
                <span class="w-1.5 h-1.5 rounded-full mr-1.5 bg-current animate-pulse"></span>
                {{ severityLabel(event.severity) }}
              </span>
              <span class="text-xs text-gray-400 font-mono">{{ formatTime(event.timestamp) }}</span>
            </div>
            <h3 class="text-base font-bold text-white leading-tight mb-1 truncate" :title="event.title">{{ event.title }}</h3>
            <p class="text-xs text-gray-400 leading-relaxed line-clamp-2" :title="event.description">{{ event.description }}</p>
          </div>
          <button class="group p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0" @click="dismiss">
            <XIcon class="w-4 h-4 text-gray-400 group-hover:text-white" />
          </button>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-2 divide-x divide-white/5 border-y border-white/5 bg-black/20">
        <div class="p-3">
          <div class="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">事件状态</div>
          <div class="text-sm font-medium text-white flex items-center gap-2">
            <div class="w-2 h-2 rounded-full" :class="statusDot(event.status)"></div>
            {{ statusLabel(event.status) }}
          </div>
        </div>
        <div class="p-3">
          <div class="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">恢复进度</div>
          <div class="flex items-center gap-2">
            <t-progress :percentage="event.recoveryProgress" size="small" class="flex-1" />
            <span class="text-xs font-mono text-gray-300">{{ event.recoveryProgress }}%</span>
          </div>
        </div>
      </div>

      <!-- Timeline -->
      <div class="p-4 pt-3">
        <div class="flex items-center justify-between mb-3">
          <div class="text-xs font-semibold text-gray-300 flex items-center gap-1">
            <ClockIcon class="w-3 h-3" />
            <span>演进时间线</span>
          </div>
          <button class="text-[10px] text-blue-400 hover:text-blue-300 transition-colors" @click="$emit('open', event.id)">
            查看全部 &rarr;
          </button>
        </div>
        
        <div class="relative space-y-4 pl-1.5 before:absolute before:left-[5px] before:top-1 before:bottom-1 before:w-px before:bg-white/10">
          <div v-for="(t, idx) in event.timeline.slice(-3)" :key="idx" class="relative pl-4">
            <!-- Dot -->
            <div class="absolute left-0 top-1.5 w-[11px] h-[11px] -ml-[5px] rounded-full border-2 border-[#0a0f1c] z-10" :class="idx === event.timeline.slice(-3).length - 1 ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-gray-700'"></div>
            
            <div class="flex flex-col gap-0.5">
              <div class="flex items-baseline justify-between text-xs">
                <span class="text-gray-200 font-medium" :class="{'text-blue-200': idx === event.timeline.slice(-3).length - 1}">{{ t.phase }}</span>
                <span class="text-[10px] text-gray-500 font-mono">{{ formatTime(t.at).split(' ')[1] }}</span>
              </div>
              <p class="text-xs text-gray-400 leading-snug truncate">{{ t.message }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="p-4 pt-0 flex gap-3">
        <button class="flex-1 px-3 py-2 rounded-lg text-xs font-medium text-gray-400 border border-white/10 hover:bg-white/5 hover:text-white transition-all" @click="dismiss">
          暂不处理
        </button>
        <button class="flex-1 px-3 py-2 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2" @click="$emit('open', event.id)">
          <span>立即响应</span>
          <ArrowRightIcon class="w-3 h-3" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { XIcon, ClockIcon, ArrowRightIcon } from 'lucide-vue-next'
import type { SecurityEvent, SecuritySeverity, SecurityEventStatus } from '../lib/securityApi'

const props = defineProps<{
  visible: boolean
  event: SecurityEvent | null
}>()

const emit = defineEmits<{
  (e: 'dismiss'): void
  (e: 'open', eventId: string): void
}>()

function dismiss() {
  emit('dismiss')
}

function severityGlow(sev: SecuritySeverity) {
  if (sev === 'critical') return 'from-red-500/20'
  if (sev === 'high') return 'from-orange-500/20'
  if (sev === 'medium') return 'from-yellow-500/20'
  return 'from-blue-500/20'
}

function severityBadge(sev: SecuritySeverity) {
  if (sev === 'critical') return 'bg-red-500/10 text-red-400 border-red-500/20'
  if (sev === 'high') return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
  if (sev === 'medium') return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
  if (sev === 'low') return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
  return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
}

function statusDot(status: SecurityEventStatus) {
  if (status === 'open') return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
  if (status === 'investigating') return 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]'
  if (status === 'resolved') return 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'
  return 'bg-gray-500'
}

function severityLabel(sev: SecuritySeverity) {
  const map: Record<SecuritySeverity, string> = {
    info: '信息',
    low: '低',
    medium: '中',
    high: '高',
    critical: '严重',
  }
  return map[sev]
}

function statusLabel(status: SecurityEventStatus) {
  const map: Record<SecurityEventStatus, string> = {
    open: '已立案',
    investigating: '处置中',
    mitigated: '已缓解',
    resolved: '已解决',
  }
  return map[status]
}

function formatTime(date: string | Date) {
  const d = new Date(date)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`
}

const event = computed(() => props.event)
</script>
