<template>
  <div class="report-list-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-white tracking-tight">报告中心</h1>
        <p class="mt-1 text-sm text-gray-400">查看和管理系统生成的所有安全分析报告</p>
      </div>
      <t-button theme="primary" size="large" @click="goToGeneration" class="shadow-lg shadow-blue-500/20">
        <template #icon>
          <PlusIcon :size="18" />
        </template>
        生成新报告
      </t-button>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="(stat, key) in statsConfig" :key="key" 
        class="relative overflow-hidden rounded-xl bg-[#0a0f1c]/50 border border-white/5 p-4 group hover:border-white/10 transition-all duration-300">
        <!-- 背景光效 -->
        <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div class="absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-20" :class="stat.glowClass"></div>
        
        <div class="relative flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-400 mb-1">{{ stat.label }}</div>
            <div class="text-2xl font-bold text-white tracking-tight">{{ stats[key] }}</div>
          </div>
          <div class="p-3 rounded-lg bg-white/5 border border-white/5 transition-colors group-hover:bg-white/10" :class="stat.iconClass">
            <component :is="stat.icon" :size="24" />
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="bg-[#0a0f1c]/50 backdrop-blur-sm border border-white/5 rounded-xl p-4">
      <t-form layout="inline" @submit="handleSearch" @reset="handleReset" class="flex-wrap gap-y-4">
        <t-form-item label="报告类型" class="!mr-4">
          <t-select
            v-model="filters.type"
            placeholder="全部类型"
            clearable
            style="width: 160px"
          >
            <t-option value="employee" label="员工上网行为" />
            <t-option value="company" label="全员上网行为" />
            <t-option value="ai_usage" label="AI使用行为" />
          </t-select>
        </t-form-item>

        <t-form-item label="状态" class="!mr-4">
          <t-select
            v-model="filters.status"
            placeholder="全部状态"
            clearable
            style="width: 140px"
          >
            <t-option value="pending" label="等待中" />
            <t-option value="generating" label="生成中" />
            <t-option value="completed" label="已完成" />
            <t-option value="failed" label="失败" />
          </t-select>
        </t-form-item>

        <t-form-item label="时间范围" class="!mr-4">
          <t-date-range-picker
            v-model="filters.dateRange"
            placeholder="选择时间范围"
            format="YYYY-MM-DD"
            style="width: 240px"
          />
        </t-form-item>

        <t-form-item label="关键词" class="!mr-4">
          <t-input
            v-model="filters.keyword"
            placeholder="搜索报告标题..."
            style="width: 200px"
          >
            <template #prefix-icon>
              <SearchIcon :size="16" />
            </template>
          </t-input>
        </t-form-item>

        <t-form-item>
          <t-space size="small">
            <t-button theme="primary" type="submit">搜索</t-button>
            <t-button variant="outline" type="reset">重置</t-button>
          </t-space>
        </t-form-item>
      </t-form>
    </div>

    <!-- 报告列表 -->
    <div class="bg-[#0a0f1c]/50 backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden flex flex-col min-h-[500px]">
      <div class="p-4 border-b border-white/5 flex justify-between items-center">
        <div class="flex items-center gap-2">
          <ListIcon :size="18" class="text-gray-400" />
          <span class="text-base font-medium text-white">报告列表</span>
        </div>
        <t-space size="small">
          <t-button variant="outline" size="small" @click="refreshData" :loading="loading">
            <template #icon><RefreshCwIcon :size="14" /></template>
            刷新
          </t-button>
          <t-dropdown
            :options="[
              { content: '导出选中', value: 'export-selected' },
              { content: '批量删除', value: 'batch-delete' }
            ]"
            @click="handleBatchAction"
          >
            <t-button variant="outline" size="small">
              批量操作
              <template #suffix><ChevronDownIcon :size="14" /></template>
            </t-button>
          </t-dropdown>
        </t-space>
      </div>

      <div class="flex-1 p-4">
        <t-table
          :data="reports"
          :columns="columns"
          :loading="loading"
          :pagination="pagination"
          row-key="id"
          :selected-row-keys="selectedRowKeys"
          @select-change="handleSelectChange"
          @page-change="handlePageChange"
          :header-affixed-top="{ offsetTop: 64 }"
          hover
          stripe
        >
          <template #type="{ row }">
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full" :class="getTypeColor(row.type)"></div>
              <span>{{ getTypeText(row.type) }}</span>
            </div>
          </template>

          <template #status="{ row }">
            <t-tag :theme="getStatusTheme(row.status)" variant="light-outline" shape="round" size="small">
              <template #icon>
                <component :is="getStatusIcon(row.status)" :size="12" />
              </template>
              {{ getStatusText(row.status) }}
            </t-tag>
          </template>

          <template #createdAt="{ row }">
            <span class="font-mono text-gray-400">{{ formatDate(row.createdAt) }}</span>
          </template>

          <template #actions="{ row }">
            <t-space size="small" :separator="false">
              <t-link v-if="row.status === 'completed'" theme="primary" hover="color" @click="viewReport(row)">
                查看
              </t-link>
              <t-link v-if="row.status === 'completed'" theme="default" hover="color" @click="downloadReport(row)">
                下载
              </t-link>
              <t-popconfirm content="确定要删除该报告吗？" @confirm="deleteReport(row.id)">
                <t-link theme="danger" hover="color">删除</t-link>
              </t-popconfirm>
            </t-space>
          </template>
        </t-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { 
  PlusIcon, 
  SearchIcon, 
  FileTextIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  XCircleIcon,
  RefreshCwIcon,
  ChevronDownIcon,
  ListIcon
} from 'lucide-vue-next'
import { getReports, deleteReport as apiDeleteReport, type Report } from '../lib/llmApi'
import { downloadTextFile, formatDate, toCsv } from '../lib/utils'

const router = useRouter()

// Stats Config
const statsConfig = {
  total: { label: '总报告数', icon: FileTextIcon, iconClass: 'text-blue-400', barClass: 'bg-blue-500', glowClass: 'bg-blue-500' },
  completed: { label: '已完成', icon: CheckCircleIcon, iconClass: 'text-green-400', barClass: 'bg-green-500', glowClass: 'bg-green-500' },
  generating: { label: '生成中', icon: ClockIcon, iconClass: 'text-yellow-400', barClass: 'bg-yellow-500', glowClass: 'bg-yellow-500' },
  failed: { label: '失败', icon: XCircleIcon, iconClass: 'text-red-400', barClass: 'bg-red-500', glowClass: 'bg-red-500' }
}

const stats = reactive({
  total: 0,
  completed: 0,
  generating: 0,
  failed: 0
})

const filters = reactive({
  type: '',
  status: '',
  dateRange: [],
  keyword: ''
})

const loading = ref(false)
const reports = ref<Report[]>([])
const selectedRowKeys = ref([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

const columns = [
  { colKey: 'row-select', type: 'multiple', width: 50, fixed: 'left' },
  { colKey: 'title', title: '报告标题', ellipsis: true },
  { colKey: 'type', title: '报告类型', width: 150 },
  { colKey: 'employeeName', title: '关联员工', width: 120, ellipsis: true },
  { colKey: 'status', title: '状态', width: 120 },
  { colKey: 'createdAt', title: '生成时间', width: 180 },
  { colKey: 'actions', title: '操作', width: 180, fixed: 'right' }
]

function getTypeColor(type: string) {
  if (type === 'employee') return 'bg-blue-500'
  if (type === 'company') return 'bg-purple-500'
  if (type === 'ai_usage') return 'bg-cyan-500'
  return 'bg-gray-500'
}

function getTypeText(type: string) {
  const map: Record<string, string> = {
    employee: '员工上网行为',
    company: '全员上网行为',
    ai_usage: 'AI使用行为'
  }
  return map[type] || type
}

function getStatusTheme(status: string) {
  if (status === 'completed') return 'success'
  if (status === 'generating') return 'warning'
  if (status === 'failed') return 'danger'
  return 'default'
}

function getStatusIcon(status: string) {
  if (status === 'completed') return CheckCircleIcon
  if (status === 'generating') return ClockIcon
  if (status === 'failed') return XCircleIcon
  return ClockIcon
}

function getStatusText(status: string) {
  const map: Record<string, string> = {
    pending: '等待中',
    generating: '生成中',
    completed: '已完成',
    failed: '失败'
  }
  return map[status] || status
}

function goToGeneration() {
  router.push('/report/generate')
}

async function fetchData() {
  loading.value = true
  try {
    const res = await getReports(filters)
    reports.value = res
    pagination.total = res.length
    
    // Calculate stats from real data
    stats.total = res.length
    stats.completed = res.filter(r => r.status === 'completed').length
    stats.generating = res.filter(r => r.status === 'generating').length
    stats.failed = res.filter(r => r.status === 'failed').length
    
    loading.value = false
  } catch (error) {
    console.error(error)
    MessagePlugin.error('获取报告列表失败')
    loading.value = false
  }
}

function handleSearch() {
  pagination.current = 1
  fetchData()
}

function handleReset() {
  filters.type = ''
  filters.status = ''
  filters.dateRange = []
  filters.keyword = ''
  handleSearch()
}

function refreshData() {
  fetchData()
}

function handlePageChange(pageInfo: any) {
  pagination.current = pageInfo.current
  pagination.pageSize = pageInfo.pageSize
  fetchData()
}

function handleSelectChange(val: any[]) {
  selectedRowKeys.value = val
}

function handleBatchAction(val: any) {
    if (val.value === 'export-selected') {
        const selectedIds = (selectedRowKeys.value || []) as any[]
        if (selectedIds.length === 0) {
          MessagePlugin.warning('请先选择要导出的报告')
          return
        }

        const selected = reports.value.filter((r) => selectedIds.includes((r as any).id))
        const headers = ['id', 'type', 'title', 'status', 'createdAt', 'completedAt', 'description']
        const rows = selected.map((r: any) => [
          r.id,
          r.type,
          r.title,
          r.status,
          r.createdAt || '',
          r.completedAt || '',
          r.description || '',
        ])
        downloadTextFile(`reports_selected_${Date.now()}.csv`, toCsv(headers, rows), 'text/csv;charset=utf-8')
        MessagePlugin.success(`已导出 ${selected.length} 条报告`)
    } else if (val.value === 'batch-delete') {
        MessagePlugin.info('批量删除功能开发中')
    }
}

function viewReport(row: any) {
  router.push(`/report/${row.id}`)
}

function downloadReport(row: any) {
  MessagePlugin.success(`开始下载: ${row.title}`)
}

async function deleteReport(id: string) {
  try {
    await apiDeleteReport(id)
    MessagePlugin.success('删除成功')
    fetchData()
  } catch (error) {
    console.error(error)
    MessagePlugin.error('删除失败')
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
/* TDesign Dark Mode Overrides if needed, usually handled by theme-mode='dark' */
:deep(.t-table) {
  background-color: transparent;
}
:deep(.t-table__header) {
    background-color: rgba(255, 255, 255, 0.05) !important;
}
:deep(.t-table__row) {
    background-color: transparent !important;
}
:deep(.t-table__row:hover) {
    background-color: rgba(255, 255, 255, 0.05) !important;
}
:deep(.t-table th), :deep(.t-table td) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
    color: #e5e7eb !important;
}
</style>
