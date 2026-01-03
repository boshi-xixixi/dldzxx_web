<template>
  <div id="olContainer" class="w-full h-full relative bg-[#0a0e17]">
    <div ref="popupRef" class="bg-slate-900/90 border border-slate-600 p-4 rounded shadow-lg text-white min-w-[200px] hidden">
      <div id="popup-content"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { fromLonLat } from 'ol/proj';
import { toLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import { Style, Circle as CircleStyle, Fill, Stroke, Text } from 'ol/style';
import Overlay from 'ol/Overlay';
import { useThreatMap, type Threat } from '../composables/useThreatMap';
import GeoJSON from 'ol/format/GeoJSON';
import worldUrl from '../assets/maps/world.json?url';

const { filteredThreats, autoRotate, control, replayBeamSignal, focusContinentSignal } = useThreatMap();
const map = ref<Map | null>(null);
const vectorSource = new VectorSource();
const popupRef = ref<HTMLElement | null>(null);
const overlay = ref<Overlay | null>(null);
let autoPanTimer: number | null = null;
let blinkTimer: number | null = null;
const blinkPhase = ref(0);

onMounted(() => {
  initOpenLayers();
  window.addEventListener('resize', handleResize);
  startBlink();
  // 2D 端不进行自动平移
});

onUnmounted(() => {
  if (map.value) {
    map.value.setTarget(undefined);
    map.value = null;
  }
  window.removeEventListener('resize', handleResize);
  stopAutoPan();
  stopBlink();
});

/**
 * initOpenLayers
 * 初始化 OpenLayers 地图、要素图层与弹窗
 */
const initOpenLayers = () => {
  const vectorLayer = new VectorLayer({
    source: vectorSource,
  });

  // 世界边界着色图层
  const worldLayer = new VectorLayer({
    source: new VectorSource({
      url: worldUrl,
      format: new GeoJSON()
    }),
    style: new Style({
      fill: new Fill({ color: 'rgba(34,36,40,0.40)' }),
      stroke: new Stroke({ color: 'rgba(120,130,150,0.7)', width: 0.8 })
    })
  });

  // Popup overlay
  if (popupRef.value) {
    overlay.value = new Overlay({
      element: popupRef.value,
      autoPan: true,
    });
  }

  map.value = new Map({
    target: 'olContainer',
    layers: [
      new TileLayer({
        source: new XYZ({
          url: 'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
          crossOrigin: 'anonymous'
        }),
        className: 'dark-map-tiles'
      }),
      worldLayer,
      vectorLayer
    ],
    view: new View({
      center: fromLonLat([116.4, 39.9]),
      zoom: 4,
      minZoom: 2,
      maxZoom: 10
    }),
    controls: [] 
  });
  if (overlay.value) {
    overlay.value.setMap(map.value as any);
  }
  setTimeout(() => map.value && map.value.updateSize(), 0);

  // Click interaction
  map.value.on('click', (evt) => {
    const feature = map.value?.forEachFeatureAtPixel(evt.pixel, (feature) => feature);
    
    if (feature && popupRef.value && overlay.value) {
      const props = feature.getProperties();
      // Check if it's a threat point (has attackType)
      if (props.attackType) {
        const content = document.getElementById('popup-content');
        if (content) {
          content.innerHTML = `
            <h3 class="font-bold text-lg mb-2 text-blue-400">${props.attackType}</h3>
            <p class="text-sm"><span class="text-slate-400">时间:</span> ${new Date(props.timestamp).toLocaleTimeString()}</p>
            <p class="text-sm"><span class="text-slate-400">来源:</span> ${props.sourceRegion}</p>
            <p class="text-sm"><span class="text-slate-400">目标:</span> ${props.targetRegion}</p>
            <p class="text-sm"><span class="text-slate-400">威胁等级:</span> <span class="${props.severity === 'high' ? 'text-red-500' : props.severity === 'medium' ? 'text-orange-500' : 'text-yellow-500'} uppercase">${props.severity}</span></p>
          `;
        }
        popupRef.value.style.display = 'block';
        overlay.value.setPosition(evt.coordinate);
        overlay.value.panIntoView({ animation: { duration: 250 } });
      }
    } else {
      if (popupRef.value && overlay.value) {
        overlay.value.setPosition(undefined);
        popupRef.value.style.display = 'none';
      }
    }
  });
  
  // Pointer cursor on hover
  map.value.on('pointermove', (evt) => {
    if (map.value) {
      const pixel = map.value.getEventPixel(evt.originalEvent);
      const hit = map.value.hasFeatureAtPixel(pixel);
      map.value.getTargetElement().style.cursor = hit ? 'pointer' : '';
    }
  });
};

/**
 * 同步威胁要素
 * 监听过滤后的威胁数据，增删点与连线
 */
watch(filteredThreats, (newThreats) => {
  // Sync features
  // Clear and rebuild is easiest for this scale, but for performance we should diff
  // Let's try to be a bit smarter: ID map
  
  // Current features
  const features = vectorSource.getFeatures();
  const existingIds = new Set(features.map(f => f.getId()));

  const newIds = new Set(newThreats.map(t => t.id));

  // Remove old
  features.forEach(f => {
    const id = f.getId();
    if (id && !newIds.has(id as string)) {
      vectorSource.removeFeature(f);
    }
  });

  // Add new or update
  newThreats.forEach(threat => {
    if (!existingIds.has(threat.id)) {
      addThreatFeature(threat);
    }
  });
}, { deep: true });

/**
 * addThreatFeature
 * 创建热点点要素与可选连线，并为点添加闪烁动画样式
 */
const addThreatFeature = (threat: Threat) => {
  const color = threat.severity === 'high' ? 'rgba(255, 0, 0, 0.8)' : 
                threat.severity === 'medium' ? 'rgba(255, 165, 0, 0.8)' : 'rgba(255, 255, 0, 0.8)';
  
  const radius = threat.severity === 'high' ? 8 : 
                 threat.severity === 'medium' ? 6 : 4;

  const pointFeature = new Feature({
    geometry: new Point(fromLonLat([threat.lng, threat.lat])),
    name: threat.attackType,
    ...threat
  });
  
  pointFeature.setId(threat.id);
  
  pointFeature.setStyle(() => {
    const phase = (blinkPhase.value % 1000) / 1000;
    const alpha = 0.6 + 0.4 * Math.abs(Math.sin(phase * Math.PI * 2));
    return new Style({
      image: new CircleStyle({
        radius: radius,
        fill: new Fill({ color: color.replace('0.8', alpha.toFixed(2)) }),
        stroke: new Stroke({ color: '#fff', width: 1 })
      }),
      text: new Text({
        text: threat.attackType,
        offsetY: -15,
        fill: new Fill({ color: '#fff' }),
        font: '12px sans-serif'
      })
    });
  });

  vectorSource.addFeature(pointFeature);

  // Line feature
  if (threat.targetLng && threat.targetLat) {
    const lineFeature = new Feature({
      geometry: new LineString([
        fromLonLat([threat.lng, threat.lat]),
        fromLonLat([threat.targetLng, threat.targetLat])
      ])
    });
    // Use ID + '_line'
    lineFeature.setId(threat.id + '_line');
    
    lineFeature.setStyle(new Style({
      stroke: new Stroke({
        color: color,
        width: 2
      })
    }));
    
    vectorSource.addFeature(lineFeature);

    createBeam(threat, lineFeature, color);
  }
};

/**
 * createBeam
 * 在线要素上创建移动光点（光束），到达目标后自动移除光点与连线
 */
const createBeam = (threat: Threat, lineFeature: Feature<LineString>, color: string) => {
  const start = fromLonLat([threat.lng, threat.lat]);
  const end = fromLonLat([threat.targetLng!, threat.targetLat!]);
  const beamFeature = new Feature({ geometry: new Point(start) });
  beamFeature.setStyle(new Style({
    image: new CircleStyle({ radius: 5, fill: new Fill({ color }), stroke: new Stroke({ color: '#fff', width: 1 }) })
  }));
  vectorSource.addFeature(beamFeature);

  const duration = 2200; // ms
  const steps = 30;
  let i = 0;
  const tail: Feature<Point>[] = [];
  const timer = window.setInterval(() => {
    i++;
    const t = i / steps;
    const x = start[0] + (end[0] - start[0]) * t;
    const y = start[1] + (end[1] - start[1]) * t;
    (beamFeature.getGeometry() as Point).setCoordinates([x, y]);

    const tailDot = new Feature({ geometry: new Point([x, y]) });
    const alpha = 0.5 * (1 - t);
    tailDot.setStyle(new Style({ image: new CircleStyle({ radius: 2, fill: new Fill({ color: color.replace('0.9', alpha.toFixed(2)) }) }) }));
    vectorSource.addFeature(tailDot);
    tail.push(tailDot);

    if (i >= steps) {
      clearInterval(timer);
      vectorSource.removeFeature(beamFeature);
      vectorSource.removeFeature(lineFeature);
      tail.forEach(f => vectorSource.removeFeature(f));
    }
  }, duration / steps);
};

/**
 * handleResize
 * 窗口尺寸变化时更新地图尺寸
 */
const handleResize = () => {
  if (map.value) {
    map.value.updateSize();
  }
};

/**
 * startBlink / stopBlink
 * 开启/停止闪烁计时器，驱动样式重绘
 */
const startBlink = () => {
  stopBlink();
  blinkTimer = window.setInterval(() => {
    blinkPhase.value = (blinkPhase.value + 100) % 1000;
    vectorSource.changed();
  }, 300);
};

const stopBlink = () => {
  if (blinkTimer) {
    clearInterval(blinkTimer);
    blinkTimer = null;
  }
};

/**
 * 自动平移演示模式
 */
const startAutoPan = () => {
  stopAutoPan();
  autoPanTimer = window.setInterval(() => {
    if (!map.value) return;
    const view = map.value.getView();
    const center = toLonLat(view.getCenter()!);
    const next = [center[0] + 0.2, center[1]];
    view.setCenter(fromLonLat(next));
  }, 500);
};

const stopAutoPan = () => {
  if (autoPanTimer) {
    clearInterval(autoPanTimer);
    autoPanTimer = null;
  }
};

/**
 * 响应全局控制信号：重置视图与缩放、自动平移
 */
watch(control, (c, prev) => {
  if (!map.value) return;
  const view = map.value.getView();
  if (c.resetTick !== prev.resetTick) {
    view.setCenter(fromLonLat([116.4, 39.9]));
    view.setZoom(4);
  }
  if (c.zoomTick !== prev.zoomTick) {
    const z = view.getZoom() ?? 4;
    view.setZoom(c.zoomDir === 'in' ? z + 1 : z - 1);
  }
}, { deep: true });

// 2D 不响应演示模式自动平移

/**
 * 监听光束重放信号
 */
watch(replayBeamSignal, (sig, prev) => {
  if (sig.tick !== prev.tick && sig.id) {
    const features = vectorSource.getFeatures();
    const line = features.find(f => f.getId() === sig.id + '_line') as Feature<LineString> | undefined;
    const t = filteredThreats.value.find(x => x.id === sig.id);
    if (line && t && t.targetLng && t.targetLat) {
      const color = t.severity === 'high' ? 'rgba(255,0,0,0.9)' : t.severity === 'medium' ? 'rgba(255,165,0,0.9)' : 'rgba(255,255,0,0.9)';
      createBeam(t, line, color);
    }
  }
}, { deep: true });

/**
 * 监听洲聚焦信号
 */
const continentCenters: Record<string, [number, number]> = {
  '亚洲': [90, 45],
  '欧洲': [20, 50],
  '非洲': [20, 5],
  '北美洲': [-100, 45],
  '南美洲': [-60, -15],
  '大洋洲': [140, -25],
  '南极洲': [0, -80]
};

watch(focusContinentSignal, (sig, prev) => {
  if (!map.value) return;
  if (sig.tick !== prev.tick && sig.name) {
    const c = continentCenters[sig.name];
    if (c) {
      const view = map.value.getView();
      view.animate({ center: fromLonLat(c), duration: 800 });
    }
  }
}, { deep: true });
</script>

<style>
/* Global style for map filter because ol renders canvas outside scope if not careful, but class name works on layer */
.dark-map-layer {
  filter: invert(100%) hue-rotate(180deg) brightness(80%) contrast(90%);
}
.dark-map-tiles {
  filter: brightness(80%) contrast(110%) saturate(85%);
}
</style>
