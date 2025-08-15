<template>
  <div class="container">
    <div class="header">
      <h1><i class="fas fa-chart-line"></i> 西安城乡融合要素交易市场</h1>
      <p>数据可视化展示平台</p>
    </div>
    
    <StatusBar 
      @reconnect="handleReconnect"
      @export="handleExport"
    />
    
    <BarChart />
    
    <DistrictButtons />
    
    <MapChart />
    
    <StatsCards />
    
    <DataTable />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useDashboardStore } from '../stores/dashboard'
import WebSocketManager from '../utils/websocket'
import StatusBar from '../components/StatusBar.vue'
import BarChart from '../components/BarChart.vue'
import DistrictButtons from '../components/DistrictButtons.vue'
import MapChart from '../components/MapChart.vue'
import StatsCards from '../components/StatsCards.vue'
import DataTable from '../components/DataTable.vue'
import * as XLSX from 'xlsx'

const store = useDashboardStore()
let wsManager = null

// 初始化用户信息
const initUserInfo = () => {
  // 移除SSO相关代码，直接设置默认用户信息
  const defaultUser = {
    username: '默认用户',
    nickname: '系统用户',
    roleid: '1',
    xzqh: '610100'
  }
  store.setUserInfo(defaultUser)
}

// 处理重连
const handleReconnect = () => {
  if (wsManager) {
    wsManager.reconnect()
  }
}

// 处理导出Excel
const handleExport = () => {
  const table = document.getElementById('data-table')
  if (!table) return
  
  const headers = Array.from(table.querySelectorAll('thead th')).map(th => 
    th.innerText.replace(/\s+/g, '')
  )
  
  const rows = Array.from(table.querySelectorAll('tbody tr'))
  if (!rows.length || rows[0].classList.contains('loading') || rows[0].classList.contains('no-data')) {
    alert('暂无可导出的数据！')
    return
  }
  
  const data = rows.map(tr => 
    Array.from(tr.querySelectorAll('td')).map(td => td.innerText)
  )
  
  // SheetJS数据
  const ws_data = [headers, ...data]
  const ws = XLSX.utils.aoa_to_sheet(ws_data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '筛选结果')
  
  // 文件名含日期
  const now = new Date()
  const pad = n => n.toString().padStart(2, '0')
  const fname = `筛选结果_${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.xlsx`
  
  XLSX.writeFile(wb, fname)
}

// 生命周期
onMounted(() => {
  // 初始化用户信息
  initUserInfo()
  
  // 初始化WebSocket连接
  wsManager = new WebSocketManager()
  wsManager.connect()
})

onUnmounted(() => {
  if (wsManager) {
    wsManager.disconnect()
  }
})
</script>

<style scoped>
.container {
  max-width: 1400px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  min-height: 100vh;
}

.header {
  background: linear-gradient(135deg, #4fc3f7 0%, #0288d1 100%);
  color: white;
  padding: 30px;
  text-align: center;
  position: relative;
}

.header h1 {
  font-size: 2.5em;
  margin-bottom: 10px;
  font-weight: 300;
}

.header p {
  font-size: 1.1em;
  opacity: 0.9;
}

@media (max-width: 768px) {
  .container {
    max-width: 100%;
    border-radius: 0;
  }
  
  .header {
    padding: 18px;
  }
  
  .header h1 {
    font-size: 1.8em;
  }
  
  .header p {
    font-size: 1em;
  }
}
</style>
