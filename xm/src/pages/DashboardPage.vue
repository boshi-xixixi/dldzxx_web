<template>
  <div class="dashboard-page min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-6">
    <!-- 页面标题 -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-4xl font-bold text-white mb-2">企业网络监控数据大屏</h1>
          <p class="text-blue-200">实时监控企业网络状态和员工上网行为</p>
        </div>
        <t-space size="small">
          <t-button theme="primary" variant="outline" @click="goLayout" class="shadow-md">
            布局模板
          </t-button>
          <t-button theme="primary" variant="base" @click="goKanban" class="shadow-md">
            看板显示
          </t-button>
        </t-space>
      </div>
    </div>

    <div class="grid grid-cols-12 gap-6">
      <div v-show="!isWidgetHidden('realtime_cards')" :style="widgetStyle('realtime_cards')">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-blue-200 text-sm">总流量</p>
                <p class="text-3xl font-bold text-white">{{ realtimeData.totalTraffic }} MB</p>
              </div>
              <div class="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <TrendingUpIcon class="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div class="mt-4">
              <span class="text-green-400 text-sm">↗ +12.5%</span>
              <span class="text-blue-200 text-sm ml-2">较昨日</span>
            </div>
          </div>

          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-blue-200 text-sm">在线用户</p>
                <p class="text-3xl font-bold text-white">{{ realtimeData.onlineUsers }}</p>
              </div>
              <div class="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <UsersIcon class="w-6 h-6 text-green-400" />
              </div>
            </div>
            <div class="mt-4">
              <span class="text-green-400 text-sm">↗ +3</span>
              <span class="text-blue-200 text-sm ml-2">较1小时前</span>
            </div>
          </div>

          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-blue-200 text-sm">安全告警</p>
                <p class="text-3xl font-bold text-white">{{ realtimeData.alertCount }}</p>
              </div>
              <div class="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <AlertTriangleIcon class="w-6 h-6 text-red-400" />
              </div>
            </div>
            <div class="mt-4">
              <span class="text-red-400 text-sm">↗ +2</span>
              <span class="text-blue-200 text-sm ml-2">需要处理</span>
            </div>
          </div>

          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-blue-200 text-sm">网络状态</p>
                <p class="text-2xl font-bold text-white">{{ realtimeData.networkStatus === 'normal' ? '正常' : '异常' }}</p>
              </div>
              <div class="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <WifiIcon class="w-6 h-6 text-green-400" />
              </div>
            </div>
            <div class="mt-4">
              <span class="text-green-400 text-sm">99.9%</span>
              <span class="text-blue-200 text-sm ml-2">可用性</span>
            </div>
          </div>
        </div>
      </div>

      <div v-show="!isWidgetHidden('traffic_trend')" :style="widgetStyle('traffic_trend')" class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
        <h3 class="text-xl font-semibold text-white mb-4">24小时流量趋势</h3>
        <div ref="trafficChartRef" class="h-80"></div>
      </div>

      <div v-show="!isWidgetHidden('website_hot')" :style="widgetStyle('website_hot')" class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
        <h3 class="text-xl font-semibold text-white mb-4">热门网站访问</h3>
        <div ref="websiteChartRef" class="h-80"></div>
      </div>

      <div v-show="!isWidgetHidden('ai_insights')" :style="widgetStyle('ai_insights')">
        <div class="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm rounded-lg p-6 border border-purple-300/30">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center">
              <div class="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-4">
                <BrainIcon class="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 class="text-2xl font-semibold text-white">AI智能分析</h3>
                <p class="text-purple-200">基于机器学习的网络数据分析与优化建议</p>
              </div>
            </div>
            <t-button theme="primary" variant="outline" @click="refreshAIAnalysis" :loading="aiAnalysisLoading">
              <RefreshCwIcon class="w-4 h-4 mr-2" />
              刷新分析
            </t-button>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white/5 rounded-lg p-6">
              <h4 class="text-lg font-semibold text-white mb-4 flex items-center">
                <TrendingUpIcon class="w-5 h-5 mr-2 text-green-400" />
                数据趋势分析
              </h4>
              <div class="space-y-4">
                <div v-for="insight in aiInsights.trends" :key="insight.id" class="bg-white/5 rounded-lg p-4">
                  <div class="flex items-start">
                    <div class="w-2 h-2 rounded-full mt-2 mr-3" :class="getInsightColor(insight.type)"></div>
                    <div class="flex-1">
                      <h5 class="text-white font-medium mb-1">{{ insight.title }}</h5>
                      <p class="text-gray-300 text-sm mb-2">{{ insight.description }}</p>
                      <div class="flex items-center text-xs">
                        <span class="text-gray-400">置信度: </span>
                        <span class="text-blue-300 ml-1">{{ insight.confidence }}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white/5 rounded-lg p-6">
              <h4 class="text-lg font-semibold text-white mb-4 flex items-center">
                <LightbulbIcon class="w-5 h-5 mr-2 text-yellow-400" />
                优化建议
              </h4>
              <div class="space-y-4">
                <div v-for="suggestion in aiInsights.suggestions" :key="suggestion.id" class="bg-white/5 rounded-lg p-4">
                  <div class="flex items-start">
                    <div class="w-6 h-6 rounded-full flex items-center justify-center mr-3" :class="getPriorityBg(suggestion.priority)">
                      <span class="text-xs font-bold text-white">{{ suggestion.priority === 'high' ? 'H' : suggestion.priority === 'medium' ? 'M' : 'L' }}</span>
                    </div>
                    <div class="flex-1">
                      <h5 class="text-white font-medium mb-1">{{ suggestion.title }}</h5>
                      <p class="text-gray-300 text-sm mb-2">{{ suggestion.description }}</p>
                      <div class="flex items-center justify-between">
                        <span class="text-xs text-gray-400">预期收益: {{ suggestion.impact }}</span>
                        <t-button size="small" theme="primary" variant="text" @click="applySuggestion(suggestion)">
                          应用建议
                        </t-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-6 flex items-center justify-between bg-white/5 rounded-lg p-4">
            <div class="flex items-center">
              <div class="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse"></div>
              <span class="text-white text-sm">AI分析引擎运行中</span>
            </div>
            <div class="flex items-center space-x-4 text-sm text-gray-300">
              <span>上次更新: {{ formatTime(aiInsights.lastUpdate) }}</span>
              <span>分析数据量: {{ aiInsights.dataPoints }}K</span>
              <span>模型准确率: {{ aiInsights.accuracy }}%</span>
            </div>
          </div>
        </div>
      </div>

      <div v-show="!isWidgetHidden('system_resource')" :style="widgetStyle('system_resource')" class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
        <div class="flex items-center mb-4">
          <div class="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mr-3">
            <ServerIcon class="w-5 h-5 text-purple-400" />
          </div>
          <h3 class="text-xl font-semibold text-white">系统资源</h3>
        </div>
        <div class="space-y-4">
          <div class="bg-white/5 rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center">
                <div class="w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center mr-2">
                  <CpuIcon class="w-4 h-4 text-blue-400" />
                </div>
                <span class="text-sm text-blue-200">CPU使用率</span>
              </div>
              <span class="text-sm text-white font-medium">{{ realtimeData.cpuUsage }}%</span>
            </div>
            <t-progress :percentage="realtimeData.cpuUsage" :color="getProgressColor(realtimeData.cpuUsage)" />
          </div>
          <div class="bg-white/5 rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center">
                <div class="w-6 h-6 bg-green-500/20 rounded flex items-center justify-center mr-2">
                  <MemoryStickIcon class="w-4 h-4 text-green-400" />
                </div>
                <span class="text-sm text-blue-200">内存使用率</span>
              </div>
              <span class="text-sm text-white font-medium">{{ realtimeData.memoryUsage }}%</span>
            </div>
            <t-progress :percentage="realtimeData.memoryUsage" :color="getProgressColor(realtimeData.memoryUsage)" />
          </div>
          <div class="bg-white/5 rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center">
                <div class="w-6 h-6 bg-orange-500/20 rounded flex items-center justify-center mr-2">
                  <HardDriveIcon class="w-4 h-4 text-orange-400" />
                </div>
                <span class="text-sm text-blue-200">磁盘使用率</span>
              </div>
              <span class="text-sm text-white font-medium">{{ realtimeData.diskUsage }}%</span>
            </div>
            <t-progress :percentage="realtimeData.diskUsage" :color="getProgressColor(realtimeData.diskUsage)" />
          </div>
        </div>
      </div>

      <div v-show="!isWidgetHidden('department_stats')" :style="widgetStyle('department_stats')" class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
        <div class="flex items-center mb-4">
          <div class="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center mr-3">
            <BuildingIcon class="w-5 h-5 text-indigo-400" />
          </div>
          <h3 class="text-xl font-semibold text-white">部门统计</h3>
        </div>
        <div class="space-y-3">
          <div v-for="(dept, name) in departmentStats" :key="name" class="flex justify-between items-center p-3 bg-white/5 rounded-lg">
            <div class="flex items-center">
              <div class="w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center mr-3">
                <UsersIcon class="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p class="text-white font-medium">{{ name }}</p>
                <p class="text-blue-200 text-sm">{{ dept.onlineEmployees }}/{{ dept.totalEmployees }} 在线</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-white">{{ Math.floor(dept.totalTraffic) }} MB</p>
              <t-tag v-if="dept.highRiskCount > 0" theme="danger" size="small">
                {{ dept.highRiskCount }} 高风险
              </t-tag>
            </div>
          </div>
        </div>
      </div>

      <div v-show="!isWidgetHidden('recent_alerts')" :style="widgetStyle('recent_alerts')" class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
        <div class="flex items-center mb-4">
          <div class="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center mr-3">
            <ShieldAlertIcon class="w-5 h-5 text-red-400" />
          </div>
          <h3 class="text-xl font-semibold text-white">最新告警</h3>
        </div>
        <div class="space-y-3">
          <div v-for="alert in recentAlerts" :key="alert.id" class="flex items-start space-x-3 p-3 bg-white/5 rounded-lg">
            <div
              class="w-6 h-6 rounded-full flex items-center justify-center mt-1"
              :class="alert.level === 'high' ? 'bg-red-500/20' : alert.level === 'medium' ? 'bg-yellow-500/20' : 'bg-blue-500/20'"
            >
              <AlertTriangleIcon
                class="w-4 h-4"
                :class="alert.level === 'high' ? 'text-red-400' : alert.level === 'medium' ? 'text-yellow-400' : 'text-blue-400'"
              />
            </div>
            <div class="flex-1">
              <p class="text-white text-sm">{{ alert.message }}</p>
              <p class="text-blue-200 text-xs mt-1">{{ formatTime(alert.time) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { TrendingUpIcon, UsersIcon, AlertTriangleIcon, WifiIcon, CpuIcon, MemoryStickIcon, HardDriveIcon, ServerIcon, MonitorIcon, ActivityIcon, BuildingIcon, ShieldAlertIcon, BrainIcon, RefreshCwIcon, LightbulbIcon } from 'lucide-vue-next'
import { fetchJSON, apiUrl } from '../lib/http'
import { useDashboardLayout, type DashboardWidgetId } from '../composables/useDashboardLayout'

// 响应式数据
const realtimeData = ref({
  totalTraffic: 0,
  onlineUsers: 0,
  alertCount: 0,
  networkStatus: 'normal',
  cpuUsage: 0,
  memoryUsage: 0,
  diskUsage: 0
})

interface DepartmentStat {
  onlineEmployees: number
  totalEmployees: number
  totalTraffic: number
  highRiskCount: number
}

const departmentStats = ref<Record<string, DepartmentStat>>({})
const recentAlerts = ref([])
const trafficChartRef = ref()
const websiteChartRef = ref()

// AI分析相关数据
const aiAnalysisLoading = ref(false)
const aiInsights = ref({
  trends: [
    {
      id: 1,
      type: 'positive',
      title: '网络流量趋势稳定',
      description: '过去24小时内网络流量保持在正常范围内，无异常波动',
      confidence: 92
    },
    {
      id: 2,
      type: 'warning',
      title: '高峰时段带宽利用率偏高',
      description: '上午9-11点和下午2-4点带宽利用率超过85%，建议优化',
      confidence: 88
    },
    {
      id: 3,
      type: 'info',
      title: '员工上网行为分析',
      description: '检测到15%的员工在工作时间访问社交媒体，影响工作效率',
      confidence: 76
    }
  ],
  suggestions: [
    {
      id: 1,
      priority: 'high',
      title: '优化带宽分配策略',
      description: '建议在高峰时段限制非工作相关流量，为关键业务预留带宽',
      impact: '提升30%网络性能'
    },
    {
      id: 2,
      priority: 'medium',
      title: '部署内容过滤规则',
      description: '建议在工作时间限制社交媒体访问，提高员工工作专注度',
      impact: '提升20%工作效率'
    },
    {
      id: 3,
      priority: 'low',
      title: '增加网络监控点',
      description: '在关键网络节点部署更多监控设备，提升异常检测能力',
      impact: '提升15%安全性'
    }
  ],
  lastUpdate: new Date().toISOString(),
  dataPoints: 1247,
  accuracy: 94
})

let trafficChart: echarts.ECharts | null = null
let websiteChart: echarts.ECharts | null = null
let updateInterval: ReturnType<typeof setInterval> | null = null

const router = useRouter()
const { activeTemplate } = useDashboardLayout()

const goKanban = () => {
  router.push({ name: 'kanban' })
}

const goLayout = () => {
  router.push({ name: 'dashboard-layout' })
}

const widgetStyle = (id: DashboardWidgetId) => {
  const l = activeTemplate.value.layout[id]
  return {
    gridColumn: `span ${l.colSpan} / span ${l.colSpan}`,
    gridRow: `span ${l.rowSpan} / span ${l.rowSpan}`,
    order: String(l.order),
  }
}

const isWidgetHidden = (id: DashboardWidgetId) => {
  return Boolean(activeTemplate.value.layout[id]?.hidden)
}

/**
 * 获取进度条颜色
 */
const getProgressColor = (percentage: number) => {
  if (percentage > 80) return '#ef4444'
  if (percentage > 60) return '#f59e0b'
  return '#10b981'
}

/**
 * 格式化时间
 */
const formatTime = (time: string) => {
  return new Date(time).toLocaleTimeString('zh-CN')
}

/**
 * 获取洞察颜色
 */
const getInsightColor = (type: string) => {
  switch (type) {
    case 'positive': return 'bg-green-400'
    case 'warning': return 'bg-yellow-400'
    case 'danger': return 'bg-red-400'
    default: return 'bg-blue-400'
  }
}

/**
 * 获取优先级背景色
 */
const getPriorityBg = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-500'
    case 'medium': return 'bg-yellow-500'
    default: return 'bg-blue-500'
  }
}

/**
 * 刷新AI分析
 */
const refreshAIAnalysis = async () => {
  aiAnalysisLoading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 更新分析数据
    aiInsights.value.lastUpdate = new Date().toISOString()
    aiInsights.value.dataPoints = Math.floor(Math.random() * 500) + 1000
    aiInsights.value.accuracy = Math.floor(Math.random() * 10) + 90
    
    console.log('AI分析已刷新')
  } catch (error) {
    console.error('刷新AI分析失败:', error)
  } finally {
    aiAnalysisLoading.value = false
  }
}

/**
 * 应用建议
 */
const applySuggestion = (suggestion: any) => {
  console.log('应用建议:', suggestion.title)
  // 这里可以添加实际的建议应用逻辑
}

/**
 * 获取实时数据
 */
/**
 * 获取实时数据
 * @function fetchRealtimeData
 */
const fetchRealtimeData = async () => {
  try {
    type ApiResp<T> = { success: boolean; data: T }
    const result = await fetchJSON<ApiResp<any>>(apiUrl('/api/network/realtime'))
    if (result?.success) realtimeData.value = result.data
  } catch (error) {
    console.error('获取实时数据失败:', error)
  }
}

/**
 * 获取部门统计
 */
/**
 * 获取部门统计
 * @function fetchDepartmentStats
 */
const fetchDepartmentStats = async () => {
  try {
    type ApiResp<T> = { success: boolean; data: T }
    const result = await fetchJSON<ApiResp<any>>(apiUrl('/api/employees/stats/departments'))
    if (result?.success) departmentStats.value = result.data
  } catch (error) {
    console.error('获取部门统计失败:', error)
  }
}

/**
 * 初始化流量趋势图表
 */
/**
 * 初始化流量趋势图表
 * @function initTrafficChart
 */
const initTrafficChart = async () => {
  if (!trafficChartRef.value) return

  try {
    type ApiResp<T> = { success: boolean; data: T }
    const result = await fetchJSON<ApiResp<any[]>>(apiUrl('/api/network/traffic?hours=24'))
    
    if (result?.success) {
      trafficChart = echarts.init(trafficChartRef.value)
      
      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderColor: '#1890ff',
          textStyle: { color: '#fff' }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: (result.data || []).map((item: any) => new Date(item.timestamp).getHours() + ':00'),
          axisLine: { lineStyle: { color: '#4a90e2' } },
          axisLabel: { color: '#a0c4ff' }
        },
        yAxis: {
          type: 'value',
          name: 'MB',
          nameTextStyle: { color: '#a0c4ff' },
          axisLine: { lineStyle: { color: '#4a90e2' } },
          axisLabel: { color: '#a0c4ff' },
          splitLine: { lineStyle: { color: '#2a4a6b' } }
        },
        series: [
          {
            name: '总流量',
            type: 'line',
            smooth: true,
            data: (result.data || []).map((item: any) => item.totalTraffic),
            lineStyle: { color: '#1890ff', width: 3 },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
                { offset: 1, color: 'rgba(24, 144, 255, 0.1)' }
              ])
            }
          },
          {
            name: '上传流量',
            type: 'line',
            smooth: true,
            data: (result.data || []).map((item: any) => item.uploadTraffic),
            lineStyle: { color: '#52c41a', width: 2 }
          },
          {
            name: '下载流量',
            type: 'line',
            smooth: true,
            data: (result.data || []).map((item: any) => item.downloadTraffic),
            lineStyle: { color: '#faad14', width: 2 }
          }
        ],
        legend: {
          textStyle: { color: '#a0c4ff' },
          top: 10
        }
      }
      
      trafficChart.setOption(option)
    }
  } catch (error) {
    console.error('初始化流量图表失败:', error)
  }
}

/**
 * 初始化网站访问图表
 */
/**
 * 初始化网站访问图表
 * @function initWebsiteChart
 */
const initWebsiteChart = async () => {
  if (!websiteChartRef.value) return

  try {
    type ApiResp<T> = { success: boolean; data: T }
    const result = await fetchJSON<ApiResp<any[]>>(apiUrl('/api/network/websites'))
    
    if (result?.success) {
      websiteChart = echarts.init(websiteChartRef.value)
      
      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderColor: '#1890ff',
          textStyle: { color: '#fff' }
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          textStyle: { color: '#a0c4ff' }
        },
        series: [
          {
            name: '访问量',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['60%', '50%'],
            data: (result.data || []).map((item: any) => ({
              value: item.visits,
              name: item.website,
              itemStyle: {
                color: item.riskLevel === 'danger' ? '#ff4d4f' : 
                       item.riskLevel === 'warning' ? '#faad14' : '#52c41a'
              }
            })),
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            label: {
              color: '#a0c4ff'
            }
          }
        ]
      }
      
      websiteChart.setOption(option)
    }
  } catch (error) {
    console.error('初始化网站图表失败:', error)
  }
}

/**
 * 生成模拟告警数据
 */
const generateAlerts = () => {
  const alerts = [
    { id: 1, level: 'high', message: '检测到异常大流量下载行为', time: new Date().toISOString() },
    { id: 2, level: 'medium', message: '员工访问未授权网站', time: new Date(Date.now() - 300000).toISOString() },
    { id: 3, level: 'low', message: '网络延迟略有增加', time: new Date(Date.now() - 600000).toISOString() },
    { id: 4, level: 'medium', message: '发现可疑文件下载', time: new Date(Date.now() - 900000).toISOString() }
  ]
  recentAlerts.value = alerts
}

/**
 * 组件挂载时初始化
 */
onMounted(async () => {
  await fetchRealtimeData()
  await fetchDepartmentStats()
  await initTrafficChart()
  await initWebsiteChart()
  generateAlerts()

  // 设置定时更新
  updateInterval = setInterval(async () => {
    await fetchRealtimeData()
  }, 30000) // 每30秒更新一次

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    trafficChart?.resize()
    websiteChart?.resize()
  })
})

/**
 * 组件卸载时清理
 */
onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
  trafficChart?.dispose()
  websiteChart?.dispose()
  window.removeEventListener('resize', () => {})
})
</script>

<style scoped>
.dashboard-page {
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
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
