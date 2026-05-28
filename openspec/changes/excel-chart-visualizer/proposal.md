## Why

需要将「主动参与与情绪表现人数分布」Excel 数据以花哨的数据大屏风格柱状图可视化展示，并支持外网临时访问。传统表格数据不够直观，通过 ECharts 分组柱状图可以更清晰地对比传统组与创新组在各维度上的差异。

## What Changes

- 新建 Vue 3 + TypeScript + Vite 单页面前端项目
- 支持用户上传 `.xlsx` 文件，使用 SheetJS 在浏览器端解析 Excel 数据
- 自动识别 Excel 中的 4 组数据块（主动参与、积极情绪、同伴分享、延续兴趣），渲染为 ECharts 分组柱状图
- 实现数据大屏风格视觉效果：深色背景、霓虹渐变柱子、悬浮动画、发光阴影、毛玻璃卡片、动态粒子背景
- 配置 Cloudflare Pages 部署，支持一键发布到外网

## Capabilities

### New Capabilities
- `excel-upload`: Excel 文件上传与解析，将非标准格式的 Excel（4 组纵向堆叠数据块）解析为结构化 JSON 数据
- `chart-rendering`: ECharts 分组柱状图渲染，支持数据大屏风格视觉效果（渐变色、动画、发光、粒子、毛玻璃卡片）
- `deployment`: Cloudflare Pages 部署配置，支持 `wrangler` 一键发布

### Modified Capabilities
<!-- 无现有 capabilities -->

## Impact

- **新建项目**: 从零创建 Vue 3 + TypeScript 前端项目，无现有代码影响
- **前端依赖**: vue@3, echarts, xlsx (SheetJS), vite, typescript
- **部署依赖**: wrangler (Cloudflare Pages CLI)
- **无后端**: 纯前端静态站点，Excel 解析在浏览器端完成，无需服务器
