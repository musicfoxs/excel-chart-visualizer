<script setup lang="ts">
import { ref } from 'vue'
import type { GroupType } from '@/types'

interface Props {
  loading: boolean
  errors: { innovative: string | null; traditional: string | null }
  innovativeFiles: File[]
  traditionalFiles: File[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  filesSelected: [group: GroupType, files: File[]]
}>()

// Refs for file inputs
const innovativeInputRef = ref<HTMLInputElement | null>(null)
const traditionalInputRef = ref<HTMLInputElement | null>(null)

// Drag state
const isInnovativeDragOver = ref(false)
const isTraditionalDragOver = ref(false)

// Trigger file input for innovation group
const triggerInnovativeInput = () => {
  if (!props.loading) {
    innovativeInputRef.value?.click()
  }
}

// Trigger file input for traditional group
const triggerTraditionalInput = () => {
  if (!props.loading) {
    traditionalInputRef.value?.click()
  }
}

// Handle file selection for innovation group
const handleInnovativeFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    emit('filesSelected', 'innovative', Array.from(files))
  }
  // Reset input value to allow re-uploading the same files
  target.value = ''
}

// Handle file selection for traditional group
const handleTraditionalFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    emit('filesSelected', 'traditional', Array.from(files))
  }
  // Reset input value to allow re-uploading the same files
  target.value = ''
}

// Handle drop for innovation group
const handleInnovativeDrop = (event: DragEvent) => {
  isInnovativeDragOver.value = false
  const files = event.dataTransfer?.files
  if (files && files.length > 0 && !props.loading) {
    // Filter only .docx files
    const docxFiles = Array.from(files).filter(file => 
      file.name.toLowerCase().endsWith('.docx')
    )
    if (docxFiles.length > 0) {
      emit('filesSelected', 'innovative', docxFiles)
    }
  }
}

// Handle drop for traditional group
const handleTraditionalDrop = (event: DragEvent) => {
  isTraditionalDragOver.value = false
  const files = event.dataTransfer?.files
  if (files && files.length > 0 && !props.loading) {
    // Filter only .docx files
    const docxFiles = Array.from(files).filter(file => 
      file.name.toLowerCase().endsWith('.docx')
    )
    if (docxFiles.length > 0) {
      emit('filesSelected', 'traditional', docxFiles)
    }
  }
}
</script>

<template>
  <div class="group-upload">
    <div class="upload-panels">
      <!-- 创新组上传区 -->
      <div 
        class="upload-panel glass-card" 
        :class="{ 
          'drag-over': isInnovativeDragOver,
          'disabled': loading 
        }"
      >
        <div class="panel-header">
          <span class="panel-icon">🚀</span>
          <h3>创新组</h3>
          <span class="file-count" v-if="innovativeFiles.length > 0">
            ({{ innovativeFiles.length }} 份文件)
          </span>
        </div>

        <!-- 文件列表 -->
        <div class="file-list" v-if="innovativeFiles.length > 0">
          <div 
            class="file-item" 
            v-for="(file, index) in innovativeFiles" 
            :key="index"
          >
            <span class="file-icon">📄</span>
            <span class="file-name">{{ file.name }}</span>
          </div>
        </div>

        <!-- 上传区域 -->
        <div 
          class="upload-area"
          @click="triggerInnovativeInput"
          @dragover.prevent="isInnovativeDragOver = true"
          @dragleave="isInnovativeDragOver = false"
          @drop.prevent="handleInnovativeDrop"
        >
          <input 
            ref="innovativeInputRef" 
            type="file" 
            accept=".docx" 
            multiple 
            class="hidden-input"
            @change="handleInnovativeFileChange"
          />
          <div v-if="loading" class="upload-loading">
            <div class="spinner"></div>
            <p>处理中...</p>
          </div>
          <div v-else class="upload-content">
            <div class="upload-icon">📂</div>
            <p>拖拽 .docx 文件到此处，或点击上传</p>
            <p class="upload-hint">支持多文件选择</p>
          </div>
        </div>

        <!-- 错误信息 -->
        <div class="error-message" v-if="errors.innovative">
          {{ errors.innovative }}
        </div>
      </div>

      <!-- 传统组上传区 -->
      <div 
        class="upload-panel glass-card" 
        :class="{ 
          'drag-over': isTraditionalDragOver,
          'disabled': loading 
        }"
      >
        <div class="panel-header">
          <span class="panel-icon">📚</span>
          <h3>传统组</h3>
          <span class="file-count" v-if="traditionalFiles.length > 0">
            ({{ traditionalFiles.length }} 份文件)
          </span>
        </div>

        <!-- 文件列表 -->
        <div class="file-list" v-if="traditionalFiles.length > 0">
          <div 
            class="file-item" 
            v-for="(file, index) in traditionalFiles" 
            :key="index"
          >
            <span class="file-icon">📄</span>
            <span class="file-name">{{ file.name }}</span>
          </div>
        </div>

        <!-- 上传区域 -->
        <div 
          class="upload-area"
          @click="triggerTraditionalInput"
          @dragover.prevent="isTraditionalDragOver = true"
          @dragleave="isTraditionalDragOver = false"
          @drop.prevent="handleTraditionalDrop"
        >
          <input 
            ref="traditionalInputRef" 
            type="file" 
            accept=".docx" 
            multiple 
            class="hidden-input"
            @change="handleTraditionalFileChange"
          />
          <div v-if="loading" class="upload-loading">
            <div class="spinner"></div>
            <p>处理中...</p>
          </div>
          <div v-else class="upload-content">
            <div class="upload-icon">📂</div>
            <p>拖拽 .docx 文件到此处，或点击上传</p>
            <p class="upload-hint">支持多文件选择</p>
          </div>
        </div>

        <!-- 错误信息 -->
        <div class="error-message" v-if="errors.traditional">
          {{ errors.traditional }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.group-upload {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.upload-panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: start;
}

.upload-panel {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: all 0.3s ease;
}

.upload-panel.disabled {
  opacity: 0.6;
  pointer-events: none;
}

.upload-panel:hover {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3),
              inset 0 0 0 1px rgba(255, 255, 255, 0.1),
              0 0 20px rgba(59, 130, 246, 0.2);
}

.upload-panel.drag-over {
  border-color: var(--neon-blue);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3),
              inset 0 0 0 1px rgba(255, 255, 255, 0.1),
              0 0 30px var(--glow-blue),
              0 0 60px var(--glow-blue);
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-card);
}

.panel-icon {
  font-size: 32px;
  filter: grayscale(30%);
  transition: filter 0.3s ease;
}

.upload-panel:hover .panel-icon {
  filter: grayscale(0%);
}

.panel-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  flex: 1;
}

.file-count {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  transition: all 0.2s ease;
}

.file-item:hover {
  background: rgba(59, 130, 246, 0.1);
}

.file-icon {
  font-size: 16px;
  opacity: 0.7;
}

.file-name {
  font-size: 14px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.upload-area {
  min-height: 180px;
  border: 2px dashed var(--border-card);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.02);
  padding: 24px;
}

.upload-area:hover {
  border-color: var(--neon-blue);
  background: rgba(59, 130, 246, 0.05);
}

.hidden-input {
  display: none;
}

.upload-content {
  text-align: center;
  color: var(--text-secondary);
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 12px;
  filter: grayscale(30%);
  transition: filter 0.3s ease;
}

.upload-area:hover .upload-icon {
  filter: grayscale(0%);
  transform: scale(1.1);
}

.upload-content p {
  margin: 8px 0;
  font-size: 16px;
}

.upload-hint {
  font-size: 14px !important;
  opacity: 0.6;
}

.upload-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: var(--text-secondary);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--neon-blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.upload-loading p {
  font-size: 16px;
}

.error-message {
  padding: 12px 16px;
  background: rgba(244, 114, 182, 0.1);
  border: 1px solid rgba(244, 114, 182, 0.3);
  border-radius: 8px;
  color: var(--neon-pink);
  font-size: 14px;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .upload-panels {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

/* 自定义滚动条 */
.file-list::-webkit-scrollbar {
  width: 6px;
}

.file-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.file-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.file-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>