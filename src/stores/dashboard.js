import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useDashboardStore = defineStore('dashboard', () => {
  // 状态
  const allData = ref([])
  const currentRegion = ref('ALL')
  const connectionStatus = ref('connecting') // connecting, connected, disconnected
  const lastUpdateTime = ref(null)
  const userInfo = ref(null)
  const currentView = ref('districts') // districts, streets
  const selectedDistrict = ref(null)

  // 计算属性
  const filteredData = computed(() => {
    if (!allData.value || allData.value.length === 0) {
      return []
    }
    
    if (currentRegion.value === 'ALL') {
      return allData.value
    }
    
    // 过滤数据并确保数据完整性
    return allData.value.filter(row => {
      // 确保行数据存在且包含必要字段
      if (!row || typeof row !== 'object') {
        return false
      }
      
      const regionCode = row['区代码']
      if (!regionCode || typeof regionCode !== 'string') {
        return false
      }
      
      return regionCode.substring(0, 6) === currentRegion.value
    })
  })

  const totalRecords = computed(() => filteredData.value.length)
  const totalCategories = computed(() => {
    const categories = new Set()
    filteredData.value.forEach(row => {
      if (row['项目类别']) {
        categories.add(row['项目类别'])
      }
    })
    return categories.size
  })
  const totalAmount = computed(() => 
    filteredData.value.reduce((sum, row) => {
      const amount = parseFloat(row['成交金额'])
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)
  )
  const totalCount = computed(() => 
    filteredData.value.reduce((sum, row) => {
      const count = parseInt(row['成交笔数'])
      return sum + (isNaN(count) ? 0 : count)
    }, 0)
  )

  // 动作
  function setData(data) {
    if (!data || !Array.isArray(data)) {
      console.warn('setData: 数据格式无效', data)
      return
    }
    
    // 数据清理和验证
    const cleanedData = data.filter(row => {
      if (!row || typeof row !== 'object') {
        return false
      }
      
      // 确保必要字段存在
      const hasRequiredFields = row['区代码'] && row['街道'] && row['项目类别']
      if (!hasRequiredFields) {
        console.warn('数据行缺少必要字段:', row)
        return false
      }
      
      // 验证区代码格式
      const regionCode = row['区代码']
      if (typeof regionCode !== 'string' || regionCode.length < 6) {
        console.warn('区代码格式无效:', regionCode)
        return false
      }
      
      return true
    })
    
    console.log(`数据清理完成: 原始数据 ${data.length} 条，清理后 ${cleanedData.length} 条`)
    
    allData.value = cleanedData
    lastUpdateTime.value = new Date()
  }

  function setCurrentRegion(region) {
    console.log('Dashboard Store: setCurrentRegion 被调用', { 
      oldRegion: currentRegion.value, 
      newRegion: region,
      type: typeof region 
    })
    
    if (region && typeof region === 'string') {
      currentRegion.value = region
      console.log('Dashboard Store: 区域已更新', { currentRegion: currentRegion.value })
    } else {
      console.warn('Dashboard Store: 无效的区域参数', { region, type: typeof region })
    }
  }

  function setConnectionStatus(status) {
    if (['connecting', 'connected', 'disconnected'].includes(status)) {
      connectionStatus.value = status
    }
  }

  function setUserInfo(user) {
    if (user && typeof user === 'object') {
      userInfo.value = user
    }
  }

  function setCurrentView(view) {
    if (['districts', 'streets'].includes(view)) {
      currentView.value = view
    }
  }

  function setSelectedDistrict(district) {
    if (district && typeof district === 'string') {
      selectedDistrict.value = district
    } else {
      selectedDistrict.value = null
    }
  }

  function clearUserInfo() {
    userInfo.value = null
  }

  // 数据重置函数
  function resetData() {
    allData.value = []
    lastUpdateTime.value = null
  }

  return {
    // 状态
    allData,
    currentRegion,
    connectionStatus,
    lastUpdateTime,
    userInfo,
    currentView,
    selectedDistrict,
    
    // 计算属性
    filteredData,
    totalRecords,
    totalCategories,
    totalAmount,
    totalCount,
    
    // 动作
    setData,
    setCurrentRegion,
    setConnectionStatus,
    setUserInfo,
    setCurrentView,
    setSelectedDistrict,
    clearUserInfo,
    resetData
  }
})
