// routes/buyer.js
const express = require("express");
const router = express.Router();
const db = require("../db/init");

// Middleware: only buyers can access
function requireBuyer(req, res, next) {
  if (!req.session.user || req.session.user.role !== "buyer") {
    return res.redirect("/login");
  }
  next();
}

// ===== Buyer Dashboard =====
router.get("/dashboard", requireBuyer, (req, res) => {
  const buyerId = req.session.user.id;

  // Fetch all farmer products
  db.all(
    "SELECT p.*, u.name as farmer_name, u.id as farmer_id FROM products p JOIN users u ON p.farmer_id = u.id",
    [],
    (err, productRows) => {
      if (err) return res.send("DB Error (products): " + err.message);

      // Fetch buyer’s own requests
      db.all("SELECT * FROM requests WHERE buyer_id = ?", [buyerId], (err2, requestRows) => {
        if (err2) return res.send("DB Error (requests): " + err2.message);

        res.render("buyer_dashboard", {
          farmerProducts: productRows,
          myRequests: requestRows,
          session: req.session
        });
      });
    }
  );
});

// ===== Add Buyer Request =====
router.post("/add-request", requireBuyer, (req, res) => {
  const { crop_name, quantity, price } = req.body;
  const buyerId = req.session.user.id;

  if (!crop_name || !quantity || !price) {
    return res.send("All fields are required!");
  }

  db.run(
    "INSERT INTO requests (buyer_id, crop_name, quantity, price) VALUES (?, ?, ?, ?)",
    [buyerId, crop_name, quantity, price],
    function (err) {
      if (err) return res.send("DB Insert Error: " + err.message);
      console.log("✅ Buyer added request:", crop_name);
      res.redirect("/buyer/dashboard");
    }
  );
});

module.exports = router;
