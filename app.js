// app.js
const express = require("express");
const session = require("express-session");
const path = require("path");
const SQLiteStore = require("connect-sqlite3")(session);

const app = express();
const PORT = 3000;

// ===== Middlewares =====
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    store: new SQLiteStore({ db: "sessions.db", dir: "./db" }),
    secret: "super-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 }, // 1 hour
  })
);

// Pass session to all views
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// ===== View Engine =====
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ===== Routes =====
const authRoutes = require("./routes/auth");
const farmerRoutes = require("./routes/farmer");
const buyerRoutes = require("./routes/buyer");
const messageRoutes = require("./routes/messages");

app.use("/", authRoutes);
app.use("/farmer", farmerRoutes);
app.use("/buyer", buyerRoutes);
app.use("/messages", messageRoutes);

// ===== Home Page =====
app.get("/", (req, res) => {
  res.render("index", { session: req.session });
});

// ===== Start Server =====
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
