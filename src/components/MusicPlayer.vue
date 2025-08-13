<template>
  <div class="music-player">
    <div class="player-button" @click="toggleMusic" :class="{ playing: isPlaying }">
      <img src="@/assets/光点.png" alt="光点军团" class="corp-icon" />
      <div class="play-indicator" v-if="isPlaying">
        <div class="wave"></div>
        <div class="wave"></div>
        <div class="wave"></div>
      </div>
      <div class="play-icon" v-else>
        ▶
      </div>
    </div>
    <audio ref="audioPlayer" loop preload="auto">
      <source src="@/music/星海微茫.mp3" type="audio/mpeg">
      您的浏览器不支持音频播放。
    </audio>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const audioPlayer = ref(null)
const isPlaying = ref(false)

const toggleMusic = () => {
  if (isPlaying.value) {
    audioPlayer.value.pause()
    isPlaying.value = false
  } else {
    audioPlayer.value.play().catch(error => {
      console.log('音频播放失败:', error)
    })
    isPlaying.value = true
  }
}

// 监听音频事件
onMounted(() => {
  if (audioPlayer.value) {
    audioPlayer.value.addEventListener('ended', () => {
      isPlaying.value = false
    })
    audioPlayer.value.addEventListener('pause', () => {
      isPlaying.value = false
    })
    audioPlayer.value.addEventListener('play', () => {
      isPlaying.value = true
    })
  }
})

onUnmounted(() => {
  if (audioPlayer.value) {
    audioPlayer.value.pause()
  }
})
</script>

<style scoped>
.music-player {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.player-button {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(0, 30, 60, 0.9), rgba(0, 20, 50, 0.95));
  border: 2px solid rgba(255, 215, 0, 0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(255, 215, 0, 0.3);
  backdrop-filter: blur(10px);
}

.player-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 30px rgba(255, 215, 0, 0.5);
  border-color: rgba(255, 215, 0, 0.8);
}

.player-button.playing {
  animation: pulse 2s infinite;
  border-color: #00ff88;
  box-shadow: 0 4px 20px rgba(0, 255, 136, 0.4);
}

@keyframes pulse {
  0% {
    box-shadow: 0 4px 20px rgba(0, 255, 136, 0.4);
  }
  50% {
    box-shadow: 0 6px 30px rgba(0, 255, 136, 0.7);
  }
  100% {
    box-shadow: 0 4px 20px rgba(0, 255, 136, 0.4);
  }
}

.corp-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  filter: brightness(1.2);
}

.play-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  gap: 2px;
  align-items: end;
}

.wave {
  width: 3px;
  height: 8px;
  background: #00ff88;
  border-radius: 1px;
  animation: wave 1s infinite ease-in-out;
}

.wave:nth-child(2) {
  animation-delay: 0.1s;
}

.wave:nth-child(3) {
  animation-delay: 0.2s;
}

@keyframes wave {
  0%, 40%, 100% {
    transform: scaleY(0.4);
  }
  20% {
    transform: scaleY(1);
  }
}

.play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #ffd700;
  font-size: 20px;
}

.play-icon i {
  margin-left: 2px; /* 微调播放图标位置 */
}

/* 响应式设计 */
@media (max-width: 768px) {
  .music-player {
    bottom: 80px; /* 避免与移动端底部导航冲突 */
    right: 15px;
  }
  
  .player-button {
    width: 50px;
    height: 50px;
  }
  
  .corp-icon {
    width: 32px;
    height: 32px;
  }
  
  .play-icon {
    font-size: 16px;
  }
}
</style>