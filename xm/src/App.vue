<template>
  <div id="app" class="min-h-screen bg-gray-900">
    <!-- 导航栏 -->
    <nav class="bg-gray-800/90 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Logo和标题 -->
          <div class="flex items-center">
            <div class="flex-shrink-0 flex items-center">
              <ShieldIcon class="w-8 h-8 text-blue-500 mr-3" />
              <h1 class="text-xl font-bold text-white">企业网络监控系统</h1>
            </div>
          </div>

          <!-- 导航菜单 -->
          <div class="flex items-center space-x-8">
            <router-link
              v-for="route in navigationRoutes"
              :key="route.name"
              :to="{ name: route.name }"
              class="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              :class="isActiveRoute(route.name) 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'"
            >
              <component :is="getIcon(route.meta.icon)" class="w-4 h-4 mr-2" />
              {{ route.meta.title }}
            </router-link>
          </div>

          <!-- 用户信息 -->
          <div class="flex items-center space-x-4">
            <!-- 通知图标 -->
            <button class="relative p-2 text-gray-400 hover:text-white transition-colors">
              <BellIcon class="w-5 h-5" />
              <span class="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400"></span>
            </button>

            <!-- 用户头像 -->
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <UserIcon class="w-5 h-5 text-white" />
              </div>
              <span class="text-gray-300 text-sm">管理员</span>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主要内容区域 -->
    <main class="flex-1">
      <router-view />
    </main>

    <!-- 页脚 -->
    <footer class="bg-gray-800 border-t border-gray-700 py-4">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
          <p class="text-gray-400 text-sm">
            © 2024 企业网络监控系统. 保留所有权利.
          </p>
          <div class="flex items-center space-x-4 text-gray-400 text-sm">
            <span>系统状态: </span>
            <div class="flex items-center space-x-1">
              <div class="w-2 h-2 bg-green-400 rounded-full"></div>
              <span class="text-green-400">正常运行</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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

const route = useRoute()
const router = useRouter()

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
    'file-text': BrainIcon, // 暂时使用 BrainIcon，后续可以添加 FileTextIcon
    'plus': BrainIcon // 暂时使用 BrainIcon，后续可以添加 PlusIcon
  }
  return iconMap[iconName as string] || MonitorIcon
}
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