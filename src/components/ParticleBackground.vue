<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let animationFrameId: number | null = null

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  color: string
}

const PARTICLE_COUNT = 60
const COLORS = ['#3b82f6', '#a855f7', '#6366f1']

function createParticle(width: number, height: number): Particle {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.6,
    vy: (Math.random() - 0.5) * 0.6,
    size: Math.random() * 3 + 1,
    opacity: Math.random() * 0.4 + 0.1,
    color: COLORS[Math.floor(Math.random() * COLORS.length)]
  }
}

function updateParticle(particle: Particle, width: number, height: number): void {
  particle.x += particle.vx
  particle.y += particle.vy

  // 边界反弹
  if (particle.x < 0 || particle.x > width) {
    particle.vx *= -1
    particle.x = Math.max(0, Math.min(width, particle.x))
  }
  if (particle.y < 0 || particle.y > height) {
    particle.vy *= -1
    particle.y = Math.max(0, Math.min(height, particle.y))
  }
}

function drawParticle(ctx: CanvasRenderingContext2D, particle: Particle): void {
  ctx.beginPath()
  ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
  ctx.fillStyle = particle.color
  ctx.globalAlpha = particle.opacity
  ctx.fill()
  ctx.globalAlpha = 1
}

function animate(ctx: CanvasRenderingContext2D, particles: Particle[], width: number, height: number): void {
  ctx.clearRect(0, 0, width, height)

  for (const particle of particles) {
    updateParticle(particle, width, height)
    drawParticle(ctx, particle)
  }

  animationFrameId = requestAnimationFrame(() => animate(ctx, particles, width, height))
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const updateSize = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }

  updateSize()
  window.addEventListener('resize', updateSize)

  const particles: Particle[] = []
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(createParticle(canvas.width, canvas.height))
  }

  animate(ctx, particles, canvas.width, canvas.height)

  // 清理函数保存到闭包
  const cleanup = () => {
    window.removeEventListener('resize', updateSize)
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
    }
  }

  // 使用 onUnmounted 清理
  onUnmounted(cleanup)
})
</script>

<template>
  <canvas ref="canvasRef" class="particle-canvas"></canvas>
</template>

<style scoped>
.particle-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}
</style>