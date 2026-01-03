<template>
  <div id="cesiumContainer" class="w-full h-full relative">
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
      <div class="text-white text-xl font-bold animate-pulse">Loading 3D Earth...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import * as Cesium from 'cesium';
import "cesium/Build/Cesium/Widgets/widgets.css";
import { useThreatMap, type Threat } from '../composables/useThreatMap';
import { useTheme } from '../composables/useTheme';
import worldUrl from '../assets/maps/world.json?url';

const { filteredThreats, autoRotate, control, replayBeamSignal, focusContinentSignal } = useThreatMap();
const { isDark } = useTheme();
const viewer = ref<Cesium.Viewer | null>(null);
const loading = ref(true);
const entities = new Map<string, Cesium.Entity>();
const lineEntities = new Map<string, Cesium.Entity>();
const beamEntities = new Map<string, Cesium.Entity>();

onMounted(() => {
  initCesium();
});

onUnmounted(() => {
  if (viewer.value) {
    viewer.value.destroy();
    viewer.value = null;
  }
});

/**
 * initCesium
 * 初始化 Cesium Viewer，设置基础影像与初始视角，并开启时钟事件用于自动旋转
 */
const initCesium = () => {
  // Access Token is usually needed for Ion assets, but we can use local or standard ones for now without it or use default
  // Cesium.Ion.defaultAccessToken = 'YOUR_TOKEN'; 

  viewer.value = new Cesium.Viewer('cesiumContainer', {
    animation: false,
    baseLayerPicker: false,
    fullscreenButton: false,
    vrButton: false,
    geocoder: false,
    homeButton: false,
    infoBox: true,
    sceneModePicker: false,
    selectionIndicator: true,
    timeline: false,
    navigationHelpButton: false,
    scene3DOnly: true,
    requestRenderMode: true,
    maximumRenderTimeChange: Infinity,
  });

  // Remove credit logo if allowed (usually need to keep it or style it)
  // (viewer.value.cesiumWidget.creditContainer as HTMLElement).style.display = 'none';

  // Enable lighting
  viewer.value.scene.globe.enableLighting = true;
  viewer.value.scene.globe.depthTestAgainstTerrain = false;
  
  // Set initial view
  viewer.value.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(116.4, 39.9, 20000000),
  });

  loading.value = false;

  setImagery(isDark.value);
  viewer.value.scene.postProcessStages.bloom.enabled = false;
  viewer.value.scene.highDynamicRange = false;

  viewer.value.scene.backgroundColor = Cesium.Color.BLACK;
  viewer.value.scene.globe.showGroundAtmosphere = false;
  viewer.value.scene.skyAtmosphere.hueShift = -0.9;
  viewer.value.scene.skyAtmosphere.saturationShift = -0.5;
  viewer.value.scene.skyAtmosphere.brightnessShift = -0.8;
  viewer.value.scene.globe.enableLighting = false;

  viewer.value.scene.skyBox = undefined;

  // Start render loop for updates
  viewer.value.clock.onTick.addEventListener(() => {
    if (!viewer.value) return;
    if (autoRotate.value) {
      viewer.value.camera.rotateLeft(0.001);
    }
  });

  loadWorldPolygons();
  removeContinentLabels();
};

/**
 * loadWorldPolygons
 * 加载世界国家边界并进行半透明面着色，突出各洲/陆地形态
 */
const loadWorldPolygons = async () => {
  if (!viewer.value) return;
  try {
    const ds = await Cesium.GeoJsonDataSource.load(worldUrl, {
      clampToGround: true
    });
    viewer.value.dataSources.add(ds);
    const fill = Cesium.Color.fromCssColorString('#1b2a3b').withAlpha(0.35);
    const outline = Cesium.Color.fromCssColorString('#7288a2').withAlpha(0.6);
    ds.entities.values.forEach((entity) => {
      if (entity.polygon) {
        entity.polygon.material = new Cesium.ColorMaterialProperty(fill);
        entity.polygon.outline = new Cesium.ConstantProperty(true);
        entity.polygon.outlineColor = new Cesium.ConstantProperty(outline);
      }
    });
  } catch (e) {
    // 忽略加载失败不影响核心功能
  }
};

/**
 * setImagery
 * 根据主题设置深色或浅色底图
 */
const setImagery = (dark: boolean) => {
  if (!viewer.value) return;
  const layers = viewer.value.imageryLayers;
  layers.removeAll();
  const provider = new Cesium.UrlTemplateImageryProvider({
    url: dark
      ? 'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
      : 'https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
  });
  const layer = layers.addImageryProvider(provider);
  layer.alpha = 1.0;
  layer.brightness = dark ? 0.3 : 1.0;
  layer.contrast = dark ? 1.0 : 1.0;
  layer.saturation = dark ? 0.6 : 1.0;
};

/**
 * addContinentLabels
 * 在地球上添加大洲名称中文标签
 */
const addContinentLabels = () => {
  if (!viewer.value) return;
  const data = [
    { name: '亚洲', lng: 90, lat: 45 },
    { name: '欧洲', lng: 20, lat: 50 },
    { name: '非洲', lng: 20, lat: 5 },
    { name: '北美洲', lng: -100, lat: 45 },
    { name: '南美洲', lng: -60, lat: -15 },
    { name: '大洋洲', lng: 140, lat: -25 },
    { name: '南极洲', lng: 0, lat: -80 }
  ];
  data.forEach(d => {
    viewer.value?.entities.add({
      position: Cesium.Cartesian3.fromDegrees(d.lng, d.lat),
      label: {
        text: d.name,
        font: 'bold 24px sans-serif',
        fillColor: Cesium.Color.fromCssColorString('#a3b2c7'),
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        pixelOffset: new Cesium.Cartesian2(0, 0),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 3.0e7)
      }
    });
  });
  // 保存用于聚焦的坐标映射
  continentCenters = data.reduce<Record<string, { lng: number; lat: number }>>((acc, cur) => {
    acc[cur.name] = { lng: cur.lng, lat: cur.lat };
    return acc;
  }, {});
};

let continentCenters: Record<string, { lng: number; lat: number }> = {};

const removeContinentLabels = () => {
  const v = viewer.value;
  if (!v) return;
  const names = new Set(['亚洲','欧洲','非洲','北美洲','南美洲','大洋洲','南极洲']);
  const now = Cesium.JulianDate.now();
  v.entities.values.slice().forEach((e) => {
    const lbl: any = (e as any).label;
    let txt: any = undefined;
    if (lbl && lbl.text) {
      txt = typeof lbl.text === 'string' ? lbl.text : (lbl.text.getValue ? lbl.text.getValue(now) : undefined);
    }
    if (txt && names.has(txt)) {
      v.entities.remove(e);
    }
  });
};

/**
 * 同步威胁实体
 * 监听过滤后的威胁数据，增删 Cesium 实体与连线
 */
watch(filteredThreats, (newThreats) => {
  if (!viewer.value) return;

  // Simple diffing: add new, remove old (simplified for now by just adding new)
  // In a real app, we'd want to track IDs more carefully to remove expired ones
  
  // For this demo, we'll just add entities for new threats that don't exist yet
  // And maybe clear old ones if the list shrinks significantly (or simple re-render strategy)
  
  // Let's just sync: iterate threats, ensure entity exists.
  // Note: This watch might trigger frequently. 
  
  const currentIds = new Set(newThreats.map(t => t.id));

  // Remove missing
  for (const [id, entity] of entities) {
    if (!currentIds.has(id)) {
      viewer.value.entities.remove(entity);
      entities.delete(id);
      
      // Also remove line
      const lineEntity = lineEntities.get(id);
      if (lineEntity) {
        viewer.value.entities.remove(lineEntity);
        lineEntities.delete(id);
      }
    }
  }

  // Add new
  newThreats.forEach(threat => {
    if (!entities.has(threat.id)) {
      addThreatEntity(threat);
    }
  });
}, { deep: true });

// 主题切换时更新底图
watch(isDark, (v) => setImagery(v));

/**
 * addThreatEntity
 * 根据威胁数据创建点实体与可选连线，并添加闪烁动画
 */
const addThreatEntity = (threat: Threat) => {
  if (!viewer.value) return;

  const color = threat.severity === 'high' ? Cesium.Color.RED : 
                threat.severity === 'medium' ? Cesium.Color.ORANGE : Cesium.Color.YELLOW;
  
  const size = threat.severity === 'high' ? 10 : 
               threat.severity === 'medium' ? 7 : 5;

  // Point entity
  const blinkColor = new Cesium.CallbackProperty((time) => {
    const phase = Math.sin((Cesium.JulianDate.toDate(time).getTime() % 2000) / 2000 * Math.PI * 2);
    const alpha = 0.6 + 0.4 * (phase > 0 ? phase : -phase);
    return color.withAlpha(alpha);
  }, false);

  const entity = viewer.value.entities.add({
    id: threat.id,
    position: Cesium.Cartesian3.fromDegrees(threat.lng, threat.lat),
    point: {
      pixelSize: size,
      color: blinkColor,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 1,
      // Add flash effect (simulated by callback property if needed, or just static for now)
    },
    label: {
      text: threat.attackType,
      font: '12px sans-serif',
      showBackground: true,
      horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(10, -10),
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 5000000)
    },
    description: `
      <div style="padding: 10px; color: black;">
        <h3>${threat.attackType}</h3>
        <p><strong>Time:</strong> ${new Date(threat.timestamp).toLocaleTimeString()}</p>
        <p><strong>Source:</strong> ${threat.sourceRegion}</p>
        <p><strong>Target:</strong> ${threat.targetRegion}</p>
        <p><strong>Severity:</strong> ${threat.severity}</p>
      </div>
    `
  });

  entities.set(threat.id, entity);

  // Line entity (if target exists)
  if (threat.targetLng && threat.targetLat) {
    const lineEntity = viewer.value.entities.add({
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray([
          threat.lng, threat.lat,
          threat.targetLng, threat.targetLat
        ]),
        width: 2,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.2,
          color: color
        })
      }
    });
    lineEntities.set(threat.id, lineEntity);

    createBeam(threat, lineEntity, color);
  }
};

/**
 * createBeam
 * 创建沿连线移动的光点（光束），在到达目标后自动移除光点与连线
 */
const createBeam = (threat: Threat, lineEntity: Cesium.Entity, color: Cesium.Color) => {
  if (!viewer.value) return;
  const duration = 2.2; // 秒
  const start = viewer.value.clock.currentTime.clone();
  const stop = Cesium.JulianDate.addSeconds(start, duration, new Cesium.JulianDate());

  const startPos = Cesium.Cartesian3.fromDegrees(threat.lng, threat.lat);
  const endPos = Cesium.Cartesian3.fromDegrees(threat.targetLng!, threat.targetLat!);
  const samples = 12;
  const prop = new Cesium.SampledPositionProperty();
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const time = Cesium.JulianDate.addSeconds(start, t * duration, new Cesium.JulianDate());
    const pos = Cesium.Cartesian3.lerp(startPos, endPos, t, new Cesium.Cartesian3());
    prop.addSample(time, pos);
  }

  const beam = viewer.value.entities.add({
    position: prop,
    availability: new Cesium.TimeIntervalCollection([
      new Cesium.TimeInterval({ start, stop })
    ]),
    point: {
      pixelSize: 6,
      color: color.withAlpha(0.9),
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 1
    }
  });

  beamEntities.set(threat.id, beam);

  const trailPoints: Cesium.Entity[] = [];
  let i = 0;
  const trailTimer = setInterval(() => {
    i++;
    const t = i / 12;
    if (t > 1) return;
    const pos = Cesium.Cartesian3.lerp(startPos, endPos, t, new Cesium.Cartesian3());
    const alpha = 0.5 * (1 - t);
    const v = viewer.value;
    if (!v) return;
    const p = v.entities.add({
      position: pos,
      point: { pixelSize: 3, color: color.withAlpha(alpha) }
    });
    trailPoints.push(p);
  }, (duration * 1000) / 12);

  setTimeout(() => {
    const v = viewer.value;
    if (!v) return;
    v.entities.remove(beam);
    beamEntities.delete(threat.id);
    v.entities.remove(lineEntity);
    lineEntities.delete(threat.id);
    clearInterval(trailTimer);
    trailPoints.forEach(p => v.entities.remove(p));
  }, duration * 1000 + 300);
};

/**
 * 响应全局控制信号：重置视角与缩放
 */
watch(control, (c, prev) => {
  if (!viewer.value) return;
  if (c.resetTick !== prev.resetTick) {
    viewer.value.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(116.4, 39.9, 20000000)
    });
  }
  if (c.zoomTick !== prev.zoomTick) {
    if (c.zoomDir === 'in') {
      viewer.value.camera.zoomIn(1000000);
    } else {
      viewer.value.camera.zoomOut(1000000);
    }
  }
}, { deep: true });

/**
 * 监听光束重放信号
 */
watch(replayBeamSignal, (sig, prev) => {
  if (!viewer.value) return;
  if (sig.tick !== prev.tick && sig.id) {
    const lineEntity = lineEntities.get(sig.id);
    const t = filteredThreats.value.find(x => x.id === sig.id);
    if (lineEntity && t && t.targetLng && t.targetLat) {
      const color = t.severity === 'high' ? Cesium.Color.RED : t.severity === 'medium' ? Cesium.Color.ORANGE : Cesium.Color.YELLOW;
      createBeam(t, lineEntity, color);
    }
  }
}, { deep: true });

/**
 * 监听洲聚焦信号
 */
watch(focusContinentSignal, (sig, prev) => {
  if (!viewer.value) return;
  if (sig.tick !== prev.tick && sig.name) {
    const center = continentCenters[sig.name];
    if (center) {
      viewer.value.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(center.lng, center.lat, 2.0e7),
        duration: 1.2
      });
    }
  }
}, { deep: true });

</script>

<style scoped>
/* Override cesium default widgets style if needed */
:deep(.cesium-viewer-bottom) {
  display: none;
}
</style>
