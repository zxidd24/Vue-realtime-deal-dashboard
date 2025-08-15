// API配置文件
const isDevelopment = process.env.NODE_ENV === 'development'

// 开发环境使用localhost，生产环境使用相对路径
export const API_BASE_URL = isDevelopment ? 'http://localhost:3000' : ''
export const WS_BASE_URL = isDevelopment ? 'ws://localhost:3000' : ''

// 地图数据路径
export const MAP_DATA_URL = `${API_BASE_URL}/assets/Data/陕西街道.geojson`

// API端点
export const API_ENDPOINTS = {
  ROLES: `${API_BASE_URL}/api/roles`
}

// WebSocket配置
export const WS_CONFIG = {
  url: WS_BASE_URL,
  reconnectAttempts: 5,
  reconnectInterval: 3000
}
