<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-6 dashboard-layout-page">
    <div class="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 class="text-3xl sm:text-4xl font-bold text-white">看板布局模板</h1>
        <p class="mt-2 text-blue-200">拖拽排序、调整大小、隐藏模块，并保存为模板。</p>
      </div>
      <div class="flex gap-2">
        <t-button theme="primary" variant="outline" @click="goDashboard">返回大屏</t-button>
        <t-button theme="primary" @click="saveToast">已自动保存</t-button>
      </div>
    </div>

    <div class="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 mb-6">
      <t-form layout="inline" class="flex-wrap gap-y-4" @submit.prevent>
        <t-form-item label="当前模板" class="!mr-4">
          <t-select v-model="activeTemplateId" style="width: 220px">
            <t-option v-for="t in templates" :key="t.id" :value="t.id" :label="t.name" />
          </t-select>
        </t-form-item>

        <t-form-item label="模板名" class="!mr-4">
          <t-input v-model="templateNameDraft" style="width: 220px" placeholder="输入模板名称" />
        </t-form-item>

        <t-form-item class="!mr-4">
          <t-space size="small">
            <t-button theme="primary" variant="outline" @click="applyRename" :disabled="!templateNameDraft.trim()">
              重命名
            </t-button>
            <t-button theme="primary" variant="outline" @click="createNewTemplate">新建
            </t-button>
            <t-button theme="danger" variant="outline" @click="deleteCurrent" :disabled="activeTemplateId === 'default'">
              删除
            </t-button>
            <t-button variant="outline" @click="resetCurrent">恢复默认布局</t-button>
          </t-space>
        </t-form-item>
      </t-form>
    </div>

    <div class="grid grid-cols-12 gap-4">
      <div
        v-for="w in widgets"
        :key="w.id"
        class="relative bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 transition-colors"
        :class="draggingId === w.id ? 'ring-2 ring-blue-400/70' : ''"
        :style="widgetGridStyle(w.id)"
        draggable="true"
        @dragstart="onDragStart(w.id)"
        @dragover.prevent="onDragOver(w.id)"
        @drop.prevent="onDrop(w.id)"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="text-white font-semibold truncate">{{ widgetTitle(w.id) }}</div>
            <div class="mt-1 text-xs text-blue-200">ID：{{ w.id }}</div>
          </div>
          <div class="text-xs text-blue-200 bg-blue-500/10 border border-blue-400/20 rounded px-2 py-1 select-none">
            拖拽
          </div>
        </div>

        <div class="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <div class="text-xs text-blue-200 mb-1">宽度（列）</div>
            <t-select
              :value="activeTemplate.layout[w.id].colSpan"
              size="small"
              @change="(v) => updateWidget(w.id, { colSpan: Number(v) })"
            >
              <t-option v-for="n in 12" :key="n" :value="n" :label="`${n}`" />
            </t-select>
          </div>
          <div>
            <div class="text-xs text-blue-200 mb-1">高度（行）</div>
            <t-select
              :value="activeTemplate.layout[w.id].rowSpan"
              size="small"
              @change="(v) => updateWidget(w.id, { rowSpan: Number(v) })"
            >
              <t-option v-for="n in 6" :key="n" :value="n" :label="`${n}`" />
            </t-select>
          </div>
          <div class="flex items-end justify-between gap-2">
            <div class="text-xs text-blue-200">隐藏</div>
            <t-switch
              :value="Boolean(activeTemplate.layout[w.id].hidden)"
              size="small"
              @change="(v) => updateWidget(w.id, { hidden: Boolean(v) })"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="mt-6 text-sm text-blue-200">
      提示：拖拽模块可交换位置；切换模板会自动保存当前编辑结果。
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { useDashboardLayout, type DashboardWidgetId, type DashboardWidgetLayout } from '../composables/useDashboardLayout'

const router = useRouter()
const draggingId = ref<DashboardWidgetId | null>(null)

const {
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
} = useDashboardLayout()

const templateNameDraft = ref(activeTemplate.value.name)

watch(
  () => activeTemplateId.value,
  (id) => {
    setActiveTemplate(id)
    templateNameDraft.value = activeTemplate.value.name
  },
  { immediate: true },
)

watch(
  () => activeTemplate.value.name,
  (v) => {
    if (!templateNameDraft.value.trim()) templateNameDraft.value = v
  },
)

function goDashboard() {
  router.push({ name: 'dashboard' })
}

function saveToast() {
  MessagePlugin.success('布局已自动保存到本地')
}

function applyRename() {
  const name = templateNameDraft.value.trim()
  if (!name) return
  renameTemplate(activeTemplateId.value, name)
  MessagePlugin.success('模板已重命名')
}

function createNewTemplate() {
  const name = templateNameDraft.value.trim() || '新模板'
  createTemplate(name)
  MessagePlugin.success('模板已创建')
}

function deleteCurrent() {
  deleteTemplate(activeTemplateId.value)
  MessagePlugin.success('模板已删除')
}

function resetCurrent() {
  resetActiveToDefaultLayout()
  MessagePlugin.success('已恢复默认布局')
}

function updateWidget(id: DashboardWidgetId, patch: Partial<DashboardWidgetLayout>) {
  updateActiveWidgetLayout(id, patch)
}

function widgetTitle(id: DashboardWidgetId): string {
  const map: Record<DashboardWidgetId, string> = {
    realtime_cards: '实时数据卡片',
    traffic_trend: '24小时流量趋势',
    website_hot: '热门网站访问',
    ai_insights: 'AI智能分析',
    system_resource: '系统资源',
    department_stats: '部门统计',
    recent_alerts: '最新告警',
  }
  return map[id] || id
}

function widgetGridStyle(id: DashboardWidgetId) {
  const l = activeTemplate.value.layout[id]
  return {
    gridColumn: `span ${l.colSpan} / span ${l.colSpan}`,
    gridRow: `span ${l.rowSpan} / span ${l.rowSpan}`,
    order: String(l.order),
    opacity: l.hidden ? '0.5' : '1',
  }
}

function onDragStart(id: DashboardWidgetId) {
  draggingId.value = id
}

function onDragOver(_targetId: DashboardWidgetId) {}

function onDrop(targetId: DashboardWidgetId) {
  const sourceId = draggingId.value
  draggingId.value = null
  if (!sourceId) return
  if (sourceId === targetId) return
  reorderWidgets(sourceId, targetId)
}
</script>

<style scoped>
.dashboard-layout-page {
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
</style>

