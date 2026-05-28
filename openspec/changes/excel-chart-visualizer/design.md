## Context

从零创建一个纯前端单页应用，用于将 Excel 数据以数据大屏风格的 ECharts 分组柱状图可视化展示。目标用户需要通过外网临时访问查看图表，无需后端服务。

**当前状态**: 空项目目录，无任何代码。

**约束条件**:
- 纯前端静态站点，无服务器端逻辑
- Excel 解析在浏览器端完成（SheetJS）
- 部署到 Cloudflare Pages（免费静态托管）
- 目标数据为特定格式 Excel（多组纵向堆叠数据块，每组含标题行 + 分类标签 + 两组数值）

## Goals / Non-Goals

**Goals:**
- 实现花哨的数据大屏视觉效果（深色背景 + 霓虹渐变 + 发光 + 粒子 + 毛玻璃）
- 支持 Excel 文件上传与自动解析
- 渲染 ECharts 分组柱状图，支持传统组 vs 创新组对比
- 一键部署到 Cloudflare Pages 获取外网访问地址
- 响应式布局，适配桌面和平板

**Non-Goals:**
- 不支持 Excel 导出或编辑
- 不支持用户自定义图表样式
- 不做移动端深度适配（以桌面优先）
- 不做数据持久化或用户认证
- 不支持 CSV 或其他格式的文件上传（仅 .xlsx）
- 不做 SSR / SSG

## Decisions

### D1: 技术栈选型 — Vue 3 + TypeScript + Vite + ECharts + SheetJS

**选择**: Vue 3 Composition API + TypeScript + Vite 作为基础框架

**理由**:
- Vue 3 Composition API 配合 `<script setup>` 语法糖，代码简洁直观
- TypeScript 提供类型安全，特别是 Excel 解析的数据结构需要类型约束
- Vite 构建速度快，开发体验好，原生支持 Vue SFC
- ECharts 5 支持按需引入，包体积可控

**替代方案**:
- React + Recharts: 用户指定 Vue，排除
- D3.js: 过于底层，ECharts 柱状图开箱即用更高效
- Chart.js: 动画和视觉效果不如 ECharts 丰富，不适合数据大屏风格

### D2: 项目结构 — 单页面 + 组件化

```
src/
├── App.vue                    # 根组件：深色背景 + 粒子层 + 主内容区
├── main.ts                    # 入口：挂载 Vue 应用
├── components/
│   ├── FileUpload.vue         # 文件上传区域（拖拽 + 点击）
│   ├── ChartCard.vue          # 毛玻璃卡片容器（标题 + ECharts 实例）
│   ├── ParticleBackground.vue # Canvas 粒子动画背景
│   └── NeonTitle.vue          # 霓虹发光标题组件
├── composables/
│   ├── useExcelParser.ts      # SheetJS Excel 解析逻辑
│   └── useChartOptions.ts     # ECharts 配置生成器（渐变/发光/动画）
├── types/
│   └── index.ts               # 数据类型定义（DataBlock, ChartData 等）
└── styles/
    └── global.css             # 全局深色主题样式、毛玻璃 mixin
```

**理由**: 单页面应用无需路由，组件化拆分保持关注点分离，composables 复用逻辑。

### D3: Excel 解析策略 — 按标题行分块识别

**解析算法**:
1. SheetJS 读取第一个 Sheet 的全部数据为二维数组
2. 逐行扫描，当某行第一列包含"人数分布"关键词时，标记为新数据块标题
3. 后续非空行作为数据行：第一列=分类标签，第二列=传统组数值，第三列=创新组数值
4. 遇到空行或下一个标题行时结束当前数据块
5. 最终输出 `DataBlock[]` 数组

**数据类型定义**:
```typescript
interface DataBlock {
  title: string          // 数据块标题，如 "主动参与情况 人数分布"
  labels: string[]       // 分类标签，如 ["高频", "中频", "低频", "无"]
  traditional: number[]  // 传统组数值
  innovative: number[]   // 创新组数值
}
```

**理由**: 这种策略能灵活适应不同数量的数据块和不同的分类标签，不硬编码为固定 4 组。

### D4: ECharts 视觉效果配置

**柱状图渐变色**:
- 传统组：`new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0, color: '#a855f7'}, {offset: 1, color: '#3b82f6'}])`
- 创新组：`new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0, color: '#f472b6'}, {offset: 1, color: '#fb923c'}])`

**发光阴影**: 通过 `itemStyle.shadowColor` + `itemStyle.shadowBlur` 实现霓虹发光
**入场动画**: `animationDelay` 按索引递增（每个分类延迟 200ms）
**Tooltip**: 自定义 formatter，使用毛玻璃样式 CSS class
**ECharts 按需引入**（包体积控制）:
```typescript
import * as echarts from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { TooltipComponent, GridComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
echarts.use([BarChart, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer])
```

**背景**: `backgroundColor: 'transparent'`，融入深色主题

### D5: 粒子背景实现 — 原生 Canvas

**选择**: 使用原生 Canvas API 而非第三方粒子库

**理由**:
- 项目只需要简单的漂浮粒子效果，不需要完整粒子引擎
- 避免引入额外依赖（如 tsparticles），保持轻量
- 50-80 个粒子即可营造大屏氛围

**粒子参数**:
- 数量: 60 个
- 大小: 1-4px 随机
- 透明度: 0.1-0.5 随机
- 运动: 匀速缓慢漂浮，碰到边界反弹
- 颜色: 蓝紫色系（#3b82f6, #a855f7, #6366f1）

### D6: 毛玻璃卡片样式

```css
.chart-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3),
              inset 0 0 0 1px rgba(255, 255, 255, 0.05);
}
```

### D7: 部署策略 — Cloudflare Pages

**构建命令**: `npm run build`（Vite 默认输出到 `dist/`）
**部署命令**: `npx wrangler pages deploy dist/ --project-name=excel-chart-visualizer`
**SPA 回退**: `public/_redirects` 文件内容为 `/* /index.html 200`
**无 wrangler.toml**: 纯静态站点不需要配置文件

## Risks / Trade-offs

| Risk | Impact | Mitigation |
|------|--------|------------|
| Excel 格式不规范导致解析失败 | 用户看到错误页面 | 容错处理 + 友好错误提示，不抛未捕获异常 |
| ECharts 全量引入包体积过大（~800KB） | 首屏加载慢 | 按需引入 BarChart + TooltipComponent + GridComponent，预计降至 ~200KB |
| 毛玻璃效果（backdrop-filter）在低性能设备卡顿 | 用户体验差 | 提供 CSS fallback，在支持检测时降级为半透明纯色背景 |
| Cloudflare Pages 首次部署需登录认证 | 部署受阻 | README 中提供 `wrangler login` 前置步骤说明 |

## Migration Plan

1. 本地开发阶段: `npm run dev` 启动 Vite 开发服务器
2. 构建: `npm run build` 生成 `dist/` 静态文件
3. 部署: `npx wrangler pages deploy dist/ --project-name=excel-chart-visualizer`
4. 回滚: 重新构建并部署上一个版本的 `dist/`

## Verification

### Acceptance Criteria
- AC1: 执行 `npm run build`，exit code 为 0 且 `dist/index.html` 文件存在
- AC2: 执行 `npm run dev` 后，页面 body 的 `background-color` 为深色（`rgb(10,10,26)` 即 `#0a0a1a`），且 DOM 中存在 `canvas` 元素（粒子背景）和 `.file-upload` 元素（上传区域）
- AC3: 上传目标 `.xlsx` 文件后，DOM 中 `.chart-card` 元素数量为 4，每个 `.chart-card` 内包含一个 ECharts `canvas` 元素（`_echarts_instance_` 属性存在）
- AC4: 柱子渲染后，通过 ECharts `getOption()` API 获取 series 数据，验证传统组 series 的 `itemStyle.color` 为 `LinearGradient` 对象且 colorStops 包含蓝色(#3b82f6)到紫色(#a855f7)渐变；创新组为橙色(#fb923c)到粉色(#f472b6)渐变。鼠标悬浮柱子后出现包含具体数值文本的 tooltip DOM 元素
- AC5: 图表首次渲染后，通过 ECharts `getOption()` API 验证 `animationDelay` 函数按索引递增（每个分类延迟 200ms），确认 `series[0].animationDelay` 存在且为函数类型
- AC6: 上传非 `.xlsx` 文件时，DOM 中出现包含"请上传 .xlsx 格式"文本的错误提示元素
- AC7: 页面加载后，DOM 中存在 `ParticleBackground` 组件的 `canvas` 元素，且 canvas 上绘制内容非空（canvas.width > 0 && canvas.height > 0）
- AC8: 执行 `npx wrangler pages deploy dist/ --project-name=excel-chart-visualizer`，命令 exit code 为 0 且输出包含 `https://` 前缀的 URL

### E2E Test Design
- **测试拓扑**: 纯前端应用，浏览器直接访问 Vite dev server
- **测试夹具**: 准备一份标准格式的 `.xlsx` 测试文件（包含 4 组数据块），以及一份非 `.xlsx` 文件（如 `.csv`）
- **必测场景**:
  1. 页面加载 → 深色背景 + 粒子动画可见
  2. 上传 `.xlsx` → 4 个图表卡片出现
  3. 验证图表柱子颜色为渐变色
  4. 悬浮柱子 → tooltip 出现
  5. 上传 `.csv` → 错误提示出现
  6. 窗口缩放 → 图表自适应
- **断言方式**: 检查 DOM 中 `.echarts` canvas 元素数量、tooltip DOM 可见性、错误提示文本内容

### Boundary Verification
- Non-goal "不支持 CSV 或其他格式的文件上传" → 检查 FileUpload 组件的 accept 属性仅为 `.xlsx`，且上传 `.csv` 时触发格式错误
- Non-goal "不做数据持久化或用户认证" → 检查代码中无 localStorage / IndexedDB / Auth 相关逻辑
- Non-goal "不做 SSR / SSG" → 检查 Vite 配置为纯 SPA 模式，无 SSR 插件
- Non-goal "不做移动端深度适配" → 检查无移动端专属媒体查询（仅桌面和平板断点）
- Non-goal "不支持 Excel 导出或编辑" → 检查代码中无文件导出逻辑（无 `Blob` + `URL.createObjectURL` + `download` 组合、无 `xlsx.writeFile` 调用、无编辑/保存按钮）
- Non-goal "不支持用户自定义图表样式" → 检查代码中无用户配置图表颜色/主题的 UI 元素（无颜色选择器、无主题切换器、无样式配置面板）
