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
  const { username, password } = req.body;

  try {
    await db.query(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, password]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ error: "User exists" });
  }
});

/* LOGIN */
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const [rows] = await db.query(
    "SELECT * FROM users WHERE username=? AND password=?",
    [username, password]
  );

  if (rows.length > 0) {
    res.json(rows[0]);
  } else {
    res.json({ error: "Invalid credentials" });
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
    console.error(err);
    res.json([]);
  }
});

/* SEND MESSAGE */
app.post("/message", async (req, res) => {
  const { sender_id, receiver_id, message } = req.body;

  await db.query(
    "INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)",
    [sender_id, receiver_id, message]
  );

  res.json({ success: true });
});

/* GET MESSAGES */
app.get("/messages", async (req, res) => {
  const { sender_id, receiver_id } = req.query;

  const [rows] = await db.query(
    `SELECT * FROM messages
     WHERE (sender_id=? AND receiver_id=?)
     OR (sender_id=? AND receiver_id=?)
     ORDER BY created_at ASC`,
    [sender_id, receiver_id, receiver_id, sender_id]
  );

  res.json(rows);
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running in development mode on port ${PORT}`);
});
