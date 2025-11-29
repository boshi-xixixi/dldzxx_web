/**
 * 网络监控相关API路由
 */
import { Router } from 'express';
import { 
  generateNetworkTraffic, 
  generateWebsiteVisits, 
  generateRealtimeData 
} from '../data/mockData.js';

const router = Router();

/**
 * 获取实时网络监控数据
 * GET /api/network/realtime
 */
router.get('/realtime', (req, res) => {
  try {
    const realtimeData = generateRealtimeData();
    res.json({
      success: true,
      data: realtimeData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取实时数据失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * 获取网络流量趋势数据
 * GET /api/network/traffic?hours=24
 */
router.get('/traffic', (req, res) => {
  try {
    const hours = parseInt(req.query.hours as string) || 24;
    const trafficData = generateNetworkTraffic(hours);
    
    res.json({
      success: true,
      data: trafficData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取流量数据失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * 获取热门网站访问统计
 * GET /api/network/websites
 */
router.get('/websites', (req, res) => {
  try {
    const websiteData = generateWebsiteVisits();
    res.json({
      success: true,
      data: websiteData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取网站访问数据失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * 获取网络状态统计
 * GET /api/network/stats
 */
router.get('/stats', (req, res) => {
  try {
    const stats = {
      totalBandwidth: 1000, // Mbps
      usedBandwidth: Math.floor(Math.random() * 600) + 200,
      peakHour: '14:00',
      averageLatency: Math.floor(Math.random() * 20) + 10, // ms
      packetLoss: Math.random() * 0.5, // %
      uptime: 99.9
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取网络统计失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;