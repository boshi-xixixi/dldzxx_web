<template>
  <div class="ai-chat-page min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-cyan-900 p-6">
    <!-- 页面标题 -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent tracking-tight mb-2">AI智能助手</h1>
      <p class="text-blue-200/90">基于大语言模型的网络安全智能问答系统</p>
    </div>

    <!-- 助手状态卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="glass-card p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-blue-200 text-sm">助手状态</p>
            <p class="text-2xl font-bold text-white">{{ assistantStatus.status === 'online' ? '在线' : '离线' }}</p>
          </div>
          <div class="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
            <BotIcon class="w-6 h-6 text-green-400" />
          </div>
        </div>
        <div class="mt-4">
          <span class="text-green-400 text-sm">{{ assistantStatus.responseTime }}ms</span>
          <span class="text-blue-200 text-sm ml-2">响应时间</span>
        </div>
      </div>

      <div class="glass-card p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-blue-200 text-sm">今日对话</p>
            <p class="text-3xl font-bold text-white">{{ assistantStatus.todayChats }}</p>
          </div>
          <div class="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <MessageCircleIcon class="w-6 h-6 text-blue-400" />
          </div>
        </div>
        <div class="mt-4">
          <span class="text-blue-400 text-sm">↗ +{{ assistantStatus.chatIncrease }}</span>
          <span class="text-blue-200 text-sm ml-2">较昨日</span>
        </div>
      </div>

      <div class="glass-card p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-blue-200 text-sm">解决问题</p>
            <p class="text-3xl font-bold text-white">{{ assistantStatus.resolvedIssues }}</p>
          </div>
          <div class="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <CheckCircleIcon class="w-6 h-6 text-purple-400" />
          </div>
        </div>
        <div class="mt-4">
          <span class="text-purple-400 text-sm">{{ assistantStatus.satisfactionRate }}%</span>
          <span class="text-blue-200 text-sm ml-2">满意度</span>
        </div>
      </div>

      <div class="glass-card p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-blue-200 text-sm">知识库</p>
            <p class="text-3xl font-bold text-white">{{ assistantStatus.knowledgeBase }}K</p>
          </div>
          <div class="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
            <BookOpenIcon class="w-6 h-6 text-yellow-400" />
          </div>
        </div>
        <div class="mt-4">
          <span class="text-yellow-400 text-sm">实时更新</span>
        </div>
      </div>
    </div>

    <!-- 主要聊天区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- 聊天界面 -->
      <div class="lg:col-span-3">
        <div class="glass-card h-[640px] flex flex-col">
          <!-- 聊天头部（视觉优化） -->
          <div class="px-6 py-4 border-b border-white/20 flex justify-between items-center bg-white/5">
            <div class="flex items-center space-x-4">
              <div class="p-0.5 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500">
                <div class="w-10 h-10 rounded-full bg-emerald-600/80 flex items-center justify-center shadow-md">
                  <BotIcon class="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <div class="flex items-center space-x-3">
                  <h3 class="text-xl font-semibold text-white tracking-wide">网络安全AI助手</h3>
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-300 border border-green-400/30">
                    <span class="inline-block w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></span>
                    {{ assistantStatus.status === 'online' ? '在线' : '离线' }}
                  </span>
                </div>
                <p class="text-blue-200 text-xs mt-1">专业的网络安全问题解答 · 响应约 {{ assistantStatus.responseTime }}ms</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <t-button size="small" theme="default" variant="base" @click="clearChat" class="bg-white/10 hover:bg-white/15">
                <TrashIcon class="w-4 h-4 mr-2" />清空
              </t-button>
              <t-button size="small" theme="primary" variant="base" @click="exportChat" class="bg-blue-500/80 hover:bg-blue-500">
                <DownloadIcon class="w-4 h-4 mr-2" />导出
              </t-button>
            </div>
          </div>

          <!-- 消息滚动区 -->
          <div class="flex-1 overflow-y-auto p-6 chat-scroll-area">
            <t-chat
              ref="chatRef"
              :data="chatMessages"
              :reverse="false"
              :clear-history="false"
              @scroll="handleScrollToBottom"
              class="min-h-[420px]"
            />
          </div>
          <!-- 底部输入栏（吸底） -->
          <div class="p-4 border-t border-white/15 bg-white/5 backdrop-blur-sm">
            <div class="flex items-center space-x-3">
              <div class="flex items-center space-x-2 text-blue-200/80">
                <PaperclipIcon class="w-4 h-4 opacity-70" />
                <MicIcon class="w-4 h-4 opacity-50" />
              </div>
              <t-textarea
                v-model="userInput"
                placeholder="请输入您的问题..."
                class="flex-1"
                :autosize="{ minRows: 1, maxRows: 5 }"
                @keydown.enter.exact.prevent="handleComposerEnter"
              />
              <t-button theme="primary" class="px-5" @click="handleManualSubmit">发送</t-button>
            </div>
            <p class="text-[11px] text-blue-200 mt-2">按 Enter 发送，Shift+Enter 换行</p>
          </div>
        </div>
      </div>

      <!-- 右侧功能区域 -->
      <div class="space-y-6">
        <!-- 快捷问题 -->
        <div class="glass-card p-6">
          <h3 class="text-xl font-semibold text-white mb-4">常见问题</h3>
          <div class="grid grid-cols-2 gap-2">
            <button 
              v-for="question in quickQuestions" 
              :key="question.id"
              @click="askQuickQuestion(question.text)"
              class="chip"
            >
              <span class="text-white text-sm">{{ question.text }}</span>
              <span class="text-blue-200 text-xs">{{ question.category }}</span>
            </button>
          </div>
        </div>

        <!-- 对话统计 -->
        <div class="glass-card p-6">
          <h3 class="text-xl font-semibold text-white mb-4">对话统计</h3>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-blue-200">本次对话轮数</span>
              <span class="text-white font-semibold">{{ messages.length / 2 }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-blue-200">平均响应时间</span>
              <span class="text-white font-semibold">{{ averageResponseTime }}ms</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-blue-200">问题类型</span>
              <span class="text-white font-semibold">{{ currentQuestionType }}</span>
            </div>
          </div>
        </div>

        <!-- AI助手能力 -->
        <div class="glass-card p-6">
          <h3 class="text-xl font-semibold text-white mb-4">AI助手能力</h3>
          <div class="space-y-3">
            <div class="flex items-center space-x-3">
              <ShieldCheckIcon class="w-5 h-5 text-green-400" />
              <span class="text-blue-200 text-sm">网络安全分析</span>
            </div>
            <div class="flex items-center space-x-3">
              <AlertTriangleIcon class="w-5 h-5 text-yellow-400" />
              <span class="text-blue-200 text-sm">威胁检测建议</span>
            </div>
            <div class="flex items-center space-x-3">
              <TrendingUpIcon class="w-5 h-5 text-blue-400" />
              <span class="text-blue-200 text-sm">流量分析解读</span>
            </div>
            <div class="flex items-center space-x-3">
              <UsersIcon class="w-5 h-5 text-purple-400" />
              <span class="text-blue-200 text-sm">员工行为分析</span>
            </div>
            <div class="flex items-center space-x-3">
              <SettingsIcon class="w-5 h-5 text-orange-400" />
              <span class="text-blue-200 text-sm">系统配置指导</span>
            </div>
          </div>
        </div>

        <!-- 反馈评价 -->
        <div class="glass-card p-6">
          <h3 class="text-xl font-semibold text-white mb-4">反馈评价</h3>
          <div class="space-y-4">
            <div>
              <p class="text-blue-200 text-sm mb-2">本次对话满意度</p>
              <div class="flex space-x-2">
                <button 
                  v-for="star in 5" 
                  :key="star"
                  @click="rateSatisfaction(star)"
                  class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                >
                  <StarIcon 
                    class="w-5 h-5" 
                    :class="star <= currentRating ? 'text-yellow-400 fill-current' : 'text-gray-400'"
                  />
                </button>
              </div>
            </div>
            <div>
              <t-textarea 
                v-model="feedbackText"
                placeholder="请输入您的建议或反馈..."
                :rows="3"
                class="w-full"
              />
            </div>
            <t-button size="small" theme="primary" @click="submitFeedback" class="w-full">
              提交反馈
            </t-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue'
import {
  loginOrRegisterAndGetToken,
  createConversation,
  sendMessage,
  buildAssistantStatus,
} from '../lib/llmApi'
import { 
  BotIcon, 
  MessageCircleIcon, 
  CheckCircleIcon, 
  BookOpenIcon,
  TrashIcon,
  DownloadIcon,
  ShieldCheckIcon,
  AlertTriangleIcon,
  TrendingUpIcon,
  UsersIcon,
  SettingsIcon,
  StarIcon,
  PaperclipIcon,
  MicIcon
} from 'lucide-vue-next'

// 响应式数据
const messages = ref([])
// Chat 组件实例引用，用于调用滚动到底部方法
const chatRef = ref<any>(null)
const userInput = ref('')
const authToken = ref<string | null>(null)
const currentConversationId = ref<string | null>(null)
const llmReady = ref(false)
const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001'
const assistantStatus = ref({
  status: 'online',
  responseTime: 150,
  todayChats: 0,
  chatIncrease: 0,
  resolvedIssues: 0,
  satisfactionRate: 0,
  knowledgeBase: 0
})

const currentRating = ref(0)
const feedbackText = ref('')
const currentQuestionType = ref('网络安全')

// 聊天配置
const chatConfig = {
  placeholder: '请输入您的问题...',
  sendBtnText: '发送',
  showUserAvatar: true,
  showAssistantAvatar: true,
  userAvatar: '',
  assistantAvatar: '',
  theme: 'dark',
  enableVoice: false,
  enableUpload: false
}

// 快捷问题
const quickQuestions = ref([
  { id: 1, text: '如何检测网络异常流量？', category: '流量分析' },
  { id: 2, text: '员工访问了危险网站怎么办？', category: '安全管理' },
  { id: 3, text: '如何设置网络访问权限？', category: '权限管理' },
  { id: 4, text: '发现恶意软件如何处理？', category: '威胁处理' },
  { id: 5, text: '如何分析员工上网行为？', category: '行为分析' },
  { id: 6, text: '网络安全策略如何制定？', category: '策略制定' }
])

// 计算属性
const averageResponseTime = computed(() => {
  return Math.floor(Math.random() * 200 + 100)
})

/**
 * 将内部 messages 映射为 TDesign Chat 组件所需的数据结构
 * 字段映射：content -> content，role -> role，time -> datetime，并补充显示名称与头像
 */
const chatMessages = computed(() => {
  return messages.value.map((m: any) => ({
    content: m.content,
    role: m.role,
    datetime: m.time,
    name: m.role === 'user' ? '用户' : 'AI助手',
    avatar: m.role === 'user' ? chatConfig.userAvatar : chatConfig.assistantAvatar,
  }))
})

/**
 * 获取助手状态数据
 */
/**
 * 获取助手状态数据（优先使用 LLM 后端，会在失败时回退本地模拟）
 */
const fetchAssistantStatus = async () => {
  try {
    if (authToken.value) {
      const status = await buildAssistantStatus(authToken.value)
      assistantStatus.value = status
      return
    }
  } catch (error) {
    console.error('LLM 后端状态获取失败，使用本地模拟:', error)
  }
  // 回退到本地模拟接口
  try {
    const response = await fetch(`${apiBase}/api/ai/analytics-stats`)
    const result = await response.json()
    if (result.success) {
      assistantStatus.value = {
        status: 'online',
        responseTime: result.data.processingTime,
        todayChats: result.data.todayAnalyses,
        chatIncrease: Math.floor(Math.random() * 5),
        resolvedIssues: Math.floor(Math.random() * 20) + 10,
        satisfactionRate: Math.floor(Math.random() * 20) + 80,
        knowledgeBase: Math.floor(Math.random() * 50) + 100,
      }
    }
  } catch (err) {
    console.error('本地模拟状态获取失败:', err)
  }
}

/**
 * 处理消息发送
 */
/**
 * 处理消息发送
 * 优先使用 LLM 会话接口，失败时回退到本地模拟 `/api/ai/chat`
 */
/**
 * 处理 Chat 提交消息事件：
 * - 追加用户消息到消息列表
 * - 调用后端/LLM 获取助手回复并追加
 * - 每次追加后滚动到底部，确保最新消息可见
 */
const handleSubmit = async (message: any) => {
  // 添加用户消息
  messages.value.push({
    id: Date.now(),
    content: message.text,
    role: 'user',
    time: new Date().toLocaleTimeString('zh-CN')
  })
  // 滚动到底部以显示最新的用户消息
  await nextTick()
  chatRef.value?.scrollToBottom({ behavior: 'auto' })

  // 分析问题类型
  analyzeQuestionType(message.text)

  // 优先调用 LLM 后端
  try {
    if (llmReady.value && authToken.value && currentConversationId.value) {
      const result = await sendMessage(currentConversationId.value, message.text, authToken.value)
      messages.value.push({
        id: Date.now() + 1,
        content: result.assistant_response,
        role: 'assistant',
        time: new Date().toLocaleTimeString('zh-CN')
      })
      // 滚动到底部以显示最新的助手消息
      await nextTick()
      chatRef.value?.scrollToBottom({ behavior: 'auto' })
      return
    }
  } catch (error) {
    console.error('LLM 消息发送失败，改用本地模拟:', error)
  }

  // 回退到本地模拟接口
  try {
    const response = await fetch(`${apiBase}/api/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message.text,
        history: messages.value.slice(-10)
      })
    })
    const result = await response.json()
    if (result.success) {
      messages.value.push({
        id: Date.now() + 1,
        content: result.data.reply,
        role: 'assistant',
        time: new Date().toLocaleTimeString('zh-CN')
      })
      // 滚动到底部以显示最新的助手消息
      await nextTick()
      chatRef.value?.scrollToBottom({ behavior: 'auto' })
    }
  } catch (error) {
    console.error('本地模拟发送失败:', error)
    messages.value.push({
      id: Date.now() + 1,
      content: '抱歉，我现在无法回答您的问题，请稍后再试。',
      role: 'assistant',
      time: new Date().toLocaleTimeString('zh-CN')
    })
    // 滚动到底部以显示错误提示消息
    await nextTick()
    chatRef.value?.scrollToBottom({ behavior: 'auto' })
  }
}

/**
 * 手动提交输入框内容
 */
const handleManualSubmit = () => {
  const text = userInput.value.trim()
  if (!text) return
  handleSubmit({ text })
  userInput.value = ''
}

const handleComposerEnter = (e: KeyboardEvent) => {
  if (!e.shiftKey) {
    handleManualSubmit()
  }
}

/**
 * 分析问题类型
 */
const analyzeQuestionType = (question: string) => {
  if (question.includes('流量') || question.includes('带宽')) {
    currentQuestionType.value = '流量分析'
  } else if (question.includes('员工') || question.includes('行为')) {
    currentQuestionType.value = '行为分析'
  } else if (question.includes('安全') || question.includes('威胁')) {
    currentQuestionType.value = '安全管理'
  } else if (question.includes('权限') || question.includes('访问')) {
    currentQuestionType.value = '权限管理'
  } else {
    currentQuestionType.value = '网络安全'
  }
}

/**
 * 快捷提问
 */
const askQuickQuestion = (question: string) => {
  handleSubmit({ text: question })
}

/**
 * 清空对话
 */
const clearChat = () => {
  messages.value = []
  currentRating.value = 0
  feedbackText.value = ''
}

/**
 * 导出对话
 */
const exportChat = () => {
  const chatContent = messages.value.map(msg => 
    `[${msg.time}] ${msg.role === 'user' ? '用户' : 'AI助手'}: ${msg.content}`
  ).join('\n')
  
  const blob = new Blob([chatContent], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `AI对话记录_${new Date().toLocaleDateString('zh-CN')}.txt`
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * 评分
 */
const rateSatisfaction = (rating: number) => {
  currentRating.value = rating
}

/**
 * 提交反馈
 */
const submitFeedback = async () => {
  if (!feedbackText.value.trim() && currentRating.value === 0) {
    return
  }

  try {
    const response = await fetch(`${apiBase}/api/ai/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        rating: currentRating.value,
        feedback: feedbackText.value,
        sessionId: Date.now()
      })
    })

    if (response.ok) {
      // 显示成功提示
      feedbackText.value = ''
      currentRating.value = 0
    }
  } catch (error) {
    console.error('提交反馈失败:', error)
  }
}

/**
 * 处理滚动到底部
 */
const handleScrollToBottom = () => {
  // 可以在这里添加滚动到底部的逻辑
}

/**
 * 初始化欢迎消息
 */
/**
 * 初始化欢迎消息
 */
const initWelcomeMessage = () => {
  messages.value = [
    {
      id: 1,
      content: `您好！我是网络安全AI助手，专门为您提供网络安全相关的专业解答。

我可以帮助您：
🔍 分析网络流量异常
👥 解读员工上网行为
🛡️ 识别安全威胁
⚙️ 配置安全策略
📊 解释监控数据

请随时向我提问，我会尽力为您提供专业的建议和解决方案！`,
      role: 'assistant',
      time: new Date().toLocaleTimeString('zh-CN')
    }
  ]
}

/**
 * 初始化 LLM 后端认证与会话
 * 使用环境变量中的测试账号自动注册/登录
 */
const initLLM = async () => {
  try {
    const username = import.meta.env.VITE_LLM_TEST_USERNAME || 'test_user'
    const email = import.meta.env.VITE_LLM_TEST_EMAIL || 'test_user@example.com'
    const password = import.meta.env.VITE_LLM_TEST_PASSWORD || 'Passw0rd!'

    // 登录或注册，获取 token
    const token = await loginOrRegisterAndGetToken(username, email, password)
    authToken.value = token

    // 创建会话（可选：如果已有会话也可复用，这里简单创建新会话）
    const conv = await createConversation(token)
    currentConversationId.value = conv.id
    llmReady.value = true
  } catch (error) {
    console.error('初始化 LLM 后端失败，继续使用本地模拟:', error)
    llmReady.value = false
  }
}

/**
 * 组件挂载时初始化
 */
onMounted(async () => {
  initWelcomeMessage()
  await initLLM()
  await fetchAssistantStatus()
})
</script>

<style scoped>
.ai-chat-page {
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* 通用玻璃卡片样式 */
.glass-card {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  backdrop-filter: blur(6px);
}

/* TDesign Chat 组件样式覆盖 */
:deep(.t-chat) {
  background: transparent;
  border: none;
}

:deep(.t-chat__message-container) {
  background: transparent;
}

:deep(.t-chat__message--user) {
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.3);
}

:deep(.t-chat__message--assistant) {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

:deep(.t-chat__message-text) {
  color: #ffffff;
}

:deep(.t-chat__inner.assistant .t-chat__text__assistant .t-chat__text__content) {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.08));
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 14px;
  padding: 12px 16px;
  display: inline-block;
  max-width: 70%;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.22);
  position: relative;
  line-height: 1.7;
  font-size: 14px;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  white-space: pre-wrap;
  word-break: break-word;
  color: #eaf4ff;
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
}

:deep(.t-chat__inner.user .t-chat__text__user pre) {
  background: linear-gradient(180deg, rgba(59, 130, 246, 0.20), rgba(59, 130, 246, 0.16));
  border: 1px solid rgba(59, 130, 246, 0.34);
  border-radius: 14px;
  padding: 12px 16px;
  display: inline-block;
  max-width: 70%;
  color: #ffffff;
  white-space: pre-wrap;
  word-break: break-word;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.24);
  position: relative;
  line-height: 1.7;
  font-size: 14px;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

:deep(.t-chat__inner.assistant .t-chat__text__assistant .t-chat__text__content)::after {
  content: "";
  position: absolute;
  left: -6px;
  top: 14px;
  width: 0;
  height: 0;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-right: 6px solid rgba(255, 255, 255, 0.18);
}

:deep(.t-chat__inner.user .t-chat__text__user pre)::after {
  content: "";
  position: absolute;
  right: -6px;
  top: 14px;
  width: 0;
  height: 0;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-left: 6px solid rgba(59, 130, 246, 0.26);
}

/* 文字排版优化 */
:deep(.t-chat__inner.assistant .t-chat__text__assistant .t-chat__text__content p + p) {
  margin-top: 0.4em;
}

:deep(.t-chat__inner.assistant .t-chat__text__assistant .t-chat__text__content p) {
  letter-spacing: 0.2px;
}

/* 名称与时间样式优化 */
:deep(.t-chat__base) {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

:deep(.t-chat__name) {
  color: #cfe8ff;
  font-weight: 600;
}

:deep(.t-chat__time) {
  color: #89a2c9;
  font-size: 12px;
}

/* 滚动区域顶部/底部渐隐，提升视觉层次 */
.chat-scroll-area {
  -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,1) 85%, rgba(0,0,0,0.85) 100%);
  mask-image: linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,1) 85%, rgba(0,0,0,0.85) 100%);
}

/* 轻微的悬浮反馈 */
:deep(.t-chat__inner.assistant .t-chat__text__assistant .t-chat__text__content:hover),
:deep(.t-chat__inner.user .t-chat__text__user pre:hover) {
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.3);
  transform: translateY(-1px);
}

:deep(.t-chat__input-container) {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
}

:deep(.t-chat__input) {
  background: transparent;
  color: #ffffff;
}

:deep(.t-chat__input::placeholder) {
  color: #a0c4ff;
}

:deep(.t-chat__send-btn) {
  background: #3b82f6;
  color: #ffffff;
}

/* 输入框样式 */
:deep(.t-textarea__inner) {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

:deep(.t-textarea__inner::placeholder) {
  color: #a0c4ff;
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

/* 常见问题 Chip */
.chip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
  transition: all 0.2s ease;
}

.chip:hover {
  background: rgba(255, 255, 255, 0.14);
  transform: translateY(-1px);
}
</style>
