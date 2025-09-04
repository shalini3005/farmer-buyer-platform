// app.js
const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session configuration
app.use(session({
    secret: 'hackathonsecret',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 2 * 60 * 60 * 1000 } // 2 hours
}));

// Make session available in all EJS templates as `session`
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

// Import routes
const authRoutes = require('./routes/auth');
const farmerRoutes = require('./routes/farmer');
const buyerRoutes = require('./routes/buyer');
const adminRoutes = require('./routes/admin');

// Use routes
app.use('/', authRoutes);        // handles /register, /login, /logout
app.use('/farmer', farmerRoutes);
app.use('/buyer', buyerRoutes);
app.use('/admin', adminRoutes);

// Home page
app.get('/', (req, res) => {
    res.render('index'); // index.ejs will use session info
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('404', { message: 'Page not found!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
