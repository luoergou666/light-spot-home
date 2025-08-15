<template>
  <div class="star-map-canvas-container">
    <canvas
      ref="canvas"
      :width="canvasWidth"
      :height="canvasHeight"
      class="star-map-canvas"
    ></canvas>
  </div>
</template>

<script>
export default {
  name: 'StarMapCanvas',
  props: {
    starSize: {
      type: Number,
      default: 4
    },
    starGlowSize: {
      type: Number,
      default: 15
    }
  },
  data() {
    return {
      canvasWidth: 800,
      canvasHeight: 600,
      ctx: null,
      animationId: null,
      particles: [],
      // 基础星系坐标（相对于800x600的基准尺寸）
      // 字体配置
      fontConfig: {
        starNameFontSize: 14,
        starInfoFontSize: 10
      },
      baseStars: [
        {
          name: 'NJ4X-S',
          x: 200,
          y: 100,
          info: ['集会 2', '避难 6', '废弃老巢 3', '-0.7'],
          securityLevel: -0.7,
          fontSize: {
            name: 18,
            info: 11
          }
        },
        {
          name: 'W-XBGF',
          x: 130,
          y: 250,
          info: [],
          securityLevel: null,
          fontSize: {
            name: 30,
            info: 11
          }
        },
        {
          name: 'W6VP-Y',
          x: 10,
          y: 330,
          info: ['集会 2', '避难 6', '废弃老巢 3', '-0.8'],
          securityLevel: -0.8,
          fontSize: {
            name: 18,
            info: 11
          }
        },
        {
          name: 'IMK-K1',
          x: 300,
          y: 350,
          info: ['集会 2', '避难 6', '废弃老巢 3', '-0.7'],
          securityLevel: -0.7,
          fontSize: {
            name: 18,
            info: 11
          }
        },
        {
          name: 'F-G7BO',
          x: 480,
          y: 250,
          info: ['集会 2', '避难 6', '废弃老巢 3', '-0.6'],
          securityLevel: -0.6,
          fontSize: {
            name: 18,
            info: 11
          }
        },
        {
          name: '2CG-5V',
          x: 600,
          y: 350,
          info: ['集会 2', '避难 6', '废弃老巢 4', '-0.6'],
          securityLevel: -0.6,
          fontSize: {
            name: 18,
            info: 11
          }
        },
        {
          name: 'QFF-O6',
          x: 800,
          y: 280,
          info: ['集会 2', '避难 6', '废弃老巢 3', '-0.5'],
          securityLevel: -0.5,
          fontSize: {
            name: 18,
            info: 11
          }
        }
      ],
      stars: [], // 缩放后的星系坐标
      connections: [
        [0, 4], // NJ4X-S to F-G7BO
        [2, 3], // W6VP-Y to IMK-K1
        [3, 0], // IMK-K1 to F-G7BO
        [4, 5], // F-G7BO to 2CG-5V
        [5, 6]  // 2CG-5V to QFF-O6
      ],
      baseWidth: 800, // 基准宽度
      baseHeight: 600 // 基准高度
    }
  },
  mounted() {
    this.initCanvas()
    this.scaleStars() // 初始化星系坐标
    this.createParticles()
    this.animate()
    window.addEventListener('resize', this.handleResize)
  },
  beforeUnmount() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    initCanvas() {
      const canvas = this.$refs.canvas
      this.ctx = canvas.getContext('2d')
      this.handleResize()
    },
    handleResize() {
      const container = this.$refs.canvas.parentElement
      const rect = container.getBoundingClientRect()
      // 使用容器的实际宽度，减去padding
      this.canvasWidth = rect.width - 20
      // 根据宽度计算高度，保持合适的宽高比
      this.canvasHeight = Math.max(400, this.canvasWidth * 0.75)

      // 设置Canvas尺寸和高DPI支持
      const canvas = this.$refs.canvas
      const dpr = window.devicePixelRatio || 1

      canvas.style.width = this.canvasWidth + 'px'
      canvas.style.height = this.canvasHeight + 'px'
      canvas.width = this.canvasWidth * dpr
      canvas.height = this.canvasHeight * dpr

      if (this.ctx) {
        // 重置变换矩阵并重新设置缩放
        this.ctx.setTransform(1, 0, 0, 1, 0, 0)
        this.ctx.scale(dpr, dpr)
        this.ctx.imageSmoothingEnabled = true
        this.ctx.imageSmoothingQuality = 'high'
      }

      // 重新计算星系坐标
      this.scaleStars()
    },
    scaleStars() {
      // 计算缩放比例，保持星系图居中
      const scaleX = this.canvasWidth / this.baseWidth
      const scaleY = this.canvasHeight / this.baseHeight
      const scale = Math.min(scaleX, scaleY) * 0.8 // 留出一些边距

      // 计算偏移量以居中显示
      const offsetX = (this.canvasWidth - this.baseWidth * scale) / 2
      const offsetY = (this.canvasHeight - this.baseHeight * scale) / 2

      // 缩放所有星系坐标
      this.stars = this.baseStars.map(star => ({
        ...star,
        x: star.x * scale + offsetX,
        y: star.y * scale + offsetY
      }))
    },
    getStarColor(securityLevel) {
      if (securityLevel === null) {
        // W-XBGF 默认颜色
        return { rgb: '#4ecdc4', r: 78, g: 205, b: 196 }
      }

      // 根据安全等级计算颜色，负数越低越红
      const intensity = Math.abs(securityLevel) // 0.5 到 0.8
      const redValue = Math.floor(255 * (intensity - 0.4) / 0.4) // 映射到 0-255
      const greenValue = Math.floor(255 * (0.8 - intensity) / 0.4) // 反向映射
      const blueValue = 100 // 保持一定的蓝色分量

      const r = Math.min(255, Math.max(100, redValue))
      const g = Math.min(255, Math.max(50, greenValue))
      const b = blueValue

      return { rgb: `rgb(${r}, ${g}, ${b})`, r, g, b }
    },
    createParticles() {
      this.particles = []
      // 确保stars数组已经初始化
      if (this.stars.length === 0) {
        this.scaleStars()
      }
      this.stars.forEach(star => {
          const starColor = this.getStarColor(star.securityLevel)
          for (let i = 0; i < 20; i++) {
            this.particles.push({
              x: star.x + (Math.random() - 0.5) * 80,
              y: star.y + (Math.random() - 0.5) * 80,
              vx: (Math.random() - 0.5) * 0.3,
              vy: (Math.random() - 0.5) * 0.3,
              alpha: Math.random() * 0.8 + 0.2,
              size: Math.random() * 1.5 + 0.5,
              color: starColor.rgb,
              centerX: star.x,
              centerY: star.y,
              angle: Math.random() * Math.PI * 2,
              speed: Math.random() * 0.02 + 0.01
            })
          }
        })
    },
    animate() {
      this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight)

      // 绘制标题
      this.drawTitle()

      // 绘制连接线
      this.drawConnections()

      // 绘制粒子
      this.updateAndDrawParticles()

      // 绘制星系点
      this.drawStars()

      // 绘制文字标签
      this.drawLabels()

      this.animationId = requestAnimationFrame(this.animate)
    },
    drawTitle() {
      this.ctx.font = 'bold 28px Arial'
      this.ctx.textAlign = 'center'
      this.ctx.fillStyle = '#ffffff'

      // 添加文字阴影效果（与主页标题一致）
      this.ctx.shadowColor = 'rgba(255, 215, 0, 0.5)'
      this.ctx.shadowBlur = 20
      this.ctx.fillText('光点驻地星系图', this.canvasWidth / 2, 45)

      // 重置阴影
      this.ctx.shadowColor = 'transparent'
      this.ctx.shadowBlur = 0
    },
    drawConnections() {
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
      this.ctx.lineWidth = 2
      this.ctx.beginPath()

      this.connections.forEach(([startIdx, endIdx]) => {
        const start = this.stars[startIdx]
        const end = this.stars[endIdx]
        this.ctx.moveTo(start.x, start.y)
        this.ctx.lineTo(end.x, end.y)
      })

      this.ctx.stroke()
    },
    drawStars() {
      this.stars.forEach(star => {
        const starColor = this.getStarColor(star.securityLevel)

        // 外圈光晕
        const gradient = this.ctx.createRadialGradient(
          star.x, star.y, 0,
          star.x, star.y, this.starGlowSize
        )
        gradient.addColorStop(0, `rgba(${starColor.r}, ${starColor.g}, ${starColor.b}, 0.5)`)
        gradient.addColorStop(1, `rgba(${starColor.r}, ${starColor.g}, ${starColor.b}, 0)`)

        this.ctx.fillStyle = gradient
        this.ctx.beginPath()
        this.ctx.arc(star.x, star.y, this.starGlowSize, 0, Math.PI * 2)
        this.ctx.fill()

        // 星系核心
        this.ctx.fillStyle = starColor.rgb
        this.ctx.beginPath()
        this.ctx.arc(star.x, star.y, this.starSize, 0, Math.PI * 2)
        this.ctx.fill()

        // 内核高光
        this.ctx.fillStyle = '#ffffff'
        this.ctx.beginPath()
        this.ctx.arc(star.x - 1, star.y - 1, this.starSize * 0.375, 0, Math.PI * 2)
        this.ctx.fill()
      })
    },
    drawLabels() {
      this.ctx.textAlign = 'center'

      this.stars.forEach(star => {
        // 设置星系名称字体大小
        this.ctx.font = `bold ${star.fontSize.name}px Arial`

        // 星系名称
        this.ctx.fillStyle = '#ffffff'
        this.ctx.fillText(star.name, star.x, star.y - (this.starGlowSize + 10))

        // 星系信息
        if (star.info.length > 0) {
          this.ctx.font = `${star.fontSize.info}px Arial`
          star.info.forEach((info, index) => {
            const color = info.includes('-') ? '#ff6b6b' : '#cccccc'
            this.ctx.fillStyle = color
            this.ctx.fillText(info, star.x, star.y + (this.starGlowSize + 20) + (index * (star.fontSize.info + 2)))
          })
        }
      })
    },
    updateAndDrawParticles() {
      this.particles.forEach(particle => {
        // 粒子围绕星系中心做圆周运动
        particle.angle += particle.speed
        const radius = 25 + Math.sin(particle.angle * 3) * 10
        particle.x = particle.centerX + Math.cos(particle.angle) * radius
        particle.y = particle.centerY + Math.sin(particle.angle) * radius

        // 更新透明度（呼吸效果）
        particle.alpha = 0.3 + Math.sin(particle.angle * 2) * 0.4
        particle.alpha = Math.max(0.1, Math.min(0.8, particle.alpha))

        // 绘制粒子
        if (particle.color) {
          const rgbMatch = particle.color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
          if (rgbMatch) {
            const [, r, g, b] = rgbMatch
            this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${particle.alpha})`
          } else {
            this.ctx.fillStyle = particle.color
          }
          this.ctx.beginPath()
          this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
          this.ctx.fill()

          // 添加粒子光晕效果
          const glowGradient = this.ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size * 3
          )
          if (rgbMatch) {
            const [, r, g, b] = rgbMatch
            glowGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.25)`)
            glowGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)
          } else {
            glowGradient.addColorStop(0, particle.color + '40')
            glowGradient.addColorStop(1, particle.color + '00')
          }

          this.ctx.fillStyle = glowGradient
          this.ctx.beginPath()
          this.ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2)
          this.ctx.fill()
        }
      })
    }
  }
}
</script>

<style scoped>
.star-map-canvas-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  background: transparent;
  width: 100%;
  height: 100%;
  min-height: 400px;
}

.star-map-canvas {
  width: 100%;
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  transition: transform 0.3s ease;
}

.star-map-canvas:hover {
  transform: scale(1.02);
}

@media (max-width: 768px) {
  .star-map-canvas-container {
    padding: 10px;
  }
}
</style>
