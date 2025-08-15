const express = require('express');
const router = express.Router();

// 获取角色列表
router.get('/', (req, res) => {
    try {
        // 模拟角色数据
        const roles = [
            { id: 1, name: '管理员', code: 'admin', description: '系统管理员' },
            { id: 2, name: '普通用户', code: 'user', description: '普通用户' },
            { id: 3, name: '查看者', code: 'viewer', description: '只读用户' }
        ];
        
        res.json({
            success: true,
            data: roles
        });
    } catch (error) {
        console.error('获取角色列表失败:', error);
        res.json({
            success: false,
            message: '获取角色列表失败'
        });
    }
});

// 获取角色详情
router.get('/:id', (req, res) => {
    try {
        const roleId = req.params.id;
        
        // 模拟角色数据
        const roles = {
            '1': { id: 1, name: '管理员', code: 'admin', description: '系统管理员' },
            '2': { id: 2, name: '普通用户', code: 'user', description: '普通用户' },
            '3': { id: 3, name: '查看者', code: 'viewer', description: '只读用户' }
        };
        
        const role = roles[roleId];
        if (role) {
            res.json({
                success: true,
                data: role
            });
        } else {
            res.json({
                success: false,
                message: '角色不存在'
            });
        }
    } catch (error) {
        console.error('获取角色详情失败:', error);
        res.json({
            success: false,
            message: '获取角色详情失败'
        });
    }
});

module.exports = router;
