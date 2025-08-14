<template>
  <div class="loading-overlay">
    <div class="loading-content">
      <div class="loading-header">
        <img src="@/assets/光点.png" alt="光点军团Logo" class="loading-logo" />
        <h1 class="loading-title">{{ corpInfo.welcome }}</h1>
        <p class="loading-motto">{{ corpInfo.motto }}</p>
      </div>
      <div class="loading-progress">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: loadingProgress + '%' }"></div>
        </div>
        <div class="progress-text">{{ loadingText }}</div>
        <div class="progress-percentage">{{ loadingProgress.toFixed(2) }}%</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue';

const props = defineProps({
  corpInfo: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['loaded']);

// 加载状态管理
const loadingProgress = ref(1) // 加载进度 1-100，从1开始
const targetProgress = ref(1) // 目标进度
const loadingText = ref('正在加载资源...') // 加载提示文字
const resourcesLoaded = ref({
  audio: false,
  corpData: false
}) // 各类资源加载状态
const progressInterval = ref(null) // 进度条动画定时器

// 开始初始进度增长
const startInitialProgress = () => {
  // 在没有资源加载完成时，让进度条缓慢增长到30%
  const initialTarget = 30
  let currentProgress = 1

  const initialInterval = setInterval(() => {
    if (currentProgress < initialTarget) {
      currentProgress += 0.5
      loadingProgress.value = currentProgress
    } else {
      clearInterval(initialInterval)
    }
  }, 100)
}

// 平滑更新进度条
const smoothUpdateProgress = (target) => {
  targetProgress.value = target

  if (progressInterval.value) {
    clearInterval(progressInterval.value)
  }

  progressInterval.value = setInterval(() => {
    const current = loadingProgress.value
    const diff = targetProgress.value - current

    if (Math.abs(diff) < 0.5) {
      loadingProgress.value = targetProgress.value
      clearInterval(progressInterval.value)
      progressInterval.value = null
    } else {
      // 缓慢增长，速度随着接近目标而减慢
      loadingProgress.value += diff * 0.05
    }
  }, 50)
}

// 检查所有资源是否加载完成
const checkAllResourcesLoaded = () => {
  const loaded = Object.values(resourcesLoaded.value)
  const loadedCount = loaded.filter(Boolean).length
  const totalCount = loaded.length

  // 根据加载状态计算目标进度
  let target = 30 // 基础进度30%

  if (loadedCount === 1) {
    target = 65 // 第一个资源加载完成
  } else if (loadedCount === totalCount) {
    target = 100 // 所有资源加载完成
  }

  // 确保进度条只能向前，不能倒退
  if (target > loadingProgress.value) {
    smoothUpdateProgress(target)
  }

  // 更新加载文字
  if (resourcesLoaded.value.audio && !resourcesLoaded.value.corpData) {
    loadingText.value = '正在获取军团数据...'
  } else if (loadedCount === totalCount) {
    // 等待进度条到达100%后再显示"加载完成"并隐藏加载页面
    const waitForProgress = () => {
      if (loadingProgress.value >= 99.5) {
        loadingText.value = '加载完成！'
        setTimeout(() => {
          emit('loaded')
        }, 200) // 显示"加载完成"后立即切换，只保留200ms的短暂延迟
      } else {
        setTimeout(waitForProgress, 100) // 每100ms检查一次进度
      }
    }
    waitForProgress()
  }
}

// 标记资源加载完成
const markResourceLoaded = (resourceType) => {
  resourcesLoaded.value[resourceType] = true
  checkAllResourcesLoaded()
}

// 暴露给父组件的方法
defineExpose({
  markResourceLoaded
})

// 组件挂载时启动初始进度增长
startInitialProgress()
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  text-align: center;
  max-width: 600px;
  padding: 40px;
}

.loading-header {
  margin-bottom: 60px;
}

.loading-logo {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 3px solid #ffd700;
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.6);
  animation: loadingGlow 2s ease-in-out infinite alternate;
  margin-bottom: 20px;
}

.loading-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #e6f3ff;
  margin-bottom: 10px;
  text-shadow: 0 0 20px rgba(230, 243, 255, 0.5);
}

.loading-motto {
  font-size: 1.2rem;
  color: #b3d9ff;
  margin: 0;
  white-space: nowrap;
  overflow: visible;
}

.loading-progress {
  width: 100%;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 15px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffd700, #ffed4e, #ffd700);
  border-radius: 4px;
  transition: width 0.3s ease;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
  animation: progressShine 2s ease-in-out infinite;
}

.progress-text {
  font-size: 1rem;
  color: #e6f3ff;
  margin-bottom: 5px;
}

.progress-percentage {
  font-size: 1.2rem;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

@keyframes loadingGlow {
  from {
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
    transform: scale(1);
  }
  to {
    box-shadow: 0 0 40px rgba(255, 215, 0, 0.8);
    transform: scale(1.05);
  }
}

@keyframes progressShine {
  0%, 100% {
    background-position: -100% 0;
  }
  50% {
    background-position: 100% 0;
  }
}
</style>