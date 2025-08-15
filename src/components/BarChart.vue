<template>
  <div id="echarts-bar" style="width:100%;height:320px;margin:30px 0 18px 0;padding-left:30px;"></div>
</template>

<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import { useDashboardStore } from '../stores/dashboard'
import { REGION_MAP } from '../utils/constants'
import * as echarts from 'echarts'

const store = useDashboardStore()
let chart = null

// 渲染柱状图
const renderChart = (data) => {
  if (!chart || !data || data.length === 0) return
  
  // 统计各区县成交金额
  const regionData = {}
  data.forEach(row => {
    const code = (row['区代码'] || '').substring(0, 6)
    const name = REGION_MAP[code] || code
    if (!regionData[name]) regionData[name] = 0
    regionData[name] += parseFloat(row['成交金额']) || 0
  })
  
  // 排序取Top5
  const sorted = Object.entries(regionData).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const names = sorted.map(x => x[0])
  const values = sorted.map(x => x[1])
  
  const option = {
    title: {
      text: '区县成交金额TOP5',
      left: 'left',
      top: 10,
      textStyle: { color: '#0288d1', fontSize: 18, fontWeight: 600 }
    },
    grid: { left: 40, right: 20, top: 60, bottom: 30 },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: function(params) {
        const data = params[0]
        return `<div style="padding: 8px;">
          <div style="font-weight: bold; margin-bottom: 4px;">${data.name}</div>
          <div>成交金额: ${data.value.toLocaleString('zh-CN', {minimumFractionDigits:2,maximumFractionDigits:2})} 元</div>
          <div style="font-size: 12px; color: #999; margin-top: 4px;">点击查看该区域详情</div>
        </div>`
      }
    },
    xAxis: {
      type: 'category',
      data: names,
      axisLine: { lineStyle: { color: '#0288d1' } },
      axisLabel: { color: '#0288d1', fontWeight: 500 }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#0288d1' } },
      splitLine: { lineStyle: { color: '#b3e5fc' } },
      axisLabel: { color: '#0288d1' }
    },
    series: [{
      data: values,
      type: 'bar',
      barWidth: 32,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {offset: 0, color: '#4fc3f7'},
          {offset: 1, color: '#0288d1'}
        ]),
        borderRadius: [8, 8, 0, 0]
      },
      emphasis: {
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {offset: 0, color: '#81d4fa'},
            {offset: 1, color: '#0277bd'}
          ]),
          borderRadius: [8, 8, 0, 0],
          shadowBlur: 10,
          shadowColor: 'rgba(0,0,0,0.3)'
        }
      },
      label: {
        show: true,
        position: 'top',
        color: '#0288d1',
        fontWeight: 600,
        formatter: v => v.value.toLocaleString('zh-CN', {minimumFractionDigits:2,maximumFractionDigits:2})
      }
    }]
  }
  
  chart.setOption(option)
  
  // 绑定点击事件
  bindClickEvent()
}

// 绑定点击事件
const bindClickEvent = () => {
  if (!chart) return
  
  chart.off('click')
  chart.on('click', function(params) {
    if (params.componentType === 'series' && params.seriesType === 'bar') {
      const districtName = params.name
      console.log('BarChart: 点击检测到', { districtName })
      
      // 反查区划码
      const regionCode = Object.keys(REGION_MAP).find(key => REGION_MAP[key] === districtName)
      if (regionCode) {
        console.log('BarChart: 设置区域', { regionCode, districtName })
        
        // 更新行政区筛选
        store.setCurrentRegion(regionCode)
        
        // 平滑滚动到地图
        requestAnimationFrame(() => {
          setTimeout(() => {
            smoothScrollToMap()
          }, 30)
        })
      } else {
        console.warn('BarChart: 未找到对应的区划码', { districtName })
      }
    }
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

// 处理窗口大小变化
const handleResize = () => {
  if (chart) {
    chart.resize()
  }
}

// 生命周期
onMounted(() => {
  // 初始化图表
  const dom = document.getElementById('echarts-bar')
  if (dom) {
    chart = echarts.init(dom)
    
    // 监听窗口大小变化
    window.addEventListener('resize', handleResize)
    
    // 如果有数据，立即渲染
    if (store.allData.length > 0) {
      renderChart(store.allData)
    }
  }
})

onUnmounted(() => {
  if (chart) {
    chart.dispose()
    chart = null
  }
  window.removeEventListener('resize', handleResize)
})

// 监听数据变化
watch(() => store.allData, (newData) => {
  if (newData && newData.length > 0) {
    renderChart(newData)
  }
}, { deep: true })
</script>
