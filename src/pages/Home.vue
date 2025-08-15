<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { Row, Col } from 'view-ui-plus'
import CircularGallery from '../components/CircularGallery.vue'
import StarMapCanvas from '../components/StarMapCanvas.vue'
import WelcomeSection from '../components/WelcomeSection.vue'
import LoadingPage from '@/components/home/LoadingPage.vue'
import CorpIntroduction from '@/components/home/CorpIntroduction.vue'
import NewbieGuide from '@/components/home/NewbieGuide.vue'
import Canteen from '@/components/home/Canteen.vue'
import CustomModal from '@/components/common/CustomModal.vue';
// 页面引用
const loadingPageRef = ref(null);
const modalVisible = ref(false);
const fileData = ref({
  fileType: '',
  name: '',
  filePath: ''
})

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

// 监听军团成员数据变化
watch(corpMembers, (newMembers) => {
  // 移除图片加载逻辑
}, { immediate: true })

// 本地存储键名
const CORP_MEMBERS_STORAGE_KEY = 'eve_corp_members_data'
const CORP_MEMBERS_TIMESTAMP_KEY = 'eve_corp_members_timestamp'
const CHARACTER_IMAGE_CACHE_PREFIX = 'eve_character_image_'

// 图片缓存相关函数
// 下载图片并转换为base64存储
const downloadAndCacheImage = async (imageUrl, characterId) => {
  try {
    // 检查网络连接
    if (!navigator.onLine) {
      console.warn(`角色 ${characterId} 头像下载跳过：网络离线`)
      return null
    }
    
    const response = await fetch(imageUrl, {
      timeout: 10000, // 10秒超时
      headers: {
        'Accept': 'image/*'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const blob = await response.blob()
    
    // 检查文件大小（限制为5MB）
    if (blob.size > 5 * 1024 * 1024) {
      console.warn(`角色 ${characterId} 头像过大 (${blob.size} bytes)，跳过缓存`)
      return null
    }
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        try {
          const base64Data = reader.result
          setCachedImage(characterId, base64Data)
          resolve(base64Data)
        } catch (error) {
          console.error(`角色 ${characterId} base64转换失败:`, error)
          resolve(null)
        }
      }
      reader.onerror = (error) => {
        console.error(`角色 ${characterId} 文件读取失败:`, error)
        resolve(null) // 返回null而不是reject，避免中断流程
      }
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error(`下载角色 ${characterId} 头像失败:`, error)
    return null
  }
}

// 从本地存储获取缓存图片
const getCachedImage = (characterId) => {
  try {
    const cacheKey = CHARACTER_IMAGE_CACHE_PREFIX + characterId
    return localStorage.getItem(cacheKey)
  } catch (error) {
    console.error(`获取角色 ${characterId} 缓存图片失败:`, error)
    return null
  }
}

// 清理旧的图片缓存
const clearOldImageCache = () => {
  try {
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(CHARACTER_IMAGE_CACHE_PREFIX)) {
        keysToRemove.push(key)
      }
    }
    
    // 清理一半的缓存
    const halfLength = Math.floor(keysToRemove.length / 2)
    for (let i = 0; i < halfLength; i++) {
      localStorage.removeItem(keysToRemove[i])
    }
    
    console.log(`已清理 ${halfLength} 个图片缓存`)
  } catch (error) {
    console.error('清理图片缓存失败:', error)
  }
}

// 保存图片到本地存储
const setCachedImage = (characterId, base64Data) => {
  try {
    const cacheKey = CHARACTER_IMAGE_CACHE_PREFIX + characterId
    
    // 检查localStorage可用性和空间
    if (typeof Storage === 'undefined') {
      console.warn('浏览器不支持localStorage，跳过图片缓存')
      return false
    }
    
    // 检查存储空间（简单检测）
    try {
      const testKey = 'storage_test_' + Date.now()
      localStorage.setItem(testKey, 'test')
      localStorage.removeItem(testKey)
    } catch (e) {
      console.warn('localStorage空间不足，清理旧缓存')
      // 清理部分旧的图片缓存
      clearOldImageCache()
    }
    
    localStorage.setItem(cacheKey, base64Data)
    console.log(`角色 ${characterId} 头像已缓存`)
    return true
  } catch (error) {
    console.error(`保存角色 ${characterId} 头像缓存失败:`, error)
    if (error.name === 'QuotaExceededError') {
      console.warn('localStorage存储配额已满，尝试清理缓存')
      clearOldImageCache()
    }
    return false
  }
}

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
const isNameSimilar = (newName, existingMembers, threshold = 0.95) => {
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

      // 检查是否有缓存图片
      const cachedImage = getCachedImage(character.character_id)
      const originalImageUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://images.evetech.net/characters/${character.character_id}/portrait?size=256`)}`
      
      const memberData = {
        image: cachedImage || originalImageUrl, // 优先使用缓存图片
        text: characterName,
        characterId: character.character_id,
        fallbackImage: 'https://picsum.photos/256/256?grayscale' // 备用图片
      }
      
      // 如果没有缓存，异步下载并缓存图片
      if (!cachedImage) {
        downloadAndCacheImage(originalImageUrl, character.character_id).then(base64Data => {
          if (base64Data) {
            // 更新已存在的成员数据中的图片URL
            const existingMember = corpMembers.value.find(member => member.characterId === character.character_id)
            if (existingMember) {
              existingMember.image = base64Data
            }
          }
        }).catch(error => {
          console.error(`异步缓存角色 ${character.character_id} 头像失败:`, error)
        })
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
  } finally {
    isLoading.value = false
  }
}

const handleNewbieItemClick = (item) => {
  // 使用新的fileData结构
  fileData.value = item;
  modalVisible.value = true
  console.log(fileData.value)
}


const historyInfoList = ref([
  {
    name: '光点编年史 -第一章',
    fileType: 'word',
    filePath: '/light-spot-home/docs/光点编年史-第一章.docx'
  },
  {
    name: '光点编年史 -第二章',
    fileType: 'word',
    filePath: '/light-spot-home/docs/光点编年史-第二章.docx'
  }
]);
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

// 窗口大小变化处理
const handleResize = () => {
  windowWidth.value = window.innerWidth
}

onMounted(async () => {
  // 模拟音频资源加载
  setTimeout(() => {
    if (loadingPageRef.value) {
      loadingPageRef.value.markResourceLoaded('audio')
    }
  }, 1000) // 1秒后标记音频加载完成

  // 获取军团成员信息
  try {
    await fetchCorporationMembers('98772842')
    // 军团数据加载完成后标记
    if (loadingPageRef.value) {
      loadingPageRef.value.markResourceLoaded('corpData')
    }
  } catch (error) {
    console.error('获取军团数据失败:', error)
    // 即使失败也标记为完成，避免卡住
    if (loadingPageRef.value) {
      loadingPageRef.value.markResourceLoaded('corpData')
    }
  }

  // 初始化稳定字体
  stableFont.value = responsiveFont.value

  // 添加窗口大小变化监听
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handleResize)
  }
})

onUnmounted(() => {
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
      <LoadingPage
        ref="loadingPageRef"
        v-if="pageLoading"
        :corp-info="corpInfo"
        @loaded="pageLoading = false"
      />
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
              <CorpIntroduction :corp-info="corpInfo" />
              <!-- 新人指引 -->
              <NewbieGuide />
            </Col>

          <!-- 中间列 -->
          <Col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
               <StarMapCanvas :star-size="5" :star-glow-size="18" :star-name-font-size="16" :star-info-font-size="11" />
          </Col>

          <!-- 右侧列 -->
          <Col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
          <!-- 光点编年史 -->
          <Card class="info-card tech-card">
            <template #title>
              <div class="card-title-container">
                <h3 class="card-title-text">{{ '光点编年史（催更找院长）' }}</h3>
              </div>
            </template>
            <div class="history-section" v-for="item in historyInfoList" :key="item.name">
              <a @click="handleNewbieItemClick(item)" target="_blank" class="history-link">
                {{item.name}}
              </a>
            </div>
          </Card>
          <!-- 光点饭堂 -->
          <Canteen />
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

    <!-- 弹框 -->
    <CustomModal
      :visible="modalVisible"
      :fileData="fileData"
      @close="modalVisible = false"
    />

    <!-- 弹框逻辑已迁移到各个子组件中 -->
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



/* 页面特有样式 - 公共卡片样式已移至 main.css */

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
  display: block;
  width: 100%;
  margin-top: 12px;
  padding: 8px 16px;
  background: linear-gradient(45deg, #ffd700, #ffb347);
  color: #000;
  text-decoration: none;
  border-radius: 6px;
  font-weight: bold;
  transition: all 0.3s ease;
  text-align: center;
  box-sizing: border-box;
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



/* 加载页面样式已迁移到 LoadingPage.vue */

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

  .main-row .ivu-col {
    margin-bottom: 0.5rem;
  }
}
</style>
