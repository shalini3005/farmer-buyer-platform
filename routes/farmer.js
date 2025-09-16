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

// ===== AI-Powered Irrigation Prototype =====
// Simulated irrigation data for demo/hackathon
router.get("/irrigation/:field_id", requireFarmer, async (req, res) => {
  const field_id = req.params.field_id;
  const crop_type = "Wheat"; // hardcoded for demo, can fetch real crop

  // Simulate soil moisture (0-100%)
  const soil_moisture = Math.floor(Math.random() * 100);

  // Simulate rain forecast (mm)
  const rain_forecast = Math.floor(Math.random() * 20);

  // Simple AI/rule-based irrigation logic
  let irrigation_amount = 0;
  if (soil_moisture < 40 && rain_forecast < 10) irrigation_amount = 25;
  else if (soil_moisture < 60 && rain_forecast < 10) irrigation_amount = 10;

  // Save simulated data to DB
  db.run(
    "INSERT INTO irrigation_data (field_id, crop_type, soil_moisture, rain_forecast, irrigation_amount) VALUES (?, ?, ?, ?, ?)",
    [field_id, crop_type, soil_moisture, rain_forecast, irrigation_amount],
    function (err) {
      if (err) console.error("DB Insert Error (irrigation):", err.message);
    }
  );

  // Return JSON to frontend
  res.json({ field_id, crop_type, soil_moisture, rain_forecast, irrigation_amount });
});

router.get("/irrigation-page", (req, res) => {
  if (!req.session.user || req.session.user.role !== "farmer") {
    return res.redirect("/login");
  }
  res.render("irrigation_status", { session: req.session });
});


module.exports = router;
