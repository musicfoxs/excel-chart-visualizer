## Wave 1: 项目初始化与依赖安装

- [ ] 1.1 [S] 初始化 Vue 3 + TypeScript + Vite 项目并安装依赖（含 ECharts 按需引入配置）
- [ ] 1.2 [S] 配置 TypeScript 严格模式和 Vite 构建选项

## Wave 2: 核心逻辑层（类型 + 解析 + 图表配置）

- [ ] 2.1 [M] 定义核心类型（DataBlock, ChartData）和全局样式
- [ ] 2.2 [M] 实现 useExcelParser composable（SheetJS 解析逻辑）
- [ ] 2.3 [M] 实现 useChartOptions composable（ECharts 渐变/发光/动画配置生成器）

## Wave 3: UI 组件层（粒子 + 上传 + 卡片 + 标题）

- [ ] 3.1 [M] 实现 ParticleBackground.vue 粒子动画背景组件
- [ ] 3.2 [M] 实现 FileUpload.vue 拖拽上传组件
- [ ] 3.3 [M] 实现 ChartCard.vue 毛玻璃卡片 + ECharts 实例组件
- [ ] 3.4 [S] 实现 NeonTitle.vue 霓虹发光标题组件

## Wave 4: 集成组装与部署配置

- [ ] 4.1 [M] 组装 App.vue 根组件（深色背景 + 粒子 + 上传 + 图表网格）
- [ ] 4.2 [S] 配置 Cloudflare Pages 部署（_redirects + README）

## Wave 5: 最终验证

- [ ] F1 [M] Artifacts Compliance Audit — 验证 AC1-AC8 全部通过（参考 design.md Verification → Acceptance Criteria）
- [ ] F2 [M] Code Quality Review — typecheck + test + AI slop 检查
- [ ] F3 [M] Integration QA — 执行 E2E 测试场景（参考 design.md Verification → E2E Test Design）
- [ ] F4 [M] Scope Fidelity Check — 检查 Non-goals 边界未被违反（参考 design.md Verification → Boundary Verification）
