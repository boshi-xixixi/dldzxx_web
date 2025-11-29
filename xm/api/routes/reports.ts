import { Router } from 'express';
import { generateEmployeeReport, generateCompanyReport, generateAIUsageReport } from '../data/mockData';

const router = Router();

// 报告类型枚举
export enum ReportType {
  EMPLOYEE_BEHAVIOR = 'employee_behavior',
  COMPANY_BEHAVIOR = 'company_behavior',
  AI_USAGE = 'ai_usage'
}

// 报告状态枚举
export enum ReportStatus {
  PENDING = 'pending',
  GENERATING = 'generating',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

// 报告接口定义
export interface Report {
  id: string;
  type: ReportType;
  title: string;
  description: string;
  status: ReportStatus;
  createdAt: string;
  completedAt?: string;
  parameters: {
    employeeId?: string;
    employeeName?: string;
    startDate: string;
    endDate: string;
    [key: string]: any;
  };
  data?: any;
}

// 模拟报告存储
let reports: Report[] = [
  {
    id: 'rpt_001',
    type: ReportType.EMPLOYEE_BEHAVIOR,
    title: '张三员工上网行为报告',
    description: '2024年1月15日张三的详细上网行为分析',
    status: ReportStatus.COMPLETED,
    createdAt: '2024-01-15T09:00:00Z',
    completedAt: '2024-01-15T09:05:00Z',
    parameters: {
      employeeId: 'emp_001',
      employeeName: '张三',
      startDate: '2024-01-15',
      endDate: '2024-01-15'
    }
  },
  {
    id: 'rpt_002',
    type: ReportType.COMPANY_BEHAVIOR,
    title: '全员上网行为汇总报告',
    description: '2024年1月15日全公司员工上网行为汇总分析',
    status: ReportStatus.COMPLETED,
    createdAt: '2024-01-15T10:00:00Z',
    completedAt: '2024-01-15T10:15:00Z',
    parameters: {
      startDate: '2024-01-15',
      endDate: '2024-01-15'
    }
  },
  {
    id: 'rpt_003',
    type: ReportType.AI_USAGE,
    title: 'AI使用行为故事报告',
    description: '2024年1月15日AI工具使用情况的故事化呈现',
    status: ReportStatus.GENERATING,
    createdAt: '2024-01-15T11:00:00Z',
    parameters: {
      startDate: '2024-01-15',
      endDate: '2024-01-15'
    }
  }
];

// 获取报告列表
router.get('/', (req, res) => {
  try {
    const { type, status, page = 1, limit = 10 } = req.query;
    
    let filteredReports = [...reports];
    
    // 按类型筛选
    if (type && Object.values(ReportType).includes(type as ReportType)) {
      filteredReports = filteredReports.filter(report => report.type === type);
    }
    
    // 按状态筛选
    if (status && Object.values(ReportStatus).includes(status as ReportStatus)) {
      filteredReports = filteredReports.filter(report => report.status === status);
    }
    
    // 分页
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const paginatedReports = filteredReports.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        reports: paginatedReports,
        total: filteredReports.length,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(filteredReports.length / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取报告列表失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 创建新报告
router.post('/', (req, res) => {
  try {
    const { type, parameters } = req.body;
    
    if (!type || !Object.values(ReportType).includes(type)) {
      return res.status(400).json({
        success: false,
        message: '无效的报告类型'
      });
    }
    
    if (!parameters || !parameters.startDate || !parameters.endDate) {
      return res.status(400).json({
        success: false,
        message: '缺少必要的参数'
      });
    }
    
    // 生成报告ID
    const reportId = `rpt_${Date.now()}`;
    
    // 根据类型生成标题和描述
    let title = '';
    let description = '';
    
    switch (type) {
      case ReportType.EMPLOYEE_BEHAVIOR:
        if (!parameters.employeeName) {
          return res.status(400).json({
            success: false,
            message: '员工行为报告需要指定员工姓名'
          });
        }
        title = `${parameters.employeeName}员工上网行为报告`;
        description = `${parameters.startDate}至${parameters.endDate}期间${parameters.employeeName}的详细上网行为分析`;
        break;
      case ReportType.COMPANY_BEHAVIOR:
        title = '全员上网行为汇总报告';
        description = `${parameters.startDate}至${parameters.endDate}期间全公司员工上网行为汇总分析`;
        break;
      case ReportType.AI_USAGE:
        title = 'AI使用行为故事报告';
        description = `${parameters.startDate}至${parameters.endDate}期间AI工具使用情况的故事化呈现`;
        break;
    }
    
    const newReport: Report = {
      id: reportId,
      type,
      title,
      description,
      status: ReportStatus.GENERATING,
      createdAt: new Date().toISOString(),
      parameters
    };
    
    reports.unshift(newReport);
    
    // 模拟异步生成报告
    setTimeout(() => {
      const reportIndex = reports.findIndex(r => r.id === reportId);
      if (reportIndex !== -1) {
        reports[reportIndex].status = ReportStatus.COMPLETED;
        reports[reportIndex].completedAt = new Date().toISOString();
      }
    }, 3000); // 3秒后完成
    
    res.json({
      success: true,
      data: newReport,
      message: '报告生成任务已创建，正在后台处理'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '创建报告失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 获取报告详情
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const report = reports.find(r => r.id === id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: '报告不存在'
      });
    }
    
    // 如果报告已完成，生成详细数据
    if (report.status === ReportStatus.COMPLETED && !report.data) {
      switch (report.type) {
        case ReportType.EMPLOYEE_BEHAVIOR:
          report.data = generateEmployeeReport(report.parameters.employeeId || 'emp_001');
          break;
        case ReportType.COMPANY_BEHAVIOR:
          report.data = generateCompanyReport();
          break;
        case ReportType.AI_USAGE:
          report.data = generateAIUsageReport();
          break;
      }
    }
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取报告详情失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 删除报告
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const reportIndex = reports.findIndex(r => r.id === id);
    
    if (reportIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '报告不存在'
      });
    }
    
    reports.splice(reportIndex, 1);
    
    res.json({
      success: true,
      message: '报告删除成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除报告失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;