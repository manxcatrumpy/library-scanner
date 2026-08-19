const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

const LINE_CHANNEL_ID = process.env.LINE_CHANNEL_ID;
const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;
const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key-please-change';

// 取得基礎網址 (處理 localhost 與 Vercel 雲端環境)
const getBaseUrl = (req) => {
    const host = req.headers['x-forwarded-host'] || req.get('host');
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    return `${protocol}://${host}`;
};

// 1. 產生 LINE 登入網址並轉址
router.get('/line', (req, res) => {
    const callbackUrl = `${getBaseUrl(req)}/api/auth/line/callback`;
    const state = Math.random().toString(36).substring(7);
    
    const authUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${LINE_CHANNEL_ID}&redirect_uri=${encodeURIComponent(callbackUrl)}&state=${state}&scope=profile%20openid`;
    
    res.redirect(authUrl);
});

// 2. 接收 LINE 授權碼並驗證
router.get('/line/callback', async (req, res) => {
    const { code, state, error } = req.query;

    if (error || !code) {
        return res.status(400).send(`登入失敗: ${error || '未取得授權碼'}`);
    }

    const callbackUrl = `${getBaseUrl(req)}/api/auth/line/callback`;

    try {
        // 向 LINE 請求 Access Token
        const tokenResponse = await fetch('https://api.line.me/oauth2/v2.1/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: callbackUrl,
                client_id: LINE_CHANNEL_ID,
                client_secret: LINE_CHANNEL_SECRET,
            })
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
            return res.status(400).send(`取得 Token 失敗: ${tokenData.error_description}`);
        }

        // 取得使用者 Profile (透過 Access Token)
        const profileResponse = await fetch('https://api.line.me/v2/profile', {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`
            }
        });
        
        const profile = await profileResponse.json();

        // 在資料庫中尋找或建立使用者
        let user = await prisma.user.findUnique({
            where: { lineId: profile.userId }
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    lineId: profile.userId,
                    name: profile.displayName,
                    pictureUrl: profile.pictureUrl
                }
            });
        } else {
            // 更新大頭貼和名字
            user = await prisma.user.update({
                where: { lineId: profile.userId },
                data: {
                    name: profile.displayName,
                    pictureUrl: profile.pictureUrl
                }
            });
        }

        // 發行我們的 JWT Token
        const appToken = jwt.sign(
            { id: user.id, name: user.name, role: user.role, pictureUrl: user.pictureUrl },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // 將 Token 回傳給前端 (轉回首頁，並把 token 放在 query 中)
        res.redirect(`/?token=${appToken}`);

    } catch (err) {
        console.error('LINE Login Error:', err);
        res.status(500).send('伺服器錯誤，登入失敗');
    }
});

// 3. 取得目前登入使用者狀態 (驗證 Token)
router.get('/me', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: '未授權' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ user: decoded });
    } catch (err) {
        res.status(401).json({ error: 'Token 無效或已過期' });
    }
});

module.exports = router;
