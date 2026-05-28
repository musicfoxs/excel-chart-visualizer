// ===== Layer 1: 解析结果（per document）=====

export interface ParsedDocument {
  filename: string
  group: 'innovative' | 'traditional'
  modules: ParsedModule[]
}

export interface ParsedModule {
  name: string // "爱上阅读（阅读兴趣）"
  indicators: ParsedIndicator[]
}

export interface ParsedIndicator {
  name: string // "1.主动参与情况"
  content: string // "主动举手、发言、提问"
  checkedLevels: string[] // ["中频(3-4次)"]
  allLevels: string[] // ["高频(>=5次)", "中频(3-4次)", ...]
}

// ===== Layer 2: 聚合结果（per module, across all documents）=====

export interface AggregatedModule {
  moduleName: string
  indicators: AggregatedIndicator[]
}

export interface AggregatedIndicator {
  indicatorName: string
  levelLabels: string[]
  innovativeCounts: number[] // 与 levelLabels 一一对应
  traditionalCounts: number[]
}

// ===== Layer 3: 图表数据（ECharts-ready）=====

export interface ChartBlock {
  title: string
  indicators: ChartIndicator[]
}

export interface ChartIndicator {
  name: string
  labels: string[]
  innovative: number[]
  traditional: number[]
}

// ===== UI 状态 =====

export type GroupType = 'innovative' | 'traditional'

export type TabId = 'love-reading' | 'learn-reading' | 'individual-diff' | 'overall'

export interface TabConfig {
  id: TabId
  label: string
}

export const TABS: TabConfig[] = [
  { id: 'love-reading', label: '爱上阅读' },
  { id: 'learn-reading', label: '学会阅读' },
  { id: 'individual-diff', label: '个体差异' },
  { id: 'overall', label: '总体对比' },
]

export const MODULE_MAPPING: Record<string, TabId> = {
  '爱上阅读': 'love-reading',
  '学会阅读': 'learn-reading',
  '个体差异': 'individual-diff',
}
