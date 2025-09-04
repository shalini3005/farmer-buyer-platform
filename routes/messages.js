// routes/messages.js
const express = require("express");
const router = express.Router();
const db = require("../db/database");

// Middleware: any logged-in user can use messages
function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect("/login");
  next();
}

// Inbox (list messages + users for dropdown)
router.get("/inbox", requireLogin, (req, res) => {
  const userId = req.session.user.id;

  // Get all messages involving this user
  db.all(
    `SELECT m.*, 
            u1.name as sender_name, 
            u2.name as receiver_name
     FROM messages m
     JOIN users u1 ON m.sender_id = u1.id
     JOIN users u2 ON m.receiver_id = u2.id
     WHERE m.sender_id = ? OR m.receiver_id = ?
     ORDER BY m.created_at DESC`,
    [userId, userId],
    (err, messageRows) => {
      if (err) return res.send("DB Error (messages): " + err.message);

      // Get all users (for dropdown selection)
      db.all("SELECT id, name, role FROM users", [], (err2, userRows) => {
        if (err2) return res.send("DB Error (users): " + err2.message);

        res.render("messages", {
          messages: messageRows,
          users: userRows,       // ✅ pass all users
          user: req.session.user // ✅ logged-in user
        });
      });
    }
  );
});

// Send message
router.post("/send", requireLogin, (req, res) => {
  const senderId = req.session.user.id;
  const { receiver_id, message_text } = req.body;

  if (!receiver_id || !message_text) {
    return res.send("All fields are required!");
  }

  db.run(
    "INSERT INTO messages (sender_id, receiver_id, message_text, created_at) VALUES (?, ?, ?, datetime('now'))",
    [senderId, receiver_id, message_text],
    function (err) {
      if (err) return res.send("DB Insert Error (message): " + err.message);
      console.log("✅ Message sent:", message_text);
      res.redirect("/messages/inbox");
    }
  );
});

module.exports = router;
