import { ref, computed } from 'vue';

export interface Threat {
  id: string;
  lng: number;
  lat: number;
  attackType: 'OAS' | 'ODS' | 'MAV' | 'DDOS' | 'Ransomware';
  timestamp: number;
  severity: 'high' | 'medium' | 'low';
  sourceRegion: string;
  targetRegion: string;
  targetLng?: number;
  targetLat?: number;
}

// Shared state
const viewMode = ref<'3D' | '2D'>('3D');
const threats = ref<Threat[]>([]);
const isPlaying = ref(true);
const autoRotate = ref(true);
const filterTypes = ref<Set<Threat['attackType']>>(new Set());
const filterSeverities = ref<Set<Threat['severity']>>(new Set());
const control = ref({ resetTick: 0, zoomTick: 0, zoomDir: 'in' as 'in' | 'out' });
const replayBeamSignal = ref<{ id: string | null; tick: number }>({ id: null, tick: 0 });
const focusContinentSignal = ref<{ name: string | null; tick: number }>({ name: null, tick: 0 });

// Mock data helpers
const REGIONS = [
  { name: 'China', lng: 116.4074, lat: 39.9042 },
  { name: 'USA', lng: -95.7129, lat: 37.0902 },
  { name: 'Russia', lng: 105.3188, lat: 61.5240 },
  { name: 'Brazil', lng: -51.9253, lat: -14.2350 },
  { name: 'Australia', lng: 133.7751, lat: -25.2744 },
  { name: 'Germany', lng: 10.4515, lat: 51.1657 },
  { name: 'Japan', lng: 138.2529, lat: 36.2048 },
];

const ATTACK_TYPES = ['OAS', 'ODS', 'MAV', 'DDOS', 'Ransomware'] as const;

function generateThreat(): Threat {
  const source = REGIONS[Math.floor(Math.random() * REGIONS.length)];
  const target = REGIONS[Math.floor(Math.random() * REGIONS.length)];
  
  // Add some randomness to coordinates
  const lng = source.lng + (Math.random() - 0.5) * 20;
  const lat = source.lat + (Math.random() - 0.5) * 10;
  const targetLng = target.lng + (Math.random() - 0.5) * 20;
  const targetLat = target.lat + (Math.random() - 0.5) * 10;

  const severityRand = Math.random();
  const severity = severityRand > 0.8 ? 'high' : severityRand > 0.5 ? 'medium' : 'low';

  return {
    id: Math.random().toString(36).substring(7),
    lng,
    lat,
    attackType: ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)],
    timestamp: Date.now(),
    severity,
    sourceRegion: source.name,
    targetRegion: target.name,
    targetLng,
    targetLat
  };
}

/**
 * useThreatMap
 * 返回威胁地图的共享状态与控制方法（视图模式、数据、播放、筛选、全局控制信号）
 */
export function useThreatMap() {
  let intervalId: NodeJS.Timeout | null = null;

  /**
   * startSimulation
   * 启动本地模拟数据源，定时生成威胁数据并维护长度
   */
  const startSimulation = () => {
    if (intervalId) return;
    
    // Initial batch
    if (threats.value.length === 0) {
      for (let i = 0; i < 20; i++) {
        threats.value.push(generateThreat());
      }
    }

    intervalId = setInterval(() => {
      if (!isPlaying.value) return;
      // Add burst every 2s: 1-3 items
      const count = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        threats.value.push(generateThreat());
      }
      // Keep list size manageable
      if (threats.value.length > 150) {
        threats.value.splice(0, threats.value.length - 150);
      }
    }, 2000);
  };

  /**
   * stopSimulation
   * 停止模拟数据源
   */
  const stopSimulation = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  /**
   * toggleViewMode
   * 切换 3D/2D 视图模式
   */
  const toggleViewMode = () => {
    viewMode.value = viewMode.value === '3D' ? '2D' : '3D';
  };

  /**
   * setFilters
   * 设置攻击类型与威胁等级筛选
   */
  const setFilters = (types: Threat['attackType'][] | null, severities: Threat['severity'][] | null) => {
    filterTypes.value = new Set(types ?? []);
    filterSeverities.value = new Set(severities ?? []);
  };

  /**
   * setSeverityFilters
   * 仅设置严重等级筛选（便于 UI 勾选联动）
   */
  const setSeverityFilters = (severities: Threat['severity'][] | null) => {
    filterSeverities.value = new Set(severities ?? []);
  };

  /**
   * filteredThreats
   * 根据筛选条件返回用于渲染的威胁数据
   */
  const filteredThreats = computed(() => {
    return threats.value.filter(t =>
      (filterTypes.value.size === 0 || filterTypes.value.has(t.attackType)) &&
      (filterSeverities.value.size === 0 || filterSeverities.value.has(t.severity))
    );
  });

  /**
   * resetView
   * 触发重置视角信号（由地图组件监听执行）
   */
  const resetView = () => {
    control.value.resetTick++;
  };

  /**
   * zoom
   * 触发缩放信号（由地图组件监听执行）
   */
  const zoom = (dir: 'in' | 'out') => {
    control.value.zoomDir = dir;
    control.value.zoomTick++;
  };

  /**
   * toggleAutoRotate
   * 切换演示模式（3D 自动旋转 / 2D 自动平移）
   */
  const toggleAutoRotate = () => {
    autoRotate.value = !autoRotate.value;
  };

  /**
   * replayBeam
   * 触发重放某条威胁的光束动画（由地图组件监听执行）
   */
  const replayBeam = (id: string) => {
    replayBeamSignal.value = { id, tick: replayBeamSignal.value.tick + 1 };
  };

  /**
   * focusContinent
   * 聚焦到指定洲（由地图组件根据内置坐标执行）
   */
  const focusContinent = (name: string) => {
    focusContinentSignal.value = { name, tick: focusContinentSignal.value.tick + 1 };
  };

  return {
    viewMode,
    threats,
    filteredThreats,
    isPlaying,
    autoRotate,
    startSimulation,
    stopSimulation,
    toggleViewMode,
    setFilters,
    setSeverityFilters,
    resetView,
    zoom,
    control,
    toggleAutoRotate,
    replayBeam,
    replayBeamSignal,
    focusContinent,
    focusContinentSignal
  };
}
