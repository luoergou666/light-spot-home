<template>
  <section class="background">
    <slot /> <!-- 这里会渲染传入的子内容 -->
  </section>
  <Galaxy
    :mouse-repulsion="true"
    :mouse-interaction="true"
    :density="1.5"
    :glow-intensity="0.5"
    :saturation="0.8"
    :hue-shift="240"
  />
</template>

<script setup>
// 背景组件的逻辑
import SplashCursor from "@/components/SplashCursor.vue";
import Galaxy from "@/components/Galaxy.vue";
</script>

<style scoped>
  .background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
  }
</style>
