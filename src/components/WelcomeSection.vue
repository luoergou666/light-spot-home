<template>
  <div class="welcome-section">
    <div class="logo-container" @click="toggleMusic">
      <div class="music-logo-wrapper" :class="{ playing: isPlaying }">
        <img src="@/assets/光点.png" alt="光点军团Logo" class="corp-logo" />
        <div class="solar-particles" v-if="isPlaying">
          <div class="particle large" v-for="i in 8" :key="'large-' + i" :style="getParticleStyle(i, 'large')">
          </div>
          <div class="particle medium" v-for="i in 12" :key="'medium-' + i"
            :style="getParticleStyle(i + 8, 'medium')"></div>
          <div class="particle small" v-for="i in 16" :key="'small-' + i"
            :style="getParticleStyle(i + 20, 'small')"></div>
        </div>
        <div class="play-overlay" v-if="!isPlaying">
          <div class="play-icon">▶</div>
        </div>
      </div>
    </div>

    <!-- 音频元素 -->
    <audio ref="audioPlayer" loop preload="auto">
      <source src="@/music/星海微茫.mp3" type="audio/mpeg">
      您的浏览器不支持音频播放。
    </audio>
    <h1 class="corp-title">{{ corpInfo.welcome }}</h1>
    <p class="corp-motto">{{ corpInfo.motto }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// Props
const props = defineProps({
  corpInfo: {
    type: Object,
    required: true
  }
})

// 音乐播放相关
const audioPlayer = ref(null)
const isPlaying = ref(false)
const audioContext = ref(null)
const analyser = ref(null)
const dataArray = ref(null)
const animationId = ref(null)
const isToggling = ref(false) // 防止快速点击的标志

// 生成粒子样式
const getParticleStyle = (index, size) => {
  const baseAngles = {
    large: 45,   // 大粒子间隔45度
    medium: 30,  // 中粒子间隔30度
    small: 22.5  // 小粒子间隔22.5度
  }

  const angle = (index - 1) * baseAngles[size]
  const delay = (index - 1) * 0.1 + Math.random() * 0.3
  const distance = {
    large: 120 + Math.random() * 30,
    medium: 100 + Math.random() * 25,
    small: 80 + Math.random() * 20
  }

  return {
    animationDelay: `${delay}s`,
    '--particle-angle': `${angle}deg`,
    '--particle-distance': `${distance[size]}px`
  }
}

const toggleMusic = async () => {
  // 防止快速点击导致的竞态条件
  if (isToggling.value) {
    return
  }

  if (audioPlayer.value.readyState < 2) {
    console.log('音频还未准备好，请稍后再试')
    return
  }

  isToggling.value = true

  try {
    if (isPlaying.value) {
      audioPlayer.value.pause()
      isPlaying.value = false
      if (animationId.value) {
        cancelAnimationFrame(animationId.value)
      }
    } else {
      // 确保音频已经暂停后再播放
      if (!audioPlayer.value.paused) {
        audioPlayer.value.pause()
        // 等待一小段时间确保暂停完成
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      await audioPlayer.value.play()
      isPlaying.value = true
      startAudioVisualization()
    }
  } catch (error) {
    console.error('音频播放失败:', error)
    isPlaying.value = false
  } finally {
    // 延迟重置防抖标志，防止过快的连续点击
    setTimeout(() => {
      isToggling.value = false
    }, 200)
  }
}

const startAudioVisualization = () => {
  if (!audioContext.value) {
    audioContext.value = new (window.AudioContext || window.webkitAudioContext)()
    const source = audioContext.value.createMediaElementSource(audioPlayer.value)
    analyser.value = audioContext.value.createAnalyser()
    source.connect(analyser.value)
    analyser.value.connect(audioContext.value.destination)
    analyser.value.fftSize = 256
    dataArray.value = new Uint8Array(analyser.value.frequencyBinCount)
  }

  const animate = () => {
    if (!isPlaying.value) return

    analyser.value.getByteFrequencyData(dataArray.value)

    // 更新粒子效果
    const largeParticles = document.querySelectorAll('.particle.large')
    const mediumParticles = document.querySelectorAll('.particle.medium')
    const smallParticles = document.querySelectorAll('.particle.small')

    largeParticles.forEach((particle, index) => {
      const intensity = dataArray.value[index % dataArray.value.length] / 255
      particle.style.opacity = 0.6 + intensity * 0.4
      particle.style.transform = `scale(${1 + intensity * 0.8})`
      particle.style.filter = `brightness(${1.5 + intensity * 2})`
    })

    mediumParticles.forEach((particle, index) => {
      const intensity = dataArray.value[(index + 8) % dataArray.value.length] / 255
      particle.style.opacity = 0.5 + intensity * 0.5
      particle.style.transform = `scale(${0.9 + intensity * 0.6})`
      particle.style.filter = `brightness(${1.3 + intensity * 1.5})`
    })

    smallParticles.forEach((particle, index) => {
      const intensity = dataArray.value[(index + 20) % dataArray.value.length] / 255
      particle.style.opacity = 0.4 + intensity * 0.6
      particle.style.transform = `scale(${0.8 + intensity * 0.4})`
      particle.style.filter = `brightness(${1.2 + intensity * 1})`
    })

    animationId.value = requestAnimationFrame(animate)
  }
  animate()
}

onMounted(() => {
  // 监听音频事件
  if (audioPlayer.value) {
    audioPlayer.value.addEventListener('ended', () => {
      isPlaying.value = false
      if (animationId.value) {
        cancelAnimationFrame(animationId.value)
      }
    })

    audioPlayer.value.addEventListener('pause', () => {
      isPlaying.value = false
      if (animationId.value) {
        cancelAnimationFrame(animationId.value)
      }
    })

    audioPlayer.value.addEventListener('play', () => {
      isPlaying.value = true
    })

    // 监听音频加载错误
    audioPlayer.value.addEventListener('error', (e) => {
      console.error('音频加载错误:', e)
      isPlaying.value = false
    })

    // 监听音频中断
    audioPlayer.value.addEventListener('abort', () => {
      console.log('音频播放被中断')
      isPlaying.value = false
    })
  }
})

onUnmounted(() => {
  if (animationId.value) {
    cancelAnimationFrame(animationId.value)
  }
  if (audioContext.value) {
    audioContext.value.close()
  }
})
</script>

<style scoped>
.welcome-section {
  text-align: center;
  padding: 2vw 4vw 0vw;
  margin-bottom: 0.5rem;
  flex-shrink: 0;
  overflow: visible;
}

.logo-container {
  margin-bottom: 1.5rem;
  cursor: pointer;
  position: relative;
  display: inline-block;
  overflow: visible;
}

.music-logo-wrapper {
  position: relative;
  display: inline-block;
  transition: all 0.3s ease;
  overflow: visible;
}

.music-logo-wrapper:hover {
  transform: scale(1.05);
}

.corp-logo {
  width: clamp(80px, 8vw, 120px);
  height: clamp(80px, 8vw, 120px);
  border-radius: 50%;
  border: 3px solid #ffd700;
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
  animation: glow 2s ease-in-out infinite alternate;
  transition: all 0.3s ease;
}

.music-logo-wrapper.playing .corp-logo {
  border-color: #ffd700;
  box-shadow: 0 0 40px rgba(255, 215, 0, 0.8);
  animation: musicGlow 1s ease-in-out infinite alternate;
}

@keyframes glow {
  from {
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
  }

  to {
    box-shadow: 0 0 40px rgba(255, 215, 0, 0.8);
  }
}

@keyframes musicGlow {
  from {
    box-shadow: 0 0 30px rgba(255, 215, 0, 0.6), 0 0 60px rgba(255, 165, 0, 0.4);
    transform: scale(1);
  }

  to {
    box-shadow: 0 0 50px rgba(255, 215, 0, 0.9), 0 0 80px rgba(255, 165, 0, 0.6);
    transform: scale(1.02);
  }
}

/* 太阳粒子效果 */
.solar-particles {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.particle {
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: 50%;
  transform-origin: 50% 50%;
  animation: particleFloat 3s ease-out infinite, particleGlow 2s ease-in-out infinite alternate;
}

.particle.large {
  width: clamp(6px, 0.8vw, 8px);
  height: clamp(6px, 0.8vw, 8px);
  background: radial-gradient(circle,
      #ffffff 0%,
      #ffd700 20%,
      #ff8c00 60%,
      #ff4500 80%,
      transparent 100%);
  box-shadow:
    0 0 15px rgba(255, 215, 0, 0.9),
    0 0 30px rgba(255, 140, 0, 0.7),
    0 0 45px rgba(255, 69, 0, 0.5);
}

.particle.medium {
  width: clamp(4px, 0.5vw, 5px);
  height: clamp(4px, 0.5vw, 5px);
  background: radial-gradient(circle,
      #ffd700 0%,
      #ff8c00 40%,
      #ff6347 70%,
      transparent 100%);
  box-shadow:
    0 0 10px rgba(255, 215, 0, 0.8),
    0 0 20px rgba(255, 140, 0, 0.6),
    0 0 30px rgba(255, 99, 71, 0.4);
}

.particle.small {
  width: clamp(2px, 0.3vw, 3px);
  height: clamp(2px, 0.3vw, 3px);
  background: radial-gradient(circle,
      #ffd700 0%,
      #ff8c00 50%,
      transparent 100%);
  box-shadow:
    0 0 6px rgba(255, 215, 0, 0.7),
    0 0 12px rgba(255, 140, 0, 0.5);
}

.particle::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  animation: particlePulse 1.5s ease-in-out infinite alternate;
}

.particle.large::before {
  width: clamp(10px, 1.2vw, 12px);
  height: clamp(10px, 1.2vw, 12px);
  background: radial-gradient(circle,
      rgba(255, 255, 255, 0.6) 0%,
      rgba(255, 215, 0, 0.3) 50%,
      transparent 100%);
}

.particle.medium::before {
  width: clamp(6px, 0.8vw, 8px);
  height: clamp(6px, 0.8vw, 8px);
  background: radial-gradient(circle,
      rgba(255, 255, 255, 0.5) 0%,
      rgba(255, 215, 0, 0.2) 50%,
      transparent 100%);
}

.particle.small::before {
  width: clamp(4px, 0.5vw, 5px);
  height: clamp(4px, 0.5vw, 5px);
  background: radial-gradient(circle,
      rgba(255, 255, 255, 0.4) 0%,
      rgba(255, 215, 0, 0.1) 50%,
      transparent 100%);
}

@keyframes particleFloat {
  0% {
    transform: translate(-50%, -50%) rotate(var(--particle-angle, 0deg)) translateX(40px) scale(0.8);
    opacity: 0;
  }

  10% {
    opacity: 1;
  }

  90% {
    opacity: 0.8;
  }

  100% {
    transform: translate(-50%, -50%) rotate(var(--particle-angle, 0deg)) translateX(var(--particle-distance, 120px)) scale(0.2);
    opacity: 0;
  }
}

@keyframes particleGlow {
  0% {
    filter: brightness(1) saturate(1);
    box-shadow:
      0 0 5px rgba(255, 215, 0, 0.5),
      0 0 10px rgba(255, 140, 0, 0.3);
  }

  100% {
    filter: brightness(1.8) saturate(1.5);
    box-shadow:
      0 0 15px rgba(255, 215, 0, 0.9),
      0 0 25px rgba(255, 140, 0, 0.7),
      0 0 35px rgba(255, 69, 0, 0.5);
  }
}

@keyframes particlePulse {
  0% {
    opacity: 0.3;
    transform: translate(-50%, -50%) scale(0.8);
  }

  100% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(1.2);
  }
}

.play-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  width: clamp(40px, 4vw, 50px);
  height: clamp(40px, 4vw, 50px);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.music-logo-wrapper:hover .play-overlay {
  opacity: 1;
}

.play-icon {
  color: #ffd700;
  font-size: clamp(16px, 1.5vw, 20px);
  margin-left: 3px;
}

.corp-title {
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 1rem;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}

.corp-motto {
  font-size: clamp(1rem, 2.5vw, 1.2rem);
  color: #e6f3ff;
  font-style: italic;
  max-width: min(600px, 90vw);
  margin: 0 auto;
  line-height: 1.6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .welcome-section {
    padding: 2rem 1rem 1.5rem;
    margin-bottom: 1rem;
  }

  .logo-container {
    margin-bottom: 1rem;
  }
}

@media (max-width: 480px) {
  .welcome-section {
    padding: 1.5rem 0.5rem 1rem;
  }

  .corp-motto {
    max-width: 95vw;
    padding: 0 0.5rem;
  }
}
</style>
