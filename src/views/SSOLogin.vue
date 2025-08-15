<template>
  <div class="sso-container">
    <div class="sso-card">
      <div class="sso-header">
        <h2><i class="fas fa-shield-alt"></i> 统一身份认证</h2>
        <p>正在验证您的身份信息...</p>
      </div>
      
      <div class="loading-section" v-if="loading">
        <div class="spinner"></div>
        <p>正在验证登录信息，请稍候...</p>
      </div>
      
      <div class="error-section" v-if="error">
        <div class="error-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h3>验证失败</h3>
        <p>{{ errorMessage }}</p>
        <button class="retry-btn" @click="retryValidation">
          <i class="fas fa-redo"></i> 重新验证
        </button>
        <button class="back-btn" @click="goBack">
          <i class="fas fa-arrow-left"></i> 返回
        </button>
      </div>
      
      <div class="success-section" v-if="success">
        <div class="success-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <h3>验证成功</h3>
        <p>正在跳转到主页面...</p>
        <div class="countdown">{{ countdown }}秒后自动跳转</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDashboardStore } from '../stores/dashboard'
import axios from 'axios'

const router = useRouter()
const route = useRoute()
const store = useDashboardStore()

// 响应式数据
const loading = ref(true)
const error = ref(false)
const success = ref(false)
const errorMessage = ref('')
const countdown = ref(3)

// 验证SSO登录
const validateSSO = async () => {
  try {
    const code = route.query.code
    if (!code) {
      throw new Error('缺少必要的验证参数')
    }
    
    // 调用SSO验证接口
    const response = await axios.post('/api/sso/validate', { code })
    
    if (response.data.success) {
      // 验证成功
      const userInfo = response.data.data
      
      // 保存用户信息到store和localStorage
      store.setUserInfo(userInfo)
      localStorage.setItem('sso_user_info', JSON.stringify(userInfo))
      localStorage.setItem('sso_login_time', new Date().toISOString())
      
      // 显示成功状态
      success.value = true
      loading.value = false
      
      // 倒计时跳转
      const timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(timer)
          router.push('/')
        }
      }, 1000)
      
    } else {
      throw new Error(response.data.message || '统一登录验证失败')
    }
    
  } catch (err) {
    console.error('SSO验证失败:', err)
    error.value = true
    loading.value = false
    errorMessage.value = err.message || '验证过程中发生错误'
  }
}

// 重新验证
const retryValidation = () => {
  error.value = false
  loading.value = true
  validateSSO()
}

// 返回
const goBack = () => {
  router.push('/test-sso')
}

// 生命周期
onMounted(() => {
  validateSSO()
})
</script>

<style scoped>
.sso-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4fc3f7 0%, #0288d1 100%);
  padding: 20px;
}

.sso-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  text-align: center;
  max-width: 500px;
  width: 100%;
}

.sso-header {
  margin-bottom: 30px;
}

.sso-header h2 {
  color: #0288d1;
  font-size: 2em;
  margin-bottom: 10px;
  font-weight: 300;
}

.sso-header p {
  color: #666;
  font-size: 1.1em;
}

.loading-section {
  padding: 40px 0;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #0288d1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-section p {
  color: #666;
  font-size: 1.1em;
}

.error-section {
  padding: 20px 0;
}

.error-icon {
  font-size: 4em;
  color: #dc3545;
  margin-bottom: 20px;
}

.error-section h3 {
  color: #dc3545;
  font-size: 1.5em;
  margin-bottom: 15px;
}

.error-section p {
  color: #666;
  margin-bottom: 25px;
}

.retry-btn, .back-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1em;
  margin: 0 10px;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.retry-btn:hover {
  background: #0056b3;
  transform: translateY(-2px);
}

.back-btn {
  background: #6c757d;
}

.back-btn:hover {
  background: #545b62;
  transform: translateY(-2px);
}

.success-section {
  padding: 20px 0;
}

.success-icon {
  font-size: 4em;
  color: #28a745;
  margin-bottom: 20px;
}

.success-section h3 {
  color: #28a745;
  font-size: 1.5em;
  margin-bottom: 15px;
}

.success-section p {
  color: #666;
  margin-bottom: 15px;
}

.countdown {
  color: #0288d1;
  font-size: 1.2em;
  font-weight: bold;
}

@media (max-width: 768px) {
  .sso-card {
    padding: 30px 20px;
    margin: 20px;
  }
  
  .sso-header h2 {
    font-size: 1.6em;
  }
  
  .retry-btn, .back-btn {
    padding: 10px 20px;
    font-size: 0.9em;
    margin: 5px;
  }
}
</style>
