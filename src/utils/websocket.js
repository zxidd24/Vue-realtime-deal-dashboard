import { useDashboardStore } from '../stores/dashboard'
import { WS_CONFIG } from '../config/api'

class WebSocketManager {
  constructor() {
    this.socket = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = WS_CONFIG.reconnectAttempts
    this.reconnectInterval = null
    this.store = useDashboardStore()
    this.messageQueue = []
    this.isProcessing = false
  }

  connect() {
    this.store.setConnectionStatus('connecting')
    
    try {
      this.socket = new WebSocket(WS_CONFIG.url)
      
      this.socket.onopen = () => {
        console.log('WebSocket连接成功')
        this.store.setConnectionStatus('connected')
        this.reconnectAttempts = 0
        if (this.reconnectInterval) {
          clearInterval(this.reconnectInterval)
          this.reconnectInterval = null
        }
        
        // 处理队列中的消息
        this.processMessageQueue()
      }

      this.socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data)
          const data = payload.data || payload
          
          // 验证数据格式
          if (this.validateData(data)) {
            // 将消息加入队列，确保顺序处理
            this.messageQueue.push({
              data: data,
              timestamp: Date.now(),
              dbConnectTime: payload.dbConnectTime
            })
            
            // 如果当前没有在处理消息，开始处理
            if (!this.isProcessing) {
              this.processMessageQueue()
            }
          } else {
            console.warn('WebSocket数据格式无效:', data)
          }
        } catch (error) {
          console.error('解析WebSocket数据失败:', error)
        }
      }

      this.socket.onerror = (error) => {
        console.error('WebSocket错误:', error)
        this.store.setConnectionStatus('disconnected')
      }

      this.socket.onclose = () => {
        console.log('WebSocket连接断开')
        this.store.setConnectionStatus('disconnected')
        
        // 尝试重连
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++
          console.log(`尝试重连... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
          
          this.reconnectInterval = setTimeout(() => {
            this.connect()
          }, WS_CONFIG.reconnectInterval)
        }
      }
    } catch (error) {
      console.error('创建WebSocket连接失败:', error)
      this.store.setConnectionStatus('disconnected')
    }
  }

  // 验证数据格式
  validateData(data) {
    if (!data) return false
    
    // 如果是数组，验证每个元素
    if (Array.isArray(data)) {
      if (data.length === 0) return true
      
      return data.every(row => {
        return row && 
               typeof row === 'object' && 
               row['区代码'] && 
               row['街道'] && 
               row['项目类别']
      })
    }
    
    // 如果是单个对象，验证结构
    if (typeof data === 'object') {
      return data['区代码'] && data['街道'] && data['项目类别']
    }
    
    return false
  }

  // 处理消息队列
  async processMessageQueue() {
    if (this.isProcessing || this.messageQueue.length === 0) {
      return
    }
    
    this.isProcessing = true
    
    try {
      while (this.messageQueue.length > 0) {
        const message = this.messageQueue.shift()
        
        // 更新store中的数据
        this.store.setData(message.data)
        
        // 如果有数据库连接时间，更新最后更新时间
        if (message.dbConnectTime) {
          this.store.lastUpdateTime = new Date(message.dbConnectTime)
        }
        
        // 添加小延迟，避免过快更新
        await new Promise(resolve => setTimeout(resolve, 50))
      }
    } catch (error) {
      console.error('处理消息队列失败:', error)
    } finally {
      this.isProcessing = false
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval)
      this.reconnectInterval = null
    }
    
    // 清空消息队列
    this.messageQueue = []
    this.isProcessing = false
  }

  reconnect() {
    this.disconnect()
    this.reconnectAttempts = 0
    this.connect()
  }

  isConnected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN
  }

  // 获取连接状态信息
  getConnectionInfo() {
    return {
      isConnected: this.isConnected(),
      reconnectAttempts: this.reconnectAttempts,
      messageQueueLength: this.messageQueue.length,
      isProcessing: this.isProcessing
    }
  }
}

export default WebSocketManager
