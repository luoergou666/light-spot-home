<template>
  <Card class="info-card tech-card">
    <template #title>
      <div class="card-title-container">
        <h3 class="card-title-text">军团简介</h3>
        <button @click="handleNewbieItemClick" class="join-us-button">加入我们</button>
      </div>
    </template>
    <div class="corp-stats">
      <div class="stat-item">
        <span class="stat-label">成员</span>
        <span class="stat-value">{{ corpInfo.members.total }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">活跃成员</span>
        <span class="stat-value">{{ corpInfo.members.active }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">在线人数</span>
        <span class="stat-value">{{ corpInfo.members.online }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">超旗驾驶</span>
        <span class="stat-value">{{ corpInfo.members.超旗 }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">旗舰驾驶</span>
        <span class="stat-value">{{ corpInfo.members.旗舰 }}</span>
      </div>
    </div>
    <Divider />
    <div class="leadership-info">
      <p><strong>军团CEO：</strong>{{ corpInfo.leadership.ceo }}</p>
      <p><strong>军团FC：</strong>{{ corpInfo.leadership.fc }}</p>
      <p><strong>新人教官：</strong>{{ corpInfo.leadership.newbie }}</p>
    </div>
    <Divider />
    <div class="manufacturer-info">
      <p><strong>物品制造商：</strong>{{ corpInfo.manufacturers.items }}</p>
      <p><strong>旗舰制造商：</strong>{{ corpInfo.manufacturers.ships }}</p>
      <p><strong>死亡势力收购商：</strong>{{ corpInfo.manufacturers.deathClone }}</p>
      <p><strong>垃圾收购商：</strong>{{ corpInfo.manufacturers.garbage }}</p>
    </div>
  </Card>

  <CustomModal
    :imageWidth="500"
    :visible="showJoinUsModal"
    :fileData="fileData"
    @close="showJoinUsModal = false"
  />
</template>

<script setup>
import { ref } from 'vue'
import { Card, Divider } from 'view-ui-plus'
import CustomModal from '@/components/common/CustomModal.vue';
import qrCodeImage from '@/assets/qrcode_1755098739971.jpg'
const fileData = ref({})
const showJoinUsModal = ref(false)
defineProps({
  corpInfo: {
    type: Object,
    required: true
  }
})
const handleNewbieItemClick = () => {
  // 使用新的fileData结构
  fileData.value = {
    fileType: 'image',
    name: '加入我们',
    filePath: qrCodeImage
  }
  showJoinUsModal.value = true
  console.log(fileData.value)
}
</script>

<style scoped>
/* 组件特有样式 */

/* 标题容器样式已移至 main.css */

.join-us-button {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  border: none;
  color: #000;
  padding: 6px 12px;
  border-radius: 0;
  font-size: 0.9em;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.join-us-button:hover {
  background: linear-gradient(135deg, #ffed4e, #ffd700);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
}

.corp-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  background: rgba(255, 215, 0, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 215, 0, 0.2);
}

.stat-label {
  font-size: 0.9em;
  color: #ccc;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 1.2em;
  font-weight: bold;
  color: #ffd700;
}

.leadership-info,
.manufacturer-info {
  margin: 15px 0;
}

.leadership-info p,
.manufacturer-info p {
  margin: 8px 0;
  color: #e0e0e0;
  font-size: 1.25em;
}

.leadership-info strong,
.manufacturer-info strong {
  color: #ffd700;
}

/* 自定义关闭按钮样式 */
.modal-footer-container {
  position: relative;
  width: 100%;
  text-align: center;
}

.custom-close-button {
  background: linear-gradient(135deg, #ffd700, #ffed4e) !important;
  border: none !important;
  color: #000 !important;
  padding: 12px 30px !important;
  border-radius: 0 !important;
  font-weight: bold !important;
  font-size: 16px !important;
  transition: all 0.3s ease !important;
  width: auto !important;
}

.custom-close-button:hover {
  background: linear-gradient(135deg, #ffed4e, #ffd700) !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3) !important;
}



@media (max-width: 768px) {
  .corp-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .stat-item {
    padding: 8px;
  }

  .modal-content {
    margin: 20px;
    padding: 20px;
  }

  .modal-content img {
    max-width: 250px;
    max-height: 250px;
  }
}
</style>
