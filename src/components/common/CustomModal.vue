<template>
  <div v-if="visible" class="custom-modal-overlay" @click="handleOverlayClick">
    <div
      ref="modalRef"
      class="custom-modal"
      :style="modalStyle"
      @click.stop
    >
      <!-- 四角L形装饰 -->
      <div class="modal-corner modal-corner-top-left"></div>
      <div class="modal-corner modal-corner-top-right"></div>
      <div class="modal-corner modal-corner-bottom-left"></div>
      <div class="modal-corner modal-corner-bottom-right"></div>

      <!-- 标题栏 -->
      <div v-if="displayTitle" class="modal-header" @mousedown="handleMouseDown">
        <div class="modal-title">{{ displayTitle }}</div>
        <div v-if="closable" class="modal-close" @click="handleClose">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
      </div>

      <!-- 关闭按钮（无标题时显示） -->
      <div v-if="!displayTitle && closable" class="modal-close" @click="handleClose">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>

      <!-- 内容区域 -->
      <div class="modal-content" :class="{ 'has-scroll': hasScroll }">
        <!-- 统一加载动画 -->
        <div v-if="shouldShowLoading" class="file-loading">
          <div class="loading-container">
            <!-- 外圈旋转动画 -->
            <div class="loading-spinner-outer"></div>
            <!-- 内圈脉冲动画 -->
            <div class="loading-spinner-inner"></div>
          </div>
          <div class="loading-text">
            <p class="loading-title">正在加载文件...</p>
            <p class="loading-subtitle">{{ currentTitle || '请稍候' }}</p>
          </div>

        </div>

        <!-- 统一错误显示 -->
        <div v-else-if="shouldShowError" class="file-error">
          <div class="error-icon-container">
            <div class="error-icon">⚠️</div>
            <div class="error-icon-bg"></div>
          </div>
          <div class="error-text">
            <p class="error-title">文件加载失败</p>
            <p class="error-message">{{ loadError || '文件加载失败' }}</p>
          </div>
          <button
            @click="loadFile"
            class="error-retry-btn"
          >
            重试
          </button>
        </div>

        <!-- 新的文件内容显示（基于fileData） -->
        <template v-else-if="props.fileData?.fileType && shouldShowContent">
          <!-- 图片内容 -->
          <div v-if="currentFileType === 'image'" class="modal-image-container" :style="imageContainerStyle">
            <img
              :src="fileContent"
              :alt="displayTitle"
              @load="handleImageLoad"
              @error="handleImageError"
            />
          </div>

          <!-- Markdown内容 -->
          <div v-else-if="currentFileType === 'markdown'" class="modal-markdown" v-html="fileContent"></div>

          <!-- Word文档内容 -->
          <div v-else-if="currentFileType === 'word'" class="modal-word">
            <div class="word-content" v-html="fileContent"></div>
          </div>
        </template>

        <!-- 兼容旧版本的内容显示 -->
        <template v-else>
          <!-- 图片内容 -->
          <div v-if="imageUrl" class="modal-image-container" :style="imageContainerStyle">
            <img
              :src="imageUrl"
              :alt="imageAlt || 'Modal Image'"
              @load="handleImageLoad"
              @error="handleImageError"
            />
          </div>

          <!-- Markdown内容 -->
          <div v-else-if="markdownContent" class="modal-markdown" v-html="renderedMarkdown"></div>

          <!-- Word文档内容 -->
          <div v-else-if="wordUrl || wordContent" class="modal-word">
            <div v-if="wordLoading" class="word-loading">
              <div class="loading-spinner"></div>
              <p>正在加载Word文档...</p>
            </div>
            <div v-else-if="wordError" class="word-error">
              <p>Word文档加载失败</p>
            </div>
            <div v-else class="word-content" v-html="wordHtmlContent"></div>
          </div>

          <!-- 插槽内容 -->
          <div v-else class="modal-slot">
            <slot></slot>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue'
import { marked } from 'marked'
import mammoth from 'mammoth'

// Props定义
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  width: {
    type: [String, Number],
    default: 'auto'
  },
  height: {
    type: [String, Number],
    default: 'auto'
  },
  imageWidth: {
    type: [String, Number],
    default: 'auto'
  },
  imageHeight: {
    type: [String, Number],
    default: 'auto'
  },
  wordWidth: {
    type: [String, Number],
    default: 794
  },
  maskClosable: {
    type: Boolean,
    default: true
  },
  // 主要的fileData prop
  fileData: {
    type: Object,
    default: null,
    validator: (value) => {
      if (!value) return true
      return value.fileType && value.name && value.filePath
    }
  },
  // 保留旧props以确保兼容性（标记为废弃）
  imageUrl: {
    type: String,
    default: '',
    // 废弃警告
    validator: (value) => {
      if (value) {
        console.warn('imageUrl prop is deprecated. Use fileData instead.')
      }
      return true
    }
  },
  imageAlt: {
    type: String,
    default: ''
  },
  markdownContent: {
    type: String,
    default: '',
    validator: (value) => {
      if (value) {
        console.warn('markdownContent prop is deprecated. Use fileData instead.')
      }
      return true
    }
  },
  wordUrl: {
    type: String,
    default: '',
    validator: (value) => {
      if (value) {
        console.warn('wordUrl prop is deprecated. Use fileData instead.')
      }
      return true
    }
  },
  wordContent: {
    type: [ArrayBuffer, Blob],
    default: null,
    validator: (value) => {
      if (value) {
        console.warn('wordContent prop is deprecated. Use fileData instead.')
      }
      return true
    }
  },
  closable: {
    type: Boolean,
    default: true
  }
})

// Emits定义
const emit = defineEmits(['update:visible', 'close'])

// 响应式数据
const modalRef = ref(null)
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
const modalPosition = ref({ x: 0, y: 0 })
const modalSize = ref({ width: 0, height: 0 })
const hasScroll = ref(false)

// 文件处理相关状态
const isLoading = ref(false)
const loadError = ref('')
const fileContent = ref('')
const currentFileType = ref('')
const currentTitle = ref('')

// 兼容旧版本的状态
const imageLoaded = ref(false)
const imageError = ref(false)
const wordHtmlContent = ref('')
const wordLoading = ref(false)
const wordError = ref(false)

// 计算属性
const renderedMarkdown = computed(() => {
  if (!props.markdownContent) return ''
  return marked(props.markdownContent)
})

// 新的文件处理计算属性
const displayTitle = computed(() => {
  if (props.fileData?.name) {
    return props.fileData.name
  }
  return props.title || currentTitle.value
})

const shouldShowContent = computed(() => {
  // 如果使用新的fileData prop
  if (props.fileData?.fileType) {
    return !isLoading.value && !loadError.value
  }
  // 兼容旧版本
  return true
})

const shouldShowLoading = computed(() => {
  if (props.fileData?.fileType) {
    return isLoading.value
  }
  // 兼容旧版本的word加载状态
  return wordLoading.value
})

const shouldShowError = computed(() => {
  if (props.fileData?.fileType) {
    return !!loadError.value
  }
  // 兼容旧版本
  return wordError.value
})

const imageContainerStyle = computed(() => {
  const style = {}
  
  // 如果外部传入了imageWidth，使用外部的值，否则使用auto
  if (props.imageWidth && props.imageWidth !== 'auto') {
    style.width = typeof props.imageWidth === 'number' ? `${props.imageWidth}px` : props.imageWidth
  }
  
  // 如果外部传入了imageHeight，使用外部的值，否则使用auto
  if (props.imageHeight && props.imageHeight !== 'auto') {
    style.height = typeof props.imageHeight === 'number' ? `${props.imageHeight}px` : props.imageHeight
  }
  
  return style
})

const modalStyle = computed(() => {
  const style = {
    transform: `translate(calc(-50% + ${modalPosition.value.x}px), calc(-50% + ${modalPosition.value.y}px))`
  }

  // Markdown内容或Word文档特殊尺寸设置
  if (props.fileData?.fileType === 'markdown' || props.fileData?.fileType === 'word' || props.markdownContent || props.wordUrl || props.wordContent) {
    // Word文档宽度：使用wordWidth参数或默认794px（A4纸张宽度）
    const wordWidthValue = typeof props.wordWidth === 'number' ? `${props.wordWidth}px` : props.wordWidth
    style.width = wordWidthValue
    // 高度为视口高度减去上下各20px边距
    style.height = `${window.innerHeight - 40}px`
    // 确保弹窗不超出视口边界
    style.maxHeight = `${window.innerHeight - 40}px`
  } else if (props.fileData?.fileType === 'image' || props.imageUrl) {
    // 图片内容的尺寸控制 - 设置固定尺寸防止超出
    const maxWidth = window.innerWidth * 0.9
    const maxHeight = window.innerHeight * 0.9
    
    // 设置固定宽高而不是最大宽高，防止内容撑大弹窗
    if (props.width && props.height) {
      const customWidth = typeof props.width === 'number' ? props.width : parseInt(props.width)
      const customHeight = typeof props.height === 'number' ? props.height : parseInt(props.height)
      style.width = `${Math.min(customWidth, maxWidth)}px`
      style.height = `${Math.min(customHeight, maxHeight)}px`
    } else {
      // 默认图片弹窗尺寸
      style.width = `${Math.min(800, maxWidth)}px`
      style.height = `${Math.min(600, maxHeight)}px`
    }
    
    // 添加overflow控制，确保内容不会溢出
    style.overflow = 'hidden'
  } else {
    // 其他内容的自定义宽高
    const maxWidth = window.innerWidth * 0.9
    const maxHeight = window.innerHeight * 0.9
    
    style.maxWidth = `${maxWidth}px`
    style.maxHeight = `${maxHeight}px`
    
    if (props.width) {
      style.width = typeof props.width === 'number' ? `${props.width}px` : props.width
    }
    if (props.height) {
      style.height = typeof props.height === 'number' ? `${props.height}px` : props.height
    }
  }

  return style
})

// 方法
const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}

const handleOverlayClick = () => {
  if (props.maskClosable) {
    handleClose()
  }
}

const handleMouseDown = (e) => {
  // 只允许通过标题栏拖拽
  if (!e.target.closest('.modal-header')) {
    return
  }

  isDragging.value = true
  // 记录鼠标相对于弹窗当前位置的偏移
  dragOffset.value = {
    x: e.clientX - modalPosition.value.x,
    y: e.clientY - modalPosition.value.y
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  e.preventDefault()
}

const handleMouseMove = (e) => {
  if (!isDragging.value) return

  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const modalWidth = modalRef.value.offsetWidth
  const modalHeight = modalRef.value.offsetHeight

  // 计算新位置（基于鼠标位置减去初始偏移）
  let newX = e.clientX - dragOffset.value.x
  let newY = e.clientY - dragOffset.value.y

  // 边界限制（确保弹窗不会完全移出视口）
  const margin = 20
  const minX = -(modalWidth - margin)
  const maxX = viewportWidth - margin
  const minY = -(modalHeight - margin)
  const maxY = viewportHeight - margin

  newX = Math.max(minX, Math.min(newX, maxX))
  newY = Math.max(minY, Math.min(newY, maxY))

  modalPosition.value = { x: newX, y: newY }
}

const handleMouseUp = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}

const handleImageLoad = (e) => {
  imageLoaded.value = true
  imageError.value = false
  // 图片加载完成后更新弹窗尺寸
  nextTick(() => {
    updateModalSize()
  })
}

const handleImageError = () => {
  imageError.value = true
  imageLoaded.value = false
}

// 新的统一文件处理方法
const loadFile = async () => {
  if (!props.fileData?.fileType || !props.fileData?.filePath) return

  isLoading.value = true
  loadError.value = ''
  currentFileType.value = props.fileData.fileType
  currentTitle.value = props.fileData.name

  try {
    const filePath = props.fileData.filePath

    if (props.fileData.fileType === 'image') {
      // 图片文件直接设置路径
      fileContent.value = filePath
    } else if (props.fileData.fileType === 'markdown') {
      // 加载Markdown文件
      const response = await fetch(filePath)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const markdownText = await response.text()
      fileContent.value = marked(markdownText)
    } else if (props.fileData.fileType === 'word') {
      // 加载Word文档
      const response = await fetch(filePath)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const arrayBuffer = await response.arrayBuffer()
      const result = await mammoth.convertToHtml({ arrayBuffer })
      fileContent.value = result.value

      if (result.messages.length > 0) {
        console.warn('Word document conversion warnings:', result.messages)
      }
    } else {
      throw new Error(`Unsupported file type: ${props.fileData.fileType}`)
    }

  } catch (error) {
    console.error('Error loading file:', error)
    loadError.value = `文件加载失败: ${error.message}`
  } finally {
    isLoading.value = false
    // 加载完成后更新弹窗尺寸
    nextTick(() => {
      updateModalSize()
    })
  }
}

// Word文档处理方法（保留以兼容旧版本）
const loadWordDocument = async () => {
  if (!props.wordUrl && !props.wordContent) return

  wordLoading.value = true
  wordError.value = false

  try {
    let arrayBuffer

    if (props.wordUrl) {
      // 从URL加载Word文档
      const response = await fetch(props.wordUrl)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      arrayBuffer = await response.arrayBuffer()
    } else if (props.wordContent) {
      // 直接使用提供的内容（假设是ArrayBuffer或Blob）
      if (props.wordContent instanceof ArrayBuffer) {
        arrayBuffer = props.wordContent
      } else if (props.wordContent instanceof Blob) {
        arrayBuffer = await props.wordContent.arrayBuffer()
      } else {
        throw new Error('Word content must be ArrayBuffer or Blob')
      }
    }

    // 使用mammoth将docx转换为HTML
    const result = await mammoth.convertToHtml({ arrayBuffer })
    wordHtmlContent.value = result.value

    // 如果有警告，可以在控制台输出
    if (result.messages.length > 0) {
      console.warn('Word document conversion warnings:', result.messages)
    }

  } catch (error) {
    console.error('Error loading Word document:', error)
    wordError.value = true
  } finally {
    wordLoading.value = false
    // 加载完成后更新弹窗尺寸
    nextTick(() => {
      updateModalSize()
    })
  }
}

const updateModalSize = async () => {
  await nextTick()
  if (!modalRef.value) return

  const content = modalRef.value.querySelector('.modal-content')
  if (!content) return

  if (props.fileData?.fileType === 'markdown' || props.fileData?.fileType === 'word' || props.markdownContent || props.wordUrl || props.wordContent) {
    // Markdown和Word内容特殊处理 - 与modalStyle保持一致
    const viewportHeight = window.innerHeight
    const headerHeight = modalRef.value.querySelector('.modal-header')?.offsetHeight || 0
    const modalPadding = 40 // 弹窗本身的padding
    const viewportMargin = 40 // 视口上下边距 (20px * 2)

    // 计算可用高度：视口高度 - 视口边距 - 标题栏高度 - 弹窗padding
    const availableHeight = viewportHeight - viewportMargin - headerHeight - modalPadding

    // 设置内容区域的最大高度并启用滚动
    content.style.maxHeight = `${availableHeight}px`
    content.style.overflowY = 'auto'
    hasScroll.value = true
  } else {
    // 非markdown/word内容的原有逻辑
    const viewportHeight = window.innerHeight
    const margin = 80 // 上下边距
    const maxHeight = viewportHeight - margin

    // 检查是否需要滚动条
    if (content.scrollHeight > maxHeight) {
      hasScroll.value = true
      content.style.maxHeight = `${maxHeight}px`
      content.style.overflowY = 'auto'
    } else {
      hasScroll.value = false
      content.style.maxHeight = 'none'
      content.style.overflowY = 'hidden'
    }
  }
}

const resetPosition = () => {
  modalPosition.value = { x: 0, y: 0 }
}

// 监听器
watch(() => props.visible, (newVal) => {
  if (newVal) {
    resetPosition()
    // 如果有新的fileData，优先使用新的加载方法
    if (props.fileData?.fileType) {
      loadFile()
    } else if (props.wordUrl || props.wordContent) {
      // 兼容旧版本的Word文档加载
      loadWordDocument()
    } else {
      nextTick(() => {
        updateModalSize()
      })
    }
  }
})

// 监听新的fileData prop变化
watch(() => props.fileData, (newFileData) => {
  if (newFileData && props.visible) {
    loadFile()
  }
}, { immediate: true, deep: true })

watch(() => props.markdownContent, () => {
  if (props.visible) {
    nextTick(() => {
      updateModalSize()
    })
  }
})

watch(() => [props.wordUrl, props.wordContent], () => {
  if (props.visible && (props.wordUrl || props.wordContent)) {
    loadWordDocument()
  }
}, { deep: true })

// 生命周期
onMounted(() => {
  console.log(props.fileData);
  window.addEventListener('resize', updateModalSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateModalSize)
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
})
</script>

<style scoped>
.custom-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.custom-modal {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(148, 163, 184, 0.2);
  min-width: 300px;
  min-height: 200px;
  max-width: 90vw;
  max-height: 90vh;
  user-select: none;
  /* 确保所有内容都不会超出弹窗边界 */
  overflow: hidden;
  box-sizing: border-box;
}

/* 加载动画样式 */
.file-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  min-height: 200px;
}

.loading-container {
  position: relative;
  margin-bottom: 1.5rem;
}

.loading-spinner-outer {
  width: 4rem;
  height: 4rem;
  border: 4px solid rgba(255, 215, 0, 0.2);
  border-top: 4px solid rgb(255, 215, 0);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-spinner-inner {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  right: 0.5rem;
  bottom: 0.5rem;
  background: rgba(255, 215, 0, 0.1);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.loading-text {
  margin-bottom: 1rem;
}

.loading-title {
  color: rgb(255, 215, 0);
  font-weight: 500;
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
}

.loading-subtitle {
  color: rgba(255, 215, 0, 0.7);
  font-size: 0.875rem;
}

.loading-progress {
  width: 12rem;
  height: 0.25rem;
  background: rgba(255, 215, 0, 0.2);
  border-radius: 9999px;
  overflow: hidden;
}

.loading-progress-bar {
  height: 100%;
  background: linear-gradient(to right, rgb(255, 215, 0), rgb(255, 235, 59));
  border-radius: 9999px;
  animation: pulse 2s ease-in-out infinite;
}

/* 错误状态样式 */
.file-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  min-height: 200px;
}

.error-icon-container {
  position: relative;
  margin-bottom: 1.5rem;
}

.error-icon {
  font-size: 3.75rem;
  animation: bounce 1s infinite;
}

.error-icon-bg {
  position: absolute;
  inset: -0.5rem;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 50%;
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.error-text {
  margin-bottom: 1.5rem;
}

.error-title {
  color: rgb(239, 68, 68);
  font-weight: 500;
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
}

.error-message {
  color: rgba(239, 68, 68, 0.7);
  font-size: 0.875rem;
  max-width: 24rem;
}

.error-retry-btn {
  padding: 0.5rem 1.5rem;
  background: rgba(239, 68, 68, 0.2);
  color: rgb(239, 68, 68);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.5rem;
  transition: all 0.2s;
  cursor: pointer;
}

.error-retry-btn:hover {
  background: rgba(239, 68, 68, 0.3);
  border-color: rgba(239, 68, 68, 0.5);
}

.custom-modal:hover {
  border-color: rgba(148, 163, 184, 0.4);
}

/* 四角L形装饰 */
.modal-corner {
  position: absolute;
  width: 20px;
  height: 20px;
  pointer-events: none;
}

.modal-corner::before,
.modal-corner::after {
  content: '';
  position: absolute;
  background: #ffd700;
  box-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
}

.modal-corner-top-left {
  top: -1px;
  left: -1px;
}

.modal-corner-top-left::before {
  top: 0;
  left: 0;
  width: 2px;
  height: 20px;
}

.modal-corner-top-left::after {
  top: 0;
  left: 0;
  width: 20px;
  height: 2px;
}

.modal-corner-top-right {
  top: -1px;
  right: -1px;
}

.modal-corner-top-right::before {
  top: 0;
  right: 0;
  width: 2px;
  height: 20px;
}

.modal-corner-top-right::after {
  top: 0;
  right: 0;
  width: 20px;
  height: 2px;
}

.modal-corner-bottom-left {
  bottom: -1px;
  left: -1px;
}

.modal-corner-bottom-left::before {
  bottom: 0;
  left: 0;
  width: 2px;
  height: 20px;
}

.modal-corner-bottom-left::after {
  bottom: 0;
  left: 0;
  width: 20px;
  height: 2px;
}

.modal-corner-bottom-right {
  bottom: -1px;
  right: -1px;
}

.modal-corner-bottom-right::before {
  bottom: 0;
  right: 0;
  width: 2px;
  height: 20px;
}

.modal-corner-bottom-right::after {
  bottom: 0;
  right: 0;
  width: 20px;
  height: 2px;
}

/* 标题栏 */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.1));
  border-bottom: 1px solid rgba(255, 215, 0, 0.3);
  cursor: move;
  user-select: none;
  position: relative;
}

.modal-header:hover {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 215, 0, 0.15));
}

.modal-header::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.1), transparent);
  pointer-events: none;
}

.modal-title {
  color: #ffd700;
  font-size: 16px;
  font-weight: 600;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

/* 关闭按钮 */
.modal-close {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 4px;
  color: #94a3b8;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.5);
  border-color: rgba(148, 163, 184, 0.4);
  color: #ffd700;
}

/* 无标题时的关闭按钮位置 */
.custom-modal > .modal-close {
  position: absolute;
  top: 10px;
  right: 10px;
}

/* 内容区域 */
.modal-content {
  padding: 20px;
  color: #e2e8f0;
  overflow: hidden;
  cursor: default;
}

.modal-content.has-scroll {
  overflow-y: auto;
}

/* 滚动条样式 */
.modal-content::-webkit-scrollbar {
  width: 6px;
}

.modal-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
}

.modal-content::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 3px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.5);
}

/* 图片容器 */
.modal-image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid rgba(255, 215, 0, 0.2);
  overflow: hidden;
  box-sizing: border-box;
}

.modal-image-container img {
  /* 根据传入的imageWidth/imageHeight参数设置尺寸，未传入时自适应 */
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  display: block;
  /* 确保图片绝对不会超出容器 */
  box-sizing: border-box;
}

/* Markdown内容 */
.modal-markdown {
  line-height: 1.6;
  font-size: 14px;
}

.modal-markdown h1,
.modal-markdown h2,
.modal-markdown h3,
.modal-markdown h4,
.modal-markdown h5,
.modal-markdown h6 {
  color: #ffd700;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

.modal-markdown p {
  margin-bottom: 1em;
}

.modal-markdown code {
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}

.modal-markdown pre {
  background: rgba(0, 0, 0, 0.3);
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 1em 0;
}

.modal-markdown blockquote {
  border-left: 3px solid #ffd700;
  padding-left: 12px;
  margin: 1em 0;
  color: #94a3b8;
}

.modal-markdown ul,
.modal-markdown ol {
  padding-left: 20px;
  margin-bottom: 1em;
}

.modal-markdown li {
  margin-bottom: 0.5em;
}

/* Word文档样式 */
.modal-word {
  padding: 16px;
  color: #e2e8f0;
  line-height: 1.6;
  width: 100%; /* 响应父容器的动态宽度设置 */
  max-height: calc(100vh - 40px); /* 视口高度减去上下边距 */
  overflow-y: auto; /* 允许垂直滚动 */
  overflow-x: hidden; /* 禁用水平滚动 */
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 8px;
  box-sizing: border-box;
  /* 隐藏滚动条但保持滚动功能 */
  -webkit-scrollbar: none; /* Webkit浏览器 */
  -ms-overflow-style: none; /* IE/Edge */
  scrollbar-width: none; /* Firefox */
}

.word-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #94a3b8;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(148, 163, 184, 0.2);
  border-top: 3px solid #ffd700;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(-25%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}

@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

.word-error {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #ef4444;
  text-align: center;
}

.word-content {
  color: #e2e8f0;
  line-height: 1.6;
}

/* Word文档内容样式优化 */
.word-content {
  /* 移除overflow限制，允许内容正常显示 */
}

.word-content h1,
.word-content h2,
.word-content h3,
.word-content h4,
.word-content h5,
.word-content h6 {
  color: #ffd700;
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
}

.word-content h1 {
  font-size: 2em;
  border-bottom: 2px solid rgba(255, 215, 0, 0.3);
  padding-bottom: 8px;
}

.word-content h2 {
  font-size: 1.5em;
}

.word-content h3 {
  font-size: 1.25em;
}

.word-content p {
  margin-bottom: 16px;
  text-align: justify;
}

.word-content ul,
.word-content ol {
  margin-bottom: 16px;
  padding-left: 24px;
}

.word-content li {
  margin-bottom: 8px;
}

.word-content table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
  border: 1px solid rgba(148, 163, 184, 0.3);
}

.word-content th,
.word-content td {
  padding: 8px 12px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  text-align: left;
}

.word-content th {
  background: rgba(255, 215, 0, 0.1);
  color: #ffd700;
  font-weight: 600;
}

.word-content strong {
  color: #ffd700;
  font-weight: 600;
}

.word-content em {
  color: #94a3b8;
  font-style: italic;
}

.word-content code {
  background: rgba(148, 163, 184, 0.1);
  color: #ffd700;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}

.word-content blockquote {
  border-left: 4px solid #ffd700;
  padding-left: 16px;
  margin: 16px 0;
  color: #94a3b8;
  font-style: italic;
}

/* 图片样式优化 */
.modal-image {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
}

.modal-image img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

/* 插槽内容 */
.modal-slot {
  min-height: 100px;
}
</style>
