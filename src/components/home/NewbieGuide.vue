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
  <CustomModal
    :visible="modalVisible"
    :fileData="fileData"
    @close="modalVisible = false"
  />
</template>
<style scoped>
 .ivu-list-item-meta-title {
    font-weight: 500;
    margin-bottom: 4px;
    color: #ffffff;
    font-size: 20px;
    line-height: 22px;
}



/* CustomModal组件已经有自己的样式，这里只需要保留必要的样式覆盖 */
</style>
<script setup>
import { ref } from 'vue';
import { Card, List, ListItem, ListItemMeta, Icon } from 'view-ui-plus';
import CustomModal from '@/components/common/CustomModal.vue';
import shipTreeImage from '@/assets/光点舰船树形图.jpg';
const title = ref("");
const newbieInfo = ref([
  {
    name: '新人入团指引',
    fileType: 'markdown',
    filePath: '/light-spot-home/docs/newbie-guide.md'
  },
  {
    name: '新人刷怪报点教程',
    fileType: 'markdown',
    filePath: '/light-spot-home/docs/ratting-guide.md'
  },
  {
    name: '角色成长机制',
    fileType: 'word',
    filePath: '/light-spot-home/docs/角色成长机制.docx'
  },
  {
    name: '光点舰船树形图',
    fileType: 'image',
    filePath: shipTreeImage
  }
]);

const modalVisible = ref(false)
const fileData = ref(null)

const handleNewbieItemClick = (item) => {
  // 使用新的fileData结构
  fileData.value = {
    fileType: item.fileType,
    name: item.name,
    filePath: item.filePath
  }
  
  modalVisible.value = true
}// closeModal方法已不再需要，因为CustomModal组件会直接处理关闭事件</script>
