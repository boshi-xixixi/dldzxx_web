<template>
  <div class="report-generation-page">
    <div class="page-header">
      <h1>报告生成</h1>
      <p class="page-description">选择报告类型并配置生成条件，系统将为您生成详细的分析报告</p>
    </div>

    <div class="generation-form">
      <t-card title="报告配置" :bordered="false">
        <t-form
          ref="formRef"
          :data="formData"
          :rules="formRules"
          label-width="120px"
          @submit="handleSubmit"
        >
          <t-form-item label="报告类型" name="type">
            <t-select
              v-model="formData.type"
              placeholder="请选择报告类型"
              @change="handleTypeChange"
            >
              <t-option value="employee" label="员工上网行为" />
              <t-option value="company" label="全员上网行为" />
              <t-option value="ai_usage" label="AI使用行为" />
            </t-select>
          </t-form-item>

          <t-form-item 
            v-if="formData.type === 'employee'" 
            label="员工姓名" 
            name="employeeName"
          >
            <t-select
              v-model="formData.employeeName"
              placeholder="请选择员工"
              filterable
            >
              <t-option
                v-for="employee in employees"
                :key="employee.id"
                :value="employee.name"
                :label="employee.name"
              />
            </t-select>
          </t-form-item>

          <t-form-item label="时间范围" name="dateRange">
            <t-date-range-picker
              v-model="formData.dateRange"
              placeholder="请选择时间范围"
              format="YYYY-MM-DD"
            />
          </t-form-item>

          <t-form-item label="报告标题" name="title">
            <t-input
              v-model="formData.title"
              placeholder="请输入报告标题（可选）"
            />
          </t-form-item>

          <t-form-item label="报告描述" name="description">
            <t-textarea
              v-model="formData.description"
              placeholder="请输入报告描述（可选）"
              :autosize="{ minRows: 3, maxRows: 6 }"
            />
          </t-form-item>

          <t-form-item>
            <t-space>
              <t-button
                theme="primary"
                type="submit"
                :loading="generating"
              >
                {{ generating ? '生成中...' : '生成报告' }}
              </t-button>
              <t-button variant="outline" @click="handleReset">
                重置
              </t-button>
            </t-space>
          </t-form-item>
        </t-form>
      </t-card>
    </div>

    <!-- 报告类型说明 -->
    <div class="report-info">
      <t-card title="报告类型说明" :bordered="false">
        <div class="info-grid">
          <div class="info-item">
            <div class="info-icon employee">
              <UserIcon :size="24" />
            </div>
            <div class="info-content">
              <h3>员工上网行为</h3>
              <p>分析单个员工的上网行为模式，包括访问网站、流量使用、时间分布等详细信息</p>
            </div>
          </div>
          
          <div class="info-item">
            <div class="info-icon company">
              <UsersIcon :size="24" />
            </div>
            <div class="info-content">
              <h3>全员上网行为</h3>
              <p>汇总分析企业全体员工的上网行为，提供部门对比、趋势分析等宏观视角</p>
            </div>
          </div>
          
          <div class="info-item">
            <div class="info-icon ai">
              <BrainIcon :size="24" />
            </div>
            <div class="info-content">
              <h3>AI使用行为</h3>
              <p>以故事化形式展现AI助手的使用情况，包括使用频率、问题类型、效果评估等</p>
            </div>
          </div>
        </div>
      </t-card>
    </div>

    <!-- 最近生成的报告 -->
    <div class="recent-reports">
      <t-card title="最近生成的报告" :bordered="false">
        <t-table
          :data="recentReports"
          :columns="recentReportsColumns"
          :loading="loadingReports"
          row-key="id"
        >
          <template #status="{ row }">
            <t-tag
              :theme="getStatusTheme(row.status)"
              variant="light"
            >
              {{ getStatusText(row.status) }}
            </t-tag>
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
                theme="danger"
                variant="text"
                size="small"
                @click="deleteReport(row.id)"
              >
                删除
              </t-button>
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
import { UserIcon, UsersIcon, BrainIcon } from 'lucide-vue-next';

interface Employee {
  id: string;
  name: string;
  department: string;
}

interface Report {
  id: string;
  type: string;
  title: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  createdAt: string;
  employeeName?: string;
}

const router = useRouter();
const formRef = ref();
const generating = ref(false);
const loadingReports = ref(false);
const employees = ref<Employee[]>([]);
const recentReports = ref<Report[]>([]);

const formData = reactive({
  type: '',
  employeeName: '',
  dateRange: [],
  title: '',
  description: ''
});

const formRules = {
  type: [{ required: true, message: '请选择报告类型' }],
  employeeName: [
    {
      required: true,
      message: '请选择员工',
      trigger: 'change',
      validator: () => formData.type !== 'employee' || formData.employeeName
    }
  ],
  dateRange: [{ required: true, message: '请选择时间范围' }]
};

const recentReportsColumns = [
  { colKey: 'title', title: '报告标题', width: '200px' },
  { colKey: 'type', title: '报告类型', width: '120px' },
  { colKey: 'employeeName', title: '关联员工', width: '120px' },
  { colKey: 'createdAt', title: '生成时间', width: '180px' },
  { colKey: 'status', title: '状态', width: '100px' },
  { colKey: 'actions', title: '操作', width: '150px' }
];

const normalizeReportType = (type: string) => {
  if (type === 'employee_behavior') return 'employee'
  if (type === 'company_behavior') return 'company'
  return type
}

// 获取员工列表
const fetchEmployees = async () => {
  try {
    const response = await fetch('/api/employees');
    const data = await response.json();
    const list = data?.data?.employees ?? data?.data ?? [];
    employees.value = Array.isArray(list) ? list : [];
  } catch (error) {
    console.error('获取员工列表失败:', error);
  }
};

// 获取最近的报告
const fetchRecentReports = async () => {
  loadingReports.value = true;
  try {
    const response = await fetch('/api/reports?page=1&limit=5');
    const data = await response.json();
    const list = data?.data?.reports ?? data?.data ?? [];
    recentReports.value = Array.isArray(list)
      ? list.map((r: any) => ({ ...r, type: normalizeReportType(r?.type) }))
      : [];
  } catch (error) {
    console.error('获取报告列表失败:', error);
  } finally {
    loadingReports.value = false;
  }
};

// 处理报告类型变化
const handleTypeChange = (value: string) => {
  if (value !== 'employee') {
    formData.employeeName = '';
  }
  
  // 自动生成标题
  const typeMap = {
    employee: '员工上网行为报告',
    company: '全员上网行为报告',
    ai_usage: 'AI使用行为报告'
  };
  
  if (!formData.title) {
    formData.title = typeMap[value as keyof typeof typeMap] || '';
  }
};

// 提交表单
const handleSubmit = async ({ validateResult }: any) => {
  if (validateResult === true) {
    generating.value = true;
    
    try {
      const apiType =
        formData.type === 'employee'
          ? 'employee_behavior'
          : formData.type === 'company'
            ? 'company_behavior'
            : formData.type

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: apiType,
          parameters: {
            employeeName: formData.employeeName,
            startDate: formData.dateRange?.[0],
            endDate: formData.dateRange?.[1],
          },
          title: formData.title,
          description: formData.description,
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        MessagePlugin.success('报告生成任务已提交，请稍后查看结果');
        handleReset();
        fetchRecentReports();
      } else {
        MessagePlugin.error(result.message || '报告生成失败');
      }
    } catch (error) {
      console.error('生成报告失败:', error);
      MessagePlugin.error('报告生成失败，请重试');
    } finally {
      generating.value = false;
    }
  }
};

// 重置表单
const handleReset = () => {
  formRef.value?.reset();
  Object.assign(formData, {
    type: '',
    employeeName: '',
    dateRange: [],
    title: '',
    description: ''
  });
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
      fetchRecentReports();
    } else {
      MessagePlugin.error(result.message || '删除失败');
    }
  } catch (error) {
    console.error('删除报告失败:', error);
    MessagePlugin.error('删除失败，请重试');
  }
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

onMounted(() => {
  fetchEmployees();
  fetchRecentReports();
});
</script>

<style scoped>
.report-generation-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  color: #e5e7eb;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 8px 0;
}

.page-description {
  color: #9ca3af;
  margin: 0;
}

.generation-form {
  margin-bottom: 32px;
}

.report-info {
  margin-bottom: 32px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.info-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.info-icon.employee {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.info-icon.company {
  background: linear-gradient(135deg, #10b981, #047857);
}

.info-icon.ai {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.info-content h3 {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 8px 0;
}

.info-content p {
  color: #cbd5e1;
  margin: 0;
  line-height: 1.5;
}

.recent-reports {
  margin-bottom: 32px;
}
</style>
