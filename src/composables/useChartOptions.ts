import echarts from '@/echarts'
import type { ChartIndicator } from '@/types'

/**
 * ECharts 图表配置生成器 composable
 * 生成带有渐变色、发光阴影和入场动画的柱状图配置
 */
export function useChartOptions() {
  /**
   * 根据 ChartIndicator 生成 ECharts option 对象
   * @param indicator - 图表指标数据，包含名称、等级标签和两组数据
   * @returns ECharts 配置对象
   */
  const generateIndicatorOptions = (indicator: ChartIndicator): Record<string, unknown> => {
    // 传统组渐变色：从底到顶 蓝色(#3b82f6) → 紫色(#a855f7)
    const traditionalGradient = new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: '#a855f7' },
      { offset: 1, color: '#3b82f6' }
    ])

    // 创新组渐变色：从底到顶 橙色(#fb923c) → 粉色(#f472b6)
    const innovativeGradient = new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: '#f472b6' },
      { offset: 1, color: '#fb923c' }
    ])

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        // 毛玻璃样式
        extraCssText: `
          backdrop-filter: blur(12px);
          background: rgba(0, 0, 0, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 10px 14px;
        `
      },
      legend: {
        data: ['传统组', '创新组'],
        top: 0,
        textStyle: {
          color: 'rgba(255, 255, 255, 0.7)'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        top: 36,
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: indicator.labels,
        axisLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.2)'
          }
        },
        axisLabel: {
          color: 'rgba(255, 255, 255, 0.7)'
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.2)'
          }
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.05)'
          }
        },
        axisLabel: {
          color: 'rgba(255, 255, 255, 0.7)'
        }
      },
      animationEasing: 'elasticOut',
      series: [
        {
          name: '传统组',
          type: 'bar',
          barGap: '30%',
          data: indicator.traditional,
          label: {
            show: true,
            position: 'top',
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: 12,
            fontWeight: 'bold'
          },
          itemStyle: {
            color: traditionalGradient,
            shadowColor: 'rgba(168, 85, 247, 0.6)',
            shadowBlur: 15,
            borderRadius: [6, 6, 0, 0]
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 25
            }
          },
          animationDelay: (idx: number) => idx * 200
        },
        {
          name: '创新组',
          type: 'bar',
          data: indicator.innovative,
          label: {
            show: true,
            position: 'top',
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: 12,
            fontWeight: 'bold'
          },
          itemStyle: {
            color: innovativeGradient,
            shadowColor: 'rgba(244, 114, 182, 0.6)',
            shadowBlur: 15,
            borderRadius: [6, 6, 0, 0]
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 25
            }
          },
          animationDelay: (idx: number) => idx * 200
        }
      ]
    }
  }

  return {
    generateIndicatorOptions
  }
}