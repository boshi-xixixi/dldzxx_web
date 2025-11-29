  <template>
  <div class="report-list-page">
    <div class="page-header">
      <div class="header-content">
        <h1>报告列表</h1>
        <p class="page-description">查看和管理所有生成的报告</p>
      </div>
      <div class="header-actions">
        <t-button theme="primary" @click="goToGeneration">
          <template #icon>
            <PlusIcon :size="16" />
          </template>
          生成新报告
        </t-button>
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="filters">
      <t-card :bordered="false">
        <t-form layout="inline" @submit="handleSearch" @reset="handleReset">
          <t-form-item label="报告类型">
            <t-select
              v-model="filters.type"
              placeholder="全部类型"
              clearable
              style="width: 150px"
            >
              <t-option value="employee" label="员工上网行为" />
              <t-option value="company" label="全员上网行为" />
              <t-option value="ai_usage" label="AI使用行为" />
            </t-select>
          </t-form-item>

          <t-form-item label="状态">
            <t-select
              v-model="filters.status"
              placeholder="全部状态"
              clearable
              style="width: 120px"
            >
              <t-option value="pending" label="等待中" />
              <t-option value="generating" label="生成中" />
              <t-option value="completed" label="已完成" />
              <t-option value="failed" label="失败" />
            </t-select>
          </t-form-item>

          <t-form-item label="时间范围">
            <t-date-range-picker
              v-model="filters.dateRange"
              placeholder="选择时间范围"
              format="YYYY-MM-DD"
              style="width: 280px"
            />
          </t-form-item>

          <t-form-item label="关键词">
            <t-input
              v-model="filters.keyword"
              placeholder="搜索报告标题或员工姓名"
              style="width: 200px"
            />
          </t-form-item>

          <t-form-item>
            <t-space>
              <t-button theme="primary" type="submit">搜索</t-button>
              <t-button variant="outline" type="reset">重置</t-button>
            </t-space>
          </t-form-item>
        </t-form>
      </t-card>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon total">
            <FileTextIcon :size="24" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-label">总报告数</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon completed">
            <CheckCircleIcon :size="24" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.completed }}</div>
            <div class="stat-label">已完成</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon generating">
            <ClockIcon :size="24" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.generating }}</div>
            <div class="stat-label">生成中</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon failed">
            <XCircleIcon :size="24" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.failed }}</div>
            <div class="stat-label">失败</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 报告列表 -->
    <div class="report-table">
      <t-card :bordered="false">
        <template #header>
          <div class="table-header">
            <span>报告列表</span>
            <t-space>
              <t-button
                variant="outline"
                size="small"
                @click="refreshData"
                :loading="loading"
              >
                <template #icon>
                  <RefreshCwIcon :size="14" />
                </template>
                刷新
              </t-button>
              <t-dropdown
                :options="[
                  { content: '导出选中', value: 'export-selected' },
                  { content: '批量删除', value: 'batch-delete' }
                ]"
                @click="handleBatchAction"
              >
                <t-button variant="outline" size="small">
                  批量操作
                  <template #suffix>
                    <ChevronDownIcon :size="14" />
                  </template>
                </t-button>
              </t-dropdown>
            </t-space>
          </div>
        </template>

        <t-table
          :data="reports"
          :columns="columns"
          :loading="loading"
          :pagination="pagination"
          row-key="id"
          :selected-row-keys="selectedRowKeys"
          @select-change="handleSelectChange"
          @page-change="handlePageChange"
        >
          <template #type="{ row }">
            <t-tag
              :theme="getTypeTheme(row.type)"
              variant="light"
            >
              {{ getTypeText(row.type) }}
            </t-tag>
          </template>

          <template #status="{ row }">
            <t-tag
              :theme="getStatusTheme(row.status)"
              variant="light"
            >
              <template #icon>
                <component :is="getStatusIcon(row.status)" :size="12" />
              </template>
              {{ getStatusText(row.status) }}
            </t-tag>
          </template>

          <template #createdAt="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>

          <template #actions="{ row }">
            <t-space>
              <t-button
                v-if="row.status === 'completed'"
                theme="primary"
                variant="text"
                size="small"
                @click="viewReport(row)"
              >
                查看详情
              </t-button>
              <t-button
                v-if="row.status === 'generating'"
                theme="warning"
                variant="text"
                size="small"
                @click="cancelGeneration(row.id)"
              >
                取消生成
              </t-button>
              <t-button
                v-if="row.status === 'failed'"
                theme="primary"
                variant="text"
                size="small"
                @click="retryGeneration(row.id)"
              >
                重新生成
              </t-button>
              <t-popconfirm
                content="确定要删除这个报告吗？"
                @confirm="deleteReport(row.id)"
              >
                <t-button
                  theme="danger"
                  variant="text"
                  size="small"
                >
                  删除
                </t-button>
              </t-popconfirm>
            </t-space>
          </template>
        </t-table>
      </t-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import {
  PlusIcon,
  FileTextIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  RefreshCwIcon,
  ChevronDownIcon
} from 'lucide-vue-next';

interface Report {
  id: string;
  type: string;
  title: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  createdAt: string;
  employeeName?: string;
  description?: string;
}

const router = useRouter();
const loading = ref(false);
const reports = ref<Report[]>([]);
const selectedRowKeys = ref<string[]>([]);

const filters = reactive({
  type: '',
  status: '',
  dateRange: [],
  keyword: ''
});

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
});

const stats = computed(() => {
  const total = reports.value.length;
  const completed = reports.value.filter(r => r.status === 'completed').length;
  const generating = reports.value.filter(r => r.status === 'generating').length;
  const failed = reports.value.filter(r => r.status === 'failed').length;
  
  return { total, completed, generating, failed };
});

const columns = [
  { colKey: 'title', title: '报告标题', width: '200px' },
  { colKey: 'type', title: '报告类型', width: '120px' },
  { colKey: 'employeeName', title: '关联员工', width: '120px' },
  { colKey: 'status', title: '状态', width: '100px' },
  { colKey: 'createdAt', title: '生成时间', width: '180px' },
  { colKey: 'operation', title: '操作', width: '200px', fixed: 'right' }
];

// 获取报告列表
const fetchReports = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams();
    
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);
    if (filters.keyword) params.append('keyword', filters.keyword);
    if (filters.dateRange.length === 2) {
      params.append('startDate', filters.dateRange[0]);
      params.append('endDate', filters.dateRange[1]);
    }
    
    params.append('page', pagination.current.toString());
    params.append('limit', pagination.pageSize.toString());
    
    const response = await fetch(`/api/reports?${params}`);
    const data = await response.json();
    
    if (data.success) {
      reports.value = data.data || [];
      pagination.total = data.total || 0;
    }
  } catch (error) {
    console.error('获取报告列表失败:', error);
    MessagePlugin.error('获取报告列表失败');
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  pagination.current = 1;
  fetchReports();
};

// 重置筛选
const handleReset = () => {
  Object.assign(filters, {
    type: '',
    status: '',
    dateRange: [],
    keyword: ''
  });
  pagination.current = 1;
  fetchReports();
};

// 刷新数据
const refreshData = () => {
  fetchReports();
};

// 分页变化
const handlePageChange = (pageInfo: any) => {
  pagination.current = pageInfo.current;
  pagination.pageSize = pageInfo.pageSize;
  fetchReports();
};

// 选择变化
const handleSelectChange = (selectedKeys: string[]) => {
  selectedRowKeys.value = selectedKeys;
};

// 批量操作
const handleBatchAction = (action: { value: string }) => {
  if (selectedRowKeys.value.length === 0) {
    MessagePlugin.warning('请先选择要操作的报告');
    return;
  }
  
  switch (action.value) {
    case 'export-selected':
      exportReports(selectedRowKeys.value);
      break;
    case 'batch-delete':
      batchDeleteReports(selectedRowKeys.value);
      break;
  }
};

// 查看报告详情
const viewReport = (report: Report) => {
  const routeMap = {
    employee: '/reports/employee',
    company: '/reports/company',
    ai_usage: '/reports/ai-usage'
  };
  
  const route = routeMap[report.type as keyof typeof routeMap];
  if (route) {
    router.push(`${route}/${report.id}`);
  }
};

// 删除报告
const deleteReport = async (reportId: string) => {
  try {
    const response = await fetch(`/api/reports/${reportId}`, {
      method: 'DELETE'
    });
    
    const result = await response.json();
    
    if (result.success) {
      MessagePlugin.success('报告删除成功');
      fetchReports();
    } else {
      MessagePlugin.error(result.message || '删除失败');
    }
  } catch (error) {
    console.error('删除报告失败:', error);
    MessagePlugin.error('删除失败，请重试');
  }
};

// 取消生成
const cancelGeneration = async (reportId: string) => {
  // 实际项目中这里应该调用取消生成的API
  MessagePlugin.info('取消生成功能开发中...');
};

// 重新生成
const retryGeneration = async (reportId: string) => {
  // 实际项目中这里应该调用重新生成的API
  MessagePlugin.info('重新生成功能开发中...');
};

// 批量删除
const batchDeleteReports = async (reportIds: string[]) => {
  // 实际项目中这里应该调用批量删除的API
  MessagePlugin.info('批量删除功能开发中...');
};

// 导出报告
const exportReports = (reportIds: string[]) => {
  // 实际项目中这里应该调用导出的API
  MessagePlugin.info('导出功能开发中...');
};

// 跳转到生成页面
const goToGeneration = () => {
  router.push('/reports/generation');
};

// 获取类型主题
const getTypeTheme = (type: string) => {
  const themeMap = {
    employee: 'primary',
    company: 'success',
    ai_usage: 'warning'
  };
  return themeMap[type as keyof typeof themeMap] || 'default';
};

// 获取类型文本
const getTypeText = (type: string) => {
  const textMap = {
    employee: '员工上网行为',
    company: '全员上网行为',
    ai_usage: 'AI使用行为'
  };
  return textMap[type as keyof typeof textMap] || type;
};

// 获取状态主题
const getStatusTheme = (status: string) => {
  const themeMap = {
    pending: 'warning',
    generating: 'primary',
    completed: 'success',
    failed: 'danger'
  };
  return themeMap[status as keyof typeof themeMap] || 'default';
};

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap = {
    pending: '等待中',
    generating: '生成中',
    completed: '已完成',
    failed: '失败'
  };
  return textMap[status as keyof typeof textMap] || status;
};

// 获取状态图标
const getStatusIcon = (status: string) => {
  const iconMap = {
    pending: ClockIcon,
    generating: ClockIcon,
    completed: CheckCircleIcon,
    failed: XCircleIcon
  };
  return iconMap[status as keyof typeof iconMap] || ClockIcon;
};

// 格式化日期
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN');
};

onMounted(() => {
  fetchReports();
});
</script>

<style scoped>
.report-list-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.header-content h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.page-description {
  color: #6b7280;
  margin: 0;
}

.filters {
  margin-bottom: 24px;
}

.stats-cards {
  margin-bottom: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.stat-icon.total {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
}

.stat-icon.completed {
  background: linear-gradient(135deg, #10b981, #047857);
}

.stat-icon.generating {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.stat-icon.failed {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
}

.report-table {
  margin-bottom: 32px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}
</style>