## Wave 1: 基础设置：依赖与类型

- [ ] 1.1 [S] 更新依赖：移除 xlsx，新增 jszip
- [ ] 1.2 [S] 定义三层类型系统（ParsedDocument / AggregatedModule / ChartBlock）
- [ ] 1.3 [S] 清理旧代码：删除 useExcelParser.ts 及 Excel 相关引用

## Wave 2: 核心逻辑：解析与聚合

- [ ] 2.1 [L] 实现 useDocxParser composable（JSZip + DOMParser 解析 Word XML 表格）
- [ ] 2.2 [L] 实现 useStatAggregation composable（多文档按模块/指标/等级聚合人数）

## Wave 3: UI 组件开发

- [ ] 3.1 [M] 实现 GroupUpload 组件（双入口：创新组/传统组，各支持多文件上传）
- [ ] 3.2 [M] 实现 TabBar 组件（4 Tab 切换：爱上阅读/学会阅读/个体差异/总体对比）
- [ ] 3.3 [M] 重构 useChartOptions composable 适配动态等级标签

## Wave 4: 集成与组装

- [ ] 4.1 [L] 重构 App.vue 整合所有新组件（双入口上传 + TabBar + 模块图表 + 总体对比）
- [ ] 4.2 [M] 重构 ChartCard 组件适配动态等级标签图表渲染
- [ ] 4.3 [S] 更新 FileUpload 组件（移除 Excel 相关逻辑，调整 accept 和提示文案）

## Wave 5: 最终验证

- [ ] F1 [M] Artifacts Compliance Audit — 对照 design → Verification → Acceptance Criteria 的 AC-1~AC-5 逐条验证实现完整性 + openspec validate --changes --strict
- [ ] F2 [M] Code Quality Review — typecheck + test + AI slop 检查
- [ ] F3 [M] Integration QA — 执行 design → Verification → E2E Test Design 中的 4 个必测场景 + 跨模块集成 + 边界测试
- [ ] F4 [M] Scope Fidelity Check — 验证 design → Verification → Boundary Verification 表格中 6 项 Non-goals 未被引入 + git diff vs tasks 1:1 对齐 + 跨任务污染检测
