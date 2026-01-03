# 电力电子学校项目归档 (glmb)

本项目包含一系列用于电力电子学校相关业务的子项目。

## 📁 项目结构

| 目录 | 说明 | 主要技术栈 |
| --- | --- | --- |
| [**xm/**](./xm) | **核心项目：企业网络监控数据大屏系统** | Vue 3, TypeScript, TDesign, ECharts, Node.js |
| [**LLM-filter-main/**](./LLM-filter-main) | **AI 过滤/中间件模块** | Python, FastAPI/Uvicorn |

---

## 🚀 快速启动核心系统 (xm)

核心系统位于 `xm` 目录下，是一个全栈应用。

### 1. 环境准备
确保已安装：
- **Node.js** (推荐 v18+)
- **pnpm** (推荐) 或 npm

### 2. 启动方式
在 `xm` 目录下运行：
```bash
cd xm
pnpm install
pnpm run dev
```
或者使用根目录/子目录下的 `start.bat` (Windows 用户)。

---

## 🛠️ 各子模块说明

### [企业网络监控数据大屏系统 (xm)](./xm/README.md)
- **前端**: Vue 3 (Composition API) + Vite + Tailwind CSS + TDesign。
- **后端**: Express + TypeScript。
- **可视化**: ECharts 图表渲染，Cesium/OpenLayers 地图展示。
- **功能**: 实时攻击监控、员工行为分析、AI 报告生成、动态看板布局。

### [LLM 过滤模块 (LLM-filter-main)](./LLM-filter-main)
- **功能**: 用于对 AI 生成内容或输入进行过滤和审核。
- **技术**: Python 异步框架。

---

## 📜 许可证
© 2026 电力电子学校项目归档。
