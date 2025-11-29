<template>
  <div class="ai-analysis-page min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-6">
    <!-- 页面标题 -->
    <div class="mb-8 flex justify-between items-center">
      <div>
        <h1 class="text-4xl font-bold text-white mb-2">AI智能分析</h1>
        <p class="text-blue-200">基于机器学习的员工行为模式识别与安全风险评估</p>
      </div>
      <div>
        <t-button 
          theme="primary" 
          size="large"
          @click="goToReport"
          class="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0"
        >
          <template #icon>
            <FileTextIcon class="w-5 h-5" />
          </template>
          生成报告
        </t-button>
      </div>
    </div>

    <!-- 分析概览卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-blue-200 text-sm">行为异常检测</p>
            <p class="text-3xl font-bold text-white">{{ analysisStats.anomalyCount }}</p>
          </div>
          <div class="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
            <AlertTriangleIcon class="w-6 h-6 text-red-400" />
          </div>
        </div>
        <div class="mt-4">
          <span class="text-red-400 text-sm">↗ +{{ analysisStats.anomalyIncrease }}%</span>
          <span class="text-blue-200 text-sm ml-2">较昨日</span>
        </div>
      </div>

      <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-blue-200 text-sm">安全风险评分</p>
            <p class="text-3xl font-bold text-white">{{ analysisStats.riskScore }}/100</p>
          </div>
          <div class="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
            <ShieldIcon class="w-6 h-6 text-yellow-400" />
          </div>
        </div>
        <div class="mt-4">
          <t-progress 
            :percentage="analysisStats.riskScore" 
            :color="getRiskColor(analysisStats.riskScore)"
            size="small"
          />
        </div>
      </div>

      <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-blue-200 text-sm">模型准确率</p>
            <p class="text-3xl font-bold text-white">{{ analysisStats.modelAccuracy }}%</p>
          </div>
          <div class="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
            <BrainIcon class="w-6 h-6 text-green-400" />
          </div>
        </div>
        <div class="mt-4">
          <span class="text-green-400 text-sm">↗ +0.3%</span>
          <span class="text-blue-200 text-sm ml-2">模型优化</span>
        </div>
      </div>

      <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-blue-200 text-sm">处理数据量</p>
            <p class="text-3xl font-bold text-white">{{ analysisStats.dataProcessed }}K</p>
          </div>
          <div class="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <DatabaseIcon class="w-6 h-6 text-blue-400" />
          </div>
        </div>
        <div class="mt-4">
          <span class="text-blue-400 text-sm">实时更新</span>
        </div>
      </div>
    </div>

    <!-- 主要分析区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <!-- 行为模式分析 -->
      <div class="lg:col-span-2">
        <div class="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
          <div class="p-6 border-b border-white/20">
            <div class="flex justify-between items-center">
              <h3 class="text-xl font-semibold text-white">行为模式识别</h3>
              <t-button size="small" theme="primary" @click="refreshAnalysis" :loading="loading">
                <RefreshCwIcon class="w-4 h-4 mr-2" />
                刷新分析
              </t-button>
            </div>
          </div>
          
          <div class="p-6">
            <div ref="behaviorChartRef" class="h-80 mb-6"></div>
            
            <!-- 行为模式列表 -->
            <div class="space-y-4">
              <h4 class="text-lg font-medium text-white">检测到的异常模式</h4>
              <div class="space-y-3">
                <div v-for="pattern in behaviorPatterns" :key="pattern.id" 
                     class="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div class="flex items-center space-x-3">
                    <div class="w-3 h-3 rounded-full" 
                         :class="pattern.severity === 'high' ? 'bg-red-400' : 
                                pattern.severity === 'medium' ? 'bg-yellow-400' : 'bg-blue-400'">
                    </div>
                    <div>
                      <p class="text-white font-medium">{{ pattern.description }}</p>
                      <p class="text-blue-200 text-sm">影响员工: {{ pattern.affectedEmployees }} 人</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-white">置信度: {{ pattern.confidence }}%</p>
                    <t-tag 
                      :theme="pattern.severity === 'high' ? 'danger' : 
                             pattern.severity === 'medium' ? 'warning' : 'primary'"
                      size="small"
                    >
                      {{ pattern.severity === 'high' ? '高风险' : 
                         pattern.severity === 'medium' ? '中风险' : '低风险' }}
                    </t-tag>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 风险评估 -->
      <div class="space-y-6">
        <!-- 实时风险监控 -->
        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <h3 class="text-xl font-semibold text-white mb-4">实时风险监控</h3>
          <div ref="riskChartRef" class="h-48 mb-4"></div>
          
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-blue-200">数据泄露风险</span>
              <span class="text-red-400 font-semibold">{{ riskMetrics.dataLeakage }}%</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-blue-200">恶意软件风险</span>
              <span class="text-yellow-400 font-semibold">{{ riskMetrics.malware }}%</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-blue-200">违规访问风险</span>
              <span class="text-orange-400 font-semibold">{{ riskMetrics.unauthorizedAccess }}%</span>
            </div>
          </div>
        </div>

        <!-- AI模型状态 -->
        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <h3 class="text-xl font-semibold text-white mb-4">AI模型状态</h3>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-blue-200">行为分析模型</span>
              <div class="flex items-center space-x-2">
                <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                <span class="text-green-400 text-sm">运行中</span>
              </div>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-blue-200">异常检测模型</span>
              <div class="flex items-center space-x-2">
                <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                <span class="text-green-400 text-sm">运行中</span>
              </div>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-blue-200">风险评估模型</span>
              <div class="flex items-center space-x-2">
                <div class="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span class="text-yellow-400 text-sm">更新中</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 详细分析报告 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 员工风险排行 -->
      <div class="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
        <div class="p-6 border-b border-white/20">
          <h3 class="text-xl font-semibold text-white">高风险员工排行</h3>
        </div>
        
        <div class="p-6">
          <div class="space-y-4">
            <div v-for="(employee, index) in highRiskEmployees" :key="employee.id" 
                 class="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div class="flex items-center space-x-4">
                <div class="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span class="text-white font-bold text-sm">{{ index + 1 }}</span>
                </div>
                <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span class="text-white font-semibold">{{ employee.name.charAt(0) }}</span>
                </div>
                <div>
                  <p class="text-white font-medium">{{ employee.name }}</p>
                  <p class="text-blue-200 text-sm">{{ employee.department }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-red-400 font-semibold">{{ employee.riskScore }}/100</p>
                <p class="text-blue-200 text-sm">{{ employee.riskReason }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 安全建议 -->
      <div class="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
        <div class="p-6 border-b border-white/20">
          <h3 class="text-xl font-semibold text-white">AI安全建议</h3>
        </div>
        
        <div class="p-6">
          <div class="space-y-4">
            <div v-for="suggestion in securitySuggestions" :key="suggestion.id" 
                 class="p-4 bg-white/5 rounded-lg">
              <div class="flex items-start space-x-3">
                <div class="w-6 h-6 rounded-full flex items-center justify-center mt-1"
                     :class="suggestion.priority === 'high' ? 'bg-red-500/20' : 
                            suggestion.priority === 'medium' ? 'bg-yellow-500/20' : 'bg-blue-500/20'">
                  <LightbulbIcon class="w-4 h-4" 
                                :class="suggestion.priority === 'high' ? 'text-red-400' : 
                                       suggestion.priority === 'medium' ? 'text-yellow-400' : 'text-blue-400'" />
                </div>
                <div class="flex-1">
                  <p class="text-white font-medium mb-2">{{ suggestion.title }}</p>
                  <p class="text-blue-200 text-sm mb-3">{{ suggestion.description }}</p>
                  <div class="flex justify-between items-center">
                    <t-tag 
                      :theme="suggestion.priority === 'high' ? 'danger' : 
                             suggestion.priority === 'medium' ? 'warning' : 'primary'"
                      size="small"
                    >
                      {{ suggestion.priority === 'high' ? '高优先级' : 
                         suggestion.priority === 'medium' ? '中优先级' : '低优先级' }}
                    </t-tag>
                    <t-button size="small" theme="primary" variant="text">
                      查看详情
                    </t-button>
                  </div>
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
import { useRouter } from 'vue-router'
import { useReportState } from '../composables/useReportState'
import * as echarts from 'echarts'
import { 
  AlertTriangleIcon, 
  ShieldIcon, 
  BrainIcon, 
  DatabaseIcon, 
  RefreshCwIcon,
  LightbulbIcon,
  FileTextIcon
} from 'lucide-vue-next'

const router = useRouter()
const { generateReport } = useReportState()

// 响应式数据
const loading = ref(false)
const analysisStats = ref({
  anomalyCount: 0,
  anomalyIncrease: 0,
  riskScore: 0,
  modelAccuracy: 0,
  dataProcessed: 0
})

const behaviorPatterns = ref([])
const highRiskEmployees = ref([])
const securitySuggestions = ref([])
const riskMetrics = ref({
  dataLeakage: 0,
  malware: 0,
  unauthorizedAccess: 0
})

// 图表引用
const behaviorChartRef = ref()
const riskChartRef = ref()

let behaviorChart: echarts.ECharts | null = null
let riskChart: echarts.ECharts | null = null
let updateInterval: NodeJS.Timeout | null = null

/**
 * 获取风险颜色
 */
const getRiskColor = (score: number) => {
  if (score > 70) return '#ef4444'
  if (score > 40) return '#f59e0b'
  return '#10b981'
}

/**
 * 获取AI分析统计数据
 */
const fetchAnalysisStats = async () => {
  try {
    const response = await fetch('/api/ai/stats')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result = await response.json()
    if (result.success) {
      analysisStats.value = result.data
    }
  } catch (error) {
    console.error('获取AI分析统计失败:', error)
    // 使用模拟数据
    analysisStats.value = {
      anomalyCount: 23,
      anomalyIncrease: 12,
      riskScore: 68,
      modelAccuracy: 94.2,
      dataProcessed: 1247
    }
  }
}

/**
 * 获取行为模式数据
 */
const fetchBehaviorPatterns = async () => {
  try {
    const response = await fetch('/api/ai/behavior-analysis')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result = await response.json()
    if (result.success) {
      behaviorPatterns.value = result.data.patterns
      riskMetrics.value = result.data.riskMetrics
    }
  } catch (error) {
    console.error('获取行为模式失败:', error)
    // 使用模拟数据
    behaviorPatterns.value = [
      '大量文件下载',
      '非工作时间访问',
      '异常网络流量',
      '敏感数据访问'
    ]
    riskMetrics.value = {
      dataLeakage: 15,
      malware: 8,
      unauthorizedAccess: 23
    }
  }
}

/**
 * 获取高风险员工数据
 */
const fetchHighRiskEmployees = async () => {
  try {
    const response = await fetch('/api/ai/high-risk-employees')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result = await response.json()
    if (result.success) {
      highRiskEmployees.value = result.data
    }
  } catch (error) {
    console.error('获取高风险员工失败:', error)
    // 使用模拟数据
    highRiskEmployees.value = [
      {
        id: 1,
        name: '李明',
        department: '技术部',
        riskScore: 85,
        riskReason: '频繁访问敏感数据'
      },
      {
        id: 2,
        name: '王芳',
        department: '财务部',
        riskScore: 78,
        riskReason: '异常下载行为'
      },
      {
        id: 3,
        name: '张强',
        department: '市场部',
        riskScore: 72,
        riskReason: '非工作时间活跃'
      },
      {
        id: 4,
        name: '刘娜',
        department: '人事部',
        riskScore: 69,
        riskReason: '访问未授权网站'
      },
      {
        id: 5,
        name: '陈伟',
        department: '技术部',
        riskScore: 65,
        riskReason: '大量数据传输'
      }
    ]
  }
}

/**
 * 获取安全建议
 */
const fetchSecuritySuggestions = async () => {
  try {
    const response = await fetch('/api/ai/security-suggestions')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result = await response.json()
    if (result.success) {
      securitySuggestions.value = result.data
    }
  } catch (error) {
    console.error('获取安全建议失败:', error)
    // 使用模拟数据
    securitySuggestions.value = [
      {
        id: 1,
        title: '加强敏感数据访问控制',
        description: '检测到多名员工频繁访问敏感数据，建议实施更严格的权限管理和访问审计机制。',
        priority: 'high'
      },
      {
        id: 2,
        title: '优化网络安全策略',
        description: '发现异常网络流量模式，建议更新防火墙规则并加强网络监控。',
        priority: 'high'
      },
      {
        id: 3,
        title: '员工安全培训',
        description: '部分员工存在不安全的网络行为，建议开展网络安全意识培训。',
        priority: 'medium'
      },
      {
        id: 4,
        title: '系统漏洞修复',
        description: '检测到潜在的系统安全漏洞，建议及时更新系统补丁。',
        priority: 'medium'
      },
      {
        id: 5,
        title: '数据备份策略优化',
        description: '当前数据备份频率可能不足，建议增加备份频次并验证备份完整性。',
        priority: 'low'
      },
      {
        id: 6,
        title: '访问日志分析',
        description: '建议定期分析访问日志，识别潜在的安全威胁和异常行为模式。',
        priority: 'low'
      }
    ]
  }
}

/**
 * 初始化行为分析图表
 */
const initBehaviorChart = () => {
  if (!behaviorChartRef.value) return

  behaviorChart = echarts.init(behaviorChartRef.value)
  
  // 生成24小时的异常行为数据
  const hours = Array.from({ length: 24 }, (_, i) => i + ':00')
  const normalBehavior = Array.from({ length: 24 }, () => Math.floor(Math.random() * 50 + 20))
  const anomalyBehavior = Array.from({ length: 24 }, () => Math.floor(Math.random() * 15 + 2))

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#1890ff',
      textStyle: { color: '#fff' }
    },
    legend: {
      data: ['正常行为', '异常行为'],
      textStyle: { color: '#a0c4ff' },
      top: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: hours,
      axisLine: { lineStyle: { color: '#4a90e2' } },
      axisLabel: { color: '#a0c4ff' }
    },
    yAxis: {
      type: 'value',
      name: '行为次数',
      nameTextStyle: { color: '#a0c4ff' },
      axisLine: { lineStyle: { color: '#4a90e2' } },
      axisLabel: { color: '#a0c4ff' },
      splitLine: { lineStyle: { color: '#2a4a6b' } }
    },
    series: [
      {
        name: '正常行为',
        type: 'bar',
        stack: 'behavior',
        data: normalBehavior,
        itemStyle: { color: '#52c41a' }
      },
      {
        name: '异常行为',
        type: 'bar',
        stack: 'behavior',
        data: anomalyBehavior,
        itemStyle: { color: '#ff4d4f' }
      }
    ]
  }

  behaviorChart.setOption(option)
}

/**
 * 初始化风险监控图表
 */
const initRiskChart = () => {
  if (!riskChartRef.value) return

  riskChart = echarts.init(riskChartRef.value)
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#1890ff',
      textStyle: { color: '#fff' }
    },
    series: [{
      type: 'gauge',
      center: ['50%', '60%'],
      startAngle: 200,
      endAngle: -20,
      min: 0,
      max: 100,
      splitNumber: 10,
      itemStyle: {
        color: '#ff4d4f'
      },
      progress: {
        show: true,
        width: 30
      },
      pointer: {
        show: false
      },
      axisLine: {
        lineStyle: {
          width: 30,
          color: [[1, 'rgba(255, 255, 255, 0.1)']]
        }
      },
      axisTick: {
        distance: -45,
        splitNumber: 5,
        lineStyle: {
          width: 2,
          color: '#a0c4ff'
        }
      },
      splitLine: {
        distance: -52,
        length: 14,
        lineStyle: {
          width: 3,
          color: '#a0c4ff'
        }
      },
      axisLabel: {
        distance: -20,
        color: '#a0c4ff',
        fontSize: 12
      },
      anchor: {
        show: false
      },
      title: {
        show: false
      },
      detail: {
        valueAnimation: true,
        width: '60%',
        lineHeight: 40,
        borderRadius: 8,
        offsetCenter: [0, '-15%'],
        fontSize: 20,
        fontWeight: 'bolder',
        formatter: '{value}%',
        color: '#ff4d4f'
      },
      data: [{
        value: analysisStats.value.riskScore
      }]
    }]
  }

  riskChart.setOption(option)
}

/**
 * 刷新分析数据
 */
const refreshAnalysis = async () => {
  loading.value = true
  try {
    await Promise.all([
      fetchAnalysisStats(),
      fetchBehaviorPatterns(),
      fetchHighRiskEmployees(),
      fetchSecuritySuggestions()
    ])
    
    // 更新图表
    if (riskChart) {
      riskChart.setOption({
        series: [{
          data: [{ value: analysisStats.value.riskScore }]
        }]
      })
    }
  } catch (error) {
    console.error('刷新分析数据失败:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 组件挂载时初始化
 */
onMounted(async () => {
  await refreshAnalysis()
  
  setTimeout(() => {
    initBehaviorChart()
    initRiskChart()
  }, 100)

  // 设置定时更新
  updateInterval = setInterval(async () => {
    await fetchAnalysisStats()
    if (riskChart) {
      riskChart.setOption({
        series: [{
          data: [{ value: analysisStats.value.riskScore }]
        }]
      })
    }
  }, 60000) // 每分钟更新一次

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    behaviorChart?.resize()
    riskChart?.resize()
  })
})

/**
 * 跳转到报告页面
 */
const goToReport = () => {
  // 生成报告数据
  generateReport({
    employeeName: '张三',
    dateRange: '2024-01-01 至 2024-01-31',
    reportId: `RPT-${Date.now().toString().slice(-8)}`
  })
  
  // 跳转到报告页面
  router.push('/report')
}

/**
 * 组件卸载时清理
 */
onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
  behaviorChart?.dispose()
  riskChart?.dispose()
  window.removeEventListener('resize', () => {})
})
</script>

<style scoped>
.ai-analysis-page {
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