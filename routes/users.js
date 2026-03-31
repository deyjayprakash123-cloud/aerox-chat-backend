const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/authMiddleware');

// GET /users - Return all users except the currently logged in user
router.get('/', verifyToken, async (req, res) => {
    try {
        const currentUserId = req.user.id;
        
        const query = 'SELECT id, username, created_at FROM users WHERE id != ?';
        const [users] = await db.query(query, [currentUserId]);

        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

module.exports = router;
