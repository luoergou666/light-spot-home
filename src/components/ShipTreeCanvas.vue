<template>
  <div class="ship-tree-canvas-container">
    <canvas
      ref="canvas"
      :width="canvasWidth"
      :height="canvasHeight"
      class="ship-tree-canvas"
    ></canvas>
  </div>
</template>

<script>
import logoImage from '@/assets/光点.png'

export default {
  name: 'ShipTreeCanvas',
  props: {
    width: {
      type: Number,
      default: 1200
    },
    height: {
      type: Number,
      default: 800
    }
  },
  data() {
    return {
      canvasWidth: 1200,
      canvasHeight: 800,
      ctx: null,
      // 舰船树形图数据结构
      shipTree: {
        title: '光点舰船树形图',
        levels: [
          {
            name: '护卫舰级别',
            color: '#00ff88',
            ships: [
              { name: '侦察舰', type: 'frigate' },
              { name: '拦截舰', type: 'frigate' },
              { name: '突击舰', type: 'frigate' },
              { name: '电子攻击舰', type: 'frigate' }
            ]
          },
          {
            name: '驱逐舰级别',
            color: '#00ccff',
            ships: [
              { name: '拦截驱逐舰', type: 'destroyer' },
              { name: '指挥驱逐舰', type: 'destroyer' },
              { name: '战术驱逐舰', type: 'destroyer' }
            ]
          },
          {
            name: '巡洋舰级别',
            color: '#ffaa00',
            ships: [
              { name: '重型攻击巡洋舰', type: 'cruiser' },
              { name: '重型拦截巡洋舰', type: 'cruiser' },
              { name: '后勤巡洋舰', type: 'cruiser' },
              { name: '侦察巡洋舰', type: 'cruiser' },
              { name: '战略巡洋舰', type: 'cruiser' }
            ]
          },
          {
            name: '战列巡洋舰',
            color: '#ff6600',
            ships: [
              { name: '攻击型战列巡洋舰', type: 'battlecruiser' },
              { name: '指挥舰', type: 'battlecruiser' }
            ]
          },
          {
            name: '战列舰级别',
            color: '#ff3300',
            ships: [
              { name: '攻击战列舰', type: 'battleship' },
              { name: '黑色行动战列舰', type: 'battleship' }
            ]
          },
          {
            name: '无畏舰级别',
            color: '#cc00ff',
            ships: [
              { name: '无畏舰', type: 'dreadnought' },
              { name: '航空母舰', type: 'carrier' },
              { name: '力场辅助舰', type: 'fax' }
            ]
          },
          {
            name: '超级航母',
            color: '#ffffff',
            ships: [
              { name: '超级航母', type: 'supercarrier' },
              { name: '泰坦', type: 'titan' }
            ]
          }
        ]
      }
    }
  },
  mounted() {
    this.initCanvas()
    this.drawShipTree()
    window.addEventListener('resize', this.handleResize)
  },
  beforeUnmount() {
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
      this.canvasWidth = Math.min(this.width, rect.width - 20)
      this.canvasHeight = Math.min(this.height, (this.canvasWidth * this.height) / this.width)

      const canvas = this.$refs.canvas
      const dpr = window.devicePixelRatio || 1

      canvas.style.width = this.canvasWidth + 'px'
      canvas.style.height = this.canvasHeight + 'px'
      canvas.width = this.canvasWidth * dpr
      canvas.height = this.canvasHeight * dpr

      if (this.ctx) {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0)
        this.ctx.scale(dpr, dpr)
        this.ctx.imageSmoothingEnabled = true
        this.ctx.imageSmoothingQuality = 'high'
        this.drawShipTree()
      }
    },
    drawShipTree() {
      // 清空画布
      this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
      
      // 绘制网格背景
      this.drawGrid()
      
      // 绘制标题
      this.drawTitle()
      
      // 绘制舰船树
      this.drawLevels()
      
      // 绘制军团logo
      this.drawCorpLogo()
    },
    drawGrid() {
      const gridSize = 20
      this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)'
      this.ctx.lineWidth = 0.5
      
      // 绘制垂直线
      for (let x = 0; x <= this.canvasWidth; x += gridSize) {
        this.ctx.beginPath()
        this.ctx.moveTo(x, 0)
        this.ctx.lineTo(x, this.canvasHeight)
        this.ctx.stroke()
      }
      
      // 绘制水平线
      for (let y = 0; y <= this.canvasHeight; y += gridSize) {
        this.ctx.beginPath()
        this.ctx.moveTo(0, y)
        this.ctx.lineTo(this.canvasWidth, y)
        this.ctx.stroke()
      }
    },
    drawTitle() {
      this.ctx.font = 'bold 36px Arial'
      this.ctx.textAlign = 'center'
      this.ctx.fillStyle = '#00ffff'
      this.ctx.shadowColor = 'rgba(0, 255, 255, 0.5)'
      this.ctx.shadowBlur = 10
      this.ctx.fillText(this.shipTree.title, this.canvasWidth / 2, 50)
      this.ctx.shadowColor = 'transparent'
      this.ctx.shadowBlur = 0
    },
    drawLevels() {
      const startY = 100
      const levelHeight = (this.canvasHeight - 200) / this.shipTree.levels.length
      
      this.shipTree.levels.forEach((level, levelIndex) => {
        const y = startY + levelIndex * levelHeight
        
        // 绘制级别标签
        this.drawLevelLabel(level, y)
        
        // 绘制舰船
        this.drawShipsInLevel(level, y, levelHeight)
        
        // 绘制连接线
        if (levelIndex < this.shipTree.levels.length - 1) {
          this.drawConnections(y, y + levelHeight)
        }
      })
    },
    drawLevelLabel(level, y) {
      // 绘制级别标签背景
      this.ctx.fillStyle = level.color
      this.ctx.fillRect(20, y - 15, 120, 30)
      
      // 绘制级别标签文字
      this.ctx.font = 'bold 14px Arial'
      this.ctx.textAlign = 'center'
      this.ctx.fillStyle = '#000000'
      this.ctx.fillText(level.name, 80, y + 5)
    },
    drawShipsInLevel(level, y, levelHeight) {
      const shipWidth = 80
      const shipHeight = 40
      const spacing = (this.canvasWidth - 200) / level.ships.length
      
      level.ships.forEach((ship, shipIndex) => {
        const x = 180 + shipIndex * spacing
        
        // 绘制舰船图标
        this.drawShipIcon(x, y - shipHeight/2, shipWidth, shipHeight, ship, level.color)
        
        // 绘制舰船名称
        this.ctx.font = '12px Arial'
        this.ctx.textAlign = 'center'
        this.ctx.fillStyle = '#ffffff'
        this.ctx.fillText(ship.name, x + shipWidth/2, y + shipHeight/2 + 15)
      })
    },
    drawShipIcon(x, y, width, height, ship, color) {
      // 绘制舰船轮廓
      this.ctx.strokeStyle = color
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
      this.ctx.lineWidth = 2
      
      this.ctx.beginPath()
      this.ctx.roundRect(x, y, width, height, 5)
      this.ctx.fill()
      this.ctx.stroke()
      
      // 根据舰船类型绘制不同的图标
      this.ctx.fillStyle = color
      this.ctx.font = 'bold 10px Arial'
      this.ctx.textAlign = 'center'
      
      const centerX = x + width/2
      const centerY = y + height/2
      
      switch(ship.type) {
        case 'frigate':
          this.drawFrigateIcon(centerX, centerY)
          break
        case 'destroyer':
          this.drawDestroyerIcon(centerX, centerY)
          break
        case 'cruiser':
          this.drawCruiserIcon(centerX, centerY)
          break
        case 'battlecruiser':
          this.drawBattlecruiserIcon(centerX, centerY)
          break
        case 'battleship':
          this.drawBattleshipIcon(centerX, centerY)
          break
        case 'dreadnought':
        case 'carrier':
        case 'fax':
          this.drawCapitalIcon(centerX, centerY)
          break
        case 'supercarrier':
        case 'titan':
          this.drawSuperCapitalIcon(centerX, centerY)
          break
      }
    },
    drawFrigateIcon(x, y) {
      this.ctx.beginPath()
      this.ctx.arc(x, y, 8, 0, Math.PI * 2)
      this.ctx.fill()
    },
    drawDestroyerIcon(x, y) {
      this.ctx.fillRect(x - 10, y - 3, 20, 6)
    },
    drawCruiserIcon(x, y) {
      this.ctx.beginPath()
      this.ctx.moveTo(x - 12, y)
      this.ctx.lineTo(x, y - 8)
      this.ctx.lineTo(x + 12, y)
      this.ctx.lineTo(x, y + 8)
      this.ctx.closePath()
      this.ctx.fill()
    },
    drawBattlecruiserIcon(x, y) {
      this.ctx.fillRect(x - 15, y - 5, 30, 10)
      this.ctx.fillRect(x - 8, y - 12, 16, 8)
    },
    drawBattleshipIcon(x, y) {
      this.ctx.fillRect(x - 18, y - 6, 36, 12)
      this.ctx.fillRect(x - 12, y - 15, 24, 10)
    },
    drawCapitalIcon(x, y) {
      this.ctx.beginPath()
      this.ctx.moveTo(x, y - 15)
      this.ctx.lineTo(x + 15, y)
      this.ctx.lineTo(x, y + 15)
      this.ctx.lineTo(x - 15, y)
      this.ctx.closePath()
      this.ctx.fill()
    },
    drawSuperCapitalIcon(x, y) {
      this.ctx.beginPath()
      this.ctx.moveTo(x, y - 18)
      this.ctx.lineTo(x + 18, y - 6)
      this.ctx.lineTo(x + 12, y + 18)
      this.ctx.lineTo(x - 12, y + 18)
      this.ctx.lineTo(x - 18, y - 6)
      this.ctx.closePath()
      this.ctx.fill()
    },
    drawConnections(startY, endY) {
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
      this.ctx.lineWidth = 1
      
      // 绘制连接线
      for (let i = 0; i < 5; i++) {
        const x = 200 + i * 200
        this.ctx.beginPath()
        this.ctx.moveTo(x, startY + 20)
        this.ctx.lineTo(x, endY - 20)
        this.ctx.stroke()
      }
    },
    drawCorpLogo() {
      const logoSize = 100
      const x = this.canvasWidth - logoSize - 20
      const y = this.canvasHeight - logoSize - 20
      
      // 创建图片对象
      const img = new Image()
      img.onload = () => {
        // 绘制Logo图片
        this.ctx.drawImage(img, x, y, logoSize, logoSize)
      }
      img.src = logoImage
    }
  }
}
</script>

<style scoped>
.ship-tree-canvas-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  background: transparent;
  width: 100%;
  height: 100%;
  min-height: 600px;
}

.ship-tree-canvas {
  width: 100%;
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  transition: transform 0.3s ease;
}

.ship-tree-canvas:hover {
  transform: scale(1.02);
}

@media (max-width: 768px) {
  .ship-tree-canvas-container {
    padding: 5px;
  }
}
</style>