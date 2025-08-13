<script setup>
import { ref, onMounted } from 'vue'

// 个人信息
const userProfile = ref({
  name: 'William Macefield',
  nickname: '威廉·院长',
  title: '军团CEO',
  joinDate: '2020-03-15',
  totalPlayTime: '2,847小时',
  securityStatus: 5.0,
  corporation: '新伊甸光点学院',
  alliance: 'Light Spot Alliance',
  location: 'Jita IV - Moon 4 - Caldari Navy Assembly Plant'
})

// 技能统计
const skillStats = ref({
  totalSP: '156,847,392',
  skillsAt5: 127,
  skillsAt4: 89,
  skillsAt3: 45,
  skillsLearning: 'Caldari Battleship V',
  queueTime: '23天 14小时'
})

// 舰船统计
const shipStats = ref([
  { category: '护卫舰', count: 15, favorite: 'Interceptor' },
  { category: '巡洋舰', count: 23, favorite: 'Heavy Assault Cruiser' },
  { category: '战列舰', count: 12, favorite: 'Marauder' },
  { category: '战略巡洋舰', count: 8, favorite: 'Command Ship' },
  { category: '无畏舰', count: 3, favorite: 'Dreadnought' },
  { category: '航母', count: 2, favorite: 'Carrier' }
])

// 成就记录
const achievements = ref([
  { title: '军团创始人', description: '创建新伊甸光点学院', date: '2020-03-15', icon: 'trophy' },
  { title: 'PVP专家', description: '击杀超过1000艘敌舰', date: '2023-08-20', icon: 'target' },
  { title: '工业大师', description: '生产价值超过100B ISK的物品', date: '2023-12-01', icon: 'cog' },
  { title: '探索先锋', description: '发现50个虫洞星系', date: '2024-01-10', icon: 'compass' }
])

// 最近活动
const recentActivities = ref([
  { time: '2小时前', activity: '参与舰队PVP作战', location: 'Delve地区', result: '胜利' },
  { time: '6小时前', activity: '指挥新人训练', location: 'Jita星系', result: '完成' },
  { time: '1天前', activity: '工业生产监督', location: '军团基地', result: '完成' },
  { time: '2天前', activity: '联盟会议', location: 'Discord', result: '参与' },
  { time: '3天前', activity: '虫洞探索', location: 'J-Space', result: '发现新站点' }
])

// 装备配置
const fittings = ref([
  { name: 'PVP Interceptor', ship: 'Stiletto', purpose: 'Fast Tackle', rating: 5 },
  { name: 'Ratting Marauder', ship: 'Paladin', purpose: 'PVE', rating: 5 },
  { name: 'Mining Barge', ship: 'Hulk', purpose: 'Mining', rating: 4 },
  { name: 'Exploration Frigate', ship: 'Astero', purpose: 'Exploration', rating: 4 }
])

onMounted(() => {
  console.log('个人资料页面加载完成')
})

// 获取安全等级颜色
const getSecurityColor = (security) => {
  if (security >= 5.0) return '#00ff00'
  if (security >= 0) return '#ffff00'
  return '#ff0000'
}

// 获取评级星星
const getRatingStars = (rating) => {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating)
}
</script>

<template>
  <div class="profile-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">个人资料</h1>
      <p class="page-subtitle">飞行员档案与统计信息</p>
    </div>

    <!-- 主要内容 -->
    <div class="main-content">
      <Row :gutter="24">
        <!-- 左侧：基本信息 -->
        <Col :span="8">
          <!-- 个人信息卡片 -->
          <Card class="profile-card" title="基本信息">
            <div class="profile-avatar">
              <div class="avatar-placeholder">
                <Icon type="ios-person" size="60" />
              </div>
            </div>
            <div class="profile-info">
              <h2 class="profile-name">{{ userProfile.name }}</h2>
              <p class="profile-nickname">{{ userProfile.nickname }}</p>
              <p class="profile-title">{{ userProfile.title }}</p>
              
              <Divider />
              
              <div class="info-item">
                <span class="info-label">加入日期：</span>
                <span class="info-value">{{ userProfile.joinDate }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">游戏时长：</span>
                <span class="info-value">{{ userProfile.totalPlayTime }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">安全等级：</span>
                <span class="info-value" :style="{ color: getSecurityColor(userProfile.securityStatus) }">
                  {{ userProfile.securityStatus.toFixed(1) }}
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">军团：</span>
                <span class="info-value">{{ userProfile.corporation }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">联盟：</span>
                <span class="info-value">{{ userProfile.alliance }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">当前位置：</span>
                <span class="info-value location">{{ userProfile.location }}</span>
              </div>
            </div>
          </Card>

          <!-- 技能统计 -->
          <Card class="profile-card" title="技能统计" style="margin-top: 16px;">
            <div class="skill-stats">
              <div class="skill-item">
                <span class="skill-label">总技能点：</span>
                <span class="skill-value">{{ skillStats.totalSP }}</span>
              </div>
              <div class="skill-item">
                <span class="skill-label">V级技能：</span>
                <span class="skill-value">{{ skillStats.skillsAt5 }}</span>
              </div>
              <div class="skill-item">
                <span class="skill-label">IV级技能：</span>
                <span class="skill-value">{{ skillStats.skillsAt4 }}</span>
              </div>
              <div class="skill-item">
                <span class="skill-label">III级技能：</span>
                <span class="skill-value">{{ skillStats.skillsAt3 }}</span>
              </div>
              <div class="skill-item">
                <span class="skill-label">正在学习：</span>
                <span class="skill-value learning">{{ skillStats.skillsLearning }}</span>
              </div>
              <div class="skill-item">
                <span class="skill-label">队列时间：</span>
                <span class="skill-value">{{ skillStats.queueTime }}</span>
              </div>
            </div>
          </Card>
        </Col>

        <!-- 中间：舰船与装备 -->
        <Col :span="8">
          <!-- 舰船统计 -->
          <Card class="profile-card" title="舰船统计">
            <div class="ship-stats">
              <div v-for="ship in shipStats" :key="ship.category" class="ship-item">
                <div class="ship-info">
                  <span class="ship-category">{{ ship.category }}</span>
                  <span class="ship-count">{{ ship.count }}艘</span>
                </div>
                <div class="ship-favorite">偏好：{{ ship.favorite }}</div>
              </div>
            </div>
          </Card>

          <!-- 装备配置 -->
          <Card class="profile-card" title="装备配置" style="margin-top: 16px;">
            <div class="fittings-list">
              <div v-for="fitting in fittings" :key="fitting.name" class="fitting-item">
                <div class="fitting-header">
                  <span class="fitting-name">{{ fitting.name }}</span>
                  <span class="fitting-rating">{{ getRatingStars(fitting.rating) }}</span>
                </div>
                <div class="fitting-details">
                  <span class="fitting-ship">{{ fitting.ship }}</span>
                  <span class="fitting-purpose">{{ fitting.purpose }}</span>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <!-- 右侧：成就与活动 -->
        <Col :span="8">
          <!-- 成就记录 -->
          <Card class="profile-card" title="成就记录">
            <div class="achievements-list">
              <div v-for="achievement in achievements" :key="achievement.title" class="achievement-item">
                <div class="achievement-icon">
                  <Icon :type="'ios-' + achievement.icon" size="24" />
                </div>
                <div class="achievement-content">
                  <h4 class="achievement-title">{{ achievement.title }}</h4>
                  <p class="achievement-desc">{{ achievement.description }}</p>
                  <span class="achievement-date">{{ achievement.date }}</span>
                </div>
              </div>
            </div>
          </Card>

          <!-- 最近活动 -->
          <Card class="profile-card" title="最近活动" style="margin-top: 16px;">
            <div class="activities-list">
              <div v-for="activity in recentActivities" :key="activity.time" class="activity-item">
                <div class="activity-time">{{ activity.time }}</div>
                <div class="activity-content">
                  <div class="activity-name">{{ activity.activity }}</div>
                  <div class="activity-location">{{ activity.location }}</div>
                  <div class="activity-result" :class="activity.result">{{ activity.result }}</div>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  min-height: 100vh;
  padding: 20px;
  color: #ffffff;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 30px 0;
  background: linear-gradient(45deg, rgba(255, 215, 0, 0.1), rgba(255, 165, 0, 0.1));
  border-radius: 15px;
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.page-title {
  font-size: 3rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 10px;
  text-shadow: 0 0 30px rgba(255, 255, 255, 0.3);
}

.page-subtitle {
  font-size: 1.1rem;
  color: #b3d9ff;
  margin: 0;
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
}

.profile-card {
  background: linear-gradient(135deg, rgba(0, 30, 60, 0.8), rgba(0, 20, 50, 0.9)) !important;
  border: 1px solid rgba(255, 215, 0, 0.2) !important;
  border-radius: 12px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
  backdrop-filter: blur(10px) !important;
}

.profile-card :deep(.ivu-card-head) {
  background: linear-gradient(90deg, rgba(255, 215, 0, 0.1), rgba(255, 165, 0, 0.1)) !important;
  border-bottom: 1px solid rgba(255, 215, 0, 0.3) !important;
  color: #ffffff !important;
  font-weight: bold !important;
  font-size: 1.1rem !important;
}

.profile-card :deep(.ivu-card-head-title) {
  color: #ffffff !important;
}

.profile-card :deep(.ivu-card-head) {
  color: #ffffff !important;
}

.profile-card :deep(.ivu-card-head *) {
  color: #ffffff !important;
}

.profile-card :deep(.ivu-card-body) {
  color: #ffffff !important;
  background: transparent !important;
}

.profile-avatar {
  text-align: center;
  margin-bottom: 20px;
}

.avatar-placeholder {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(45deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.2));
  border: 3px solid #ffd700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
}

.profile-info {
  text-align: center;
}

.profile-name {
  font-size: 1.5rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 4px;
}

.profile-nickname {
  font-size: 1.1rem;
  color: #b3d9ff;
  margin-bottom: 4px;
}

.profile-title {
  font-size: 1rem;
  color: #e6f3ff;
  margin-bottom: 16px;
  font-style: italic;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  text-align: left;
}

.info-label {
  color: #b3d9ff;
  font-size: 0.9rem;
}

.info-value {
  color: #ffffff;
  font-weight: bold;
}

.info-value.location {
  font-size: 0.85rem;
  max-width: 60%;
  text-align: right;
}

.skill-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skill-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.skill-label {
  color: #b3d9ff;
  font-size: 0.9rem;
}

.skill-value {
  color: #ffd700;
  font-weight: bold;
}

.skill-value.learning {
  color: #52c41a;
  font-size: 0.9rem;
}

.ship-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ship-item {
  padding: 12px;
  background: rgba(255, 215, 0, 0.05);
  border-radius: 8px;
  border-left: 3px solid #ffd700;
}

.ship-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.ship-category {
  color: #e6f3ff;
  font-weight: bold;
}

.ship-count {
  color: #ffd700;
  font-weight: bold;
}

.ship-favorite {
  color: #b3d9ff;
  font-size: 0.9rem;
}

.fittings-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.fitting-item {
  padding: 12px;
  background: rgba(255, 215, 0, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 215, 0, 0.1);
}

.fitting-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.fitting-name {
  color: #e6f3ff;
  font-weight: bold;
}

.fitting-rating {
  color: #ffd700;
}

.fitting-details {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.fitting-ship {
  color: #b3d9ff;
}

.fitting-purpose {
  color: #52c41a;
}

.achievements-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.achievement-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 215, 0, 0.05);
  border-radius: 8px;
  border-left: 3px solid #ffd700;
}

.achievement-icon {
  color: #ffd700;
  margin-top: 2px;
}

.achievement-content {
  flex: 1;
}

.achievement-title {
  color: #e6f3ff;
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 4px;
}

.achievement-desc {
  color: #b3d9ff;
  font-size: 0.9rem;
  margin-bottom: 4px;
}

.achievement-date {
  color: #999;
  font-size: 0.8rem;
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  padding: 10px;
  background: rgba(255, 215, 0, 0.05);
  border-radius: 6px;
  border-left: 2px solid #ffd700;
}

.activity-time {
  color: #999;
  font-size: 0.8rem;
  margin-bottom: 4px;
}

.activity-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.activity-name {
  color: #e6f3ff;
  font-weight: bold;
  font-size: 0.9rem;
}

.activity-location {
  color: #b3d9ff;
  font-size: 0.85rem;
}

.activity-result {
  font-size: 0.8rem;
  font-weight: bold;
}

.activity-result.胜利,
.activity-result.完成,
.activity-result.参与 {
  color: #52c41a;
}

.activity-result.发现新站点 {
  color: #ffd700;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-title {
    font-size: 1.8rem;
  }
  
  .main-content {
    padding: 0 10px;
  }
  
  .info-value.location {
    font-size: 0.8rem;
    max-width: 55%;
  }
}
</style>