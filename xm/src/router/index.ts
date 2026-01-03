import { createRouter, createWebHistory } from 'vue-router'
import DashboardPage from '../pages/DashboardPage.vue'
import EmployeePage from '../pages/EmployeePage.vue'
import AIAnalysisPage from '../pages/AIAnalysisPage.vue'
import AIChatPage from '../pages/AIChatPage.vue'
import ReportPage from '../pages/ReportPage.vue'
import ReportGenerationPage from '../pages/ReportGenerationPage.vue'
import ReportListPage from '../pages/ReportListPage.vue'
import EmployeeReportDetailPage from '../pages/EmployeeReportDetailPage.vue'
import CompanyReportDetailPage from '../pages/CompanyReportDetailPage.vue'
import AIUsageReportDetailPage from '../pages/AIUsageReportDetailPage.vue'
import { useReportState } from '../composables/useReportState'
import KanbanPage from '../pages/KanbanPage.vue'
import SecurityOpsPage from '../pages/SecurityOpsPage.vue'
import DashboardLayoutPage from '../pages/DashboardLayoutPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardPage,
      meta: {
        title: '数据大屏',
        icon: 'monitor'
      }
    },
    {
      path: '/kanban',
      name: 'kanban',
      component: KanbanPage,
      meta: {
        title: '看板显示',
        icon: 'monitor'
      }
    },
    {
      path: '/dashboard-layout',
      name: 'dashboard-layout',
      component: DashboardLayoutPage,
      meta: {
        title: '布局模板',
        icon: 'monitor'
      }
    },
    {
      path: '/employees',
      name: 'employees',
      component: EmployeePage,
      meta: {
        title: '员工监控',
        icon: 'users'
      }
    },
    {
      path: '/ai-analysis',
      name: 'ai-analysis',
      component: AIAnalysisPage,
      meta: {
        title: 'AI分析',
        icon: 'brain'
      }
    },
    {
      path: '/ai-chat',
      name: 'ai-chat',
      component: AIChatPage,
      meta: {
        title: 'AI助手',
        icon: 'message-circle'
      }
    },
    {
      path: '/security-ops',
      name: 'security-ops',
      component: SecurityOpsPage,
      meta: {
        title: '安全运营',
        icon: 'shield',
      },
    },
    {
      path: '/reports',
      name: 'reports',
      component: ReportListPage,
      meta: {
        title: '报告列表',
        icon: 'file-text',
      },
    },
    {
      path: '/reports/generate',
      name: 'reports-generate',
      component: ReportGenerationPage,
      meta: {
        title: '生成报告',
        icon: 'file-plus',
      },
    },
    {
      path: '/report',
      name: 'report',
      component: ReportPage,
      meta: {
        title: '分析报告',
        hideFromNav: true
      }
    },

    {
      path: '/reports/employee/:id',
      name: 'EmployeeReportDetail',
      component: EmployeeReportDetailPage,
      meta: { title: '员工报告详情' }
    },
    {
      path: '/reports/company/:id',
      name: 'CompanyReportDetail',
      component: CompanyReportDetailPage,
      meta: { title: '全员报告详情' }
    },
    {
      path: '/reports/ai-usage/:id',
      name: 'AIUsageReportDetail',
      component: AIUsageReportDetailPage,
      meta: { title: 'AI使用报告详情' }
    },
    // 重定向到首页
    {
      path: '/home',
      redirect: '/'
    }
  ],
})

// 添加导航守卫
router.beforeEach((to, from, next) => {
  const { hasReport } = useReportState()
  
  // 如果访问报告页面但没有生成报告，重定向到AI分析页面
  if (to.name === 'report' && !hasReport()) {
    next({ name: 'ai-analysis' })
  } else {
    next()
  }
})

export default router
