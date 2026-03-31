require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

/* Root route */
app.get("/", (req, res) => {
  res.send("AEROX CHAT BACKEND RUNNING");
});

/* Register */
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

/* Login */
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

    res.json({
      success: true,
      user: rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

/* GET USERS (IMPORTANT FOR FRIEND LIST) */
app.get("/users", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, username FROM users"
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

/* Get messages */
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
    console.error(err);
    res.status(500).json({ error: "Message fetch failed" });
  }
});

/* Send message */
app.post("/message", async (req, res) => {
  try {
    const { sender_id, receiver_id, message } = req.body;

    await db.query(
      "INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)",
      [sender_id, receiver_id, message]
    );

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Send failed" });
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running in development mode on port ${PORT}`);
});
