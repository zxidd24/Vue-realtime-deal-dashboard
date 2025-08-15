<template>
  <div class="status-bar">
    <div class="data-info">
      <div class="connection-status">
        <div :class="['status-indicator', connectionStatusClass]"></div>
        <span>{{ connectionStatusText }}</span>
      </div>
      <div class="info-item">
        <i class="fas fa-clock"></i>
        <span>{{ lastUpdateText }}</span>
      </div>
      <div class="info-item">
        <i class="fas fa-database"></i>
        <span>{{ recordCountText }}</span>
      </div>
    </div>
    
    <div class="user-info" v-if="userInfo">
      <div class="user-avatar">{{ userAvatarText }}</div>
      <div class="user-details">
        <div class="user-name">{{ userInfo.nickname || userInfo.username || '用户' }}</div>
        <div class="user-role">{{ userRoleText }}</div>
      </div>
      <button class="logout-btn" @click="handleLogout">
        <i class="fas fa-sign-out-alt"></i>
        退出
      </button>
    </div>
    
    <div class="btn-group">
      <button class="refresh-btn" @click="handleReconnect">
        <i class="fas fa-sync-alt"></i>
        重连数据库
      </button>
      <button class="refresh-btn export-btn" @click="handleExport">
        <i class="fas fa-file-excel"></i>
        导出Excel
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDashboardStore } from '../stores/dashboard'
import { CONNECTION_STATUS_TEXT, CONNECTION_STATUS_CLASS } from '../utils/constants'

const router = useRouter()
const store = useDashboardStore()

// 计算属性
const connectionStatusText = computed(() => 
  CONNECTION_STATUS_TEXT[store.connectionStatus] || '未知状态'
)

const connectionStatusClass = computed(() => 
  CONNECTION_STATUS_CLASS[store.connectionStatus] || 'status-connecting'
)

const lastUpdateText = computed(() => {
  if (!store.lastUpdateTime) return '--'
  const now = store.lastUpdateTime
  const month = now.getMonth() + 1
  const day = now.getDate()
  const timeString = now.toLocaleTimeString('zh-CN')
  return `更新时间: ${month}月${day}日 ${timeString}`
})

const recordCountText = computed(() => 
  `${store.totalRecords} 条记录`
)

const userInfo = computed(() => store.userInfo)

const userAvatarText = computed(() => {
  if (!store.userInfo) return 'U'
  const displayName = store.userInfo.nickname || store.userInfo.username || '用户'
  return displayName.charAt(0).toUpperCase()
})

const userRoleText = computed(() => {
  if (!store.userInfo) return '角色'
  return store.userInfo.roleid ? `角色ID: ${store.userInfo.roleid}` : '普通用户'
})

// 方法
const handleReconnect = () => {
  // 这里需要调用WebSocket重连方法
  // 可以通过emit事件通知父组件
  emit('reconnect')
}

const handleExport = () => {
  emit('export')
}

const handleLogout = () => {
  if (confirm('确定要退出系统吗？')) {
    store.clearUserInfo()
    localStorage.removeItem('sso_user_info')
    localStorage.removeItem('sso_login_time')
    
    const exiturl = localStorage.getItem('sso_exiturl')
    if (exiturl) {
      window.location.href = exiturl
    } else {
      router.push('/test-sso')
    }
  }
}

// 定义emit事件
const emit = defineEmits(['reconnect', 'export'])
</script>

<style scoped>
.status-bar {
  background: #f8f9fa;
  padding: 15px 30px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.data-info {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.status-connected { background: #28a745; }
.status-disconnected { background: #dc3545; }
.status-connecting { background: #ffc107; }

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6c757d;
}

.info-item i {
  color: #0095ff;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4fc3f7 0%, #0288d1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 14px;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.user-role {
  font-size: 12px;
  color: #666;
}

.logout-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 15px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s ease;
}

.logout-btn:hover {
  background: #c82333;
}

.btn-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

.refresh-btn {
  background: linear-gradient(135deg, #4fc3f7 0%, #0288d1 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: transform 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.refresh-btn:hover {
  transform: translateY(-2px);
}

.refresh-btn:active {
  transform: translateY(0);
}

.export-btn {
  background: linear-gradient(135deg, #81d4fa 0%, #0288d1 100%);
}

@media (max-width: 768px) {
  .status-bar {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .data-info {
    gap: 15px;
  }
  
  .btn-group {
    gap: 10px;
  }
  
  .refresh-btn {
    padding: 8px 16px;
    font-size: 13px;
  }
}
</style>
