const express = require('express');
const router = express.Router();

// 模拟SSO token验证接口
router.post('/token', (req, res) => {
    try {
        const { appkey, appsecret, code } = req.body;
        
        // 验证应用密钥
        if (appkey !== 'dashboard_system' || appsecret !== 'dashboard_secret_2024') {
            return res.json({
                success: false,
                message: '应用密钥验证失败'
            });
        }
        
        // 模拟验证成功
        const mockUserData = {
            access_token: 'mock_token_' + Date.now(),
            ssousername: 'test_user',
            username: '测试用户',
            roleid: 'user',
            xzqh: '610100',
            nickname: '测试昵称',
            tel: '13800138000',
            isBindUser: true
        };
        
        res.json({
            success: true,
            message: '验证成功',
            data: mockUserData
        });
        
    } catch (error) {
        console.error('模拟SSO验证失败:', error);
        res.json({
            success: false,
            message: '验证过程中发生错误'
        });
    }
});

// 模拟SSO登录页面
router.get('/login', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>模拟统一登录系统</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    background: linear-gradient(135deg, #4fc3f7 0%, #0288d1 100%);
                    margin: 0;
                    padding: 20px;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .login-container { 
                    background: white;
                    border-radius: 20px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                    padding: 40px;
                    max-width: 400px;
                    width: 100%;
                }
                .login-header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .login-header h2 {
                    color: #0288d1;
                    margin-bottom: 10px;
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
                .form-group input {
                    width: 100%;
                    padding: 12px 16px;
                    border: 2px solid #e1e5e9;
                    border-radius: 8px;
                    font-size: 1em;
                    box-sizing: border-box;
                }
                .form-group input:focus {
                    outline: none;
                    border-color: #0288d1;
                }
                .login-btn {
                    width: 100%;
                    background: linear-gradient(135deg, #4fc3f7 0%, #0288d1 100%);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 25px;
                    font-size: 1em;
                    cursor: pointer;
                    transition: transform 0.3s ease;
                }
                .login-btn:hover {
                    transform: translateY(-2px);
                }
                .info {
                    background: #f8f9fa;
                    border-radius: 12px;
                    padding: 20px;
                    margin-top: 20px;
                    border-left: 4px solid #0288d1;
                }
                .info h4 {
                    color: #0288d1;
                    margin-top: 0;
                }
                .info ul {
                    color: #666;
                    padding-left: 20px;
                }
                .info li {
                    margin-bottom: 8px;
                }
            </style>
        </head>
        <body>
            <div class="login-container">
                <div class="login-header">
                    <h2><i class="fas fa-shield-alt"></i> 模拟统一登录系统</h2>
                    <p>这是一个模拟的统一登录页面</p>
                </div>
                
                <form id="loginForm">
                    <div class="form-group">
                        <label for="username">用户名：</label>
                        <input type="text" id="username" name="username" placeholder="请输入用户名" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="password">密码：</label>
                        <input type="password" id="password" name="password" placeholder="请输入密码" required>
                    </div>
                    
                    <button type="submit" class="login-btn">登录</button>
                </form>
                
                <div class="info">
                    <h4>说明：</h4>
                    <ul>
                        <li>这是一个模拟的统一登录系统</li>
                        <li>填写任意用户名和密码即可登录</li>
                        <li>登录成功后会自动跳转到主系统</li>
                        <li>用于测试SSO功能</li>
                    </ul>
                </div>
            </div>
            
            <script>
                document.getElementById('loginForm').addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                    const username = document.getElementById('username').value;
                    const password = document.getElementById('password').value;
                    
                    if (!username || !password) {
                        alert('请填写用户名和密码');
                        return;
                    }
                    
                    // 模拟登录成功，生成code并跳转
                    const code = 'mock_code_' + Date.now();
                    const redirectUrl = 'http://localhost:3001/sso?code=' + code;
                    
                    // 存储模拟的用户信息
                    localStorage.setItem('mock_user_info', JSON.stringify({
                        username: username,
                        password: password,
                        code: code
                    }));
                    
                    // 跳转到主系统
                    window.location.href = redirectUrl;
                });
            </script>
        </body>
        </html>
    `);
});

module.exports = router;
