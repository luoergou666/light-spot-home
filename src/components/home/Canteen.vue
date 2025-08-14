<template>
  <Card class="info-card tech-card" style="margin-top: 16px;">
    <template #title>
      <div class="card-title-container">
        <h3 class="card-title-text">{{ canteenInfo.title + canteenInfo.subtitle}} </h3>
      </div>
    </template>
    <div class="canteen-section">
      <div class="posts-list">
        <div v-for="post in canteenInfo.posts" :key="post.title" class="post-item">
          <p class="post-title">{{ post.title }}</p>
          <p class="post-author">{{ post.author }}</p>
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup>
import { ref } from 'vue';
import { Card } from 'view-ui-plus';

const canteenInfo = ref({
  title: '光点大饭堂：',
  subtitle: '（投稿找鲨鱼）',
  posts: [
    { title: '你敢不敢？我敢回家的诱惑', author: '我是死亡-1' },
    { title: '我找我自己-2', author: '你敢到我的TSK了吗' },
    { title: '性感飞龙，半夜偷渡速来小队', author: '你的改装舰船' },
    { title: '逆组鬼才', author: '世界第一强势新人' }
  ]
});
</script>

<style scoped>
/* 组件特有样式 - 公共卡片样式已移至 main.css */

.canteen-section h3 {
  color: #ffffff;
  margin-bottom: 16px;
}

.subtitle {
  font-size: 0.9rem;
  color: #b3d9ff;
  font-weight: normal;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.post-item {
  padding: 8px 12px;
  background: rgba(255, 215, 0, 0.05);
  border-left: 3px solid #ffd700;
  border-radius: 4px;
}

.post-title {
  font-weight: bold;
  color: #e6f3ff;
  margin-bottom: 4px;
}

.post-author {
  font-size: 0.9rem;
  color: #b3d9ff;
}

/* 角落装饰和头部样式已移至 main.css */
</style>
