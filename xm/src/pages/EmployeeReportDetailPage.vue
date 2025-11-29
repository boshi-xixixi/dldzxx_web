<template>
  <div class="employee-report-detail-page min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-6">
    <!-- 页面头部 -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-4xl font-bold text-white mb-2">员工上网行为报告</h1>
          <p class="text-blue-200">{{ reportData?.employeeName }} - {{ reportData?.date }}</p>
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

    <!-- 报告概览 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-blue-200 text-sm">总流量</p>
            <p class="text-3xl font-bold text-white">{{ reportData?.totalTraffic }} MB</p>
          </div>
          <div class="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <TrendingUpIcon class="w-6 h-6 text-blue-400" />
          </div>
        </div>
      </div>

      <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-blue-200 text-sm">访问网站数</p>
            <p class="text-3xl font-bold text-white">{{ reportData?.websiteCount }}</p>
          </div>
          <div class="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
            <GlobeIcon class="w-6 h-6 text-green-400" />
          </div>
        </div>
      </div>

      <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-blue-200 text-sm">在线时长</p>
            <p class="text-3xl font-bold text-white">{{ reportData?.onlineHours }} 小时</p>
          </div>
          <div class="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <ClockIcon class="w-6 h-6 text-purple-400" />
          </div>
        </div>
      </div>

      <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-blue-200 text-sm">风险等级</p>
            <p class="text-3xl font-bold" :class="getRiskLevelColor(reportData?.riskLevel)">
              {{ getRiskLevelText(reportData?.riskLevel) }}
            </p>
          </div>
          <div class="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
            <ShieldIcon class="w-6 h-6 text-red-400" />
          </div>
        </div>
      </div>
    </div>

    <!-- 行为轨迹时间线 -->
    <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 mb-8">
      <h2 class="text-2xl font-bold text-white mb-6">行为轨迹时间线</h2>
      <div class="space-y-4 max-h-96 overflow-y-auto">
        <div v-for="activity in reportData?.activities" :key="activity.id" 
             class="flex items-start space-x-4 p-4 bg-white/5 rounded-lg">
          <div class="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
          <div class="flex-1">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-white font-medium">{{ activity.website }}</h3>
              <span class="text-blue-200 text-sm">{{ activity.time }}</span>
            </div>
            <p class="text-blue-200 text-sm mb-2">{{ activity.description }}</p>
            <div class="flex items-center space-x-4 text-xs text-blue-300">
              <span>流量: {{ activity.traffic }} MB</span>
              <span>停留: {{ activity.duration }} 分钟</span>
              <span class="px-2 py-1 rounded" :class="getActivityTypeClass(activity.type)">
                {{ activity.type }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计图表 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <!-- 流量趋势图 -->
      <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
        <h3 class="text-xl font-bold text-white mb-4">流量趋势</h3>
        <div ref="trafficChartRef" class="h-80"></div>
      </div>

      <!-- 网站访问分布 -->
      <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
        <h3 class="text-xl font-bold text-white mb-4">网站访问分布</h3>
        <div ref="websiteChartRef" class="h-80"></div>
      </div>
    </div>

    <!-- 详细分析 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- 风险分析 -->
      <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
        <h3 class="text-xl font-bold text-white mb-4">风险分析</h3>
        <div class="space-y-4">
          <div v-for="risk in reportData?.riskAnalysis" :key="risk.id" 
               class="p-4 bg-white/5 rounded-lg">
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-white font-medium">{{ risk.title }}</h4>
              <t-tag :theme="risk.level === 'high' ? 'danger' : risk.level === 'medium' ? 'warning' : 'success'" size="small">
                {{ risk.level === 'high' ? '高风险' : risk.level === 'medium' ? '中风险' : '低风险' }}
              </t-tag>
            </div>
            <p class="text-blue-200 text-sm">{{ risk.description }}</p>
          </div>
        </div>
      </div>

      <!-- 建议措施 -->
      <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
        <h3 class="text-xl font-bold text-white mb-4">建议措施</h3>
        <div class="space-y-4">
          <div v-for="suggestion in reportData?.suggestions" :key="suggestion.id" 
               class="p-4 bg-white/5 rounded-lg">
            <div class="flex items-start space-x-3">
              <div class="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center mt-1">
                <LightbulbIcon class="w-4 h-4 text-blue-400" />
              </div>
              <div class="flex-1">
                <h4 class="text-white font-medium mb-2">{{ suggestion.title }}</h4>
                <p class="text-blue-200 text-sm">{{ suggestion.description }}</p>
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
  TrendingUpIcon,
  GlobeIcon,
  ClockIcon,
  ShieldIcon,
  LightbulbIcon
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

// 图表引用
const trafficChartRef = ref<HTMLElement>()
const websiteChartRef = ref<HTMLElement>()

// 图表实例
let trafficChart: echarts.ECharts | null = null
let websiteChart: echarts.ECharts | null = null

// 报告数据
const reportData = ref<any>(null)

/**
 * 获取风险等级颜色
 */
const getRiskLevelColor = (level: string) => {
  switch (level) {
    case 'high': return 'text-red-400'
    case 'medium': return 'text-yellow-400'
    case 'low': return 'text-green-400'
    default: return 'text-blue-400'
  }
}

/**
 * 获取风险等级文本
 */
const getRiskLevelText = (level: string) => {
  switch (level) {
    case 'high': return '高风险'
    case 'medium': return '中风险'
    case 'low': return '低风险'
    default: return '未知'
  }
}

/**
 * 获取活动类型样式
 */
const getActivityTypeClass = (type: string) => {
  switch (type) {
    case '工作相关': return 'bg-green-500/20 text-green-400'
    case '社交媒体': return 'bg-blue-500/20 text-blue-400'
    case '娱乐': return 'bg-purple-500/20 text-purple-400'
    case '购物': return 'bg-yellow-500/20 text-yellow-400'
    case '风险网站': return 'bg-red-500/20 text-red-400'
    default: return 'bg-gray-500/20 text-gray-400'
  }
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
 * 初始化流量趋势图
 */
const initTrafficChart = () => {
  if (!trafficChartRef.value || !reportData.value) return

  trafficChart = echarts.init(trafficChartRef.value)
  
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
      data: reportData.value.trafficTrend.map((item: any) => item.time),
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
      data: reportData.value.trafficTrend.map((item: any) => item.traffic),
      type: 'line',
      smooth: true,
      lineStyle: { color: '#1890ff', width: 3 },
      itemStyle: { color: '#1890ff' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
          { offset: 1, color: 'rgba(24, 144, 255, 0.1)' }
        ])
      }
    }]
  }

  trafficChart.setOption(option)
}

/**
 * 初始化网站访问分布图
 */
const initWebsiteChart = () => {
  if (!websiteChartRef.value || !reportData.value) return

  websiteChart = echarts.init(websiteChartRef.value)
  
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
      data: reportData.value.websiteDistribution,
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

  websiteChart.setOption(option)
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
    initTrafficChart()
    initWebsiteChart()
  }, 100)

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    trafficChart?.resize()
    websiteChart?.resize()
  })
})

/**
 * 组件卸载
 */
onUnmounted(() => {
  trafficChart?.dispose()
  websiteChart?.dispose()
  window.removeEventListener('resize', () => {})
})
</script>

<style scoped>
.employee-report-detail-page {
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