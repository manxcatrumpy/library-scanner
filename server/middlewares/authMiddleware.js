const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key-please-change';

const isAdmin = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: '未授權' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'ADMIN') {
            return res.status(403).json({ error: '權限不足，需要管理員權限' });
        }
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Token 無效或已過期' });
    }
};

module.exports = { isAdmin };
