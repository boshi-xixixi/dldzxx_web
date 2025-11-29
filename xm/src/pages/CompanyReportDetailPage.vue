<template>
  <div class="company-report-detail-page min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-6">
    <!-- 页面头部 -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-4xl font-bold text-white mb-2">全员上网行为报告</h1>
          <p class="text-blue-200">{{ reportData?.date }} - 企业整体分析报告</p>
        </div>
        <div class="flex space-x-4">
          <t-button theme="default" variant="outline" @click="goBack">
            <template #icon>
              <ArrowLeftIcon :size="16" />
            </template>
            返回
          </t-button>
          <t-button theme="primary" @click="exportReport">
            <template #icon>
              <DownloadIcon :size="16" />
            </template>
            导出报告
          </t-button>
        </div>
      </div>
    </div>

    <!-- 整体概览 -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
      <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-blue-200 text-sm">总员工数</p>
            <p class="text-3xl font-bold text-white">{{ reportData?.totalEmployees }}</p>
          </div>
          <div class="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <UsersIcon class="w-6 h-6 text-blue-400" />
          </div>
        </div>
      </div>

      <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-blue-200 text-sm">总流量</p>
            <p class="text-3xl font-bold text-white">{{ reportData?.totalTraffic }} GB</p>
          </div>
          <div class="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
            <TrendingUpIcon class="w-6 h-6 text-green-400" />
          </div>
        </div>
      </div>

      <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-blue-200 text-sm">平均在线时长</p>
            <p class="text-3xl font-bold text-white">{{ reportData?.avgOnlineHours }} 小时</p>
          </div>
          <div class="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <ClockIcon class="w-6 h-6 text-purple-400" />
          </div>
        </div>
      </div>

      <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-blue-200 text-sm">风险事件</p>
            <p class="text-3xl font-bold text-red-400">{{ reportData?.riskEvents }}</p>
          </div>
          <div class="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
            <ShieldIcon class="w-6 h-6 text-red-400" />
          </div>
        </div>
      </div>

      <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-blue-200 text-sm">生产力指数</p>
            <p class="text-3xl font-bold text-yellow-400">{{ reportData?.productivityIndex }}%</p>
          </div>
          <div class="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
            <BarChartIcon class="w-6 h-6 text-yellow-400" />
          </div>
        </div>
      </div>
    </div>

    <!-- 部门对比分析 -->
    <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 mb-8">
      <h2 class="text-2xl font-bold text-white mb-6">部门对比分析</h2>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- 部门流量对比 -->
        <div>
          <h3 class="text-lg font-semibold text-white mb-4">部门流量对比</h3>
          <div ref="departmentTrafficChartRef" class="h-80"></div>
        </div>
        
        <!-- 部门风险分布 -->
        <div>
          <h3 class="text-lg font-semibold text-white mb-4">部门风险分布</h3>
          <div ref="departmentRiskChartRef" class="h-80"></div>
        </div>
      </div>
    </div>

    <!-- 行为趋势分析 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <!-- 全天流量趋势 -->
      <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
        <h3 class="text-xl font-bold text-white mb-4">全天流量趋势</h3>
        <div ref="hourlyTrafficChartRef" class="h-80"></div>
      </div>

      <!-- 网站类型分布 -->
      <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
        <h3 class="text-xl font-bold text-white mb-4">网站类型分布</h3>
        <div ref="websiteTypeChartRef" class="h-80"></div>
      </div>
    </div>

    <!-- 详细统计表格 -->
    <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 mb-8">
      <h2 class="text-2xl font-bold text-white mb-6">部门详细统计</h2>
      <t-table 
        :data="reportData?.departmentStats || []"
        :columns="departmentColumns"
        row-key="department"
        stripe
        hover
        size="medium"
        class="bg-transparent"
      >
        <template #riskLevel="{ row }">
          <t-tag :theme="getRiskTheme(row.riskLevel)" size="small">
            {{ getRiskText(row.riskLevel) }}
          </t-tag>
        </template>
        
        <template #productivity="{ row }">
          <div class="flex items-center space-x-2">
            <div class="w-20 bg-gray-600 rounded-full h-2">
              <div 
                class="h-2 rounded-full"
                :class="getProductivityColor(row.productivity)"
                :style="{ width: `${row.productivity}%` }"
              ></div>
            </div>
            <span class="text-white text-sm">{{ row.productivity }}%</span>
          </div>
        </template>
      </t-table>
    </div>

    <!-- 风险分析和建议 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- 风险热点分析 -->
      <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
        <h3 class="text-xl font-bold text-white mb-4">风险热点分析</h3>
        <div class="space-y-4">
          <div v-for="hotspot in reportData?.riskHotspots" :key="hotspot.id" 
               class="p-4 bg-white/5 rounded-lg">
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-white font-medium">{{ hotspot.title }}</h4>
              <t-tag :theme="hotspot.level === 'high' ? 'danger' : hotspot.level === 'medium' ? 'warning' : 'success'" size="small">
                {{ hotspot.level === 'high' ? '高风险' : hotspot.level === 'medium' ? '中风险' : '低风险' }}
              </t-tag>
            </div>
            <p class="text-blue-200 text-sm mb-2">{{ hotspot.description }}</p>
            <div class="text-xs text-blue-300">
              影响员工: {{ hotspot.affectedEmployees }} 人 | 发生频率: {{ hotspot.frequency }}
            </div>
          </div>
        </div>
      </div>

      <!-- 优化建议 -->
      <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
        <h3 class="text-xl font-bold text-white mb-4">优化建议</h3>
        <div class="space-y-4">
          <div v-for="suggestion in reportData?.suggestions" :key="suggestion.id" 
               class="p-4 bg-white/5 rounded-lg">
            <div class="flex items-start space-x-3">
              <div class="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center mt-1">
                <LightbulbIcon class="w-4 h-4 text-blue-400" />
              </div>
              <div class="flex-1">
                <h4 class="text-white font-medium mb-2">{{ suggestion.title }}</h4>
                <p class="text-blue-200 text-sm mb-2">{{ suggestion.description }}</p>
                <div class="flex items-center space-x-4 text-xs text-blue-300">
                  <span>优先级: {{ suggestion.priority }}</span>
                  <span>预期效果: {{ suggestion.expectedEffect }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as echarts from 'echarts'
import {
  ArrowLeftIcon,
  DownloadIcon,
  UsersIcon,
  TrendingUpIcon,
  ClockIcon,
  ShieldIcon,
  BarChartIcon,
  LightbulbIcon
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

// 图表引用
const departmentTrafficChartRef = ref<HTMLElement>()
const departmentRiskChartRef = ref<HTMLElement>()
const hourlyTrafficChartRef = ref<HTMLElement>()
const websiteTypeChartRef = ref<HTMLElement>()

// 图表实例
let departmentTrafficChart: echarts.ECharts | null = null
let departmentRiskChart: echarts.ECharts | null = null
let hourlyTrafficChart: echarts.ECharts | null = null
let websiteTypeChart: echarts.ECharts | null = null

// 报告数据
const reportData = ref<any>(null)

// 表格列配置
const departmentColumns = [
  { colKey: 'department', title: '部门', width: '120px' },
  { colKey: 'employeeCount', title: '员工数', width: '100px' },
  { colKey: 'totalTraffic', title: '总流量(GB)', width: '120px' },
  { colKey: 'avgOnlineHours', title: '平均在线(小时)', width: '140px' },
  { colKey: 'riskLevel', title: '风险等级', width: '100px' },
  { colKey: 'productivity', title: '生产力指数', width: '140px' }
]

/**
 * 获取风险主题
 */
const getRiskTheme = (level: string) => {
  switch (level) {
    case 'high': return 'danger'
    case 'medium': return 'warning'
    case 'low': return 'success'
    default: return 'default'
  }
}

/**
 * 获取风险文本
 */
const getRiskText = (level: string) => {
  switch (level) {
    case 'high': return '高风险'
    case 'medium': return '中风险'
    case 'low': return '低风险'
    default: return '未知'
  }
}

/**
 * 获取生产力颜色
 */
const getProductivityColor = (productivity: number) => {
  if (productivity >= 80) return 'bg-green-500'
  if (productivity >= 60) return 'bg-yellow-500'
  return 'bg-red-500'
}

/**
 * 获取报告数据
 */
const fetchReportData = async () => {
  try {
    const reportId = route.params.id
    const response = await fetch(`/api/reports/${reportId}`)
    const data = await response.json()
    
    if (data.success) {
      reportData.value = data.data
    }
  } catch (error) {
    console.error('获取报告数据失败:', error)
  }
}

/**
 * 初始化部门流量对比图
 */
const initDepartmentTrafficChart = () => {
  if (!departmentTrafficChartRef.value || !reportData.value) return

  departmentTrafficChart = echarts.init(departmentTrafficChartRef.value)
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#4a90e2',
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
      data: reportData.value.departmentStats.map((item: any) => item.department),
      axisLine: { lineStyle: { color: '#4a90e2' } },
      axisLabel: { color: '#a0c4ff' }
    },
    yAxis: {
      type: 'value',
      name: '流量 (GB)',
      nameTextStyle: { color: '#a0c4ff' },
      axisLine: { lineStyle: { color: '#4a90e2' } },
      axisLabel: { color: '#a0c4ff' },
      splitLine: { lineStyle: { color: '#2a4a6b' } }
    },
    series: [{
      data: reportData.value.departmentStats.map((item: any) => item.totalTraffic),
      type: 'bar',
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#1890ff' },
          { offset: 1, color: '#096dd9' }
        ]),
        borderRadius: [4, 4, 0, 0]
      }
    }]
  }

  departmentTrafficChart.setOption(option)
}

/**
 * 初始化部门风险分布图
 */
const initDepartmentRiskChart = () => {
  if (!departmentRiskChartRef.value || !reportData.value) return

  departmentRiskChart = echarts.init(departmentRiskChartRef.value)
  
  const riskData = reportData.value.departmentStats.map((item: any) => ({
    name: item.department,
    value: item.riskScore || 0
  }))
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#4a90e2',
      textStyle: { color: '#fff' }
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: { color: '#a0c4ff' }
    },
    series: [{
      type: 'pie',
      radius: '50%',
      data: riskData,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      itemStyle: {
        borderRadius: 8,
        borderColor: '#fff',
        borderWidth: 2
      }
    }]
  }

  departmentRiskChart.setOption(option)
}

/**
 * 初始化全天流量趋势图
 */
const initHourlyTrafficChart = () => {
  if (!hourlyTrafficChartRef.value || !reportData.value) return

  hourlyTrafficChart = echarts.init(hourlyTrafficChartRef.value)
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#4a90e2',
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
      data: Array.from({ length: 24 }, (_, i) => `${i}:00`),
      axisLine: { lineStyle: { color: '#4a90e2' } },
      axisLabel: { color: '#a0c4ff' }
    },
    yAxis: {
      type: 'value',
      name: '流量 (MB)',
      nameTextStyle: { color: '#a0c4ff' },
      axisLine: { lineStyle: { color: '#4a90e2' } },
      axisLabel: { color: '#a0c4ff' },
      splitLine: { lineStyle: { color: '#2a4a6b' } }
    },
    series: [{
      data: reportData.value.hourlyTraffic || [],
      type: 'line',
      smooth: true,
      lineStyle: { color: '#52c41a', width: 3 },
      itemStyle: { color: '#52c41a' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(82, 196, 26, 0.3)' },
          { offset: 1, color: 'rgba(82, 196, 26, 0.1)' }
        ])
      }
    }]
  }

  hourlyTrafficChart.setOption(option)
}

/**
 * 初始化网站类型分布图
 */
const initWebsiteTypeChart = () => {
  if (!websiteTypeChartRef.value || !reportData.value) return

  websiteTypeChart = echarts.init(websiteTypeChartRef.value)
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#4a90e2',
      textStyle: { color: '#fff' }
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: { color: '#a0c4ff' }
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: reportData.value.websiteTypeDistribution || [],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      itemStyle: {
        borderRadius: 8,
        borderColor: '#fff',
        borderWidth: 2
      }
    }]
  }

  websiteTypeChart.setOption(option)
}

/**
 * 返回上一页
 */
const goBack = () => {
  router.back()
}

/**
 * 导出报告
 */
const exportReport = () => {
  // 这里可以实现报告导出功能
  console.log('导出报告')
}

/**
 * 组件挂载
 */
onMounted(async () => {
  await fetchReportData()
  
  // 延迟初始化图表，确保DOM已渲染
  setTimeout(() => {
    initDepartmentTrafficChart()
    initDepartmentRiskChart()
    initHourlyTrafficChart()
    initWebsiteTypeChart()
  }, 100)

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    departmentTrafficChart?.resize()
    departmentRiskChart?.resize()
    hourlyTrafficChart?.resize()
    websiteTypeChart?.resize()
  })
})

/**
 * 组件卸载
 */
onUnmounted(() => {
  departmentTrafficChart?.dispose()
  departmentRiskChart?.dispose()
  hourlyTrafficChart?.dispose()
  websiteTypeChart?.dispose()
  window.removeEventListener('resize', () => {})
})
</script>

<style scoped>
.company-report-detail-page {
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