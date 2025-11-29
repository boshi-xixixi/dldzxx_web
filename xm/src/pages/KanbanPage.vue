<template>
  <div class="w-full h-screen bg-[#0a0e17] text-white overflow-hidden flex flex-col relative">
    <!-- Header -->
    <header class="h-16 flex items-center justify-between px-6 bg-[#0a0e17]/90 border-b border-slate-800 z-50">
      <div class="flex items-center gap-4">
        <h1 class="text-2xl font-bold text-blue-400 tracking-wider">网络威胁地图</h1>
        <div class="text-xs text-slate-400 px-2 py-1 border border-slate-700 rounded bg-slate-900/50">
          实时监控
        </div>
      </div>
      
      <div class="flex items-center gap-4">
        <div class="flex bg-slate-800 rounded-lg p-1">
          <button 
            @click="setMode('3D')"
            class="px-4 py-1 rounded text-sm font-medium transition-all"
            :class="viewMode === '3D' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-400 hover:text-white'"
          >
            3D 地球视图
          </button>
          <button 
            @click="setMode('2D')"
            class="px-4 py-1 rounded text-sm font-medium transition-all"
            :class="viewMode === '2D' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-400 hover:text-white'"
          >
            2D 平面视图
          </button>
        </div>
        <div v-if="webglUnsupported" class="text-xs text-yellow-400 ml-4">当前浏览器不支持 WebGL，已自动切换为 2D 视图</div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 relative overflow-hidden">
      <!-- Map Containers -->
      <div class="absolute inset-0 w-full h-full">
        <!-- 3D Map -->
        <div v-show="viewMode === '3D'" class="w-full h-full">
          <CesiumMap />
        </div>
        <!-- 2D Map -->
        <div v-show="viewMode === '2D'" class="w-full h-full">
          <OpenLayersMap />
        </div>
      </div>

      <!-- Overlay UI -->
      <div class="absolute inset-0 pointer-events-none">
        <canvas ref="bgCanvasRef" class="absolute inset-0 w-full h-full"></canvas>
      </div>
      <div class="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
        
        <!-- 左侧统计面板 -->
        <div class="w-80 pointer-events-auto space-y-4">
          <!-- 实时统计 -->
          <div class="bg-slate-900/80 backdrop-blur-md border border-slate-700 p-4 rounded-lg glow-panel">
            <h3 class="text-slate-400 text-xs uppercase tracking-wider mb-3">全球威胁活动</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="text-2xl font-bold text-red-500">{{ totalThreats }}</div>
                <div class="text-xs text-slate-500">累计检测</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-orange-500 animate-pulse">{{ activeThreats }}</div>
                <div class="text-xs text-slate-500">当前活跃</div>
              </div>
            </div>
          </div>

          <!-- TOP 目标地区 -->
          <div class="bg-slate-900/80 backdrop-blur-md border border-slate-700 p-4 rounded-lg glow-panel">
            <h3 class="text-slate-400 text-xs uppercase tracking-wider mb-3">受攻击最严重地区 TOP5</h3>
            <div class="space-y-3">
              <div v-for="(count, region) in topRegions" :key="region" class="flex items-center justify-between">
                <span class="text-sm text-slate-300">{{ region }}</span>
                <div class="flex items-center gap-2">
                  <div class="h-1 w-16 bg-slate-800 rounded-full overflow-hidden">
                    <div class="h-full bg-red-500" :style="{ width: Math.min((count / 50) * 100, 100) + '%' }"></div>
                  </div>
                  <span class="text-xs font-mono text-slate-400 w-8 text-right">{{ count }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：攻击类型分布 -->
        <div class="absolute top-6 right-6 w-72 pointer-events-auto space-y-4">
          <div class="bg-slate-900/80 backdrop-blur-md border border-slate-700 p-4 rounded-lg glow-panel">
            <h3 class="text-slate-400 text-xs uppercase tracking-wider mb-3">⚡ 实时速率</h3>
            <div class="grid grid-cols-2 gap-4 items-center">
              <div>
                <div class="text-xl font-bold text-green-400">{{ lastMinuteCount }}</div>
                <div class="text-xs text-slate-500">近1分钟新增</div>
              </div>
              <div ref="trendChartRef" class="h-12 w-full"></div>
            </div>
          </div>
          <div class="bg-slate-900/80 backdrop-blur-md border border-slate-700 p-4 rounded-lg glow-panel">
            <h3 class="text-slate-400 text-xs uppercase tracking-wider mb-3">🛡️ 攻击类型分布</h3>
            <div ref="chartRef" class="h-40 w-full"></div>
            <div class="mt-3 text-xs text-slate-500">点击某类型以筛选</div>
            <div class="mt-2 space-y-1">
              <div v-for="it in typeListSorted" :key="it.name" class="flex items-center justify-between text-xs">
                <span class="text-slate-300">{{ it.name }}</span>
                <span class="text-slate-400">{{ it.value }}</span>
              </div>
            </div>
          </div>
          <div class="mt-4 bg-slate-900/80 backdrop-blur-md border border-slate-700 p-4 rounded-lg glow-panel">
            <h3 class="text-slate-400 text-xs uppercase tracking-wider mb-3">🔥 威胁等级分布</h3>
            <div ref="severityChartRef" class="h-40 w-full"></div>
            <div class="mt-2 text-xs text-slate-400">高 {{ severityStats[0].value }} · 中 {{ severityStats[1].value }} · 低 {{ severityStats[2].value }}</div>
          </div>
          <div class="mt-4 bg-slate-900/80 backdrop-blur-md border border-slate-700 p-4 rounded-lg glow-panel">
            <h3 class="text-slate-400 text-xs uppercase tracking-wider mb-3">🕒 近期攻击（最新10条）</h3>
            <div class="space-y-2 max-h-56 overflow-auto pr-2">
              <div v-for="item in recentAttacks" :key="item.id" class="flex items-center justify-between text-xs">
                <button @click="replay(item.id)" class="truncate max-w-[60%] text-left hover:text-blue-400">
                  <span :class="severityColor(item.severity)" class="font-bold">●</span> {{ item.attackType }} · {{ item.sourceRegion }} → {{ item.targetRegion }}
                </button>
                <div class="text-slate-500">{{ new Date(item.timestamp).toLocaleTimeString() }}</div>
              </div>
            </div>
          </div>
          <div class="mt-4 bg-slate-900/80 backdrop-blur-md border border-slate-700 p-4 rounded-lg glow-panel">
            <h3 class="text-slate-400 text-xs uppercase tracking-wider mb-3">📍 来源地区 TOP5</h3>
            <div class="space-y-2">
              <div v-for="(count, region) in topSourceRegions" :key="region" class="flex items-center justify-between text-xs">
                <span class="text-slate-300">{{ region }}</span>
                <span class="text-slate-400">{{ count }}</span>
              </div>
            </div>
          </div>
          <div class="mt-4 bg-slate-900/80 backdrop-blur-md border border-slate-700 p-4 rounded-lg glow-panel">
            <h3 class="text-slate-400 text-xs uppercase tracking-wider mb-3">🌏 洲快速定位</h3>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <button v-for="c in continents" :key="c" @click="focus(c)" class="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded">{{ c }}</button>
            </div>
          </div>
        </div>

        

        <!-- 版权标注 -->
        <div class="absolute bottom-2 right-4 text-[10px] text-slate-600 pointer-events-auto">
          基于 Cesium & OpenLayers | 瓦片服务：OpenStreetMap | 模拟数据
        </div>

      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import CesiumMap from '../components/CesiumMap.vue';
import OpenLayersMap from '../components/OpenLayersMap.vue';
import { useThreatMap } from '../composables/useThreatMap';
import * as echarts from 'echarts';

const { viewMode, toggleViewMode, threats, isPlaying, startSimulation, stopSimulation, setFilters, setSeverityFilters, resetView, zoom, autoRotate, toggleAutoRotate, replayBeam, focusContinent } = useThreatMap();
const webglUnsupported = ref(false);

const chartRef = ref<HTMLElement | null>(null);
const trendChartRef = ref<HTMLElement | null>(null);
const bgCanvasRef = ref<HTMLCanvasElement | null>(null);
const severityChartRef = ref<HTMLElement | null>(null);
let chartInstance: echarts.ECharts | null = null;
let trendChartInstance: echarts.ECharts | null = null;
let severityChartInstance: echarts.ECharts | null = null;

// Computed Stats
const totalThreats = ref(125430);
const activeThreats = computed(() => threats.value.length);

const topRegions = computed(() => {
  const counts: Record<string, number> = {};
  threats.value.forEach(t => {
    counts[t.targetRegion] = (counts[t.targetRegion] || 0) + 1;
  });
  return Object.fromEntries(
    Object.entries(counts).sort(([,a], [,b]) => b - a).slice(0, 5)
  );
});

const attackTypeStats = computed(() => {
  const counts: Record<string, number> = {};
  threats.value.forEach(t => {
    counts[t.attackType] = (counts[t.attackType] || 0) + 1;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
});

const severityStats = computed(() => {
  const counts: Record<string, number> = { high: 0, medium: 0, low: 0 };
  threats.value.forEach(t => { counts[t.severity]++; });
  return [
    { name: '高', value: counts.high },
    { name: '中', value: counts.medium },
    { name: '低', value: counts.low }
  ];
});

const recentAttacks = computed(() => threats.value.slice(-10).reverse());
const severityColor = (s: 'high'|'medium'|'low') => s === 'high' ? 'text-red-500' : s === 'medium' ? 'text-orange-500' : 'text-yellow-500';
const sev = ref({ high: true, medium: true, low: true });
const continents = ['亚洲','欧洲','非洲','北美洲','南美洲','大洋洲','南极洲'];

/**
 * lastMinuteCount
 * 近1分钟新增数量
 */
const lastMinuteCount = computed(() => {
  const now = Date.now();
  return threats.value.filter(t => now - t.timestamp <= 60000).length;
});

/**
 * typeListSorted
 * 攻击类型明细列表（按数量降序）
 */
const typeListSorted = computed(() => {
  return [...attackTypeStats.value].sort((a,b) => b.value - a.value);
});

/**
 * topSourceRegions
 * 来源地区 TOP5
 */
const topSourceRegions = computed(() => {
  const counts: Record<string, number> = {};
  threats.value.forEach(t => {
    counts[t.sourceRegion] = (counts[t.sourceRegion] || 0) + 1;
  });
  return Object.fromEntries(Object.entries(counts).sort(([,a],[,b]) => b - a).slice(0,5));
});

/**
 * setMode
 * 设置视图模式
 */
const setMode = (mode: '3D' | '2D') => {
  if (viewMode.value !== mode) {
    toggleViewMode();
  }
};

/**
 * togglePlay
 * 切换模拟数据的播放状态
 */
const togglePlay = () => {
  isPlaying.value = !isPlaying.value;
};

/**
 * replay
 * 重放单条攻击的光束动画
 */
const replay = (id: string) => {
  replayBeam(id);
};

/**
 * focus
 * 聚焦到指定洲
 */
const focus = (name: string) => {
  focusContinent(name);
};

// Counter effect
let counterInterval: NodeJS.Timeout;

/**
 * 页面挂载时初始化模拟数据与图表
 */
onMounted(() => {
  const gl = document.createElement('canvas').getContext('webgl') || document.createElement('canvas').getContext('experimental-webgl');
  if (!gl) {
    webglUnsupported.value = true;
    if (viewMode.value !== '2D') toggleViewMode();
  }
  startSimulation();
  
  counterInterval = setInterval(() => {
    if (isPlaying.value) {
      totalThreats.value += Math.floor(Math.random() * 5);
    }
  }, 500);

  initChart();
  initSeverityChart();
  initTrendChart();
  initParticles();
  window.addEventListener('resize', resizeChart);
});

/**
 * 页面卸载清理资源
 */
onUnmounted(() => {
  stopSimulation();
  clearInterval(counterInterval);
  window.removeEventListener('resize', resizeChart);
  chartInstance?.dispose();
  severityChartInstance?.dispose();
  trendChartInstance?.dispose();
  stopParticles();
});

// Chart
/**
 * initChart
 * 初始化攻击类型分布图并绑定点击筛选事件
 */
const initChart = () => {
  if (!chartRef.value) return;
  
  chartInstance = echarts.init(chartRef.value);
  updateChart();
  chartInstance.on('click', (params: any) => {
    const name = params.name as string;
    setFilters([name as any], null);
  });
};

/**
 * resizeChart
 * 图表自适应
 */
const resizeChart = () => {
  chartInstance?.resize();
  severityChartInstance?.resize();
  trendChartInstance?.resize();
};

/**
 * updateChart
 * 更新图表数据
 */
const updateChart = () => {
  if (!chartInstance) return;

  chartInstance.setOption({
    tooltip: {
      trigger: 'item'
    },
    legend: {
      show: false
    },
    series: [
      {
        name: 'Attack Type',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 5,
          borderColor: '#0f172a',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 12,
            fontWeight: 'bold',
            color: '#fff'
          }
        },
        data: attackTypeStats.value
      }
    ]
  });
};

/**
 * initSeverityChart
 * 初始化严重等级分布的柱状图
 */
const initSeverityChart = () => {
  if (!severityChartRef.value) return;
  severityChartInstance = echarts.init(severityChartRef.value);
  updateSeverityChart();
};

/**
 * updateSeverityChart
 * 更新严重等级分布图
 */
const updateSeverityChart = () => {
  if (!severityChartInstance) return;
  severityChartInstance.setOption({
    xAxis: { type: 'category', data: severityStats.value.map(d => d.name), axisLabel: { color: '#94a3b8' } },
    yAxis: { type: 'value', axisLabel: { color: '#94a3b8' } },
    series: [{ type: 'bar', data: severityStats.value.map(d => d.value), itemStyle: { color: '#ef4444' } }],
    grid: { left: 24, right: 8, top: 16, bottom: 24 }
  });
};

/**
 * initTrendChart
 * 初始化近1分钟趋势折线图
 */
const initTrendChart = () => {
  if (!trendChartRef.value) return;
  trendChartInstance = echarts.init(trendChartRef.value);
  updateTrendChart();
};

/**
 * updateTrendChart
 * 更新近1分钟趋势图
 */
const updateTrendChart = () => {
  if (!trendChartInstance) return;
  const now = Date.now();
  const buckets: number[] = [];
  const labels: string[] = [];
  const step = 5000; // 5s
  for (let i = 12; i >= 1; i--) {
    const start = now - i * step;
    const end = start + step;
    const cnt = threats.value.filter(t => t.timestamp >= start && t.timestamp < end).length;
    buckets.push(cnt);
    labels.push(`${Math.round((60 - i*5))}s`);
  }
  trendChartInstance.setOption({
    xAxis: { type: 'category', data: labels, axisLabel: { show: false }, axisLine: { show: false } },
    yAxis: { type: 'value', axisLabel: { show: false }, axisLine: { show: false }, splitLine: { show: false } },
    grid: { left: 0, right: 0, top: 0, bottom: 0 },
    series: [{ type: 'line', data: buckets, smooth: true, areaStyle: { color: 'rgba(34,197,94,0.3)' }, lineStyle: { color: '#22c55e' }, symbol: 'none' }]
  });
};

watch(attackTypeStats, () => {
  updateChart();
});

watch(severityStats, () => {
  updateSeverityChart();
});

watch(threats, () => {
  updateTrendChart();
});

let rafId = 0;
let particles: { x: number; y: number; vx: number; vy: number; r: number; a: number }[] = [];
const initParticles = () => {
  if (!bgCanvasRef.value) return;
  const canvas = bgCanvasRef.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const resize = () => {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  };
  resize();
  particles = Array.from({ length: 80 }).map(() => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.6,
    vy: (Math.random() - 0.5) * 0.6,
    r: Math.random() * 1.5 + 0.5,
    a: Math.random() * 0.5 + 0.2
  }));
  const loop = () => {
    rafId = requestAnimationFrame(loop);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(34,197,94,0.12)';
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
  };
  loop();
  window.addEventListener('resize', resize);
};
const stopParticles = () => {
  if (rafId) cancelAnimationFrame(rafId);
};

// 等级筛选联动
watch(sev, (v) => {
  const selected: ('high'|'medium'|'low')[] = [];
  if (v.high) selected.push('high');
  if (v.medium) selected.push('medium');
  if (v.low) selected.push('low');
  setSeverityFilters(selected.length === 3 ? null : selected);
}, { deep: true });

</script>

<style scoped>
/* Custom scrollbar if needed */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: #0f172a;
}
::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 3px;
}
.glow-panel {
  box-shadow: 0 0 24px rgba(59,130,246,0.18), inset 0 0 12px rgba(59,130,246,0.08);
  position: relative;
}
.glow-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 0.5rem;
  padding: 1px;
  background: linear-gradient(135deg, rgba(59,130,246,0.5), rgba(147,197,253,0.2));
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}
.glow-panel h3 {
  text-shadow: 0 0 8px rgba(147,197,253,0.3);
}
</style>
