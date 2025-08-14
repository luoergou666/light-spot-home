<template>
  <!-- 主应用容器 -->
  <main class="vue-root">
    <!-- 背景层1：图片背景 -->
    <div class="background-layer-1">
      <Galaxy v-if="isAppLoaded" />
    </div>

    <!-- 背景层2：SplashCursor组件 -->
    <div class="background-layer-2">
      <SplashCursor/>
    </div>

    <!-- 最顶层：业务路由组件 -->
    <div class="content">
      <router-view />
    </div>

  </main>
</template>

<script setup>
// 导入Galaxy组件作为背景
import Galaxy from "@/components/Galaxy.vue";
import SplashCursor from "@/components/SplashCursor.vue";
import { useRouter } from 'vue-router';
import { h, ref, onMounted } from 'vue';

// 全局加载状态
const isAppLoaded = ref(false);

const router = useRouter();

// 应用初始化
onMounted(() => {
  // 延迟显示Galaxy组件，给页面加载留出时间
  setTimeout(() => {
    isAppLoaded.value = true;
  }, 1000);
});

// Dock导航项配置
const dockItems = [
  {
    icon: h('i', { class: 'pi pi-home', style: { fontSize: '20px' } }),
    label: '首页',
    onClick: () => router.push('/')
  },
  {
    icon: h('i', { class: 'pi pi-chart-bar', style: { fontSize: '20px' } }),
    label: '数据',
    onClick: () => router.push('/data')
  },
  {
    icon: h('i', { class: 'pi pi-user', style: { fontSize: '20px' } }),
    label: '资料',
    onClick: () => router.push('/profile')
  },
  {
    icon: h('i', { class: 'pi pi-cog', style: { fontSize: '20px' } }),
    label: '设置',
    onClick: () => router.push('/settings')
  }
];

</script>
<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

#app {
  width: 100%;
  height: 100%;
}

.vue-root {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

/* 背景层1：图片背景 */
.background-layer-1 {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgb(10, 10, 10);
  /* background-image: url('@/assets/background.jpg'); */
  /* background-size: cover; */
  /* background-position: center; */
  /* background-repeat: no-repeat; */
  z-index: 1;
}

/* 背景层2：SplashCursor组件 */
.background-layer-2 {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
}

/* 最顶层：业务内容 */
.content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
  overflow: auto;
}

/* 底部导航栏容器 */
.dock-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 4;
  display: flex;
  justify-content: center;
  padding: 20px;
  pointer-events: none; /* 让容器本身不阻挡点击 */
}

.dock-container > * {
  pointer-events: auto; /* 恢复子元素的点击事件 */
}
</style>
