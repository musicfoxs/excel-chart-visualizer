// 单个数据块的结构
export interface DataBlock {
  title: string          // 数据块标题，如 "主动参与情况 人数分布"
  labels: string[]       // 分类标签，如 ["高频", "中频", "低频", "无"]
  traditional: number[]  // 传统组数值
  innovative: number[]   // 创新组数值
}

// 图表系列数据
export interface ChartSeries {
  name: string
  type: 'bar'
  data: number[]
  itemStyle: {
    color: unknown  // LinearGradient 对象
    shadowColor: string
    shadowBlur: number
    borderRadius: [number, number, number, number]  // 左上、右上、右下、左下圆角
  }
}

// 图表配置
export interface ChartConfig {
  title: string
  labels: string[]
  series: ChartSeries[]
}

// 解析状态
export type ParseStatus = 'idle' | 'loading' | 'success' | 'error'

// 解析结果
export interface ParseResult {
  status: ParseStatus
  data: DataBlock[]
  error: string | null
}