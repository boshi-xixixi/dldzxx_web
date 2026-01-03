/**
 * AI分析相关API路由
 */
import { Router, type Router as ExpressRouter } from 'express';
import { 
  generateAIAnalysis, 
  generateAIChatResponse,
  generateEmployees 
} from '../data/mockData.js';

const router: ExpressRouter = Router();

// 缓存员工数据
const cachedEmployees = generateEmployees(20);

/**
 * AI行为分析
 * POST /api/ai/analyze-behavior
 */
router.post('/analyze-behavior', (req, res) => {
  try {
    const { employeeId, timeRange, analysisType } = req.body;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: '员工ID不能为空'
      });
    }

    const employee = cachedEmployees.find(emp => emp.id === employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: '员工不存在'
      });
    }

    const analysisResult = generateAIAnalysis(employeeId);
    
    res.json({
      success: true,
      data: analysisResult
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'AI分析失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * AI聊天对话
 * POST /api/ai/chat
 */
router.post('/chat', (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: '消息内容不能为空'
      });
    }

    const reply = generateAIChatResponse(message);
    
    // 模拟一些建议操作
    const suggestions = [
      '查看详细的员工行为报告',
      '设置新的安全策略',
      '导出当前分析数据',
      '配置实时监控告警'
    ];

    res.json({
      success: true,
      data: {
        reply,
        suggestions: suggestions.slice(0, Math.floor(Math.random() * 3) + 1),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'AI对话失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * 获取安全风险评估
 * GET /api/ai/security-assessment
 */
router.get('/security-assessment', (req, res) => {
  try {
    const overallRisk = {
      level: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      score: Math.floor(Math.random() * 40) + 60,
      threats: [
        {
          type: '异常访问行为',
          severity: 'medium',
          count: Math.floor(Math.random() * 10) + 1,
          description: '检测到部分员工在非工作时间访问敏感网站'
        },
        {
          type: '大流量下载',
          severity: 'high',
          count: Math.floor(Math.random() * 5) + 1,
          description: '发现异常大流量下载行为，可能存在数据泄露风险'
        },
        {
          type: '未授权软件使用',
          severity: 'low',
          count: Math.floor(Math.random() * 15) + 5,
          description: '员工使用未经授权的网络工具和软件'
        }
      ],
      recommendations: [
        '加强员工网络安全培训',
        '实施更严格的网站访问控制',
        '定期进行安全审计',
        '建立异常行为监控机制'
      ]
    };

    res.json({
      success: true,
      data: overallRisk
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取安全评估失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * 获取AI分析统计
 * GET /api/ai/analytics-stats
 */
router.get('/analytics-stats', (req, res) => {
  try {
    const stats = {
      totalAnalyses: Math.floor(Math.random() * 1000) + 500,
      todayAnalyses: Math.floor(Math.random() * 50) + 20,
      riskDetections: Math.floor(Math.random() * 100) + 50,
      accuracyRate: 95.5 + Math.random() * 3,
      processingTime: Math.floor(Math.random() * 500) + 100, // ms
      modelVersion: '2.1.0',
      lastUpdate: new Date().toISOString()
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取AI统计失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * 批量分析员工行为
 * POST /api/ai/batch-analyze
 */
router.post('/batch-analyze', (req, res) => {
  try {
    const { employeeIds, analysisType } = req.body;

    if (!employeeIds || !Array.isArray(employeeIds)) {
      return res.status(400).json({
        success: false,
        message: '员工ID列表不能为空'
      });
    }

    const results = employeeIds.map(id => {
      const employee = cachedEmployees.find(emp => emp.id === id);
      if (!employee) {
        return {
          employeeId: id,
          error: '员工不存在'
        };
      }
      return generateAIAnalysis(id);
    });

    // 使用类型守卫来过滤结果
    const successResults = results.filter((r): r is ReturnType<typeof generateAIAnalysis> => !('error' in r));
    const errorResults = results.filter((r): r is { employeeId: string; error: string } => 'error' in r);

    res.json({
      success: true,
      data: {
        results,
        totalAnalyzed: successResults.length,
        totalErrors: errorResults.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '批量分析失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
