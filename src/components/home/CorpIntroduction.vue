<template>
  <Card class="info-card tech-card">
    <template #title>
      <div class="card-title-container">
        <h3 class="card-title-text">军团简介</h3>
        <button @click="showJoinUsModal = true" class="join-us-button">加入我们</button>
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

  <Modal
    v-model="showJoinUsModal"
    title="加入我们"
    width="80%"
    :styles="{ top: '50px' }"
    class="join-us-modal custom-modal"
    :mask-closable="false"
    :closable="false"
  >
    <div class="join-us-content">
      <img :src="qrCodeImage" alt="加入我们" />
    </div>
    <template #footer>
      <div class="modal-footer-container">
        <div class="modal-corner-bottom-left"></div>
        <div class="modal-corner-bottom-right"></div>
        <Button class="custom-close-button" type="primary" @click="showJoinUsModal = false">关闭</Button>
      </div>
    </template>
  </Modal>
</template>

<script setup>
import { ref } from 'vue'
import { Card, Divider, Modal, Button } from 'view-ui-plus'
import qrCodeImage from '@/assets/qrcode_1755098739971.jpg'

defineProps({
  corpInfo: {
    type: Object,
    required: true
  }
})

const showJoinUsModal = ref(false)
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

/* 加入我们弹窗内容样式 */
.join-us-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 400px;
}

.join-us-content img {
  max-width: 400px;
  max-height: 400px;
  border-radius: 10px;
  display: block;
}

/* 自定义Modal样式 */
:deep(.custom-modal .ivu-modal-content) {
  background: rgba(20, 20, 30, 0.95) !important;
  backdrop-filter: blur(20px);
  border: 2px solid rgba(255, 215, 0, 0.3) !important;
  border-radius: 0 !important;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5) !important;
  overflow: visible;
  position: relative;
}

:deep(.custom-modal .ivu-modal-header) {
  background: transparent !important;
  border-bottom: 1px solid rgba(255, 215, 0, 0.2) !important;
  padding: 20px 30px !important;
}

:deep(.custom-modal .ivu-modal-header-inner) {
  color: #ffd700 !important;
  font-size: 18px !important;
  font-weight: bold !important;
}

:deep(.custom-modal .ivu-modal-body) {
  background: transparent !important;
  padding: 30px !important;
  color: #e0e0e0 !important;
}

:deep(.custom-modal .ivu-modal-footer) {
  background: transparent !important;
  border-top: 1px solid rgba(255, 215, 0, 0.2) !important;
  padding: 20px 30px !important;
  text-align: center !important;
}

/* 四角L效果 */
:deep(.custom-modal .ivu-modal-content::before) {
  content: '';
  position: absolute;
  top: 8px;
  left: 8px;
  width: 20px;
  height: 20px;
  border-top: 3px solid #ffd700;
  border-left: 3px solid #ffd700;
  z-index: 1;
}

:deep(.custom-modal .ivu-modal-content::after) {
  content: '';
  position: absolute;
  top: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  border-top: 3px solid #ffd700;
  border-right: 3px solid #ffd700;
  z-index: 1;
}

.modal-footer-container {
  position: relative;
  width: 100%;
}

.modal-corner-bottom-left {
  position: absolute;
  bottom: -28px;
  left: -22px;
  width: 20px;
  height: 20px;
  border-bottom: 3px solid #ffd700;
  border-left: 3px solid #ffd700;
  z-index: 1;
}

.modal-corner-bottom-right {
  position: absolute;
  bottom: -28px;
  right: -22px;
  width: 20px;
  height: 20px;
  border-bottom: 3px solid #ffd700;
  border-right: 3px solid #ffd700;
  z-index: 1;
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

/* 遮罩层样式 */
:deep(.custom-modal .ivu-modal-mask) {
  background: rgba(0, 0, 0, 0.8);
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
