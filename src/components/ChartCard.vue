<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import echarts from '@/echarts'
import type { DataBlock } from '@/types'
import { useChartOptions } from '@/composables/useChartOptions'

const props = defineProps<{
  block: DataBlock
}>()

const chartRef = ref<HTMLDivElement | null>(null)
const { generateOptions } = useChartOptions()
let chartInstance: echarts.ECharts | null = null
let resizeObserver: ResizeObserver | null = null

const initChart = () => {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value, undefined, {
    renderer: 'canvas'
  })

  const options = generateOptions(props.block)
  chartInstance.setOption(options)
}

const updateChart = () => {
  if (!chartInstance) return

  const options = generateOptions(props.block)
  chartInstance.setOption(options)
}

const handleResize = () => {
  chartInstance?.resize()
}

onMounted(() => {
  initChart()

  // Use ResizeObserver for responsive chart
  if (chartRef.value) {
    resizeObserver = new ResizeObserver(() => {
      handleResize()
    })
    resizeObserver.observe(chartRef.value)
  }
})

watch(
  () => props.block,
  () => {
    updateChart()
  },
  { deep: true }
)

onUnmounted(() => {
  if (resizeObserver && chartRef.value) {
    resizeObserver.unobserve(chartRef.value)
    resizeObserver.disconnect()
  }
  
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>

<template>
  <div class="chart-card glass-card fade-in-up">
    <h3 class="chart-title">{{ block.title }}</h3>
    <div ref="chartRef" class="chart-container"></div>
  </div>
</template>

<style scoped>
.chart-card {
  padding: 20px;
  animation: fadeInUp 0.6s ease-out forwards;
}

.chart-title {
  font-size: 1.1em;
  margin-bottom: 16px;
  color: var(--text-primary);
  text-align: center;
}

.chart-container {
  width: 100%;
  height: 300px;
}
</style>