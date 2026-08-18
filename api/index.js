const express = require('express');
const cors = require('cors');

// Import routes from the server folder
const booksRouter = require('../server/routes/books');
const lookupRouter = require('../server/routes/lookup');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/books', booksRouter);
app.use('/api/lookup', lookupRouter);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Vercel Serverless Function is running' });
});

// Export the Express app as a Vercel Serverless Function
module.exports = app;
