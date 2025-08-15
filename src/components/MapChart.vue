<template>
  <div class="echarts-card">
    <div id="region-filter-box" class="region-filter-box">
      <i class="fas fa-filter"></i>
      <label for="region-filter">行政区筛选：</label>
      <select id="region-filter" v-model="selectedRegion" @change="onRegionFilterChange">
        <option value="ALL">全部</option>
        <option v-for="code in regionCodes" :key="code" :value="code">
          {{ getRegionName(code) }}
        </option>
      </select>
    </div>
    
    <div id="echarts-map"></div>
    
    <div id="highlight-counter" class="highlight-counter" v-show="showHighlightCounter">
      - 存在交易的街道数量为：<span id="highlight-count">{{ highlightCount }}</span>
    </div>
    
    <div id="legend-note" class="legend-note" v-show="showLegendNote">
      - 灰色部分为未涉及交易的区域
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useDashboardStore } from '../stores/dashboard'
import { REGION_MAP, DISTRICT_COLORS } from '../utils/constants'
import { MAP_DATA_URL } from '../config/api'
import * as echarts from 'echarts'

const store = useDashboardStore()
let chart = null
let allStreetData = []
let districtOption = null

// 响应式数据
const selectedRegion = ref('ALL')
const showHighlightCounter = ref(false)
const showLegendNote = ref(false)
const highlightCount = ref(0)

// 计算属性
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

const onRegionFilterChange = () => {
  console.log('MapChart: 筛选器变化', { 
    selectedRegion: selectedRegion.value,
    chartExists: !!chart,
    storeCurrentRegion: store.currentRegion
  })
  
  // 先更新store
  store.setCurrentRegion(selectedRegion.value)
  
  // 等待store更新完成后再更新地图
  setTimeout(() => {
    console.log('MapChart: 准备更新地图', { 
      selectedRegion: selectedRegion.value,
      storeCurrentRegion: store.currentRegion,
      chartExists: !!chart
    })
    
    if (chart) {
      updateMapForRegion(selectedRegion.value)
    } else {
      console.warn('MapChart: 图表未初始化，无法更新')
    }
  }, 100) // 增加延迟，确保store更新完成
}

// 获取区县颜色
const getDistrictColor = (name) => {
  return DISTRICT_COLORS[name] || '#BFC9CA'
}

// 初始化地图
const initMap = async () => {
  try {
    console.log('开始加载地图数据...')
    // 使用后端服务器的URL来加载地图数据
    const response = await fetch(MAP_DATA_URL)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const geoJson = await response.json()
    console.log('地图数据加载成功:', geoJson.features?.length || 0, '个要素')
    
    const xianDistricts = geoJson.features.filter(feature =>
      feature.properties && feature.properties.市 === '西安市' && feature.properties.区
    )
    
    console.log('西安市区县数量:', xianDistricts.length)
    
    allStreetData = geoJson.features.filter(feature =>
      feature.properties && feature.properties.市 === '西安市'
    )
    
    if (xianDistricts.length === 0) {
      throw new Error('未找到西安市区县数据')
    }
    
    const xianGeoJson = {
      type: 'FeatureCollection',
      features: xianDistricts
    }
    
    xianGeoJson.features.forEach(feature => {
      if (feature.properties && feature.properties.区) {
        feature.properties.name = feature.properties.区
      }
    })
    
    echarts.registerMap('xian_district', xianGeoJson)
    console.log('地图注册成功')
    
    const mapData = xianDistricts.map(feature => {
      const districtName = feature.properties.区 || feature.properties.name || '其它'
      return {
        name: districtName,
        value: 1,
        itemStyle: {
          areaColor: getDistrictColor(districtName)
        }
      }
    })
    
    console.log('地图数据准备完成:', mapData.length, '个区县')
    
    districtOption = {
      backgroundColor: '#f7f9fa',
      title: {
        text: '西安市区地图',
        left: 'center',
        top: 32,
        textStyle: {
          fontSize: 22,
          fontWeight: 'bold',
          color: '#222',
          fontFamily: '"Segoe UI", "微软雅黑", Arial, sans-serif'
        }
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: '#222',
        borderRadius: 6,
        textStyle: { color: '#fff', fontSize: 15 },
        formatter: function(params) {
          return params.name || ''
        }
      },
      series: [
        {
          type: 'map',
          map: 'xian_district',
          roam: false,
          label: { show: false },
          itemStyle: { borderColor: '#fff', borderWidth: 1 },
          emphasis: {
            label: { show: false },
            itemStyle: { areaColor: '#b3e5fc', borderColor: '#0288d1', borderWidth: 2 }
          },
          data: mapData
        }
      ]
    }
    
    chart.setOption(districtOption)
    console.log('地图渲染完成')
    setBackButton(false)
    bindDistrictClick()
    
  } catch (error) {
    console.error('加载地图数据失败:', error)
    // 显示错误信息到页面上
    const mapEl = document.getElementById('echarts-map')
    if (mapEl) {
      mapEl.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #666;">
          <i class="fas fa-exclamation-triangle" style="font-size: 3em; color: #dc3545; margin-bottom: 20px;"></i>
          <h3>地图加载失败</h3>
          <p>${error.message}</p>
          <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
            重新加载
          </button>
        </div>
      `
    }
  }
}

// 绑定区县点击事件
const bindDistrictClick = () => {
  if (!chart) return
  
  chart.off('click')
  chart.on('click', function(params) {
    const districtName = params.name
    if (districtName && store.currentView === 'districts') {
      console.log('MapChart: 地图点击检测到', { districtName })
      
      showDistrictStreets(districtName)
      
      // 更新筛选器
      const code = Object.keys(REGION_MAP).find(key => REGION_MAP[key] === districtName)
      if (code) {
        console.log('MapChart: 更新区域选择', { code, districtName })
        selectedRegion.value = code
        store.setCurrentRegion(code)
      } else {
        console.warn('MapChart: 未找到对应的区划码', { districtName })
      }
    }
  })
}

// 显示街道详情
const showDistrictStreets = (districtName) => {
  const streetsInDistrict = allStreetData.filter(feature => 
    feature.properties && feature.properties.区 === districtName
  )
  
  if (streetsInDistrict.length > 0) {
    store.setSelectedDistrict(districtName)
    store.setCurrentView('streets')
    
    const streetGeoJson = {
      type: 'FeatureCollection',
      features: streetsInDistrict
    }
    
    streetGeoJson.features.forEach(feature => {
      if (feature.properties && feature.properties.Name) {
        feature.properties.name = feature.properties.Name
      }
    })
    
    echarts.registerMap('street_detail', streetGeoJson)
    
    // 获取当前表格数据中有交易的街道名
    let filterRegion = store.currentRegion
    if (!filterRegion || filterRegion === 'ALL') {
      filterRegion = Object.keys(REGION_MAP).find(key => REGION_MAP[key] === districtName) || ''
    }
    
    const tradedStreets = new Set(
      store.allData
        .filter(row => (row['区代码'] || '').substring(0, 6) === filterRegion)
        .map(row => row['街道'])
        .filter(Boolean)
    )
    
    // 显示高亮计数器
    highlightCount.value = tradedStreets.size
    showHighlightCounter.value = true
    showLegendNote.value = true
    
    // 生成街道数据
    const streetData = streetsInDistrict.map(feature => {
      const name = feature.properties.Name || '未知街道'
      const hasTrade = tradedStreets.has(name)
      return {
        name,
        value: 1,
        itemStyle: {
          areaColor: hasTrade ? '#f5b97f' : '#e0e0e0',
          borderColor: '#fff',
          borderWidth: 1
        }
      }
    })
    
    const streetOption = {
      backgroundColor: '#f7f9fa',
      title: {
        text: `${districtName} - 街道详情`,
        left: 'center',
        top: 32,
        textStyle: {
          fontSize: 20,
          fontWeight: 'bold',
          color: '#222',
          fontFamily: '"Segoe UI", "微软雅黑", Arial, sans-serif'
        }
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: '#222',
        borderRadius: 6,
        textStyle: { color: '#fff', fontSize: 14 },
        formatter: function(params) {
          return params.name || ''
        }
      },
      series: [
        {
          type: 'map',
          map: 'street_detail',
          roam: false,
          label: {
            show: true,
            fontSize: 12,
            color: '#333',
            fontWeight: 'bold',
            backgroundColor: 'rgba(255,255,255,0.85)',
            borderRadius: 4,
            padding: [2, 6]
          },
          itemStyle: { borderColor: '#fff', borderWidth: 1 },
          emphasis: {
            label: {
              show: true,
              fontSize: 13,
              color: '#fff',
              fontWeight: 'bold',
              backgroundColor: '#0288d1',
              borderRadius: 5,
              padding: [2, 8]
            },
            itemStyle: { areaColor: '#b3e5fc', borderColor: '#0288d1', borderWidth: 2 }
          },
          data: streetData
        }
      ]
    }
    
    chart.setOption(streetOption, true)
    setTimeout(() => {
      chart.dispatchAction({ type: 'restore' })
      setBackButton(true)
    }, 10)
    
    chart.off('click')
  }
}

// 返回区县视图
const returnToDistrictView = () => {
  console.log('MapChart: 返回区县视图')
  
  store.setCurrentView('districts')
  store.setSelectedDistrict(null)
  
  const mapData = (allStreetData.filter(feature => feature.properties && feature.properties.区)
    .map(feature => {
      const districtName = feature.properties.区 || feature.properties.name || '其它'
      return {
        name: districtName,
        value: 1,
        itemStyle: {
          areaColor: getDistrictColor(districtName)
        }
      }
    }))
  
  const resetOption = {
    backgroundColor: '#f7f9fa',
    title: {
      text: '西安市区地图',
      left: 'center',
      top: 32,
      textStyle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#222',
        fontFamily: '"Segoe UI", "微软雅黑", Arial, sans-serif'
      }
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: '#222',
      borderRadius: 6,
      textStyle: { color: '#fff', fontSize: 15 },
      formatter: function(params) {
        return params.name || ''
      }
    },
    series: [
      {
        type: 'map',
        map: 'xian_district',
        roam: false,
        label: { show: false },
        itemStyle: { borderColor: '#fff', borderWidth: 1 },
        emphasis: {
          label: { show: false },
          itemStyle: { areaColor: '#b3e5fc', borderColor: '#0288d1', borderWidth: 2 }
        },
        data: mapData
      }
    ]
  }
  
  chart.setOption(resetOption, true)
  setBackButton(false)
  bindDistrictClick()
  
  // 重置筛选器
  selectedRegion.value = 'ALL'
  store.setCurrentRegion('ALL')
  
  // 隐藏高亮计数器
  showHighlightCounter.value = false
  showLegendNote.value = false
  
  console.log('MapChart: 区县视图重置完成')
}

// 设置返回按钮
const setBackButton = (show) => {
  chart.setOption({
    graphic: show ? [{
      type: 'group',
      left: 1,
      top: 70,
      z: 1000,
      children: [
        {
          type: 'rect',
          shape: { width: 80, height: 29, r: 8 },
          style: {
            fill: 'rgba(255,255,255,0.9)',
            shadowBlur: 6,
            shadowColor: 'rgba(0,0,0,0.06)',
            cursor: 'pointer',
            stroke: 'transparent',
            lineWidth: 0
          },
          onclick: function() { returnToDistrictView() }
        },
        {
          type: 'text',
          left: 14,
          top: 8,
          style: {
            text: '\u25C0',
            font: 'bold 14px "Segoe UI", "微软雅黑", Arial',
            fill: '#e67e22',
            cursor: 'pointer',
          },
          onclick: function() { returnToDistrictView() }
        },
        {
          type: 'text',
          left: 30,
          top: 8,
          style: {
            text: '返回',
            font: 'bold 14px "Segoe UI", "微软雅黑", Arial',
            fill: '#666',
            cursor: 'pointer',
          },
          onclick: function() { returnToDistrictView() }
        }
      ]
    }] : []
  })
}

// 处理窗口大小变化
const handleResize = () => {
  if (chart) {
    chart.resize()
  }
}

// 生命周期
onMounted(async () => {
  const dom = document.getElementById('echarts-map')
  if (dom) {
    chart = echarts.init(dom)
    window.addEventListener('resize', handleResize)
    
    // 等待地图初始化完成
    await initMap()
    
    // 地图初始化完成后再开始监听区域变化
    console.log('MapChart: 地图初始化完成，开始监听区域变化')
  }
})

onUnmounted(() => {
  if (chart) {
    chart.dispose()
    chart = null
  }
  window.removeEventListener('resize', handleResize)
})

// 根据区域更新地图显示
const updateMapForRegion = (regionCode) => {
  console.log('MapChart: updateMapForRegion 开始执行', { 
    regionCode,
    chartExists: !!chart,
    currentView: store.currentView,
    selectedDistrict: store.selectedDistrict,
    allStreetDataLength: allStreetData.length
  })
  
  if (!chart) {
    console.warn('MapChart: 图表未初始化，无法更新')
    return
  }
  
  if (regionCode === 'ALL') {
    console.log('MapChart: 处理全部区域')
    // 显示全部区域
    if (store.currentView !== 'districts') {
      console.log('MapChart: 切换到区县视图')
      returnToDistrictView()
    } else {
      console.log('MapChart: 已经在区县视图，无需切换')
    }
  } else {
    console.log('MapChart: 处理特定区域', { regionCode })
    // 显示特定区域
    const districtName = REGION_MAP[regionCode]
    if (districtName) {
      console.log('MapChart: 找到区县名称', { districtName })
      if (store.currentView !== 'streets' || store.selectedDistrict !== districtName) {
        console.log('MapChart: 切换到街道视图', { districtName })
        showDistrictStreets(districtName)
      } else {
        console.log('MapChart: 已经在街道视图，无需切换')
      }
    } else {
      console.warn('MapChart: 未找到区县名称', { regionCode })
    }
  }
  
  console.log('MapChart: updateMapForRegion 执行完成')
}

// 监听数据变化
watch(() => store.allData, () => {
  if (chart && store.allData.length > 0) {
    // 重新初始化地图以更新筛选选项
    initMap()
  }
}, { deep: true })

// 监听当前区域变化 - 移除immediate，避免在地图初始化前执行
watch(() => store.currentRegion, (newRegion, oldRegion) => {
  console.log('MapChart: 区域变化检测到', { 
    oldRegion, 
    newRegion,
    chartExists: !!chart,
    currentView: store.currentView
  })
  
  // 更新本地状态
  selectedRegion.value = newRegion
  
  // 同步更新地图显示
  if (chart) {
    // 使用setTimeout确保在下一个事件循环中执行
    setTimeout(() => {
      console.log('MapChart: 执行地图更新', { regionCode: newRegion })
      updateMapForRegion(newRegion)
    }, 0)
  } else {
    console.warn('MapChart: 图表未初始化，跳过地图更新')
  }
})
</script>

<style scoped>
.echarts-card {
  background: #e3f2fd;
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(2,136,209,0.10), 0 1.5px 4px rgba(2,136,209,0.08);
  margin: 30px 30px 0 30px;
  padding: 24px 24px 12px 24px;
  max-width: none;
  min-width: 0;
  border: 1.5px solid #b3e5fc;
  position: relative;
}

#echarts-map {
  width: 100%;
  min-height: 480px;
  height: 52vw;
  max-height: 600px;
  margin: 0 auto;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(2,136,209,0.08);
  background: #e3f2fd;
}

.region-filter-box {
  position: absolute;
  left: 24px;
  top: 24px;
  z-index: 1200;
  background: rgba(255,255,255,0.95);
  border-radius: 8px;
  padding: 8px 16px;
  box-shadow: 0 2px 8px rgba(2,136,209,0.08);
  display: flex;
  align-items: center;
  gap: 8px;
}

.region-filter-box i {
  color: #4fc3f7;
}

.region-filter-box label {
  color: #666;
  font-weight: 500;
}

.region-filter-box select {
  font-size: 15px;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid #b3e5fc;
  outline: none;
}

.highlight-counter {
  position: absolute;
  right: 32px;
  bottom: 80px;
  z-index: 1100;
  background: rgba(255,255,255,0.9);
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: bold;
  box-shadow: 0 2px 6px rgba(0,0,0,0.06);
  color: #e67e22;
}

.legend-note {
  position: absolute;
  right: 32px;
  bottom: 32px;
  z-index: 1100;
  background: rgba(255,255,255,0.9);
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  color: #666;
  box-shadow: 0 2px 6px rgba(0,0,0,0.06);
}

@media (max-width: 768px) {
  .echarts-card {
    margin: 20px 15px 0 15px;
    padding: 20px 20px 10px 20px;
  }
  
  .region-filter-box {
    left: 15px;
    top: 15px;
    padding: 6px 12px;
  }
  
  .highlight-counter,
  .legend-note {
    right: 15px;
    font-size: 13px;
    padding: 6px 12px;
  }
  
  .highlight-counter {
    bottom: 70px;
  }
}
</style>
