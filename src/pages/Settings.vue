<template>
  <div class="settings-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">系统设置</h1>
      <p class="page-subtitle">个性化配置与系统管理</p>
    </div>

    <!-- 设置内容 -->
    <div class="settings-content">
      <Row :gutter="24">
        <!-- 左侧设置菜单 -->
        <Col :span="6">
          <Card class="settings-menu">
            <div class="menu-item active" @click="activeTab = 'general'">
              <i class="pi pi-cog"></i>
              <span>常规设置</span>
            </div>
            <div class="menu-item" @click="activeTab = 'display'">
              <i class="pi pi-desktop"></i>
              <span>显示设置</span>
            </div>
            <div class="menu-item" @click="activeTab = 'notification'">
              <i class="pi pi-bell"></i>
              <span>通知设置</span>
            </div>
            <div class="menu-item" @click="activeTab = 'security'">
              <i class="pi pi-shield"></i>
              <span>安全设置</span>
            </div>
            <div class="menu-item" @click="activeTab = 'about'">
              <i class="pi pi-info-circle"></i>
              <span>关于</span>
            </div>
          </Card>
        </Col>

        <!-- 右侧设置内容 -->
        <Col :span="18">
          <!-- 常规设置 -->
          <Card v-if="activeTab === 'general'" class="settings-panel">
            <template #title>
              <div class="panel-title">
                <i class="pi pi-cog"></i>
                常规设置
              </div>
            </template>
            
            <div class="setting-group">
              <h3>语言设置</h3>
              <Select v-model="settings.language" style="width: 200px">
                <Option value="zh-CN">简体中文</Option>
                <Option value="en-US">English</Option>
                <Option value="ja-JP">日本語</Option>
              </Select>
            </div>

            <Divider />

            <div class="setting-group">
              <h3>时区设置</h3>
              <Select v-model="settings.timezone" style="width: 200px">
                <Option value="Asia/Shanghai">北京时间 (UTC+8)</Option>
                <Option value="UTC">协调世界时 (UTC)</Option>
                <Option value="America/New_York">纽约时间 (UTC-5)</Option>
              </Select>
            </div>

            <Divider />

            <div class="setting-group">
              <h3>自动保存</h3>
              <Switch v-model="settings.autoSave" />
              <span class="setting-desc">自动保存用户数据和设置</span>
            </div>
          </Card>

          <!-- 显示设置 -->
          <Card v-if="activeTab === 'display'" class="settings-panel">
            <template #title>
              <div class="panel-title">
                <i class="pi pi-desktop"></i>
                显示设置
              </div>
            </template>
            
            <div class="setting-group">
              <h3>主题模式</h3>
              <RadioGroup v-model="settings.theme">
                <Radio label="dark">深色模式</Radio>
                <Radio label="light">浅色模式</Radio>
                <Radio label="auto">跟随系统</Radio>
              </RadioGroup>
            </div>

            <Divider />

            <div class="setting-group">
              <h3>动画效果</h3>
              <Switch v-model="settings.animations" />
              <span class="setting-desc">启用界面动画和过渡效果</span>
            </div>

            <Divider />

            <div class="setting-group">
              <h3>字体大小</h3>
              <Slider v-model="settings.fontSize" :min="12" :max="20" :step="1" style="width: 200px" />
              <span class="setting-value">{{ settings.fontSize }}px</span>
            </div>
          </Card>

          <!-- 通知设置 -->
          <Card v-if="activeTab === 'notification'" class="settings-panel">
            <template #title>
              <div class="panel-title">
                <i class="pi pi-bell"></i>
                通知设置
              </div>
            </template>
            
            <div class="setting-group">
              <h3>桌面通知</h3>
              <Switch v-model="settings.desktopNotifications" />
              <span class="setting-desc">允许显示桌面通知</span>
            </div>

            <Divider />

            <div class="setting-group">
              <h3>声音提醒</h3>
              <Switch v-model="settings.soundNotifications" />
              <span class="setting-desc">播放通知声音</span>
            </div>

            <Divider />

            <div class="setting-group">
              <h3>邮件通知</h3>
              <Switch v-model="settings.emailNotifications" />
              <span class="setting-desc">发送重要事件邮件通知</span>
            </div>
          </Card>

          <!-- 安全设置 -->
          <Card v-if="activeTab === 'security'" class="settings-panel">
            <template #title>
              <div class="panel-title">
                <i class="pi pi-shield"></i>
                安全设置
              </div>
            </template>
            
            <div class="setting-group">
              <h3>两步验证</h3>
              <Switch v-model="settings.twoFactorAuth" />
              <span class="setting-desc">启用两步验证增强账户安全</span>
            </div>

            <Divider />

            <div class="setting-group">
              <h3>登录记录</h3>
              <Button type="primary" ghost>查看登录历史</Button>
            </div>

            <Divider />

            <div class="setting-group">
              <h3>修改密码</h3>
              <Button type="primary">更改密码</Button>
            </div>
          </Card>

          <!-- 关于 -->
          <Card v-if="activeTab === 'about'" class="settings-panel">
            <template #title>
              <div class="panel-title">
                <i class="pi pi-info-circle"></i>
                关于
              </div>
            </template>
            
            <div class="about-content">
              <div class="app-info">
                <img src="@/assets/光点.png" alt="光点军团" class="app-logo" />
                <h2>光点军团官网</h2>
                <p class="version">版本 1.0.0</p>
                <p class="description">
                  EVE Online 光点军团官方网站，为军团成员提供数据统计、
                  个人资料管理和军团信息展示等功能。
                </p>
              </div>

              <Divider />

              <div class="tech-info">
                <h3>技术栈</h3>
                <div class="tech-list">
                  <Tag color="blue">Vue 3</Tag>
                  <Tag color="green">View Design</Tag>
                  <Tag color="orange">Vite</Tag>
                  <Tag color="purple">JavaScript</Tag>
                </div>
              </div>

              <Divider />

              <div class="contact-info">
                <h3>联系我们</h3>
                <p>如有问题或建议，请联系军团管理员</p>
                <Button type="primary" ghost>反馈问题</Button>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Row, Col, Card, Select, Option, Switch, RadioGroup, Radio, Slider, Button, Divider, Tag } from 'view-ui-plus'

// 当前激活的设置标签
const activeTab = ref('general')

// 设置数据
const settings = reactive({
  language: 'zh-CN',
  timezone: 'Asia/Shanghai',
  autoSave: true,
  theme: 'dark',
  animations: true,
  fontSize: 14,
  desktopNotifications: true,
  soundNotifications: false,
  emailNotifications: true,
  twoFactorAuth: false
})
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  color: #e0e0e0;
  padding: 40px 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 3rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 10px;
  text-shadow: 0 0 30px rgba(255, 255, 255, 0.3);
}

.page-subtitle {
  font-size: 1.2rem;
  color: #888;
  margin: 0;
}

.settings-content {
  max-width: 1200px;
  margin: 0 auto;
}

/* 设置菜单样式 */
.settings-menu {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
  margin-bottom: 8px;
}

.menu-item:hover {
  background: rgba(0, 212, 255, 0.1);
  transform: translateX(5px);
}

.menu-item.active {
  background: linear-gradient(45deg, rgba(0, 212, 255, 0.2), rgba(0, 153, 204, 0.2));
  border-left: 3px solid #00d4ff;
}

.menu-item i {
  font-size: 18px;
  margin-right: 12px;
  color: #ffffff;
}

.menu-item span {
  font-weight: 500;
}

/* 设置面板样式 */
.settings-panel {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  min-height: 500px;
}

.settings-panel :deep(.ivu-card-head) {
  background: linear-gradient(90deg, rgba(255, 215, 0, 0.1), rgba(255, 165, 0, 0.1)) !important;
  border-bottom: 1px solid rgba(255, 215, 0, 0.3) !important;
  color: #ffffff !important;
  font-weight: bold !important;
  font-size: 1.1rem !important;
}

.settings-panel :deep(.ivu-card-head-title) {
  color: #ffffff !important;
}

.settings-panel :deep(.ivu-card-head) {
  color: #ffffff !important;
}

.settings-panel :deep(.ivu-card-head *) {
  color: #ffffff !important;
}

.settings-menu :deep(.ivu-card-head) {
  background: linear-gradient(90deg, rgba(255, 215, 0, 0.1), rgba(255, 165, 0, 0.1)) !important;
  border-bottom: 1px solid rgba(255, 215, 0, 0.3) !important;
  color: #ffffff !important;
  font-weight: bold !important;
  font-size: 1.1rem !important;
}

.settings-menu :deep(.ivu-card-head-title) {
  color: #ffffff !important;
}

.settings-menu :deep(.ivu-card-head *) {
  color: #ffffff !important;
}

.panel-title {
  display: flex;
  align-items: center;
  font-size: 1.3rem;
  font-weight: 600;
  color: #ffffff;
}

.panel-title i {
  margin-right: 10px;
  font-size: 20px;
}

.setting-group {
  margin-bottom: 30px;
}

.setting-group h3 {
  color: #e0e0e0;
  margin-bottom: 15px;
  font-size: 1.1rem;
  font-weight: 600;
}

.setting-desc {
  margin-left: 15px;
  color: #888;
  font-size: 0.9rem;
}

.setting-value {
  margin-left: 15px;
  color: #ffffff;
  font-weight: 600;
}

/* 关于页面样式 */
.about-content {
  text-align: center;
}

.app-info {
  margin-bottom: 30px;
}

.app-logo {
  width: 80px;
  height: 80px;
  margin-bottom: 20px;
  border-radius: 50%;
  box-shadow: 0 0 30px rgba(0, 212, 255, 0.3);
}

.app-info h2 {
  color: #ffffff;
  margin-bottom: 10px;
  font-size: 2rem;
}

.version {
  color: #888;
  font-size: 1rem;
  margin-bottom: 15px;
}

.description {
  color: #ccc;
  line-height: 1.6;
  max-width: 500px;
  margin: 0 auto;
}

.tech-info {
  text-align: left;
  margin-bottom: 30px;
}

.tech-info h3 {
  color: #e0e0e0;
  margin-bottom: 15px;
}

.tech-list {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.contact-info {
  text-align: left;
}

.contact-info h3 {
  color: #e0e0e0;
  margin-bottom: 15px;
}

.contact-info p {
  color: #ccc;
  margin-bottom: 15px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .settings-content {
    padding: 0 10px;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .menu-item {
    padding: 12px 15px;
  }
  
  .settings-panel {
    margin-top: 20px;
  }
}
</style>