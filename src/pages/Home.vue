<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { Row, Col, Card } from 'view-ui-plus'
import CircularGallery from '../components/CircularGallery.vue'
import StarMapCanvas from '../components/StarMapCanvas.vue'
import MusicPlayer from '../components/MusicPlayer.vue'
import WelcomeSection from '../components/WelcomeSection.vue'
import { useRouter } from 'vue-router'
import ShipTreeCanvas from '@/components/ShipTreeCanvas.vue'

// 军团数据
const corpInfo = ref({
  name: '新伊甸光点学院',
  welcome: '新伊甸光点学院欢迎你',
  motto: '让你我化作星光点点，汇聚成星河，闪耀整个宇宙。',
  members: {
    total: '240+',
    active: '70+',
    online: '20+',
    超旗: '13+',
    旗舰:'17+'
  },
  leadership: {
    ceo: 'William Macefield（威廉、院长、光点灵魂、光点佛音）',
    fc: 'FourierJW（傅里叶、傅老板）',
    newbie: 'Captain Dragonfly（鲨鱼）'
  },
  manufacturers: {
    items: 'G-Yuer（玥儿）',
    ships: 'Captain Dragonfly（鲨鱼）',
    deathClone: '鲨鱼（吉他BUY95）',
    garbage: '玥儿（吉他BUY90）'
  }
})

// EVE ESI API 相关
const corpMembers = ref([]) // 军团成员数据
const isLoading = ref(false) // 加载状态
const errorMessage = ref('') // 错误信息

// 页面加载状态管理
const pageLoading = ref(true) // 页面整体加载状态
const loadingProgress = ref(1) // 加载进度 1-100，从1开始
const targetProgress = ref(1) // 目标进度
const loadingText = ref('正在加载资源...') // 加载提示文字
const resourcesLoaded = ref({
  audio: false,
  corpData: false
}) // 各类资源加载状态
const progressInterval = ref(null) // 进度条动画定时器

// 开始初始进度增长
const startInitialProgress = () => {
  // 在没有资源加载完成时，让进度条缓慢增长到30%
  const initialTarget = 30
  let currentProgress = 1

  const initialInterval = setInterval(() => {
    if (currentProgress < initialTarget) {
      currentProgress += 0.5
      loadingProgress.value = currentProgress
    } else {
      clearInterval(initialInterval)
    }
  }, 100)
}

// 平滑更新进度条
const smoothUpdateProgress = (target) => {
  targetProgress.value = target

  if (progressInterval.value) {
    clearInterval(progressInterval.value)
  }

  progressInterval.value = setInterval(() => {
    const current = loadingProgress.value
    const diff = targetProgress.value - current

    if (Math.abs(diff) < 0.5) {
      loadingProgress.value = targetProgress.value
      clearInterval(progressInterval.value)
      progressInterval.value = null
    } else {
      // 缓慢增长，速度随着接近目标而减慢
      loadingProgress.value += diff * 0.05
    }
  }, 50)
}

// 检查所有资源是否加载完成
const checkAllResourcesLoaded = () => {
  const loaded = Object.values(resourcesLoaded.value)
  const loadedCount = loaded.filter(Boolean).length
  const totalCount = loaded.length

  // 根据加载状态计算目标进度
  let target = 30 // 基础进度30%

  if (loadedCount === 1) {
    target = 65 // 第一个资源加载完成
  } else if (loadedCount === totalCount) {
    target = 100 // 所有资源加载完成
  }

  // 确保进度条只能向前，不能倒退
  if (target > loadingProgress.value) {
    smoothUpdateProgress(target)
  }

  // 更新加载文字
  if (resourcesLoaded.value.audio && !resourcesLoaded.value.corpData) {
    loadingText.value = '正在获取军团数据...'
  } else if (loadedCount === totalCount) {
    // 等待进度条到达100%后再显示"加载完成"并隐藏加载页面
    const waitForProgress = () => {
      if (loadingProgress.value >= 99.5) {
        loadingText.value = '加载完成！'
        setTimeout(() => {
          pageLoading.value = false
        }, 200) // 显示"加载完成"后立即切换，只保留200ms的短暂延迟
      } else {
        setTimeout(waitForProgress, 100) // 每100ms检查一次进度
      }
    }
    waitForProgress()
  }
}

// 标记资源加载完成
const markResourceLoaded = (resourceType) => {
  resourcesLoaded.value[resourceType] = true
  checkAllResourcesLoaded()
}

// 监听军团成员数据变化
watch(corpMembers, (newMembers) => {
  // 移除图片加载逻辑
}, { immediate: true })

// 本地存储键名
const CORP_MEMBERS_STORAGE_KEY = 'eve_corp_members_data'
const CORP_MEMBERS_TIMESTAMP_KEY = 'eve_corp_members_timestamp'

// 从本地存储加载军团成员数据
const loadMembersFromStorage = () => {
  try {
    const storedData = localStorage.getItem(CORP_MEMBERS_STORAGE_KEY)
    const timestamp = localStorage.getItem(CORP_MEMBERS_TIMESTAMP_KEY)

    if (storedData && timestamp) {
      const now = Date.now()
      const oneDay = 24 * 60 * 60 * 1000 // 24小时

      // 如果数据不超过24小时，使用本地数据
      if (now - parseInt(timestamp) < oneDay) {
        const members = JSON.parse(storedData)
        console.log('从本地存储加载军团成员数据')
        return members
      }
    }
  } catch (error) {
    console.error('加载本地存储数据失败:', error)
  }
  return null
}

// 保存军团成员数据到本地存储
const saveMembersToStorage = (members) => {
  try {
    localStorage.setItem(CORP_MEMBERS_STORAGE_KEY, JSON.stringify(members))
    localStorage.setItem(CORP_MEMBERS_TIMESTAMP_KEY, Date.now().toString())
    console.log('军团成员数据已保存到本地存储')
  } catch (error) {
    console.error('保存数据到本地存储失败:', error)
  }
}


// 计算两个字符串的余弦相似度
const calculateCosineSimilarity = (str1, str2) => {
  // 将字符串转换为小写并分割成字符数组
  const getCharVector = (str) => {
    const chars = str.toLowerCase().split('')
    const charCount = {}
    chars.forEach(char => {
      charCount[char] = (charCount[char] || 0) + 1
    })
    return charCount
  }

  const vector1 = getCharVector(str1)
  const vector2 = getCharVector(str2)

  // 获取所有唯一字符
  const allChars = new Set([...Object.keys(vector1), ...Object.keys(vector2)])

  // 计算向量的点积和模长
  let dotProduct = 0
  let magnitude1 = 0
  let magnitude2 = 0

  allChars.forEach(char => {
    const count1 = vector1[char] || 0
    const count2 = vector2[char] || 0

    dotProduct += count1 * count2
    magnitude1 += count1 * count1
    magnitude2 += count2 * count2
  })

  // 避免除零错误
  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0
  }

  // 计算余弦相似度
  return dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2))
}

// 检查角色名称是否与已存在的角色相似
const isNameSimilar = (newName, existingMembers, threshold = 0.8) => {
  return existingMembers.some(member => {
    const similarity = calculateCosineSimilarity(newName, member.text)
    return similarity >= threshold
  })
}

// 使用EveWho API获取军团成员信息
const fetchCorporationMembers = async (corpId) => {
  if (!corpId) {
    errorMessage.value = '请输入有效的军团ID'
    return
  }

  // 首先尝试从本地存储加载数据
  const cachedMembers = loadMembersFromStorage()
  if (cachedMembers) {
    corpMembers.value = cachedMembers
    markResourceLoaded('corpData')
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    // 使用EveWho API获取军团成员列表
    const eveWhoResponse = await fetch(`https://evewho.com/api/corplist/${corpId}`)
    if (!eveWhoResponse.ok) {
      throw new Error('无法从EveWho获取军团成员信息，请检查军团ID是否正确')
    }

    const eveWhoData = await eveWhoResponse.json()

    // 检查返回的数据格式 - EveWho API获取军团数组eveWhoData.characters
    let membersList = []
    if (Array.isArray(eveWhoData.characters)) {
      // 直接是数组格式
      membersList = eveWhoData.characters; // 显示所有成员
    } else if (eveWhoData && Array.isArray(eveWhoData.characters)) {
      // 包含characters字段的对象格式
      membersList = eveWhoData.characters;
    } else {
      throw new Error('EveWho API返回的数据格式不正确')
    }
    corpInfo.value.members.total = membersList.length + "+"
    // 构建成员数据并获取头衔信息，同时过滤相似的角色名称
    const members = []

    for (const character of membersList) {
      const characterName = character.name || character.character_name || `角色 ${character.character_id}`

      // 检查角色名称是否与已存在的角色相似（相似度超过80%）
      if (isNameSimilar(characterName, members, 0.8)) {
        console.log(`跳过相似角色: ${characterName}，相似度超过80%`)
        continue
      }

      // 获取角色头衔

      const memberData = {
        image: `/eve-images/characters/${character.character_id}/portrait?size=256`,
        text: characterName,
        characterId: character.character_id,
        fallbackImage: 'https://picsum.photos/256/256?grayscale' // 备用图片
      }

      members.push(memberData)
    }

    // 按角色名称排序
    members.sort((a, b) => {
      const nameA = a.text.toLowerCase()
      const nameB = b.text.toLowerCase()
      return nameA.localeCompare(nameB)
    })

    console.log(`处理完成，共${members.length}个角色（已过滤相似角色）`);
    console.log(members);
    corpMembers.value = members

    // 保存到本地存储
    saveMembersToStorage(members)

  } catch (error) {
    errorMessage.value = error.message || '获取军团信息失败，请稍后重试'

    // 使用默认数据
    const defaultMembers = [

    ]
    corpMembers.value = defaultMembers
    // 移除图片加载标记
  } finally {
    isLoading.value = false
    markResourceLoaded('corpData')
  }
}




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
    filePath: '@/assets/光点舰船树形图.jpg'
  }
])

// 弹框状态
const showModal = ref(false)
const modalContent = ref('')
const modalType = ref('')
const modalTitle = ref('')

const historyInfo = ref({
  title: '光点编年史：',
  subtitle: '催更找院长',
  link: 'https://www.kdocs.cn/l/cqnSw64bxGPh'
})

// 窗口宽度响应式状态
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1200)

// 稳定的字体状态，用于防抖
const stableFont = ref('bold 30px Arial')

// 响应式字体大小计算
const responsiveFont = computed(() => {
  if (windowWidth.value <= 480) {
    return 'bold 20px Arial'
  } else if (windowWidth.value <= 768) {
    return 'bold 24px Arial'
  } else {
    return 'bold 30px Arial'
  }
})

// 字体更新防抖
let fontUpdateTimeout = null
watch(responsiveFont, (newFont) => {
  if (fontUpdateTimeout) {
    clearTimeout(fontUpdateTimeout)
  }
  fontUpdateTimeout = setTimeout(() => {
    stableFont.value = newFont
  }, 500) // 500ms防抖，比CircularGallery内部的300ms更长
})

const canteenInfo = ref({
  title: '光点大饭堂：',
  subtitle: '（投稿找鲨鱼）',
  posts: [
    { title: '你敢不敢？我敢回家的诱惑', author: '我是死亡-1' },
    { title: '我找我自己-2', author: '你敢到我的TSK了吗' },
    { title: '性感飞龙，半夜偷渡速来小队', author: '你的改装舰船' },
    { title: '逆组鬼才', author: '世界第一强势新人' }
  ]
})



// 处理新人指引点击事件
const handleNewbieItemClick = async (item) => {
  modalTitle.value = item.name
  modalType.value = item.fileType
  try {
    if (item.fileType === 'markdown') {
      // 读取markdown文件内容
      const response = await fetch(item.filePath)
      if (response.ok) {
        modalContent.value = await response.text()
      } else {
        modalContent.value = '文件加载失败，请稍后重试。'
      }
    } else if (item.fileType === 'image') {
      // 对于图片，直接使用文件路径
      modalContent.value = item.filePath
    }

    showModal.value = true
  } catch (error) {
    console.error('加载文件失败:', error)
    modalContent.value = '文件加载失败，请稍后重试。'
    showModal.value = true
  }
}

// 关闭弹框
const closeModal = () => {
  showModal.value = false
  modalContent.value = ''
  modalType.value = ''
  modalTitle.value = ''
}

// 窗口大小变化处理
const handleResize = () => {
  windowWidth.value = window.innerWidth
}

onMounted(async () => {
  // 开始缓慢增长进度条
  startInitialProgress()

  // 立即标记音频为已加载（简化处理）
  markResourceLoaded('audio')

  // 获取军团成员信息
  fetchCorporationMembers('98772842')

  // 初始化稳定字体
  stableFont.value = responsiveFont.value

  // 添加窗口大小变化监听
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handleResize)
  }
})

onUnmounted(() => {
  if (progressInterval.value) {
    clearInterval(progressInterval.value)
  }

  // 清理字体更新定时器
  if (fontUpdateTimeout) {
    clearTimeout(fontUpdateTimeout)
  }

  // 移除窗口大小变化监听
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', handleResize)
  }
})
</script>

<template>
  <div class="corp-home">
    <!-- 加载页面 -->
    <Transition name="loading-fade" appear>
      <div v-if="pageLoading" class="loading-overlay">
        <div class="loading-content">
          <!-- 标题栏 -->
          <div class="loading-header">
            <img src="@/assets/光点.png" alt="光点军团Logo" class="loading-logo" />
            <h1 class="loading-title">{{ corpInfo.welcome }}</h1>
            <p class="loading-motto">{{ corpInfo.motto }}</p>
          </div>

          <!-- 进度条 -->
          <div class="loading-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: loadingProgress + '%' }"></div>
            </div>
            <div class="progress-text">{{ loadingText }}</div>
            <div class="progress-percentage">{{ loadingProgress.toFixed(2) }}%</div>
          </div>
      </div>
      </div>
    </Transition>

    <!-- 主要页面内容 - 只有在加载完成后才显示 -->
    <Transition name="content-fade" appear>
      <div v-if="!pageLoading" class="main-content">
        <!-- 顶部欢迎区域 -->
        <WelcomeSection :corp-info="corpInfo" />

        <!-- 主要内容区域 -->
        <div class="content-rows">
        <Row :gutter="24" class="main-row">
          <!-- 左侧列 -->
          <Col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
          <!-- 军团简介 -->
          <Card class="info-card tech-card" title="军团简介">
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
          <!-- 新人指引 -->
          <Card class="info-card tech-card" title="新人指引" style="margin-top: 16px;">
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
          </Col>

          <!-- 中间列 -->
          <Col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
               <StarMapCanvas :star-size="5" :star-glow-size="18" :star-name-font-size="16" :star-info-font-size="11" />
          </Col>

          <!-- 右侧列 -->
          <Col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
          <!-- 光点编年史 -->
          <Card class="info-card tech-card" title="光点编年史">
            <div class="history-section">
              <h3>{{ historyInfo.title }}</h3>
              <p>{{ historyInfo.subtitle }}</p>
              <a :href="historyInfo.link" target="_blank" class="history-link">
                查看编年史文档
              </a>
            </div>
          </Card>
          <Card class="info-card tech-card" title="光点饭堂" style="margin-top: 16px;">

          </Card>
          </Col>
        </Row>
        <Row class="gallery-row">
          <Col span="24">
            <CircularGallery :items="corpMembers" :bend="3" text-color="#ffffff" :border-radius="0.05"
              :font="stableFont" :scroll-speed="2" :scroll-ease="0.05" height="100%" :auto-scroll="true"
              :auto-scroll-speed="-0.1" />
          </Col>
        </Row>
        </div> <!-- content-rows 结束 -->
      </div> <!-- 主要页面内容结束 -->
    </Transition>

    <!-- 文件内容弹框 -->
    <Modal
      v-model="showModal"
      :title="modalTitle"
      :width="modalType === 'image' ? 800 : 600"
      :mask-closable="true"
      @on-cancel="closeModal"
    >
      <div v-if="modalType === 'markdown'" class="modal-content">
        <pre class="markdown-content">{{ modalContent }}</pre>
      </div>
      <div v-else-if="modalType === 'image'" class="modal-content image-content">
        <img :src="modalContent" :alt="modalTitle" class="modal-image" />
      </div>
      <div slot="footer">
        <Button @click="closeModal">关闭</Button>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.corp-home {
  height: 100vh;
  padding: clamp(10px, 2vw, 20px);
  color: #ffffff;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}



.main-content {
  width: 100%;
  margin: 0 auto;
  padding: 0 clamp(10px, 2vw, 20px);
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-rows {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-row {
  flex-shrink: 0;
}

.gallery-row {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.gallery-row :deep(.ivu-row) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.gallery-row :deep(.ivu-col) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.gallery-row .info-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-top: 16px !important;
}

.gallery-row :deep(.ivu-card-body) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.info-card {
  background: transparent !important;
  border: 1px solid rgba(255, 215, 0, 0.2) !important;
  border-radius: 12px !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
}

/* 科技感卡片样式 */
.tech-card {
  background: rgba(255, 255, 255, 0.05) !important;
  backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(255, 215, 0, 0.3) !important;
  border-radius: 0 !important;
  position: relative !important;
  overflow: hidden !important;
}

/* 科技感内角 */
.tech-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 20px;
  height: 20px;
  border-top: 2px solid #00ffff;
  border-left: 2px solid #00ffff;
  z-index: 1;
}

.tech-card::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 20px;
  height: 20px;
  border-top: 2px solid #00ffff;
  border-right: 2px solid #00ffff;
  z-index: 1;
}

.tech-card .ivu-card-body::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 20px;
  height: 20px;
  border-bottom: 2px solid #00ffff;
  border-left: 2px solid #00ffff;
  z-index: 1;
}

.tech-card .ivu-card-body::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: 0;
  width: 20px;
  height: 20px;
  border-bottom: 2px solid #00ffff;
  border-right: 2px solid #00ffff;
  z-index: 1;
}

.info-card :deep(.ivu-card-head) {
  background: linear-gradient(90deg, rgba(255, 215, 0, 0.1), rgba(255, 165, 0, 0.1)) !important;
  border-bottom: 1px solid rgba(255, 215, 0, 0.3) !important;
  color: #ffffff !important;
  font-weight: bold !important;
  font-size: 1.1rem !important;
}

.tech-card :deep(.ivu-card-head) {
  background: linear-gradient(90deg, rgba(0, 255, 255, 0.1), rgba(0, 200, 255, 0.1)) !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.3) !important;
  color: #00ffff !important;
  font-weight: bold !important;
  font-size: 1.1rem !important;
  position: relative;
  z-index: 2;
}

.tech-card :deep(.ivu-card-body) {
  position: relative;
  z-index: 2;
}

.info-card :deep(.ivu-card-head-title) {
  color: #ffffff !important;
}

.info-card :deep(.ivu-card-head) {
  color: #ffffff !important;
}

.info-card :deep(.ivu-card-head *) {
  color: #ffffff !important;
}

.info-card :deep(.ivu-card-body) {
  color: #ffffff !important;
  background: transparent !important;
}

.corp-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  color: #b3d9ff;
  margin-bottom: 4px;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #ffd700;
}

.leadership-info p,
.manufacturer-info p {
  margin-bottom: 8px;
  line-height: 1.5;
}

.fleet-links,
.newbie-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.fleet-link,
.newbie-link {
  display: block;
  padding: 12px 16px;
  background: linear-gradient(45deg, rgba(255, 215, 0, 0.1), rgba(255, 165, 0, 0.1));
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 8px;
  color: #ffd700;
  text-decoration: none;
  transition: all 0.3s ease;
  text-align: center;
}

.fleet-link:hover,
.newbie-link:hover {
  background: linear-gradient(45deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.2));
  border-color: rgba(255, 215, 0, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(255, 215, 0, 0.3);
}

.history-section h3 {
  color: #ffffff;
  margin-bottom: 8px;
}

.history-link {
  display: inline-block;
  margin-top: 12px;
  padding: 8px 16px;
  background: linear-gradient(45deg, #ffd700, #ffb347);
  color: #000;
  text-decoration: none;
  border-radius: 6px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.history-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(255, 215, 0, 0.4);
}

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



/* 加载页面样式 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  text-align: center;
  max-width: 600px;
  padding: 40px;
}

.loading-header {
  margin-bottom: 60px;
}

.loading-logo {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 3px solid #ffd700;
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.6);
  animation: loadingGlow 2s ease-in-out infinite alternate;
  margin-bottom: 20px;
}

.loading-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #e6f3ff;
  margin-bottom: 10px;
  text-shadow: 0 0 20px rgba(230, 243, 255, 0.5);
}

.loading-motto {
  font-size: 1.2rem;
  color: #b3d9ff;
  margin: 0;
  white-space: nowrap;
  overflow: visible;
}

.loading-progress {
  width: 100%;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 15px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffd700, #ffed4e, #ffd700);
  border-radius: 4px;
  transition: width 0.3s ease;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
  animation: progressShine 2s ease-in-out infinite;
}

.progress-text {
  font-size: 1rem;
  color: #e6f3ff;
  margin-bottom: 5px;
}

.progress-percentage {
  font-size: 1.2rem;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

@keyframes loadingGlow {
  from {
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
    transform: scale(1);
  }

  to {
    box-shadow: 0 0 40px rgba(255, 215, 0, 0.8);
    transform: scale(1.05);
  }
}

@keyframes progressShine {

  0%,
  100% {
    background-position: -100% 0;
  }

  50% {
    background-position: 100% 0;
  }
}

/* 过渡动画 */
.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: all 0.8s ease;
}

.loading-fade-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.loading-fade-leave-to {
  opacity: 0;
  transform: scale(1.05);
}

.content-fade-enter-active {
  transition: all 1s ease 0.3s;
  /* 延迟0.3s开始 */
}

.content-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .corp-stats {
    flex-direction: column;
    gap: 1rem;
  }

  .main-content {
    padding: 0 1rem;
  }

  .content-rows {
    gap: 1rem;
  }

  .loading-title {
    font-size: 2rem;
  }

  .loading-content {
    padding: 1.5rem;
  }

  .main-row {
    margin-bottom: 1rem;
  }

  .main-row .ivu-col {
    margin-bottom: 1rem;
  }
}

@media (max-width: 480px) {
  .corp-home {
    padding: 0.5rem;
  }

  .main-content {
    padding: 0 0.5rem;
  }

  .content-rows {
    gap: 0.5rem;
  }

  .gallery-row .info-card {
    margin-top: 0.5rem !important;
  }

  .main-row .ivu-col {
    margin-bottom: 0.5rem;
  }

  .corp-stats {
    gap: 0.5rem;
  }

  .stat-item {
    padding: 0.5rem;
  }

  .leadership-info p,
  .manufacturer-info p {
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }
}

/* 弹框样式 */
.modal-content {
  max-height: 500px;
  overflow-y: auto;
}

.markdown-content {
  white-space: pre-wrap;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.image-content {
  text-align: center;
  padding: 16px;
}

.modal-image {
  max-width: 100%;
  max-height: 500px;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 科技感列表样式 */
.tech-list-item {
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid rgba(0, 255, 255, 0.1) !important;
  background: transparent !important;
}

.tech-list-item:hover {
  background: rgba(0, 255, 255, 0.1) !important;
  transform: translateX(8px);
  border-left: 3px solid #00ffff;
}

.tech-list-item :deep(.ivu-list-item-meta-title) {
  color: #ffffff !important;
  font-size: 14px;
}

.tech-arrow {
  color: #00ffff !important;
  transition: transform 0.3s ease;
}

.tech-list-item:hover .tech-arrow {
  transform: translateX(4px);
}

/* 移除默认列表样式 */
.tech-card :deep(.ivu-list) {
  background: transparent !important;
}

.tech-card :deep(.ivu-list-item) {
  padding: 12px 16px !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.1) !important;
}

.tech-card :deep(.ivu-list-item:last-child) {
  border-bottom: none !important;
}
</style>
