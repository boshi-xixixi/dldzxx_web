<template>
  <div class="report-page">
    <!-- 报告头部 -->
    <div class="report-header">
      <div class="report-title-section">
        <h1 class="report-title">员工上网行为分析报告</h1>
        <div class="report-meta">
          <span class="report-employee">员工：{{ currentReportData.employeeName || '张三' }}</span>
          <span class="report-period">时间范围：{{ currentReportData.dateRange || '2024-01-01 至 2024-01-31' }}</span>
          <span class="report-generated">生成时间：{{ currentReportData.generatedAt || new Date().toLocaleString('zh-CN') }}</span>
        </div>
      </div>
      <div class="report-actions">
        <button class="btn-secondary" @click="goBack">
          <ArrowLeftIcon class="w-4 h-4" />
          返回
        </button>
        <button class="btn-primary" @click="exportToPDF" :disabled="isExporting">
          <DownloadIcon class="w-4 h-4" />
          {{ isExporting ? '导出中...' : '导出PDF' }}
        </button>
      </div>
    </div>

    <!-- 报告摘要 -->
    <div class="report-summary">
      <h2>报告摘要</h2>
      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-icon risk-high">
            <AlertTriangleIcon class="w-6 h-6" />
          </div>
          <div class="summary-content">
            <h3>风险等级</h3>
            <p class="summary-value risk-high">高风险</p>
            <p class="summary-desc">发现多项异常行为</p>
          </div>
        </div>
        <div class="summary-card">
          <div class="summary-icon">
            <ClockIcon class="w-6 h-6" />
          </div>
          <div class="summary-content">
            <h3>在线时长</h3>
            <p class="summary-value">186.5小时</p>
            <p class="summary-desc">日均6.0小时</p>
          </div>
        </div>
        <div class="summary-card">
          <div class="summary-icon">
            <GlobeIcon class="w-6 h-6" />
          </div>
          <div class="summary-content">
            <h3>访问网站</h3>
            <p class="summary-value">1,247个</p>
            <p class="summary-desc">其中85个高风险</p>
          </div>
        </div>
        <div class="summary-card">
          <div class="summary-icon">
            <DownloadIcon class="w-6 h-6" />
          </div>
          <div class="summary-content">
            <h3>下载文件</h3>
            <p class="summary-value">342个</p>
            <p class="summary-desc">总计2.3GB</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 详细分析 -->
    <div class="report-content">
      <!-- 上网时间分析 -->
      <div class="report-section">
        <h2>上网时间分析</h2>
        <div class="chart-container">
          <div class="chart-placeholder">
            <BarChartIcon class="w-12 h-12 text-gray-400" />
            <p class="text-gray-500">每日上网时长统计图表</p>
          </div>
        </div>
        <div class="analysis-text">
          <p>该员工在统计期间内，工作日平均上网时长为6.2小时，周末平均4.8小时。其中1月15日上网时长达到12.5小时，远超正常工作时间，需要重点关注。</p>
        </div>
      </div>

      <!-- 网站访问分析 -->
      <div class="report-section">
        <h2>网站访问分析</h2>
        <div class="website-stats">
          <div class="website-category">
            <h3>访问类别分布</h3>
            <div class="category-list">
              <div class="category-item">
                <span class="category-name">工作相关</span>
                <div class="category-bar">
                  <div class="category-fill" style="width: 45%"></div>
                </div>
                <span class="category-percent">45%</span>
              </div>
              <div class="category-item">
                <span class="category-name">社交媒体</span>
                <div class="category-bar">
                  <div class="category-fill" style="width: 25%"></div>
                </div>
                <span class="category-percent">25%</span>
              </div>
              <div class="category-item">
                <span class="category-name">娱乐视频</span>
                <div class="category-bar">
                  <div class="category-fill" style="width: 20%"></div>
                </div>
                <span class="category-percent">20%</span>
              </div>
              <div class="category-item risk-high">
                <span class="category-name">高风险网站</span>
                <div class="category-bar">
                  <div class="category-fill risk-high" style="width: 10%"></div>
                </div>
                <span class="category-percent">10%</span>
              </div>
            </div>
          </div>
          <div class="top-websites">
            <h3>访问频次最高网站</h3>
            <div class="website-list">
              <div class="website-item">
                <span class="website-rank">1</span>
                <span class="website-name">github.com</span>
                <span class="website-visits">1,234次</span>
                <span class="website-status safe">安全</span>
              </div>
              <div class="website-item">
                <span class="website-rank">2</span>
                <span class="website-name">stackoverflow.com</span>
                <span class="website-visits">856次</span>
                <span class="website-status safe">安全</span>
              </div>
              <div class="website-item">
                <span class="website-rank">3</span>
                <span class="website-name">weibo.com</span>
                <span class="website-visits">432次</span>
                <span class="website-status warning">注意</span>
              </div>
              <div class="website-item">
                <span class="website-rank">4</span>
                <span class="website-name">某游戏网站</span>
                <span class="website-visits">287次</span>
                <span class="website-status risk">风险</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 异常行为检测 -->
      <div class="report-section">
        <h2>异常行为检测</h2>
        <div class="anomaly-list">
          <div class="anomaly-item high-risk">
            <div class="anomaly-icon">
              <AlertTriangleIcon class="w-5 h-5" />
            </div>
            <div class="anomaly-content">
              <h4>非工作时间大量下载</h4>
              <p>1月15日 23:30-02:15，下载了大量文件（共计850MB），包含敏感文档</p>
              <span class="anomaly-time">2024-01-15 23:30</span>
            </div>
            <span class="anomaly-level high">高风险</span>
          </div>
          <div class="anomaly-item medium-risk">
            <div class="anomaly-icon">
              <AlertCircleIcon class="w-5 h-5" />
            </div>
            <div class="anomaly-content">
              <h4>访问未授权网站</h4>
              <p>多次尝试访问被公司政策禁止的网站，共计23次</p>
              <span class="anomaly-time">2024-01-20 14:25</span>
            </div>
            <span class="anomaly-level medium">中风险</span>
          </div>
          <div class="anomaly-item low-risk">
            <div class="anomaly-icon">
              <InfoIcon class="w-5 h-5" />
            </div>
            <div class="anomaly-content">
              <h4>工作时间娱乐网站访问</h4>
              <p>工作时间内访问娱乐网站时长超过2小时</p>
              <span class="anomaly-time">2024-01-18 10:30</span>
            </div>
            <span class="anomaly-level low">低风险</span>
          </div>
        </div>
      </div>

      <!-- 安全建议 -->
      <div class="report-section">
        <h2>安全建议</h2>
        <div class="recommendations">
          <div class="recommendation-item">
            <div class="recommendation-priority high">
              <span>高优先级</span>
            </div>
            <div class="recommendation-content">
              <h4>立即调查非工作时间下载行为</h4>
              <p>建议立即与该员工沟通，了解非工作时间大量下载文件的原因，并检查下载内容是否涉及敏感信息。</p>
            </div>
          </div>
          <div class="recommendation-item">
            <div class="recommendation-priority medium">
              <span>中优先级</span>
            </div>
            <div class="recommendation-content">
              <h4>加强网站访问控制</h4>
              <p>建议更新网站黑名单，阻止访问高风险网站，并对员工进行网络安全培训。</p>
            </div>
          </div>
          <div class="recommendation-item">
            <div class="recommendation-priority low">
              <span>低优先级</span>
            </div>
            <div class="recommendation-content">
              <h4>制定工作时间上网规范</h4>
              <p>建议制定明确的工作时间上网规范，限制娱乐网站的访问时长。</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 报告尾部 -->
    <div class="report-footer">
      <div class="footer-info">
        <p>本报告由企业网络监控系统自动生成</p>
        <p>报告编号：RPT-{{ Date.now().toString().slice(-8) }}</p>
        <p>生成时间：{{ new Date().toLocaleString('zh-CN') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useReportState } from '../composables/useReportState'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { 
  ArrowLeftIcon, 
  DownloadIcon, 
  AlertTriangleIcon, 
  ClockIcon, 
  GlobeIcon, 
  BarChartIcon,
  AlertCircleIcon,
  InfoIcon
} from 'lucide-vue-next'

const router = useRouter()
const { currentReportData, clearReport } = useReportState()
const isExporting = ref(false)

const goBack = () => {
  clearReport() // 清除报告状态
  router.push('/ai-analysis')
}

const exportToPDF = async () => {
  try {
    isExporting.value = true
    
    // 获取报告页面元素
    const reportElement = document.querySelector('.report-page')
    if (!reportElement) {
      throw new Error('无法找到报告内容')
    }

    // 生成canvas，添加颜色兼容性配置
     const canvas = await html2canvas(reportElement as HTMLElement, {
       scale: 2, // 提高清晰度
       useCORS: true,
       allowTaint: true,
       backgroundColor: '#ffffff',
       ignoreElements: (element) => {
         // 忽略可能包含不兼容颜色的元素
         return element.classList?.contains('ignore-pdf') || false
       },
       onclone: (clonedDoc) => {
         // 在克隆的文档中替换不兼容的颜色
         const style = clonedDoc.createElement('style')
         style.textContent = `
           * {
             color: rgb(0, 0, 0) !important;
             background-color: rgb(255, 255, 255) !important;
           }
           .text-blue-600 { color: rgb(37, 99, 235) !important; }
           .text-green-600 { color: rgb(22, 163, 74) !important; }
           .text-red-600 { color: rgb(220, 38, 38) !important; }
           .text-yellow-600 { color: rgb(202, 138, 4) !important; }
           .text-gray-600 { color: rgb(75, 85, 99) !important; }
           .text-gray-800 { color: rgb(31, 41, 55) !important; }
           .bg-blue-50 { background-color: rgb(239, 246, 255) !important; }
           .bg-green-50 { background-color: rgb(240, 253, 244) !important; }
           .bg-red-50 { background-color: rgb(254, 242, 242) !important; }
           .bg-yellow-50 { background-color: rgb(254, 252, 232) !important; }
           .bg-gray-50 { background-color: rgb(249, 250, 251) !important; }
           .border-gray-200 { border-color: rgb(229, 231, 235) !important; }
         `
         clonedDoc.head.appendChild(style)
       }
     })

    // 创建PDF
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    
    const imgWidth = 210 // A4宽度
    const pageHeight = 295 // A4高度
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight

    let position = 0

    // 添加第一页
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    // 如果内容超过一页，添加更多页面
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    // 下载PDF
    const fileName = `员工上网行为分析报告_${currentReportData.employeeName || '张三'}_${new Date().toISOString().slice(0, 10)}.pdf`
    pdf.save(fileName)
    
  } catch (error) {
    console.error('导出PDF失败:', error)
    alert('导出PDF失败，请重试')
  } finally {
    isExporting.value = false
  }
}
</script>

<style scoped>
.report-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  min-height: 100vh;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e5e7eb;
}

.report-title {
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.report-meta {
  display: flex;
  gap: 1.5rem;
  color: #6b7280;
  font-size: 0.9rem;
}

.report-actions {
  display: flex;
  gap: 1rem;
}

.btn-primary, .btn-secondary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.report-summary {
  margin-bottom: 2rem;
}

.report-summary h2 {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 1rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
}

.summary-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  background: #dbeafe;
  color: #3b82f6;
}

.summary-icon.risk-high {
  background: #fee2e2;
  color: #dc2626;
}

.summary-content h3 {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.summary-value {
  font-size: 1.25rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.summary-value.risk-high {
  color: #dc2626;
}

.summary-desc {
  font-size: 0.875rem;
  color: #6b7280;
}

.report-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.report-section {
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  padding: 1.5rem;
}

.report-section h2 {
  font-size: 1.25rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 1rem;
}

.chart-container {
  margin-bottom: 1rem;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  background: #f9fafb;
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  gap: 0.5rem;
}

.analysis-text {
  padding: 1rem;
  background: #f0f9ff;
  border-radius: 0.5rem;
  border-left: 4px solid #3b82f6;
}

.website-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.website-category h3, .top-websites h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.category-list, .website-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.category-name {
  min-width: 80px;
  font-size: 0.875rem;
  color: #374151;
}

.category-bar {
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.category-fill {
  height: 100%;
  background: #3b82f6;
  transition: width 0.3s ease;
}

.category-fill.risk-high {
  background: #dc2626;
}

.category-percent {
  min-width: 40px;
  text-align: right;
  font-size: 0.875rem;
  color: #6b7280;
}

.website-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.website-rank {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: bold;
}

.website-name {
  flex: 1;
  font-size: 0.875rem;
  color: #374151;
}

.website-visits {
  font-size: 0.875rem;
  color: #6b7280;
}

.website-status {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.website-status.safe {
  background: #dcfce7;
  color: #166534;
}

.website-status.warning {
  background: #fef3c7;
  color: #92400e;
}

.website-status.risk {
  background: #fee2e2;
  color: #991b1b;
}

.anomaly-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.anomaly-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.5rem;
  border-left: 4px solid;
}

.anomaly-item.high-risk {
  background: #fef2f2;
  border-left-color: #dc2626;
}

.anomaly-item.medium-risk {
  background: #fffbeb;
  border-left-color: #f59e0b;
}

.anomaly-item.low-risk {
  background: #f0f9ff;
  border-left-color: #3b82f6;
}

.anomaly-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: white;
}

.anomaly-content {
  flex: 1;
}

.anomaly-content h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.25rem;
}

.anomaly-content p {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.anomaly-time {
  font-size: 0.75rem;
  color: #9ca3af;
}

.anomaly-level {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.anomaly-level.high {
  background: #dc2626;
  color: white;
}

.anomaly-level.medium {
  background: #f59e0b;
  color: white;
}

.anomaly-level.low {
  background: #3b82f6;
  color: white;
}

.recommendations {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.recommendation-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.recommendation-priority {
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  height: fit-content;
}

.recommendation-priority.high {
  background: #dc2626;
  color: white;
}

.recommendation-priority.medium {
  background: #f59e0b;
  color: white;
}

.recommendation-priority.low {
  background: #3b82f6;
  color: white;
}

.recommendation-content h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.recommendation-content p {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.5;
}

.report-footer {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
  text-align: center;
}

.footer-info p {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

@media (max-width: 768px) {
  .report-page {
    padding: 1rem;
  }
  
  .report-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .report-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .website-stats {
    grid-template-columns: 1fr;
  }
  
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>