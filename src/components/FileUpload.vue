<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  loading: boolean
  error: string | null
}>()

const emit = defineEmits<{
  fileSelected: [file: File]
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragOver = ref(false)

const triggerFileInput = () => {
  if (!props.loading) {
    fileInputRef.value?.click()
  }
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    emit('fileSelected', file)
  }
  // Reset input value to allow re-uploading the same file
  target.value = ''
}

const handleDrop = (event: DragEvent) => {
  isDragOver.value = false
  const file = event.dataTransfer?.files[0]
  if (file && !props.loading) {
    emit('fileSelected', file)
  }
}
</script>

<template>
  <div 
    class="file-upload glass-card" 
    :class="{ 'drag-over': isDragOver }"
    @dragover.prevent="isDragOver = true"
    @dragleave="isDragOver = false"
    @drop.prevent="handleDrop"
    @click="triggerFileInput"
  >
    <input 
      ref="fileInputRef" 
      type="file" 
      accept=".xlsx" 
      class="hidden-input"
      @change="handleFileChange"
    />
    <div v-if="loading" class="upload-loading">
      <div class="spinner"></div>
      <p>正在解析数据...</p>
    </div>
    <div v-else-if="error" class="upload-error">
      <p>{{ error }}</p>
    </div>
    <div v-else class="upload-content">
      <div class="upload-icon">📊</div>
      <p>拖拽 Excel 文件到此处，或点击上传</p>
      <p class="upload-hint">仅支持 .xlsx 格式</p>
    </div>
  </div>
</template>

<style scoped>
.file-upload {
  max-width: 500px;
  margin: 0 auto;
  padding: 40px 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  user-select: none;
}

.file-upload:hover {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3),
              inset 0 0 0 1px rgba(255, 255, 255, 0.1),
              0 0 20px rgba(59, 130, 246, 0.2);
}

.file-upload.drag-over {
  border-color: var(--neon-blue);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3),
              inset 0 0 0 1px rgba(255, 255, 255, 0.1),
              0 0 30px var(--glow-blue),
              0 0 60px var(--glow-blue);
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
  margin-bottom: 16px;
  filter: grayscale(30%);
  transition: filter 0.3s ease;
}

.file-upload:hover .upload-icon {
  filter: grayscale(0%);
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

.upload-error {
  text-align: center;
  color: var(--neon-pink);
}

.upload-error p {
  font-size: 16px;
  padding: 20px;
  background: rgba(244, 114, 182, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(244, 114, 182, 0.3);
}
</style>