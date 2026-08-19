const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { isAdmin } = require('../middlewares/authMiddleware');
const prisma = new PrismaClient();

// POST /api/books - 新增書籍
router.post('/', isAdmin, async (req, res) => {
    try {
        const { isbn, title, author, publishYear, coverUrl } = req.body;
        
        if (!isbn || !title) {
            return res.status(400).json({ error: 'ISBN and title are required' });
        }

        // 檢查是否已存在
        const existingBook = await prisma.book.findUnique({
            where: { isbn }
        });

        if (existingBook) {
            return res.status(409).json({ error: 'Book already exists in the system', book: existingBook });
        }

        const newBook = await prisma.book.create({
            data: {
                isbn,
                title,
                author: author || '未知作者',
                publishYear: publishYear ? parseInt(publishYear) : null,
                coverUrl: coverUrl || null
            }
        });

        res.status(201).json(newBook);
    } catch (error) {
        console.error('Error creating book:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/books - 取得所有書籍
router.get('/', async (req, res) => {
    try {
        const books = await prisma.book.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(books);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/books/search/:isbn - 根據 ISBN 搜尋本地書籍
router.get('/search/:isbn', async (req, res) => {
    try {
        const { isbn } = req.params;
        const book = await prisma.book.findUnique({
            where: { isbn }
        });
        
        if (!book) {
            return res.status(404).json({ error: 'Book not found in local catalog' });
        }
        
        res.json(book);
    } catch (error) {
        console.error('Error searching book by isbn:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/books/:id - 編輯書籍
router.put('/:id', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, author, publishYear } = req.body;

        const updatedBook = await prisma.book.update({
            where: { id: parseInt(id) },
            data: {
                title,
                author,
                publishYear: publishYear ? parseInt(publishYear) : null
            }
        });

        res.json(updatedBook);
    } catch (error) {
        console.error('Error updating book:', error);
        res.status(500).json({ error: 'Failed to update book' });
    }
});

// DELETE /api/books/:id - 刪除書籍
router.delete('/:id', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.book.delete({
            where: { id: parseInt(id) }
        });
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json({ error: 'Failed to delete book' });
    }
});

module.exports = router;
