<template>
  <div class="ai-usage-report-detail-page min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-6">
    <!-- 页面头部 -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-4xl font-bold text-white mb-2">AI使用行为故事报告</h1>
          <p class="text-purple-200">{{ reportData?.date }} - 企业AI应用全景记录</p>
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

    <!-- 故事概览卡片 -->
    <div class="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 mb-8">
      <div class="text-center mb-6">
        <div class="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
          <BrainIcon class="w-10 h-10 text-white" />
        </div>
        <h2 class="text-2xl font-bold text-white mb-2">今日AI使用概览</h2>
        <p class="text-purple-200">让我们一起回顾今天企业中AI技术的精彩应用</p>
      </div>
      
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div class="text-center">
          <div class="text-3xl font-bold text-white mb-1">{{ reportData?.totalInteractions }}</div>
          <div class="text-purple-200 text-sm">AI交互次数</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-white mb-1">{{ reportData?.activeUsers }}</div>
          <div class="text-purple-200 text-sm">活跃用户</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-white mb-1">{{ reportData?.totalTokens }}</div>
          <div class="text-purple-200 text-sm">处理Token数</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-white mb-1">{{ reportData?.avgSatisfaction }}%</div>
          <div class="text-purple-200 text-sm">满意度</div>
        </div>
      </div>
    </div>

    <!-- 故事章节 -->
    <div class="space-y-8">
      <!-- 第一章：晨光初现 -->
      <div class="story-chapter">
        <div class="chapter-header mb-6">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <SunriseIcon class="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 class="text-2xl font-bold text-white">第一章：晨光初现</h3>
              <p class="text-purple-200">08:00 - 10:00 | 新一天的AI协作开始</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <div class="prose prose-invert max-w-none">
            <p class="text-white leading-relaxed mb-4">
              清晨8点，阳光透过办公室的玻璃窗洒向大地，我们的AI助手也开始了新一天的工作。
              <span class="text-yellow-300 font-semibold">{{ reportData?.morningStats?.firstUser }}</span> 
              成为了今天第一个与AI对话的员工，他在8:05分向AI询问了今日的工作安排。
            </p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
              <div class="bg-white/5 rounded-lg p-4">
                <h4 class="text-white font-semibold mb-3 flex items-center">
                  <MessageCircleIcon class="w-5 h-5 mr-2 text-blue-400" />
                  晨间热门对话
                </h4>
                <div class="space-y-2">
                  <div v-for="topic in reportData?.morningStats?.hotTopics" :key="topic.id" 
                       class="flex justify-between items-center text-sm">
                    <span class="text-purple-200">{{ topic.name }}</span>
                    <span class="text-white font-medium">{{ topic.count }}次</span>
                  </div>
                </div>
              </div>
              
              <div class="bg-white/5 rounded-lg p-4">
                <h4 class="text-white font-semibold mb-3 flex items-center">
                  <TrendingUpIcon class="w-5 h-5 mr-2 text-green-400" />
                  使用趋势
                </h4>
                <div ref="morningTrendChartRef" class="h-32"></div>
              </div>
            </div>
            
            <p class="text-white leading-relaxed">
              在这个充满希望的早晨，我们观察到员工们主要使用AI来进行
              <span class="bg-blue-500/20 px-2 py-1 rounded text-blue-300">日程规划</span>、
              <span class="bg-green-500/20 px-2 py-1 rounded text-green-300">邮件撰写</span> 和
              <span class="bg-purple-500/20 px-2 py-1 rounded text-purple-300">创意构思</span>。
              这些智能化的协作为新一天的工作奠定了高效的基础。
            </p>
          </div>
        </div>
      </div>

      <!-- 第二章：午间高峰 -->
      <div class="story-chapter">
        <div class="chapter-header mb-6">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
              <SunIcon class="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 class="text-2xl font-bold text-white">第二章：午间高峰</h3>
              <p class="text-purple-200">10:00 - 14:00 | AI协作的黄金时段</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <div class="prose prose-invert max-w-none">
            <p class="text-white leading-relaxed mb-4">
              随着工作节奏的加快，AI使用量在午间达到了峰值。
              <span class="text-orange-300 font-semibold">技术部门</span> 以 
              <span class="text-red-300 font-bold">{{ reportData?.peakStats?.techDeptUsage }}</span> 次交互领跑全公司，
              主要集中在代码审查和技术文档生成方面。
            </p>
            
            <!-- 部门使用情况可视化 -->
            <div class="my-6">
              <h4 class="text-white font-semibold mb-4 flex items-center">
                <BarChartIcon class="w-5 h-5 mr-2 text-cyan-400" />
                各部门AI使用热力图
              </h4>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div v-for="dept in reportData?.departmentUsage" :key="dept.name" 
                     class="bg-white/5 rounded-lg p-4 text-center">
                  <div class="text-2xl mb-2">{{ dept.emoji }}</div>
                  <div class="text-white font-medium text-sm">{{ dept.name }}</div>
                  <div class="text-cyan-300 text-xs mt-1">{{ dept.usage }}次</div>
                  <div class="w-full bg-gray-600 rounded-full h-2 mt-2">
                    <div 
                      class="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full"
                      :style="{ width: `${(dept.usage / reportData?.maxDeptUsage) * 100}%` }">
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4 my-6">
              <h4 class="text-white font-semibold mb-2 flex items-center">
                <SparklesIcon class="w-5 h-5 mr-2 text-pink-400" />
                精彩瞬间回放
              </h4>
              <p class="text-purple-100 text-sm leading-relaxed">
                {{ reportData?.peakStats?.highlightMoment }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 第三章：创新时刻 -->
      <div class="story-chapter">
        <div class="chapter-header mb-6">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
              <LightbulbIcon class="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 class="text-2xl font-bold text-white">第三章：创新时刻</h3>
              <p class="text-purple-200">14:00 - 18:00 | 创意与智慧的碰撞</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <div class="prose prose-invert max-w-none">
            <p class="text-white leading-relaxed mb-4">
              下午时光，创意的火花在AI的助力下绽放。我们见证了多个令人惊喜的创新应用场景：
            </p>
            
            <!-- 创新应用展示 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
              <div v-for="innovation in reportData?.innovations" :key="innovation.id" 
                   class="bg-gradient-to-br from-white/10 to-white/5 rounded-lg p-4 border border-white/10">
                <div class="flex items-start space-x-3">
                  <div class="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <component :is="innovation.icon" class="w-5 h-5 text-white"></component>
                  </div>
                  <div class="flex-1">
                    <h5 class="text-white font-semibold mb-2">{{ innovation.title }}</h5>
                    <p class="text-purple-200 text-sm mb-3">{{ innovation.description }}</p>
                    <div class="flex items-center space-x-4 text-xs">
                      <span class="text-pink-300">👤 {{ innovation.user }}</span>
                      <span class="text-purple-300">⏰ {{ innovation.time }}</span>
                      <span class="text-cyan-300">💡 {{ innovation.impact }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- AI能力分布雷达图 -->
            <div class="my-6">
              <h4 class="text-white font-semibold mb-4 flex items-center">
                <RadarIcon class="w-5 h-5 mr-2 text-indigo-400" />
                AI能力应用分布
              </h4>
              <div ref="abilityRadarChartRef" class="h-80"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 第四章：夜幕降临 -->
      <div class="story-chapter">
        <div class="chapter-header mb-6">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full flex items-center justify-center">
              <MoonIcon class="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 class="text-2xl font-bold text-white">第四章：夜幕降临</h3>
              <p class="text-purple-200">18:00 - 20:00 | 一天的总结与反思</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <div class="prose prose-invert max-w-none">
            <p class="text-white leading-relaxed mb-4">
              夜幕降临，办公室逐渐安静下来，但AI的服务并未停止。在这个时段，我们看到了更多关于
              <span class="text-indigo-300 font-semibold">工作总结</span> 和 
              <span class="text-purple-300 font-semibold">明日规划</span> 的对话。
            </p>
            
            <!-- 用户满意度和反馈 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
              <div class="bg-white/5 rounded-lg p-4">
                <h4 class="text-white font-semibold mb-4 flex items-center">
                  <HeartIcon class="w-5 h-5 mr-2 text-red-400" />
                  用户满意度
                </h4>
                <div ref="satisfactionChartRef" class="h-40"></div>
              </div>
              
              <div class="bg-white/5 rounded-lg p-4">
                <h4 class="text-white font-semibold mb-4 flex items-center">
                  <MessageSquareIcon class="w-5 h-5 mr-2 text-green-400" />
                  用户反馈精选
                </h4>
                <div class="space-y-3">
                  <div v-for="feedback in reportData?.userFeedbacks" :key="feedback.id" 
                       class="bg-white/5 rounded p-3">
                    <p class="text-purple-200 text-sm mb-2">"{{ feedback.content }}"</p>
                    <div class="flex items-center justify-between text-xs">
                      <span class="text-green-300">{{ feedback.user }}</span>
                      <div class="flex items-center space-x-1">
                        <StarIcon v-for="i in feedback.rating" :key="i" class="w-3 h-3 text-yellow-400 fill-current" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-lg p-6 my-6">
              <h4 class="text-white font-semibold mb-3 flex items-center">
                <TrophyIcon class="w-5 h-5 mr-2 text-yellow-400" />
                今日成就解锁
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div v-for="achievement in reportData?.achievements" :key="achievement.id" 
                     class="text-center">
                  <div class="text-3xl mb-2">{{ achievement.emoji }}</div>
                  <div class="text-white font-medium text-sm">{{ achievement.title }}</div>
                  <div class="text-purple-200 text-xs mt-1">{{ achievement.description }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 故事尾声 -->
    <div class="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-8 border border-white/20 mt-8">
      <div class="text-center">
        <h3 class="text-2xl font-bold text-white mb-4">故事尾声</h3>
        <p class="text-purple-200 leading-relaxed max-w-3xl mx-auto">
          {{ reportData?.conclusion }}
        </p>
        <div class="mt-6 flex items-center justify-center space-x-8">
          <div class="text-center">
            <div class="text-2xl font-bold text-white">{{ reportData?.totalSavings }}</div>
            <div class="text-purple-200 text-sm">节省时间(小时)</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-white">{{ reportData?.efficiencyGain }}%</div>
            <div class="text-purple-200 text-sm">效率提升</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-white">{{ reportData?.innovationCount }}</div>
            <div class="text-purple-200 text-sm">创新想法</div>
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
  BrainIcon,
  SunriseIcon,
  SunIcon,
  MoonIcon,
  LightbulbIcon,
  MessageCircleIcon,
  TrendingUpIcon,
  BarChartIcon,
  SparklesIcon,
  RadarIcon,
  HeartIcon,
  MessageSquareIcon,
  StarIcon,
  TrophyIcon
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

// 图表引用
const morningTrendChartRef = ref<HTMLElement>()
const abilityRadarChartRef = ref<HTMLElement>()
const satisfactionChartRef = ref<HTMLElement>()

// 图表实例
let morningTrendChart: echarts.ECharts | null = null
let abilityRadarChart: echarts.ECharts | null = null
let satisfactionChart: echarts.ECharts | null = null

// 报告数据
const reportData = ref<any>(null)

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
 * 初始化晨间趋势图
 */
const initMorningTrendChart = () => {
  if (!morningTrendChartRef.value || !reportData.value) return

  morningTrendChart = echarts.init(morningTrendChartRef.value)
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#8b5cf6',
      textStyle: { color: '#fff' }
    },
    grid: {
      left: '10%',
      right: '10%',
      bottom: '15%',
      top: '10%'
    },
    xAxis: {
      type: 'category',
      data: ['8:00', '8:30', '9:00', '9:30', '10:00'],
      axisLine: { lineStyle: { color: '#8b5cf6' } },
      axisLabel: { color: '#c4b5fd', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#8b5cf6' } },
      axisLabel: { color: '#c4b5fd', fontSize: 10 },
      splitLine: { lineStyle: { color: '#4c1d95' } }
    },
    series: [{
      data: reportData.value.morningTrend || [5, 12, 25, 35, 28],
      type: 'line',
      smooth: true,
      lineStyle: { color: '#fbbf24', width: 2 },
      itemStyle: { color: '#fbbf24' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(251, 191, 36, 0.3)' },
          { offset: 1, color: 'rgba(251, 191, 36, 0.1)' }
        ])
      }
    }]
  }

  morningTrendChart.setOption(option)
}

/**
 * 初始化AI能力雷达图
 */
const initAbilityRadarChart = () => {
  if (!abilityRadarChartRef.value || !reportData.value) return

  abilityRadarChart = echarts.init(abilityRadarChartRef.value)
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#8b5cf6',
      textStyle: { color: '#fff' }
    },
    radar: {
      indicator: [
        { name: '文本生成', max: 100 },
        { name: '代码辅助', max: 100 },
        { name: '数据分析', max: 100 },
        { name: '创意设计', max: 100 },
        { name: '问题解答', max: 100 },
        { name: '翻译服务', max: 100 }
      ],
      shape: 'polygon',
      splitNumber: 4,
      axisName: {
        color: '#c4b5fd',
        fontSize: 12
      },
      splitLine: {
        lineStyle: { color: '#4c1d95' }
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ['rgba(139, 92, 246, 0.1)', 'rgba(139, 92, 246, 0.05)']
        }
      }
    },
    series: [{
      type: 'radar',
      data: [{
        value: reportData.value.abilityScores || [85, 92, 78, 65, 88, 72],
        name: 'AI能力使用',
        itemStyle: { color: '#8b5cf6' },
        areaStyle: {
          color: 'rgba(139, 92, 246, 0.3)'
        },
        lineStyle: { color: '#8b5cf6', width: 2 }
      }]
    }]
  }

  abilityRadarChart.setOption(option)
}

/**
 * 初始化满意度图表
 */
const initSatisfactionChart = () => {
  if (!satisfactionChartRef.value || !reportData.value) return

  satisfactionChart = echarts.init(satisfactionChartRef.value)
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#8b5cf6',
      textStyle: { color: '#fff' }
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: [
        { value: 65, name: '非常满意', itemStyle: { color: '#10b981' } },
        { value: 25, name: '满意', itemStyle: { color: '#3b82f6' } },
        { value: 8, name: '一般', itemStyle: { color: '#f59e0b' } },
        { value: 2, name: '不满意', itemStyle: { color: '#ef4444' } }
      ],
      label: {
        color: '#c4b5fd',
        fontSize: 10
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  }

  satisfactionChart.setOption(option)
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
  console.log('导出AI使用行为报告')
}

/**
 * 组件挂载
 */
onMounted(async () => {
  await fetchReportData()
  
  // 延迟初始化图表，确保DOM已渲染
  setTimeout(() => {
    initMorningTrendChart()
    initAbilityRadarChart()
    initSatisfactionChart()
  }, 100)

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    morningTrendChart?.resize()
    abilityRadarChart?.resize()
    satisfactionChart?.resize()
  })
})

/**
 * 组件卸载
 */
onUnmounted(() => {
  morningTrendChart?.dispose()
  abilityRadarChart?.dispose()
  satisfactionChart?.dispose()
  window.removeEventListener('resize', () => {})
})
</script>

<style scoped>
.ai-usage-report-detail-page {
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.story-chapter {
  position: relative;
}

.chapter-header {
  position: relative;
}

.chapter-header::before {
  content: '';
  position: absolute;
  left: 24px;
  top: 60px;
  bottom: -40px;
  width: 2px;
  background: linear-gradient(to bottom, rgba(139, 92, 246, 0.5), transparent);
}

.story-chapter:last-child .chapter-header::before {
  display: none;
}

.prose {
  line-height: 1.8;
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
  background: rgba(139, 92, 246, 0.5);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 92, 246, 0.7);
}

/* 动画效果 */
.story-chapter {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>