<template>
  <Card class="info-card tech-card" style="margin-top: 16px;">
    <template #title>
      <div class="card-title-container">
        <h3 class="card-title-text">新人指引</h3>
      </div>
    </template>
    <List>
      <ListItem
        v-for="item in newbieInfo"
        :key="item.name"
        class="tech-list-item"
        @click="handleNewbieItemClick(item)"
      >
        <ListItemMeta :title="item.name" />
        <template #action>
          <Icon type="ios-arrow-forward" class="tech-arrow" />
        </template>
      </ListItem>
    </List>
  </Card>

  <!-- 弹框 -->
  <Modal
    v-model="showModal"
    :title="modalTitle"
    draggable
    sticky-distance
    width="80%"
    :styles="{ top: '50px' }"
    class="tech-modal custom-modal"
    :mask-closable="false"
    :closable="false"
  >
    <div v-if="modalType === 'markdown'" v-html="renderedMarkdown"></div>
    <div v-if="modalType === 'image'" class="image-container">
      <div v-if="imageLoading" class="loading-container">
        <Spin size="large" class="loading-spin">
          <div class="loading-text">图片加载中...</div>
        </Spin>
      </div>
      <img
        v-show="!imageLoading"
        :src="modalContent"
        style="width: 100%; max-height: 70vh; object-fit: contain;"
        @load="imageLoading = false"
        @error="imageLoading = false"
      />
    </div>
    <template #footer>
      <div class="modal-footer-container">
        <div class="modal-corner-bottom-left"></div>
        <div class="modal-corner-bottom-right"></div>
        <Button class="custom-close-button" type="primary" @click="closeModal">关闭</Button>
      </div>
    </template>
  </Modal>
</template>
<style scoped>
 .ivu-list-item-meta-title {
    font-weight: 500;
    margin-bottom: 4px;
    color: #ffffff;
    font-size: 20px;
    line-height: 22px;
}

.image-container {
  position: relative;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  width: 100%;
}

.loading-spin {
  color: #ffd700;
}

.loading-text {
  color: #ffd700;
  font-size: 16px;
  margin-top: 16px;
  text-align: center;
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
</style>
<script setup>
import { ref } from 'vue';
import { Card, List, ListItem, ListItemMeta, Icon, Modal, Button, Spin } from 'view-ui-plus';
import { marked } from 'marked';
import shipTreeImage from '@/assets/光点舰船树形图.jpg';

const newbieInfo = ref([
  {
    name: '新人入团指引',
    fileType: 'markdown',
    filePath: '/docs/newbie-guide.md'
  },
  {
    name: '新人进阶教学',
    fileType: 'markdown',
    filePath: '/docs/advanced-tutorial.md'
  },
  {
    name: '新人刷怪报点教程',
    fileType: 'markdown',
    filePath: '/docs/ratting-guide.md'
  },
  {
    name: '角色技能机制',
    fileType: 'markdown',
    filePath: '/docs/skill-mechanics.md'
  },
  {
    name: '光点舰船树形图',
    fileType: 'image',
    filePath: shipTreeImage
  }
]);

const showModal = ref(false);
const modalContent = ref('');
const modalType = ref('');
const modalTitle = ref('');
const renderedMarkdown = ref('');
const imageLoading = ref(false);

const handleNewbieItemClick = async (item) => {
  modalTitle.value = item.name;
  modalType.value = item.fileType;
  try {
    if (item.fileType === 'markdown') {
      const response = await fetch(item.filePath);
      if (response.ok) {
        const markdownText = await response.text();
        modalContent.value = markdownText;
        renderedMarkdown.value = marked(markdownText);
      } else {
        modalContent.value = '文件加载失败，请稍后重试。';
        renderedMarkdown.value = marked(modalContent.value);
      }
    } else if (item.fileType === 'image') {
      imageLoading.value = true;
      modalContent.value = item.filePath;
    }
    showModal.value = true;
  } catch (error) {
    console.error('加载文件失败:', error);
    modalContent.value = '文件加载失败，请稍后重-试。';
    renderedMarkdown.value = marked(modalContent.value);
    showModal.value = true;
  }
};

const closeModal = () => {
  showModal.value = false;
  modalContent.value = '';
  modalType.value = '';
  modalTitle.value = '';
  renderedMarkdown.value = '';
  imageLoading.value = false;
};
</script>
