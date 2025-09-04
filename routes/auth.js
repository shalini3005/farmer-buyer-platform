// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db/database');

// Middleware to redirect logged-in users
function redirectIfLoggedIn(req, res, next) {
    if (req.session.user) {
        if (req.session.user.role === 'farmer') return res.redirect('/farmer/dashboard');
        if (req.session.user.role === 'buyer') return res.redirect('/buyer/dashboard');
        if (req.session.user.role === 'admin') return res.redirect('/admin');
    }
    next();
}

// ===== REGISTER =====
router.get('/register', redirectIfLoggedIn, (req, res) => {
    res.render('register');
});

router.post('/register', async (req, res) => {
    try {
        const { name, phone, password, role } = req.body;

        // Basic validation
        if (!name || !phone || !password || !role) {
            return res.send('All fields are required!');
        }
        if (!/^\d{10}$/.test(phone)) {
            return res.send('Phone must be exactly 10 digits.');
        }
        if (password.length < 8) {
            return res.send('Password must be at least 8 characters long.');
        }

        // Check if phone already exists
        db.get('SELECT * FROM users WHERE phone = ?', [phone], async (err, user) => {
            if (err) return res.send('DB Error: ' + err.message);
            if (user) return res.send('Phone number already registered!');

            const hashedPassword = await bcrypt.hash(password, 10);
            db.run(
                'INSERT INTO users (name, phone, password, role) VALUES (?, ?, ?, ?)',
                [name, phone, hashedPassword, role],
                function (err) {
                    if (err) return res.send('DB Insert Error: ' + err.message);
                    console.log('New user registered, ID:', this.lastID);
                    return res.redirect('/login');
                }
            );
        });
    } catch (e) {
        console.error(e);
        res.send('Server error during registration.');
    }
});

// ===== LOGIN =====
router.get('/login', redirectIfLoggedIn, (req, res) => {
    res.render('login');
});

router.post('/login', (req, res) => {
    const { phone, password } = req.body;
    if (!phone || !password) return res.send('Phone number and password are required!');

    db.get('SELECT * FROM users WHERE phone = ?', [phone], async (err, user) => {
        if (err) return res.send('DB Error: ' + err.message);
        if (!user) return res.send('User not found! Make sure you registered.');

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.send('Incorrect password!');

        // Set session (store minimal user info)
        req.session.user = { id: user.id, name: user.name, phone: user.phone, role: user.role };

        // Redirect based on role
        if (user.role === 'farmer') return res.redirect('/farmer/dashboard');
        if (user.role === 'buyer') return res.redirect('/buyer/dashboard');
        if (user.role === 'admin') return res.redirect('/admin');
        return res.redirect('/');
    });
});

// ===== LOGOUT =====
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.send('Logout Error: ' + err.message);
        res.redirect('/');
    });
});

module.exports = router;
