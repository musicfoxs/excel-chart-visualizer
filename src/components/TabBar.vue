<script setup lang="ts">
import type { TabId } from '@/types'
import { TABS } from '@/types'

interface Props {
  activeTab: TabId
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

defineEmits<{
  tabChange: [tabId: TabId]
}>()
</script>

<template>
  <div class="tab-bar glass-card">
    <button 
      v-for="tab in TABS" 
      :key="tab.id"
      class="tab-item"
      :class="{ active: tab.id === props.activeTab, disabled: props.disabled }"
      :disabled="props.disabled"
      @click="$emit('tabChange', tab.id)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<style scoped>
.tab-bar {
  display: flex;
  gap: 8px;
  padding: 8px;
  width: 100%;
}

.tab-item {
  flex: 1;
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 0.95em;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  white-space: nowrap;
}

.tab-item:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
}

.tab-item.active:not(.disabled) {
  color: var(--text-primary);
  border-bottom-color: var(--neon-blue);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3),
              0 0 20px rgba(59, 130, 246, 0.2);
}

.tab-item.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.tab-item:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>