require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("AEROX CHAT BACKEND RUNNING");
});

/* REGISTER */
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    const [existing] = await db.query(
      "SELECT * FROM users WHERE username=?",
      [username]
    );

    if (existing.length > 0) {
      return res.json({ error: "User already exists" });
    }

    await db.query(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, password]
    );

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Register failed" });
  }
});

/* LOGIN */
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const [rows] = await db.query(
      "SELECT * FROM users WHERE username=? AND password=?",
      [username, password]
    );

    if (rows.length === 0) {
      return res.json({ error: "Invalid credentials" });
    }

    res.json(rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

/* USERS */
app.get("/users", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, username FROM users"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.json([]);
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running in development mode on port ${PORT}`);
});
