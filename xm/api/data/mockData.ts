/**
 * 模拟数据生成器
 * 为企业网络监控系统提供各种假数据
 */

// 员工数据接口
export interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  email: string;
  isOnline: boolean;
  todayTraffic: number; // MB
  riskLevel: 'low' | 'medium' | 'high';
  lastActivity: string;
}

// 网络流量数据接口
export interface NetworkTraffic {
  timestamp: string;
  totalTraffic: number; // MB
  uploadTraffic: number; // MB
  downloadTraffic: number; // MB
}

// 网站访问数据接口
export interface WebsiteVisit {
  website: string;
  category: string;
  visits: number;
  traffic: number; // MB
  riskLevel: 'safe' | 'warning' | 'danger';
}

// AI分析结果接口
export interface AIAnalysisResult {
  employeeId: string;
  riskLevel: 'low' | 'medium' | 'high';
  behaviorPatterns: string[];
  recommendations: string[];
  securityScore: number;
  analysisTime: string;
}

/**
 * 生成随机员工数据
 */
export function generateEmployees(count: number = 20): Employee[] {
  const departments = ['技术部', '市场部', '人事部', '财务部', '运营部'];
  const positions = ['工程师', '经理', '主管', '专员', '总监'];
  const names = [
    '张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十',
    '郑十一', '王十二', '冯十三', '陈十四', '褚十五', '卫十六', '蒋十七', '沈十八',
    '韩十九', '杨二十', '朱二一', '秦二二'
  ];

  return Array.from({ length: count }, (_, index) => ({
    id: `emp_${index + 1}`,
    name: names[index] || `员工${index + 1}`,
    department: departments[Math.floor(Math.random() * departments.length)],
    position: positions[Math.floor(Math.random() * positions.length)],
    email: `user${index + 1}@company.com`,
    isOnline: Math.random() > 0.3,
    todayTraffic: Math.floor(Math.random() * 2000) + 100,
    riskLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
    lastActivity: new Date(Date.now() - Math.random() * 3600000).toISOString()
  }));
}

/**
 * 生成网络流量趋势数据
 */
export function generateNetworkTraffic(hours: number = 24): NetworkTraffic[] {
  const now = new Date();
  return Array.from({ length: hours }, (_, index) => {
    const timestamp = new Date(now.getTime() - (hours - index - 1) * 3600000);
    const baseTraffic = 500 + Math.sin((index / hours) * Math.PI * 2) * 200;
    const randomVariation = (Math.random() - 0.5) * 100;
    const totalTraffic = Math.max(0, baseTraffic + randomVariation);
    
    return {
      timestamp: timestamp.toISOString(),
      totalTraffic: Math.floor(totalTraffic),
      uploadTraffic: Math.floor(totalTraffic * 0.3),
      downloadTraffic: Math.floor(totalTraffic * 0.7)
    };
  });
}

/**
 * 生成热门网站访问数据
 */
export function generateWebsiteVisits(): WebsiteVisit[] {
  const websites = [
    { name: 'github.com', category: '开发工具', risk: 'safe' },
    { name: 'stackoverflow.com', category: '开发工具', risk: 'safe' },
    { name: 'baidu.com', category: '搜索引擎', risk: 'safe' },
    { name: 'taobao.com', category: '电商购物', risk: 'warning' },
    { name: 'bilibili.com', category: '视频娱乐', risk: 'warning' },
    { name: 'weibo.com', category: '社交媒体', risk: 'warning' },
    { name: 'douyin.com', category: '视频娱乐', risk: 'danger' },
    { name: 'unknown-site.com', category: '未知网站', risk: 'danger' }
  ];

  return websites.map(site => ({
    website: site.name,
    category: site.category,
    visits: Math.floor(Math.random() * 500) + 50,
    traffic: Math.floor(Math.random() * 1000) + 100,
    riskLevel: site.risk as 'safe' | 'warning' | 'danger'
  }));
}

/**
 * 生成AI分析结果
 */
export function generateAIAnalysis(employeeId: string): AIAnalysisResult {
  const behaviorPatterns = [
    '工作时间内频繁访问社交媒体',
    '下载大量非工作相关文件',
    '访问未知风险网站',
    '异常时间段的网络活动',
    '使用未授权的网络工具'
  ];

  const recommendations = [
    '建议限制社交媒体访问时间',
    '加强网络安全培训',
    '定期检查下载文件',
    '设置网站访问白名单',
    '监控异常网络行为'
  ];

  const riskLevel = ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high';
  const patternCount = Math.floor(Math.random() * 3) + 1;
  const recommendationCount = Math.floor(Math.random() * 3) + 1;

  return {
    employeeId,
    riskLevel,
    behaviorPatterns: behaviorPatterns.slice(0, patternCount),
    recommendations: recommendations.slice(0, recommendationCount),
    securityScore: Math.floor(Math.random() * 40) + 60,
    analysisTime: new Date().toISOString()
  };
}

/**
 * 生成实时监控数据
 */
export function generateRealtimeData() {
  return {
    totalTraffic: Math.floor(Math.random() * 1000) + 500,
    onlineUsers: Math.floor(Math.random() * 50) + 20,
    alertCount: Math.floor(Math.random() * 10),
    networkStatus: Math.random() > 0.1 ? 'normal' : 'warning',
    cpuUsage: Math.floor(Math.random() * 30) + 20,
    memoryUsage: Math.floor(Math.random() * 40) + 30,
    diskUsage: Math.floor(Math.random() * 20) + 40
  };
}

/**
 * 生成AI对话回复
 */
export function generateAIChatResponse(message: string): string {
  const responses = [
    '根据您的查询，我为您分析了相关数据...',
    '通过AI分析，发现以下关键信息...',
    '基于当前网络监控数据，建议您关注...',
    '系统检测到异常行为，详细分析如下...',
    '数据显示，当前网络状态良好，具体指标为...',
    'AI助手正在为您处理请求，请稍候...',
    '根据历史数据对比，当前趋势显示...',
    '安全评估完成，风险等级为中等，建议采取以下措施...'
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * 生成员工上网行为报告数据
 */
export function generateEmployeeReport(employeeId: string) {
  const employee = generateEmployees(1)[0];
  employee.id = employeeId;
  
  return {
    employee,
    summary: {
      totalOnlineTime: Math.floor(Math.random() * 8) + 1, // 1-8小时
      totalTraffic: Math.floor(Math.random() * 1000) + 100, // 100-1100MB
      websitesVisited: Math.floor(Math.random() * 50) + 10, // 10-60个网站
      riskEvents: Math.floor(Math.random() * 5), // 0-5个风险事件
    },
    timeline: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      activity: Math.random() > 0.3 ? '在线' : '离线',
      traffic: Math.random() > 0.3 ? Math.floor(Math.random() * 50) : 0,
      websites: Math.random() > 0.5 ? ['工作相关', '社交媒体', '新闻资讯'] : ['工作相关']
    })),
    topWebsites: generateWebsiteVisits().slice(0, 10),
    riskAnalysis: {
      level: employee.riskLevel,
      events: [
        { time: '09:30', event: '访问非工作相关网站', severity: 'low' },
        { time: '14:15', event: '大文件下载', severity: 'medium' },
        { time: '16:45', event: '异常流量峰值', severity: 'high' }
      ].slice(0, Math.floor(Math.random() * 4))
    },
    recommendations: [
      '建议限制非工作时间的娱乐网站访问',
      '加强网络安全意识培训',
      '定期检查下载文件的安全性',
      '优化工作流程，减少不必要的网络使用'
    ]
  };
}

/**
 * 生成全员上网行为汇总报告数据
 */
export function generateCompanyReport() {
  const employees = generateEmployees(50);
  
  return {
    overview: {
      totalEmployees: employees.length,
      onlineEmployees: employees.filter(e => e.isOnline).length,
      totalTraffic: employees.reduce((sum, e) => sum + e.todayTraffic, 0),
      highRiskEmployees: employees.filter(e => e.riskLevel === 'high').length,
    },
    departmentStats: {
      '技术部': { employees: 15, traffic: 2500, riskLevel: 'medium' },
      '市场部': { employees: 12, traffic: 1800, riskLevel: 'low' },
      '人事部': { employees: 8, traffic: 900, riskLevel: 'low' },
      '财务部': { employees: 10, traffic: 1200, riskLevel: 'medium' },
      '运营部': { employees: 5, traffic: 600, riskLevel: 'high' }
    },
    trafficTrends: generateNetworkTraffic(24),
    topRisks: [
      { type: '异常下载', count: 15, trend: 'up' },
      { type: '非工作网站访问', count: 32, trend: 'down' },
      { type: '超时在线', count: 8, trend: 'stable' },
      { type: '可疑文件传输', count: 3, trend: 'up' }
    ],
    recommendations: [
      '加强对运营部门的网络监控',
      '制定更严格的下载文件审核制度',
      '开展全员网络安全培训',
      '优化网络带宽分配策略'
    ]
  };
}

/**
 * 生成AI使用行为故事报告数据
 */
export function generateAIUsageReport() {
  return {
    story: {
      title: '今日AI助手使用情况的数字故事',
      chapters: [
        {
          title: '晨间启动',
          time: '08:00-10:00',
          content: '随着新一天的开始，我们的AI助手迎来了第一波使用高峰。技术部的张工程师率先向AI询问了代码优化建议，而市场部的李经理则咨询了客户数据分析方案。',
          stats: {
            totalQueries: 45,
            departments: ['技术部', '市场部', '人事部'],
            topQuestions: ['代码优化', '数据分析', '文档生成']
          },
          mood: 'productive'
        },
        {
          title: '午间协作',
          time: '12:00-14:00',
          content: '午休时间，AI助手的使用呈现出有趣的模式。员工们不仅询问工作相关问题，还有人咨询健康饮食建议和学习计划制定，展现了AI在生活助手方面的潜力。',
          stats: {
            totalQueries: 28,
            departments: ['全部门'],
            topQuestions: ['健康咨询', '学习规划', '工作总结']
          },
          mood: 'relaxed'
        },
        {
          title: '下午冲刺',
          time: '14:00-18:00',
          content: '下午时段是AI使用的黄金时间。财务部门大量使用AI进行数据处理和报表生成，而运营团队则频繁咨询流程优化建议。AI助手在这个时段展现了强大的工作效率提升能力。',
          stats: {
            totalQueries: 67,
            departments: ['财务部', '运营部', '技术部'],
            topQuestions: ['数据处理', '流程优化', '问题解决']
          },
          mood: 'intense'
        }
      ],
      insights: [
        'AI助手在技术问题解决方面表现突出，准确率达到92%',
        '跨部门协作中，AI起到了重要的信息桥梁作用',
        '员工对AI的信任度持续提升，复杂问题咨询增加35%',
        'AI使用模式显示出明显的时间规律性，可用于优化服务策略'
      ],
      totalStats: {
        totalQueries: 140,
        uniqueUsers: 28,
        averageSessionTime: '3.5分钟',
        satisfactionRate: '94%',
        topCategories: [
          { name: '技术支持', percentage: 35 },
          { name: '数据分析', percentage: 28 },
          { name: '文档处理', percentage: 20 },
          { name: '流程咨询', percentage: 17 }
        ]
      }
    },
    visualData: {
      usageTimeline: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        queries: Math.floor(Math.random() * 20),
        users: Math.floor(Math.random() * 10)
      })),
      departmentUsage: {
        '技术部': 45,
        '市场部': 32,
        '财务部': 28,
        '人事部': 20,
        '运营部': 15
      },
      questionTypes: [
        { type: '技术问题', count: 49, color: '#3b82f6' },
        { type: '数据分析', count: 39, color: '#10b981' },
        { type: '文档生成', count: 28, color: '#f59e0b' },
        { type: '流程咨询', count: 24, color: '#ef4444' }
      ]
    }
  };
}