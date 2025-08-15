<template>
  <div class="table-container">
    <div class="table-wrapper">
      <table id="data-table">
        <thead>
          <tr>
            <th style="text-align: center;">
              <i class="fas fa-map-marker-alt"></i> 行政区划
            </th>
            <th style="text-align: center;">
              <i class="fas fa-road"></i> 街道名称
            </th>
            <th style="text-align: center;">
              <i class="fas fa-tag"></i> 项目类别
            </th>
            <th style="text-align: center;">
              <i class="fas fa-yen-sign"></i> 成交金额(元)
            </th>
            <th style="text-align: center;">
              <i class="fas fa-handshake"></i> 成交笔数
            </th>
          </tr>
        </thead>
        <tbody id="table-body">
          <tr v-if="loading">
            <td colspan="5" class="loading">
              <i class="fas fa-spinner"></i>
              <div>正在加载数据...</div>
            </td>
          </tr>
          <tr v-else-if="!hasData">
            <td colspan="5" class="no-data">
              <i class="fas fa-inbox"></i>
              <div>暂无数据</div>
            </td>
          </tr>
          <template v-else>
            <tr 
              v-for="(row, index) in displayData" 
              :key="`${row['区代码']}-${row['街道']}-${row['项目类别']}-${index}`"
              :class="['fade-in']"
              :style="{ animationDelay: `${index * 0.05}s` }"
            >
              <td class="region-cell" :rowspan="getRowspan(row, 'region')" v-if="shouldShowCell(row, 'region')">
                {{ getRegionName(row['区代码']) }}
              </td>
              <td class="region-cell" :rowspan="getRowspan(row, 'street')" v-if="shouldShowCell(row, 'street')">
                {{ row['街道'] || '--' }}
              </td>
              <td class="category-cell">
                {{ row['项目类别'] || '--' }}
              </td>
              <td class="amount-cell">
                {{ formatAmount(row['成交金额']) }}
              </td>
              <td class="count-cell">
                {{ row['成交笔数'] || '0' }}
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, nextTick, ref, watch } from 'vue'
import { useDashboardStore } from '../stores/dashboard'
import { REGION_MAP } from '../utils/constants'

const store = useDashboardStore()

// 响应式数据
const rowspanCache = ref(new Map())
const debugInfo = ref({
  totalRows: 0,
  processedRows: 0,
  cacheHits: 0,
  cacheMisses: 0
})

// 计算属性
const loading = computed(() => store.connectionStatus === 'connecting')
const hasData = computed(() => store.totalRecords > 0)
const filteredData = computed(() => store.filteredData)

// 处理后的显示数据
const displayData = computed(() => {
  if (!filteredData.value || filteredData.value.length === 0) {
    debugInfo.value.totalRows = 0
    debugInfo.value.processedRows = 0
    return []
  }
  
  // 按区代码、街道、项目类别排序，确保相同数据相邻
  const sortedData = [...filteredData.value].sort((a, b) => {
    const aCode = (a['区代码'] || '').substring(0, 6)
    const bCode = (b['区代码'] || '').substring(0, 6)
    if (aCode !== bCode) return aCode.localeCompare(bCode)
    
    const aStreet = a['街道'] || ''
    const bStreet = b['街道'] || ''
    if (aStreet !== bStreet) return aStreet.localeCompare(bStreet)
    
    const aCategory = a['项目类别'] || ''
    const bCategory = b['项目类别'] || ''
    return aCategory.localeCompare(bCategory)
  })
  
  debugInfo.value.totalRows = filteredData.value.length
  debugInfo.value.processedRows = sortedData.length
  
  return sortedData
})

// 方法
const getRegionName = (regionCode) => {
  if (!regionCode) return '--'
  const code = regionCode.substring(0, 6)
  return REGION_MAP[code] || code
}

const formatAmount = (amount) => {
  const num = parseFloat(amount) || 0
  return num.toLocaleString('zh-CN', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })
}

// 计算行合并数
const getRowspan = (row, type) => {
  const cacheKey = `${type}-${row['区代码']}-${row['街道']}`
  
  if (rowspanCache.value.has(cacheKey)) {
    debugInfo.value.cacheHits++
    return rowspanCache.value.get(cacheKey)
  }
  
  debugInfo.value.cacheMisses++
  let count = 1
  const currentIndex = displayData.value.findIndex(item => 
    item === row
  )
  
  if (currentIndex === -1) return 1
  
  if (type === 'region') {
    // 计算相同区代码的行数
    const currentCode = (row['区代码'] || '').substring(0, 6)
    for (let i = currentIndex + 1; i < displayData.value.length; i++) {
      const nextCode = (displayData.value[i]['区代码'] || '').substring(0, 6)
      if (nextCode === currentCode) {
        count++
      } else {
        break
      }
    }
  } else if (type === 'street') {
    // 计算相同街道的行数
    const currentCode = (row['区代码'] || '').substring(0, 6)
    const currentStreet = row['街道'] || ''
    for (let i = currentIndex + 1; i < displayData.value.length; i++) {
      const nextCode = (displayData.value[i]['区代码'] || '').substring(0, 6)
      const nextStreet = displayData.value[i]['街道'] || ''
      if (nextCode === currentCode && nextStreet === currentStreet) {
        count++
      } else {
        break
      }
    }
  }
  
  rowspanCache.value.set(cacheKey, count)
  return count
}

// 判断是否应该显示单元格
const shouldShowCell = (row, type) => {
  const cacheKey = `${type}-${row['区代码']}-${row['街道']}`
  
  if (type === 'region') {
    // 区代码单元格只在第一次出现时显示
    const currentIndex = displayData.value.findIndex(item => 
      item === row
    )
    if (currentIndex === 0) return true
    
    const currentCode = (row['区代码'] || '').substring(0, 6)
    const prevCode = (displayData.value[currentIndex - 1]['区代码'] || '').substring(0, 6)
    return currentCode !== prevCode
  } else if (type === 'street') {
    // 街道单元格只在第一次出现时显示
    const currentIndex = displayData.value.findIndex(item => 
      item === row
    )
    if (currentIndex === 0) return true
    
    const currentCode = (row['区代码'] || '').substring(0, 6)
    const currentStreet = row['街道'] || ''
    const prevCode = (displayData.value[currentIndex - 1]['区代码'] || '').substring(0, 6)
    const prevStreet = displayData.value[currentIndex - 1]['街道'] || ''
    return currentCode !== prevCode || currentStreet !== prevStreet
  }
  
  return true
}

// 清除缓存
const clearCache = () => {
  rowspanCache.value.clear()
  debugInfo.value.cacheHits = 0
  debugInfo.value.cacheMisses = 0
  console.log('DataTable: 缓存已清除')
}

// 调试信息
const logDebugInfo = () => {
  console.log('DataTable 调试信息:', {
    ...debugInfo.value,
    cacheSize: rowspanCache.value.size,
    filteredDataLength: filteredData.value?.length || 0,
    displayDataLength: displayData.value?.length || 0
  })
}

// 监听数据变化
watch(() => store.filteredData, (newData, oldData) => {
  console.log('DataTable: 数据变化检测到', {
    oldLength: oldData?.length || 0,
    newLength: newData?.length || 0
  })
  
  nextTick(() => {
    clearCache()
    logDebugInfo()
  })
}, { deep: true })

// 监听当前区域变化
watch(() => store.currentRegion, (newRegion, oldRegion) => {
  console.log('DataTable: 区域变化检测到', { oldRegion, newRegion })
  
  nextTick(() => {
    clearCache()
    logDebugInfo()
  })
})

// 生命周期
onMounted(() => {
  // 初始清除缓存
  clearCache()
  logDebugInfo()
  
  // 开发环境下添加调试信息到控制台
  if (process.env.NODE_ENV === 'development') {
    console.log('DataTable 组件已挂载，开始监听数据变化')
  }
})
</script>

<style scoped>
.table-container {
  padding: 30px;
  overflow-x: auto;
}

.table-wrapper {
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

th {
  background: linear-gradient(135deg, #4fc3f7 0%, #0288d1 100%);
  color: white;
  padding: 18px 15px;
  text-align: left;
  font-weight: 600;
  font-size: 15px;
  position: sticky;
  top: 0;
  z-index: 10;
}

th:first-child { border-top-left-radius: 15px; }
th:last-child { border-top-right-radius: 15px; }

td {
  padding: 15px;
  border-bottom: 1px solid #f1f3f4;
  transition: background-color 0.2s ease;
}

tr:hover td {
  background-color: #f8f9ff;
}

tr:last-child td {
  border-bottom: none;
}

.amount-cell {
  font-weight: 600;
  color: #28a745;
  text-align: right;
}

.count-cell {
  font-weight: 600;
  color: #007bff;
  text-align: center;
}

.category-cell {
  font-weight: 500;
  color: #495057;
  text-align: center;
}

.region-cell {
  font-weight: 500;
  color: #6c757d;
  text-align: center;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
}

.loading i {
  font-size: 3em;
  color: #0095ff;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-data {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
}

.no-data i {
  font-size: 4em;
  color: #dee2e6;
  margin-bottom: 20px;
}

.fade-in {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .table-container {
    padding: 15px;
  }
  
  th, td {
    padding: 12px 8px;
    font-size: 13px;
  }
}
</style>
