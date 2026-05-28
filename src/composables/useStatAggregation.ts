import type {
  ParsedDocument,
  AggregatedModule,
  AggregatedIndicator,
  ChartBlock,
} from '@/types'

/**
 * 多文档按模块/指标/等级聚合人数。
 * 将多份 ParsedDocument 聚合为 AggregatedModule[]，并提供 ChartBlock 转换。
 */
export function useStatAggregation() {
  /**
   * 聚合：按 module name → indicator name → 等级统计两组人数。
   * 空输入时返回 3 个空模块（爱上阅读/学会阅读/个体差异）。
   */
  const aggregate = (documents: ParsedDocument[]): AggregatedModule[] => {
    if (documents.length === 0) {
      return [
        { moduleName: '爱上阅读', indicators: [] },
        { moduleName: '学会阅读', indicators: [] },
        { moduleName: '个体差异', indicators: [] },
      ]
    }

    const moduleOrder: string[] = []
    const seenModules = new Set<string>()
    for (const doc of documents) {
      for (const mod of doc.modules) {
        if (!seenModules.has(mod.name)) {
          seenModules.add(mod.name)
          moduleOrder.push(mod.name)
        }
      }
    }

    const result: AggregatedModule[] = []

    for (const moduleName of moduleOrder) {
      const indicatorOrder: string[] = []
      const seenIndicators = new Set<string>()
      const baseLevelLabels = new Map<string, string[]>()

      for (const doc of documents) {
        const mod = doc.modules.find((m) => m.name === moduleName)
        if (!mod) continue

        for (const ind of mod.indicators) {
          if (!seenIndicators.has(ind.name)) {
            seenIndicators.add(ind.name)
            indicatorOrder.push(ind.name)
            baseLevelLabels.set(ind.name, [...ind.allLevels])
          } else {
            const base = baseLevelLabels.get(ind.name)!
            for (const level of ind.allLevels) {
              if (!base.includes(level)) {
                base.push(level)
              }
            }
          }
        }
      }

      const aggregatedIndicators: AggregatedIndicator[] = []

      for (const indicatorName of indicatorOrder) {
        const levelLabels = baseLevelLabels.get(indicatorName)!
        const innovativeCounts = new Array<number>(levelLabels.length).fill(0)
        const traditionalCounts = new Array<number>(levelLabels.length).fill(0)

        for (const doc of documents) {
          const mod = doc.modules.find((m) => m.name === moduleName)
          if (!mod) continue

          const ind = mod.indicators.find((i) => i.name === indicatorName)
          if (!ind) continue

          for (const checked of ind.checkedLevels) {
            const idx = levelLabels.indexOf(checked)
            if (idx === -1) continue
            if (doc.group === 'innovative') {
              innovativeCounts[idx]++
            } else {
              traditionalCounts[idx]++
            }
          }
        }

        aggregatedIndicators.push({
          indicatorName,
          levelLabels,
          innovativeCounts,
          traditionalCounts,
        })
      }

      result.push({ moduleName, indicators: aggregatedIndicators })
    }

    return result
  }

  /** 将 AggregatedModule[] 转换为 ChartBlock[]（每模块一个）。 */
  const toChartBlocks = (modules: AggregatedModule[]): ChartBlock[] =>
    modules.map((mod) => ({
      title: mod.moduleName,
      indicators: mod.indicators.map((ind) => ({
        name: ind.indicatorName,
        labels: ind.levelLabels,
        innovative: ind.innovativeCounts,
        traditional: ind.traditionalCounts,
      })),
    }))

  const toOverallChartBlock = (modules: AggregatedModule[]): ChartBlock => {
    const moduleLabels: string[] = []
    const innovativeScores: number[] = []
    const traditionalScores: number[] = []

    for (const mod of modules) {
      moduleLabels.push(mod.moduleName)
      let innoTotal = 0, innoCount = 0
      let tradTotal = 0, tradCount = 0

      for (const ind of mod.indicators) {
        const n = ind.levelLabels.length
        for (let i = 0; i < n; i++) {
          const score = n - i
          innoTotal += score * ind.innovativeCounts[i]
          innoCount += ind.innovativeCounts[i]
          tradTotal += score * ind.traditionalCounts[i]
          tradCount += ind.traditionalCounts[i]
        }
      }

      innovativeScores.push(innoCount > 0 ? Math.round(innoTotal / innoCount * 100) / 100 : 0)
      traditionalScores.push(tradCount > 0 ? Math.round(tradTotal / tradCount * 100) / 100 : 0)
    }

    return {
      title: '总体对比',
      indicators: [{
        name: '加权平均分',
        labels: moduleLabels,
        innovative: innovativeScores,
        traditional: traditionalScores,
      }],
    }
  }

  return { aggregate, toChartBlocks, toOverallChartBlock }
}
