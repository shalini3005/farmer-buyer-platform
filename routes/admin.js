// routes/admin.js
const express = require("express");
const router = express.Router();
const db = require("../db/init"); // <-- use init.js which you already have

// Middleware: allow only admin
router.use((req, res, next) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.redirect("/login");
  }
  next();
});

// Admin Dashboard (http://localhost:3000/admin)
router.get("/", (req, res) => {
  db.all("SELECT id, name, phone, role FROM users", (err, users) => {
    if (err) return res.status(500).send("Error fetching users");

    db.all(
      `SELECT p.id, u.name AS farmer_name, p.product_name, p.quantity, p.price, p.harvest_date, p.status
       FROM products p JOIN users u ON p.farmer_id = u.id`,
      (err2, products) => {
        if (err2) return res.status(500).send("Error fetching products");

        db.all(
          `SELECT r.id, u.name AS buyer_name, r.product_name, r.quantity, r.price, r.message
           FROM buyer_requests r JOIN users u ON r.buyer_id = u.id`,
          (err3, requests) => {
            if (err3) return res.status(500).send("Error fetching buyer requests");

            res.render("admin_dashboard", {
              session: req.session,
              users: users || [],
              products: products || [],
              requests: requests || []
            });
          }
        );
      }
    );
  });
});

// Delete User
router.post("/delete-user/:id", (req, res) => {
  db.run("DELETE FROM users WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).send("Error deleting user");
    res.redirect("/admin");
  });
});

// Delete Product
router.post("/delete-product/:id", (req, res) => {
  db.run("DELETE FROM products WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).send("Error deleting product");
    res.redirect("/admin");
  });
});

// Delete Buyer Request
router.post("/delete-request/:id", (req, res) => {
  db.run("DELETE FROM buyer_requests WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).send("Error deleting request");
    res.redirect("/admin");
  });
});

module.exports = router;
