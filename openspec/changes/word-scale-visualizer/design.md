## Context

现有项目 `excel-chart-visualizer` 是一个 Vue 3 + TypeScript + ECharts 数据可视化大屏，当前仅支持上传 Excel 文件并渲染柱状图。研究量表的实际数据源是 Word（.docx）评价量表，包含 3 个模块共 10 个评价指标。每份 Word 代表一个幼儿的评分，评价者通过勾选 `☑`/`□` 标记各指标的等级。

**当前技术栈**: Vue 3, TypeScript, Vite, ECharts, SheetJS (xlsx)
**新增依赖**: JSZip（解析 .docx 的 zip 结构）

**约束**:
- 纯前端，无后端，所有解析在浏览器端完成
- Word 文档为 `.docx` 格式（已确认用户可将 `.doc` 另存为 `.docx`）
- 文档内部为单表格结构，16 行 × 5 列，含垂直合并单元格

## Goals / Non-Goals

**Goals:**
- 实现双入口 Word 上传 UI（创新组 / 传统组），各支持多文件上传
- 浏览器端解析 .docx XML 表格，提取勾选数据和等级标签
- 按模块聚合多份评分数据为人数分布统计
- 4-Tab 切换界面展示各模块和总体对比柱状图
- 保持现有视觉风格（深色大屏、霓虹渐变、毛玻璃卡片）

**Non-Goals:**
- 不支持 `.doc` 旧格式（用户需自行另存为 `.docx`）
- 不保留原有 Excel 上传功能（本次重构替换）
- 不做后端服务或数据持久化
- 不做用户认证或多用户支持
- 不对等级标签做标准化归一（各指标保持原始等级标签）
- 不支持综合评估区域（文档第 13-16 行）的数据提取

## Decisions

### Decision 1: 使用 JSZip + DOMParser 解析 .docx

**选择**: 使用 JSZip 解压 .docx，DOMParser 解析 `word/document.xml`

**替代方案**:
- `mammoth.js`: 将 .docx 转为 HTML，丢失表格结构信息（合并单元格等），不适合
- `docx-preview`: 渲染预览用，不适合数据提取

**理由**: .docx 本质是 zip 文件，内含 XML。JSZip 提供稳定的 zip 解压能力，DOMParser 是浏览器原生 XML 解析器，无需额外依赖。两者组合可以精确控制 XML 节点的遍历和属性读取，能正确处理 `w:vMerge`（垂直合并）和 `w:gridSpan`（水平合并）。

### Decision 2: 类型系统设计 — 分层类型模型

**选择**: 定义三层类型：`ParsedDocument`（原始解析）→ `AggregatedModule`（统计聚合）→ `ChartBlock`（图表渲染）

**理由**: 不同阶段的关注点不同。解析阶段需要保留文档原始结构（含单元格位置信息），聚合阶段需要按指标×等级统计人数，渲染阶段需要 ECharts 可直接消费的格式。分层类型避免了单一巨大接口。

```typescript
// Layer 1: 解析结果（per document）
interface ParsedDocument {
  filename: string
  group: 'innovative' | 'traditional'
  modules: ParsedModule[]  // 3 modules
}

interface ParsedModule {
  name: string  // "爱上阅读（阅读兴趣）"
  indicators: ParsedIndicator[]
}

interface ParsedIndicator {
  name: string       // "1.主动参与情况"
  content: string    // "主动举手、发言、提问"
  checkedLevels: string[]  // ["中频(3-4次)"]
  allLevels: string[]      // ["高频(>=5次)", "中频(3-4次)", ...]
}

// Layer 2: 聚合结果（per module, across all documents）
interface AggregatedModule {
  moduleName: string
  indicators: AggregatedIndicator[]
}

interface AggregatedIndicator {
  indicatorName: string
  levelLabels: string[]
  innovativeCounts: number[]  // 与 levelLabels 一一对应
  traditionalCounts: number[]
}

// Layer 3: 图表数据（ECharts-ready）
interface ChartBlock {
  title: string
  indicators: ChartIndicator[]
}

interface ChartIndicator {
  name: string
  labels: string[]
  innovative: number[]
  traditional: number[]
}
```

### Decision 3: 单文件解析策略 — 行遍历 + 状态机

**选择**: 使用状态机逐行遍历 XML 表格，根据行号和列位置提取数据

**理由**: 文档结构固定（16 行 × 5 列），行号与语义强相关：
- 行 1-2: 表头（跳过）
- 行 3-6: 爱上阅读模块（4 个指标）
- 行 7-10: 学会阅读模块（4 个指标）
- 行 11-12: 个体差异模块（2 个指标）
- 行 13-16: 综合评估（不提取）

解析器按行遍历，通过 `w:vMerge` 解析获取当前所属模块名，从第 2 列获取指标名，从第 5 列解析勾选数据。

**勾选解析正则**: `/(☑|✓|√)\s*([^\n□☑✓√]+)/g` — 匹配勾选符号后的文本作为等级标签。

### Decision 4: UI 架构 — Composable 分离

**选择**: 拆分为 3 个 composable:
- `useDocxParser.ts` — Word 文件解析（JSZip + DOMParser）
- `useStatAggregation.ts` — 多文档统计聚合
- `useChartOptions.ts` — ECharts 配置生成（保留并扩展）

**理由**: 与现有架构保持一致（composable 模式），职责清晰。解析和聚合逻辑完全独立于 UI 组件，便于测试和复用。

### Decision 5: Tab 组件设计

**选择**: 使用 Vue 3 原生 `ref` + `v-if` 实现 Tab 切换，不引入额外 UI 框架

**理由**: 项目当前为纯手写 UI（无 Element Plus 等框架），保持一致性。Tab 切换逻辑简单（4 个 tab，单选），不值得引入额外依赖。

### Decision 6: 移除 xlsx 依赖

**选择**: 移除 `xlsx` (SheetJS) 依赖，新增 `jszip` 依赖

**理由**: 本次变更不再需要 Excel 解析功能。SheetJS 体积较大（~500KB），移除可减小打包体积。

## Risks / Trade-offs

**[Risk] .docx 表格结构变化** → 如果用户使用的 Word 模板行数或列数不同，解析会失败。缓解：在解析阶段添加结构性校验（检查行数 ≥ 12、列数 = 5、检测到 ☑/□ 字符），失败时给出明确的错误提示。

**[Risk] 文本碎片化导致等级标签截断** → Word XML 可能将一个等级标签拆分成多个 `<w:r>` 节点。缓解：先按单元格聚合所有文本，再用正则匹配。

**[Risk] 勾选符号不一致** → 用户可能用 ✓、√、☑ 等不同符号打勾。缓解：正则匹配时同时支持所有常见勾选符号。

**[Trade-off] 各指标等级标签不同 → 图表 x 轴不统一** → 每个指标单独一张图，避免强行对齐不同等级。总体对比 Tab 中每个指标也是独立图。

**[Trade-off] 不做等级标准化 → 无法跨指标对比** → 这是刻意选择：原始等级标签对研究者更有意义。如未来需要标准化，可在聚合层增加标准化映射。

## Verification

### Acceptance Criteria

1. **AC-1**: 上传 1 份创新组 `.docx` + 1 份传统组 `.docx` → 系统解析出 2 份评分记录，4 个 Tab 均可切换且显示对应图表
   - 验证方式: 手动上传测试文件，检查每个 Tab 的图表渲染
   - 通过标准: 图表显示正确的等级标签和人数（每人各指标 1 个等级）

2. **AC-2**: 上传 3 份创新组 + 3 份传统组 → "爱上阅读" Tab 显示 4 个图表，每个图表的柱状值反映 6 人的等级分布
   - 验证方式: 手动上传后检查图表数据
   - 通过标准: 创新组各指标等级人数之和 = 3，传统组各指标等级人数之和 = 3

3. **AC-3**: 上传非 `.docx` 文件 → 显示 "仅支持 .docx 格式的文件" 错误提示
   - 验证方式: 尝试上传 .pdf / .xlsx / .doc 文件
   - 通过标准: 所有非 .docx 文件均被拒绝并显示错误提示

4. **AC-4**: 上传格式错误的 `.docx`（如非量表文件）→ 显示明确的解析错误提示
   - 验证方式: 上传一个空白 .docx 文件
   - 通过标准: 显示 "无法识别的量表格式" 类错误

5. **AC-5**: "总体对比" Tab 显示全部 10 个指标的图表，按模块分组
   - 验证方式: 切换到总体对比 Tab
   - 通过标准: 显示 10 个图表，分别对应 10 个指标

### E2E Test Design

**测试拓扑**: 纯前端测试，无服务端依赖。使用 Vitest + Vue Test Utils。

**测试夹具**:
- 准备 2 份 `.docx` 测试文件：1 份创新组、1 份传统组（使用真实的量表模板填充测试数据）
- 准备 1 份格式错误的 `.docx`（空白文档）

**必须覆盖的端到端场景**:
1. 双入口上传 → 创新组上传 1 份 → 传统组上传 1 份 → 4 个 Tab 切换 → 每个图表数据正确
2. 多文件上传 → 创新组上传 3 份 → 传统组上传 3 份 → 统计数据正确（人数累加）
3. 非法文件上传 → 上传 .pdf → 错误提示显示
4. 空 Tab 点击 → 无数据时 Tab 为禁用状态

**断言方式**:
- 检查 `AggregatedModule` 的数据结构完整性（字段非空、数组长度正确）
- 检查图表渲染后的 ECharts option 数据（series data 与聚合结果一致）
- 检查 UI 状态（Tab 激活态、错误提示文本、空状态展示）

### Boundary Verification

逐条检查 Non-goals:

| Non-Goal | 验证方式 |
|----------|---------|
| 不支持 .doc 旧格式 | 检查代码中无 .doc 格式处理逻辑，上传入口 accept 属性为 `.docx` |
| 不保留 Excel 上传功能 | 检查 git diff 中 `useExcelParser.ts` 被删除，`xlsx` 依赖从 package.json 移除 |
| 不做后端服务 | 检查无新增 API 调用、无新增网络请求代码 |
| 不做用户认证 | 检查无新增 auth 相关代码 |
| 不做等级标准化 | 检查聚合逻辑直接使用原始等级标签，无映射/转换层 |
| 不支持综合评估区域数据 | 检查解析器仅处理行 3-12，跳过行 13-16 |
