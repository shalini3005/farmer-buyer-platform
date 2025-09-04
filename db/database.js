// db/database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Path for database file
const dbPath = path.join(__dirname, 'database.db');

// Create and connect
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Database connection error:', err.message);
    } else {
        console.log('✅ Connected to SQLite database:', dbPath);
    }
});

// Export the database instance directly
module.exports = db;
