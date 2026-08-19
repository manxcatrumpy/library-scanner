const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { isAdmin } = require('../middlewares/authMiddleware');

const prisma = new PrismaClient();

// 取得所有使用者列表 (管理員專用)
router.get('/users', isAdmin, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                pictureUrl: true,
                role: true,
                status: true,
                createdAt: true
            }
        });
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: '無法取得會員列表' });
    }
});

// 核准/拒絕/更新使用者狀態
router.put('/users/:id/status', isAdmin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ error: '無效的狀態' });
    }

    try {
        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { status }
        });
        res.json({ message: '狀態更新成功', user });
    } catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).json({ error: '無法更新使用者狀態' });
    }
});

module.exports = router;
