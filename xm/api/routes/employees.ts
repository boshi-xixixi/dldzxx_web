/**
 * 员工监控相关API路由
 */
import { Router, type Router as ExpressRouter } from 'express';
import { 
  generateEmployees, 
  generateNetworkTraffic,
  generateWebsiteVisits 
} from '../data/mockData.js';

const router: ExpressRouter = Router();

// 缓存员工数据，避免每次请求都重新生成
const cachedEmployees = generateEmployees(20);

/**
 * 获取员工列表
 * GET /api/employees
 */
router.get('/', (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const department = req.query.department as string;
    const riskLevel = req.query.riskLevel as string;

    let filteredEmployees = [...cachedEmployees];

    // 按部门筛选
    if (department) {
      filteredEmployees = filteredEmployees.filter(emp => emp.department === department);
    }

    // 按风险等级筛选
    if (riskLevel) {
      filteredEmployees = filteredEmployees.filter(emp => emp.riskLevel === riskLevel);
    }

    // 分页
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        employees: paginatedEmployees,
        totalCount: filteredEmployees.length,
        currentPage: page,
        totalPages: Math.ceil(filteredEmployees.length / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取员工列表失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * 获取单个员工详细信息
 * GET /api/employees/:id
 */
router.get('/:id', (req, res) => {
  try {
    const employeeId = req.params.id;
    const employee = cachedEmployees.find(emp => emp.id === employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: '员工不存在'
      });
    }

    res.json({
      success: true,
      data: employee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取员工信息失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * 获取员工流量统计
 * GET /api/employees/:id/traffic
 */
router.get('/:id/traffic', (req, res) => {
  try {
    const employeeId = req.params.id;
    const employee = cachedEmployees.find(emp => emp.id === employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: '员工不存在'
      });
    }

    // 生成员工个人流量数据
    const dailyTraffic = generateNetworkTraffic(7).map((traffic, index) => ({
      date: new Date(Date.now() - (6 - index) * 24 * 3600000).toISOString().split('T')[0],
      traffic: Math.floor(traffic.totalTraffic * (0.8 + Math.random() * 0.4))
    }));

    // 网站分类统计
    const websiteCategories = {
      '开发工具': Math.floor(Math.random() * 40) + 30,
      '办公软件': Math.floor(Math.random() * 30) + 20,
      '社交媒体': Math.floor(Math.random() * 20) + 5,
      '视频娱乐': Math.floor(Math.random() * 15) + 5,
      '其他': Math.floor(Math.random() * 10) + 5
    };

    // 时间分布数据
    const timeDistribution = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      traffic: hour >= 9 && hour <= 18 
        ? Math.floor(Math.random() * 50) + 20 
        : Math.floor(Math.random() * 10) + 2
    }));

    res.json({
      success: true,
      data: {
        employeeId,
        dailyTraffic,
        websiteCategories,
        timeDistribution,
        totalTraffic: employee.todayTraffic,
        averageTraffic: Math.floor(employee.todayTraffic / 8) // 8小时工作时间
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取员工流量数据失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * 获取员工访问的网站列表
 * GET /api/employees/:id/websites
 */
router.get('/:id/websites', (req, res) => {
  try {
    const employeeId = req.params.id;
    const employee = cachedEmployees.find(emp => emp.id === employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: '员工不存在'
      });
    }

    // 为每个员工生成个性化的网站访问数据
    const websites = generateWebsiteVisits().map(site => ({
      ...site,
      visits: Math.floor(site.visits * (0.5 + Math.random())),
      traffic: Math.floor(site.traffic * (0.5 + Math.random())),
      lastVisit: new Date(Date.now() - Math.random() * 86400000).toISOString()
    }));

    res.json({
      success: true,
      data: websites
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取员工网站访问数据失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * 获取部门统计信息
 * GET /api/employees/stats/departments
 */
router.get('/stats/departments', (req, res) => {
  try {
    const departmentStats = cachedEmployees.reduce((stats, employee) => {
      const dept = employee.department;
      if (!stats[dept]) {
        stats[dept] = {
          totalEmployees: 0,
          onlineEmployees: 0,
          totalTraffic: 0,
          highRiskCount: 0
        };
      }
      
      stats[dept].totalEmployees++;
      if (employee.isOnline) stats[dept].onlineEmployees++;
      stats[dept].totalTraffic += employee.todayTraffic;
      if (employee.riskLevel === 'high') stats[dept].highRiskCount++;
      
      return stats;
    }, {} as Record<string, any>);

    res.json({
      success: true,
      data: departmentStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取部门统计失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
