<template>
  <div class="test-sso-container">
    <div class="test-sso-card">
      <div class="test-sso-header">
        <h2><i class="fas fa-user-check"></i> 模拟统一登录系统</h2>
        <p>这是一个模拟的统一登录页面，用于测试SSO功能</p>
      </div>
      
      <div class="login-form">
        <div class="form-group">
          <label for="username">用户名：</label>
          <input 
            type="text" 
            id="username" 
            v-model="formData.username" 
            placeholder="请输入用户名"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="password">密码：</label>
          <input 
            type="password" 
            id="password" 
            v-model="formData.password" 
            placeholder="请输入密码"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="role">角色：</label>
          <select id="role" v-model="formData.role">
            <option value="admin">管理员</option>
            <option value="user">普通用户</option>
            <option value="viewer">查看者</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="nickname">昵称：</label>
          <input 
            type="text" 
            id="nickname" 
            v-model="formData.nickname" 
            placeholder="请输入昵称"
          />
        </div>
        
        <div class="form-group">
          <label for="tel">电话：</label>
          <input 
            type="tel" 
            id="tel" 
            v-model="formData.tel" 
            placeholder="请输入电话号码"
          />
        </div>
        
        <div class="form-actions">
          <button class="login-btn" @click="handleLogin" :disabled="loading">
            <i class="fas fa-sign-in-alt"></i>
            {{ loading ? '登录中...' : '登录' }}
          </button>
          
          <button class="reset-btn" @click="resetForm">
            <i class="fas fa-undo"></i>
            重置
          </button>
        </div>
      </div>
      
      <div class="test-info">
        <h3>测试说明：</h3>
        <ul>
          <li>这是一个模拟的统一登录系统，用于测试SSO功能</li>
          <li>填写任意信息后点击登录即可模拟登录成功</li>
          <li>登录成功后会自动跳转到主页面</li>
          <li>可以测试用户信息显示、权限控制等功能</li>
        </ul>
        
        <div class="preset-users">
          <h4>预设用户（可选）：</h4>
          <div class="preset-buttons">
            <button 
              v-for="user in presetUsers" 
              :key="user.username"
              class="preset-btn"
              @click="fillPresetUser(user)"
            >
              {{ user.nickname || user.username }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDashboardStore } from '../stores/dashboard'

const router = useRouter()
const store = useDashboardStore()

// 响应式数据
const loading = ref(false)
const formData = ref({
  username: '',
  password: '',
  role: 'user',
  nickname: '',
  tel: ''
})

// 预设用户
const presetUsers = [
  { username: 'admin', password: 'admin123', role: 'admin', nickname: '系统管理员', tel: '13800138000' },
  { username: 'user001', password: 'user123', role: 'user', nickname: '张三', tel: '13800138001' },
  { username: 'viewer001', password: 'viewer123', role: 'viewer', nickname: '李四', tel: '13800138002' }
]

// 处理登录
const handleLogin = async () => {
  if (!formData.value.username || !formData.value.password) {
    alert('请填写用户名和密码')
    return
  }
  
  loading.value = true
  
  try {
    // 模拟登录验证
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 构造用户信息
    const userInfo = {
      ssousername: formData.value.username,
      username: formData.value.username,
      roleid: formData.value.role,
      xzqh: '610100', // 西安市
      nickname: formData.value.nickname || formData.value.username,
      tel: formData.value.tel || '',
      isBindUser: true
    }
    
    // 保存用户信息
    store.setUserInfo(userInfo)
    localStorage.setItem('sso_user_info', JSON.stringify(userInfo))
    localStorage.setItem('sso_login_time', new Date().toISOString())
    
    // 跳转到主页面
    router.push('/')
    
  } catch (error) {
    console.error('登录失败:', error)
    alert('登录失败，请重试')
  } finally {
    loading.value = false
  }
}

// 重置表单
const resetForm = () => {
  formData.value = {
    username: '',
    password: '',
    role: 'user',
    nickname: '',
    tel: ''
  }
}

// 填充预设用户信息
const fillPresetUser = (user) => {
  formData.value = { ...user }
}
</script>

<style scoped>
.test-sso-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4fc3f7 0%, #0288d1 100%);
  padding: 20px;
}

.test-sso-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  max-width: 600px;
  width: 100%;
}

.test-sso-header {
  text-align: center;
  margin-bottom: 30px;
}

.test-sso-header h2 {
  color: #0288d1;
  font-size: 2em;
  margin-bottom: 10px;
  font-weight: 300;
}

.test-sso-header p {
  color: #666;
  font-size: 1.1em;
}

.login-form {
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1em;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #0288d1;
}

.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 25px;
}

.login-btn, .reset-btn {
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-size: 1em;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.login-btn {
  background: linear-gradient(135deg, #4fc3f7 0%, #0288d1 100%);
  color: white;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(2,136,209,0.3);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.reset-btn {
  background: #6c757d;
  color: white;
}

.reset-btn:hover {
  background: #545b62;
  transform: translateY(-2px);
}

.test-info {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  border-left: 4px solid #0288d1;
}

.test-info h3 {
  color: #0288d1;
  margin-bottom: 15px;
  font-size: 1.2em;
}

.test-info ul {
  color: #666;
  margin-bottom: 20px;
  padding-left: 20px;
}

.test-info li {
  margin-bottom: 8px;
  line-height: 1.5;
}

.preset-users h4 {
  color: #333;
  margin-bottom: 12px;
  font-size: 1em;
}

.preset-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.preset-btn {
  background: #e3f2fd;
  color: #0288d1;
  border: 1px solid #b3e5fc;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9em;
  transition: all 0.3s ease;
}

.preset-btn:hover {
  background: #0288d1;
  color: white;
  border-color: #0288d1;
}

@media (max-width: 768px) {
  .test-sso-card {
    padding: 30px 20px;
    margin: 20px;
  }
  
  .test-sso-header h2 {
    font-size: 1.6em;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .preset-buttons {
    justify-content: center;
  }
}
</style>
