<script setup>
import { ref, onMounted } from 'vue'
import ShipTreeCanvas from '@/components/ShipTreeCanvas.vue'
// 成员活动表格列定义
const memberColumns = [
      {
        title: '成员名称',
        key: 'name',
        width: 150
      },
      {
        title: '状态',
        key: 'status',
        width: 80,
        render: (h, params) => {
          const status = params.row.status
          const color = status === '在线' ? '#52c41a' : '#999'
          return h('span', {
            style: {
              color: color,
              fontWeight: 'bold'
            }
          }, status)
        }
      },
      {
        title: '最后活动',
        key: 'lastSeen',
        width: 100
      },
      {
        title: '当前活动',
        key: 'activity'
      }
    ]

    // 舰队记录表格列定义
    const fleetColumns = [
      {
        title: '日期',
        key: 'date',
        width: 120
      },
      {
        title: '作战类型',
        key: 'operation',
        width: 150
      },
      {
        title: '参与人数',
        key: 'participants',
        width: 100
      },
      {
        title: '作战结果',
        key: 'result',
        width: 100,
        render: (h, params) => {
          const result = params.row.result
          const color = result === '成功' || result === '胜利' ? '#52c41a' : '#f5222d'
          return h('span', {
            style: {
              color: color,
              fontWeight: 'bold'
            }
          }, result)
        }
      },
      {
        title: 'ISK收益',
        key: 'isk',
        render: (h, params) => {
          return h('span', {
            style: {
              color: '#ffd700',
              fontWeight: 'bold'
            }
          }, params.row.isk)
        }
      }
    ]
// 数据统计
const dataStats = ref({
  totalMembers: 240,
  activeMembersWeek: 70,
  onlineNow: 20,
  totalAssets: '15.2B ISK',
  monthlyIncome: '2.8B ISK',
  fleetOperations: 45
})

// 成员活动数据
const memberActivity = ref([
  { name: 'William Macefield', status: '在线', lastSeen: '刚刚', activity: 'PVP作战' },
  { name: 'Fourier玥', status: '在线', lastSeen: '5分钟前', activity: '舰队指挥' },
  { name: 'Captain Dragonfly', status: '离线', lastSeen: '2小时前', activity: '新人培训' },
  { name: '6-Yuer', status: '在线', lastSeen: '刚刚', activity: '工业生产' },
  { name: '鲨鱼', status: '在线', lastSeen: '10分钟前', activity: '舰船制造' }
])

// 舰队作战记录
const fleetRecords = ref([
  { date: '2024-01-15', operation: '零安巡逻', participants: 12, result: '成功', isk: '+450M' },
  { date: '2024-01-14', operation: '虫洞探索', participants: 8, result: '成功', isk: '+280M' },
  { date: '2024-01-13', operation: 'PVP作战', participants: 15, result: '胜利', isk: '+120M' },
  { date: '2024-01-12', operation: '工业护航', participants: 6, result: '成功', isk: '+80M' },
  { date: '2024-01-11', operation: '星系防御', participants: 20, result: '成功', isk: '+200M' }
])

// 资产分布
const assetDistribution = ref([
  { category: '舰船', value: 8.5, unit: 'B ISK', percentage: 56 },
  { category: '装备', value: 3.2, unit: 'B ISK', percentage: 21 },
  { category: '原材料', value: 2.1, unit: 'B ISK', percentage: 14 },
  { category: 'ISK现金', value: 1.4, unit: 'B ISK', percentage: 9 }
])

// 获取统计标签
const getStatLabel = (key) => {
  const labels = {
    totalMembers: '总成员数',
    activeMembersWeek: '周活跃成员',
    onlineNow: '当前在线',
    totalAssets: '总资产',
    monthlyIncome: '月收入',
    fleetOperations: '舰队作战'
  }
  return labels[key] || key
}

// 获取进度条颜色
const getProgressColor = (category) => {
  const colors = {
    '舰船': '#1890ff',
    '装备': '#52c41a',
    '原材料': '#faad14',
    'ISK现金': '#f5222d'
  }
  return colors[category] || '#1890ff'
}

onMounted(() => {
  console.log('数据页面加载完成')
})
</script>

<template>
  <div class="data-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">军团数据中心</h1>
      <p class="page-subtitle">实时监控军团运营状况</p>
    </div>

    <!-- 数据概览 -->
    <div class="stats-overview">
      <Row :gutter="16">
        <Col :span="4" v-for="(stat, key) in dataStats" :key="key">
          <Card class="stat-card">
            <div class="stat-content">
              <div class="stat-value">{{ stat }}</div>
              <div class="stat-label">{{ getStatLabel(key) }}</div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>

    <!-- 主要数据区域 -->
    <div class="main-data">
      <Row :gutter="24">
        <!-- 成员活动 -->
        <Col :span="12">
          <Card class="data-card" title="成员活动状态">
            <Table
              :columns="memberColumns"
              :data="memberActivity"
              :show-header="true"
              size="small"
            />
          </Card>
        </Col>

        <!-- 资产分布 -->
        <Col :span="12">
          <Card class="data-card" title="军团资产分布">
            <div class="asset-list">
              <div v-for="asset in assetDistribution" :key="asset.category" class="asset-item">
                <div class="asset-info">
                  <span class="asset-category">{{ asset.category }}</span>
                  <span class="asset-value">{{ asset.value }}{{ asset.unit }}</span>
                </div>
                <div class="asset-progress">
                  <Progress
                    :percent="asset.percentage"
                    :stroke-color="getProgressColor(asset.category)"
                    :show-info="false"
                  />
                  <span class="asset-percentage">{{ asset.percentage }}%</span>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <!-- 舰队作战记录 -->
      <Row style="margin-top: 24px;">
        <Col :span="24">
          <Card class="data-card" title="近期舰队作战记录">
            <Table
              :columns="fleetColumns"
              :data="fleetRecords"
              :show-header="true"
              size="small"
            />
          </Card>
        </Col>
      </Row>

      <!-- 光点舰船树形图 -->
      <Row style="margin-top: 24px;">
        <Col :span="24">
          <Card class="data-card" title="光点舰船树形图">
            <ShipTreeCanvas />
          </Card>
        </Col>
      </Row>
    </div>
  </div>
</template>

<style scoped>
.data-page {
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
  font-size: 2.2rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 8px;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
}

.page-subtitle {
  font-size: 1.1rem;
  color: #b3d9ff;
  margin: 0;
}

.stats-overview {
  margin-bottom: 30px;
}

.stat-card {
  background: linear-gradient(135deg, rgba(0, 30, 60, 0.8), rgba(0, 20, 50, 0.9)) !important;
  border: 1px solid rgba(255, 215, 0, 0.2) !important;
  border-radius: 12px !important;
  text-align: center;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(255, 215, 0, 0.2) !important;
}

.stat-content {
  padding: 20px 10px;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 8px;
  display: block;
}

.stat-label {
  font-size: 0.9rem;
  color: #b3d9ff;
  display: block;
}

.main-data {
  max-width: 1400px;
  margin: 0 auto;
}

.data-card {
  background: linear-gradient(135deg, rgba(0, 30, 60, 0.8), rgba(0, 20, 50, 0.9)) !important;
  border: 1px solid rgba(255, 215, 0, 0.2) !important;
  border-radius: 12px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
  backdrop-filter: blur(10px) !important;
}

.data-card :deep(.ivu-card-head) {
  background: linear-gradient(90deg, rgba(255, 215, 0, 0.1), rgba(255, 165, 0, 0.1)) !important;
  border-bottom: 1px solid rgba(255, 215, 0, 0.3) !important;
  color: #ffffff !important;
  font-weight: bold !important;
  font-size: 1.1rem !important;
}

.data-card :deep(.ivu-card-head-title) {
  color: #ffffff !important;
}

.data-card :deep(.ivu-card-head) {
  color: #ffffff !important;
}

.data-card :deep(.ivu-card-head *) {
  color: #ffffff !important;
}

.data-card :deep(.ivu-card-body) {
  color: #ffffff !important;
  background: transparent !important;
}

.data-card :deep(.ivu-table) {
  background: transparent !important;
  color: #ffffff !important;
}

.data-card :deep(.ivu-table-thead th) {
  background: rgba(255, 215, 0, 0.1) !important;
  color: #ffd700 !important;
  border-bottom: 1px solid rgba(255, 215, 0, 0.3) !important;
}

.data-card :deep(.ivu-table-tbody td) {
  background: transparent !important;
  color: #ffffff !important;
  border-bottom: 1px solid rgba(255, 215, 0, 0.1) !important;
}

.data-card :deep(.ivu-table-row:hover td) {
  background: rgba(255, 215, 0, 0.05) !important;
}

.asset-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.asset-item {
  padding: 12px;
  background: rgba(255, 215, 0, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 215, 0, 0.1);
}

.asset-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.asset-category {
  font-weight: bold;
  color: #e6f3ff;
}

.asset-value {
  color: #ffd700;
  font-weight: bold;
}

.asset-progress {
  display: flex;
  align-items: center;
  gap: 12px;
}

.asset-progress :deep(.ivu-progress-outer) {
  flex: 1;
}

.asset-percentage {
  color: #b3d9ff;
  font-size: 0.9rem;
  min-width: 40px;
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-title {
    font-size: 1.8rem;
  }

  .stats-overview .ivu-col {
    margin-bottom: 16px;
  }

  .main-data {
    padding: 0 10px;
  }
}
</style>
