const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/authMiddleware');

// GET /messages?sender_id=&receiver_id=
// Fetch chat history between two users, order by created_at ASC
router.get('/', verifyToken, async (req, res) => {
    try {
        const { sender_id, receiver_id } = req.query;

        if (!sender_id || !receiver_id) {
            return res.status(400).json({ error: 'Both sender_id and receiver_id query parameters are required' });
        }

        const query = `
            SELECT id, sender_id, receiver_id, message, created_at 
            FROM messages 
            WHERE (sender_id = ? AND receiver_id = ?) 
               OR (sender_id = ? AND receiver_id = ?)
            ORDER BY created_at ASC
        `;

        const [messages] = await db.query(query, [sender_id, receiver_id, receiver_id, sender_id]);

        res.status(200).json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// POST /messages
// Save message to MySQL
router.post('/', verifyToken, async (req, res) => {
    try {
        const { sender_id, receiver_id, message } = req.body;

        if (!sender_id || !receiver_id || !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const query = 'INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)';
        await db.query(query, [sender_id, receiver_id, message]);

        res.status(201).json({ success: true, message: 'Message saved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save message' });
    }
});

module.exports = router;
