const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const booksRouter = require('./routes/books');
const lookupRouter = require('./routes/lookup');

app.use('/api/books', booksRouter);
app.use('/api/lookup', lookupRouter);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// 提供前端網頁服務 (Serve static files from the parent directory)
app.use(express.static(path.join(__dirname, '../')));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
