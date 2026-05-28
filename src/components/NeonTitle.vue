<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <div class="neon-title-container">
    <h1 class="neon-text">{{ title }}</h1>
    <p v-if="subtitle" class="neon-subtitle">{{ subtitle }}</p>
  </div>
</template>

<style scoped>
.neon-title-container {
  text-align: center;
}

.neon-text {
  text-shadow: 0 0 7px var(--neon-blue),
               0 0 10px var(--neon-blue),
               0 0 21px var(--neon-blue),
               0 0 42px var(--neon-purple),
               0 0 82px var(--neon-purple);
}

.neon-subtitle {
  color: var(--text-secondary);
  font-size: 0.9em;
  margin-top: 8px;
}
</style>