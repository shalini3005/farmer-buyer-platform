// routes/farmer.js
const express = require("express");
const router = express.Router();
const db = require("../db/init");

// Middleware: only farmers can access
function requireFarmer(req, res, next) {
  if (!req.session.user || req.session.user.role !== "farmer") {
    return res.redirect("/login");
  }
  next();
}

// ===== Farmer Dashboard =====
router.get("/dashboard", requireFarmer, (req, res) => {
  const farmerId = req.session.user.id;

  // Fetch farmer’s products
  db.all("SELECT * FROM products WHERE farmer_id = ?", [farmerId], (err, productRows) => {
    if (err) return res.send("DB Error (products): " + err.message);

    // Fetch buyer requests
    db.all(
      "SELECT r.*, u.name as buyer_name, u.id as buyer_id FROM requests r JOIN users u ON r.buyer_id = u.id",
      [],
      (err2, requestRows) => {
        if (err2) return res.send("DB Error (requests): " + err2.message);

        res.render("farmer_dashboard", {
          productList: productRows,
          buyerRequests: requestRows,
          session: req.session
        });
      }
    );
  });
});

// ===== Add Product =====
router.post("/add-produce", requireFarmer, (req, res) => {
  const { product_name, quantity, price, harvest_date } = req.body;
  const farmerId = req.session.user.id;

  if (!product_name || !quantity || !price) {
    return res.send("All fields are required!");
  }

  db.run(
    "INSERT INTO products (farmer_id, product_name, quantity, price, harvest_date) VALUES (?, ?, ?, ?, ?)",
    [farmerId, product_name, quantity, price, harvest_date],
    function (err) {
      if (err) return res.send("DB Insert Error: " + err.message);
      console.log("✅ Farmer added product:", product_name);
      res.redirect("/farmer/dashboard");
    }
  );
});

module.exports = router;
