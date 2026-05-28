<script setup lang="ts">
import { computed } from 'vue'
import ParticleBackground from '@/components/ParticleBackground.vue'
import NeonTitle from '@/components/NeonTitle.vue'
import FileUpload from '@/components/FileUpload.vue'
import ChartCard from '@/components/ChartCard.vue'
import { useExcelParser } from '@/composables/useExcelParser'

const { result, parseFile } = useExcelParser()

const isLoading = computed(() => result.value.status === 'loading')
const errorMessage = computed(() => result.value.error)
const hasData = computed(() => result.value.status === 'success' && result.value.data.length > 0)

const handleFileSelected = (file: File) => {
  parseFile(file)
}
</script>

<template>
  <ParticleBackground />
  <div class="app-content">
    <header class="app-header">
      <NeonTitle 
        title="数据可视化大屏" 
        subtitle="上传 Excel 文件以查看数据分布"
      />
    </header>
    
    <main class="app-main">
      <FileUpload 
        :loading="isLoading"
        :error="errorMessage"
        @file-selected="handleFileSelected"
      />
      
      <div v-if="hasData" class="chart-grid">
        <ChartCard 
          v-for="block in result.data" 
          :key="block.title" 
          :block="block" 
        />
      </div>
    </main>
  </div>
</template>

<style scoped>
.app-content {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  padding: 40px 20px;
}

.app-header {
  text-align: center;
  margin-bottom: 40px;
}

.app-main {
  max-width: 1200px;
  margin: 0 auto;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-top: 40px;
}

@media (max-width: 768px) {
  .chart-grid {
    grid-template-columns: 1fr;
  }
}
</style>