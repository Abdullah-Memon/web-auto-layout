const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Admin login (simple authentication)
router.post('/admin/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    db.query(
        'SELECT * FROM users WHERE username = ? AND password = ?',
        [username, password],
        (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Server error' });
            }
            if (results.length === 0) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const user = results[0];
            res.json({
                message: 'Login successful',
                user: { id: user.id, username: user.username, role: user.role }
            });
        }
    );
});

// Get components for public layout
router.get('/components', (req, res) => {
    db.query(
        `
        SELECT c.id, c.type, c.content, c.keywords, l.position
        FROM components c
        LEFT JOIN layout l ON c.id = l.component_id
        ORDER BY l.position
        `,
        (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Server error' });
            }
            res.json(results);
        }
    );
});

// Update layout (reorder components)
router.post('/layout', (req, res) => {
    const { components } = req.body; // Array of { id, position }

    if (!Array.isArray(components) || components.length === 0) {
        return res.status(400).json({ error: 'Invalid components data' });
    }

    // Delete existing layout
    db.query('DELETE FROM layout', (err) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Server error' });
        }

        // Insert new layout
        const values = components.map((c, index) => [c.id, index]);
        db.query(
            'INSERT INTO layout (component_id, position) VALUES ?',
            [values],
            (err) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Server error' });
                }
                res.json({ message: 'Layout updated successfully' });
            }
        );
    });
});

module.exports = router;