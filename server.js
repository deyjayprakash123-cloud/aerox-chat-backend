require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

/* DEBUG */
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PORT:", process.env.DB_PORT);

/* ROOT */
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
    console.error("REGISTER ERROR:", err);
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
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

/* USERS LIST */
app.get("/users", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, username FROM users"
    );

    res.json(rows);

  } catch (err) {
    console.error("USERS ERROR:", err);
    res.json([]);
  }
});

/* SEND MESSAGE */
app.post("/message", async (req, res) => {
  try {
    const { sender_id, receiver_id, message } = req.body;

    await db.query(
      "INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)",
      [sender_id, receiver_id, message]
    );

    res.json({ success: true });

  } catch (err) {
    console.error("MESSAGE ERROR:", err);
    res.status(500).json({ error: "Send failed" });
  }
});

/* GET MESSAGES */
app.get("/messages", async (req, res) => {
  try {
    const { sender_id, receiver_id } = req.query;

    const [rows] = await db.query(
      `SELECT * FROM messages 
       WHERE (sender_id=? AND receiver_id=?)
       OR (sender_id=? AND receiver_id=?)
       ORDER BY created_at ASC`,
      [sender_id, receiver_id, receiver_id, sender_id]
    );

    res.json(rows);

  } catch (err) {
    console.error("FETCH MESSAGE ERROR:", err);
    res.json([]);
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running in development mode on port ${PORT}`);
});
