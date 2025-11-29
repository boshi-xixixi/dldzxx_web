import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

// 引入 TDesign 组件库
import TDesign from 'tdesign-vue-next'
import 'tdesign-vue-next/es/style/index.css'

// 引入 TDesign Chat 组件
import TDesignChat from '@tdesign-vue-next/chat'

const app = createApp(App)

app.use(router)
app.use(TDesign)
app.use(TDesignChat)

app.mount('#app')
