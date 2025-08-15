<template>
  <div id="district-buttons" class="district-buttons">
    <div class="district-left">
      <button 
        class="district-btn district-all" 
        :class="{ active: currentRegion === 'ALL' }"
        @click="selectRegion('ALL')"
      >
        <i class="fas fa-globe-asia"></i>全部区域
      </button>
    </div>
    <div class="district-right">
      <button 
        v-for="code in regionCodes" 
        :key="code"
        class="district-btn"
        :class="{ active: currentRegion === code }"
        @click="selectRegion(code)"
      >
        {{ getRegionName(code) }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useDashboardStore } from '../stores/dashboard'
import { REGION_MAP } from '../utils/constants'

const store = useDashboardStore()

// 计算属性
const currentRegion = computed(() => store.currentRegion)
const regionCodes = computed(() => {
  const codes = Array.from(new Set(
    store.allData.map(row => (row['区代码'] || '').substring(0, 6))
  )).filter(code => code && REGION_MAP[code])
  return codes.sort()
})

// 方法
const getRegionName = (code) => {
  return REGION_MAP[code] || code
}

const selectRegion = (code) => {
  console.log('DistrictButtons: 选择区域', { code })
  store.setCurrentRegion(code)
  
  // 平滑滚动到地图
  requestAnimationFrame(() => {
    setTimeout(() => {
      smoothScrollToMap()
    }, 30)
  })
}

// 平滑滚动到地图区域
const smoothScrollToMap = () => {
  try {
    const mapEl = document.getElementById('echarts-map')
    if (!mapEl) return
    
    const scroller = document.scrollingElement || document.documentElement || document.body
    const currentTop = scroller.scrollTop || window.pageYOffset || 0
    const rect = mapEl.getBoundingClientRect()
    const offset = 72
    const targetTop = rect.top + currentTop - offset
    const maxTop = (scroller.scrollHeight || document.documentElement.scrollHeight || document.body.scrollHeight) - window.innerHeight
    const clamped = Math.max(0, Math.min(targetTop, maxTop))
    
    if (Math.abs(clamped - currentTop) > 4) {
      window.scrollTo({ top: clamped, behavior: 'smooth' })
    }
  } catch (e) {
    // 忽略滚动异常
  }
}

// 动态调整按钮布局
const adjustLayout = () => {
  const container = document.getElementById('district-buttons')
  if (!container) return

  const districtRight = container.querySelector('.district-right')
  if (!districtRight) return

  const windowWidth = window.innerWidth

  if (windowWidth <= 480) {
    districtRight.style.gridTemplateRows = 'repeat(1, auto)'
    districtRight.style.gridAutoFlow = 'row'
    districtRight.style.gap = '6px'
  } else if (windowWidth <= 768) {
    districtRight.style.gridTemplateRows = 'repeat(2, auto)'
    districtRight.style.gridAutoFlow = 'column'
    districtRight.style.gap = '8px 6px'
  } else if (windowWidth <= 980) {
    districtRight.style.gridTemplateRows = 'repeat(2, auto)'
    districtRight.style.gridAutoFlow = 'column'
    districtRight.style.gap = '10px 8px'
  } else if (windowWidth <= 1200) {
    districtRight.style.gridTemplateRows = 'repeat(2, auto)'
    districtRight.style.gridAutoFlow = 'column'
    districtRight.style.gap = '12px 10px'
  } else {
    districtRight.style.gridTemplateRows = 'repeat(2, auto)'
    districtRight.style.gridAutoFlow = 'column'
    districtRight.style.gap = '14px 12px'
  }
}

// 生命周期
onMounted(() => {
  // 初始化时调整布局
  setTimeout(adjustLayout, 100)
  
  // 监听窗口大小变化
  window.addEventListener('resize', adjustLayout)
})

onUnmounted(() => {
  window.removeEventListener('resize', adjustLayout)
})
</script>

<style scoped>
.district-buttons {
  display: grid;
  grid-template-columns: max-content max-content;
  align-items: center;
  justify-content: center;
  column-gap: 12px;
  row-gap: 8px;
  padding: 0 30px 10px 30px;
  margin: 0 0 6px 0;
  transition: all 0.3s ease;
}

.district-left {
  display: flex;
  align-items: center;
}

.district-right {
  display: grid;
  grid-template-rows: repeat(2, auto);
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  gap: 12px 14px;
  justify-content: center;
  transition: all 0.3s ease;
}

.district-btn {
  --accent: #0288d1;
  position: relative;
  padding: 8px 16px 8px 28px;
  border-radius: 20px;
  border: 1px solid #cdeefd;
  background: #ffffff;
  color: #046ea6;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  white-space: nowrap;
  transition: all 0.18s ease;
  box-shadow: 0 1px 2px rgba(2,136,209,0.08);
}

.district-btn::before {
  content: '';
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 2px rgba(2,136,209,0.06);
}

.district-btn:hover {
  border-color: var(--accent);
  box-shadow: 0 4px 10px rgba(2,136,209,0.15);
  transform: translateY(-1px);
  background: #f7fbff;
}

.district-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(2,136,209,0.12);
}

.district-btn.active {
  background: linear-gradient(135deg, var(--accent), #0277bd);
  color: #ffffff;
  border-color: transparent;
  box-shadow: 0 6px 12px rgba(2,136,209,0.25);
}

.district-btn.active::before {
  box-shadow: 0 0 0 2px rgba(255,255,255,0.35);
}

.district-all {
  padding-left: 16px;
  border: none;
  background: linear-gradient(135deg, #4fc3f7 0%, #0288d1 100%);
  color: #fff;
  box-shadow: 0 6px 14px rgba(2,136,209,0.28);
}

.district-all::before {
  display: none;
}

.district-all i {
  margin-right: 6px;
}

.district-all:hover,
.district-all:focus {
  background: linear-gradient(135deg, #4fc3f7 0%, #0288d1 100%);
  color: #fff;
  border: none;
  box-shadow: 0 8px 16px rgba(2,136,209,0.32);
  transform: translateY(-1px);
}

@media (max-width: 1200px) {
  .district-buttons {
    grid-template-columns: 1fr;
    justify-content: center;
    row-gap: 15px;
    padding: 0 20px 10px 20px;
  }
  
  .district-right {
    justify-content: center;
    gap: 10px 12px;
  }
}

@media (max-width: 980px) {
  .district-buttons {
    grid-template-columns: 1fr;
    justify-content: center;
    row-gap: 12px;
    padding: 0 15px 10px 15px;
  }
  
  .district-right {
    justify-content: center;
    gap: 8px 10px;
  }
  
  .district-btn {
    padding: 6px 14px 6px 24px;
    font-size: 13px;
  }
}

@media (max-width: 768px) {
  .district-buttons {
    grid-template-columns: 1fr;
    justify-content: center;
    row-gap: 10px;
    padding: 0 10px 10px 10px;
  }
  
  .district-right {
    justify-content: center;
    gap: 6px 8px;
  }
  
  .district-btn {
    padding: 5px 12px 5px 20px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .district-buttons {
    grid-template-columns: 1fr;
    justify-content: center;
    row-gap: 8px;
    padding: 0 8px 10px 8px;
  }
  
  .district-right {
    justify-content: center;
    gap: 5px 6px;
  }
  
  .district-btn {
    padding: 4px 10px 4px 18px;
    font-size: 11px;
  }
}
</style>
