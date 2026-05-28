<script setup lang="ts">
import { ref, computed } from 'vue'
import ParticleBackground from '@/components/ParticleBackground.vue'
import NeonTitle from '@/components/NeonTitle.vue'
import GroupUpload from '@/components/GroupUpload.vue'
import TabBar from '@/components/TabBar.vue'
import ChartCard from '@/components/ChartCard.vue'
import { useDocxParser } from '@/composables/useDocxParser'
import { useStatAggregation } from '@/composables/useStatAggregation'
import type { ParsedDocument, GroupType, TabId, ChartBlock } from '@/types'
import { MODULE_MAPPING } from '@/types'

// Composables
const { parseFile } = useDocxParser()
const { aggregate, toChartBlocks, toOverallChartBlock } = useStatAggregation()

// State
const innovativeFiles = ref<File[]>([])
const traditionalFiles = ref<File[]>([])
const parsedDocuments = ref<ParsedDocument[]>([])
const activeTab = ref<TabId>('love-reading')
const loading = ref(false)
const errors = ref<{ innovative: string | null; traditional: string | null }>({
  innovative: null,
  traditional: null
})

// Aggregated data
const aggregatedModules = computed(() => aggregate(parsedDocuments.value))
const chartBlocks = computed(() => toChartBlocks(aggregatedModules.value))
const overallChartBlock = computed(() => toOverallChartBlock(aggregatedModules.value))

const hasData = computed(() => parsedDocuments.value.length > 0)

// Current tab's chart block
const currentChartBlock = computed<ChartBlock | null>(() => {
  if (!hasData.value) return null
  if (activeTab.value === 'overall') return overallChartBlock.value
  // Find the matching module (use prefix match since module names may contain suffixes like "（阅读兴趣）")
  const block = chartBlocks.value.find(b => {
    const matchedTabId = MODULE_MAPPING[b.title] ?? 
      Object.entries(MODULE_MAPPING).find(([key]) => b.title.startsWith(key))?.[1]
    return matchedTabId === activeTab.value
  })
  return block ?? null
})

// Handlers
const handleFilesSelected = async (group: GroupType, files: File[]) => {
  // Reset errors for this group
  errors.value[group] = null

  // Add files to the list
  if (group === 'innovative') {
    innovativeFiles.value = [...innovativeFiles.value, ...files]
  } else {
    traditionalFiles.value = [...traditionalFiles.value, ...files]
  }

  loading.value = true

  try {
    const newDocs: ParsedDocument[] = []
    for (const file of files) {
      try {
        const doc = await parseFile(file, group)
        newDocs.push(doc)
      } catch (err) {
        const msg = err instanceof Error ? err.message : `解析文件 ${file.name} 失败`
        errors.value[group] = msg
      }
    }
    parsedDocuments.value = [...parsedDocuments.value, ...newDocs]
  } finally {
    loading.value = false
  }
}

const handleTabChange = (tabId: TabId) => {
  activeTab.value = tabId
}
</script>

<template>
  <ParticleBackground />
  <div class="app-content">
    <header class="app-header">
      <NeonTitle
        title="绘本阅读量表分析"
        subtitle="上传 Word 评价量表文件以查看数据分布"
      />
    </header>

    <main class="app-main">
      <GroupUpload
        :loading="loading"
        :errors="errors"
        :innovative-files="innovativeFiles"
        :traditional-files="traditionalFiles"
        @files-selected="handleFilesSelected"
      />

      <div v-if="hasData" class="data-section">
        <TabBar
          :active-tab="activeTab"
          :disabled="false"
          @tab-change="handleTabChange"
        />

        <div v-if="currentChartBlock" class="chart-grid">
          <ChartCard
            v-for="indicator in currentChartBlock.indicators"
            :key="indicator.name"
            :indicator="indicator"
          />
        </div>
      </div>

      <div v-else class="empty-state">
        <p>请上传 Word 评价量表文件（.docx 格式）</p>
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

.data-section {
  margin-top: 40px;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-top: 24px;
}

.empty-state {
  text-align: center;
  margin-top: 60px;
  color: var(--text-secondary);
  font-size: 18px;
}

@media (max-width: 768px) {
  .chart-grid {
    grid-template-columns: 1fr;
  }
}
</style>
