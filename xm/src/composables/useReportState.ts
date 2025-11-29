import { ref, reactive } from 'vue'

// 报告状态管理
const reportGenerated = ref(false)
const currentReportData = reactive({
  employeeName: '',
  dateRange: '',
  generatedAt: '',
  reportId: ''
})

export function useReportState() {
  // 生成报告
  const generateReport = (data: {
    employeeName?: string
    dateRange?: string
    reportId?: string
  }) => {
    reportGenerated.value = true
    Object.assign(currentReportData, {
      employeeName: data.employeeName || '张三',
      dateRange: data.dateRange || '2024-01-01 至 2024-01-31',
      generatedAt: new Date().toLocaleString('zh-CN'),
      reportId: data.reportId || `RPT-${Date.now().toString().slice(-8)}`
    })
  }

  // 清除报告状态
  const clearReport = () => {
    reportGenerated.value = false
    Object.assign(currentReportData, {
      employeeName: '',
      dateRange: '',
      generatedAt: '',
      reportId: ''
    })
  }

  // 检查是否有报告
  const hasReport = () => {
    return reportGenerated.value
  }

  return {
    reportGenerated,
    currentReportData,
    generateReport,
    clearReport,
    hasReport
  }
}