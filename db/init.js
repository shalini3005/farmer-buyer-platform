// db/init.js
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Path for SQLite file
const dbPath = path.join(__dirname, "database.db");

// Connect to SQLite
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Failed to connect to database:", err.message);
  } else {
    console.log("✅ Connected to SQLite database:", dbPath);
  }
});

// ===== Create Tables =====
db.serialize(() => {
  console.log("➡️ Creating tables...");

  // Users table (farmer, buyer, admin)
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('farmer','buyer','admin')) NOT NULL
    )
  `);

  // Products table (farmer posts)
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      farmer_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      quantity TEXT NOT NULL,
      price TEXT NOT NULL,
      harvest_date TEXT,
      FOREIGN KEY(farmer_id) REFERENCES users(id)
    )
  `);

  // Requests table (buyer posts)
  db.run(`
    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      buyer_id INTEGER NOT NULL,
      crop_name TEXT NOT NULL,
      quantity TEXT NOT NULL,
      price TEXT NOT NULL,
      FOREIGN KEY(buyer_id) REFERENCES users(id)
    )
  `);

  console.log("✅ Tables created successfully!");
});

// Export database connection
module.exports = db;
