require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

console.log("ENV CHECK:");
console.log("DB_HOST =", process.env.DB_HOST);
console.log("DB_USER =", process.env.DB_USER);
console.log("DB_PASSWORD =", process.env.DB_PASSWORD ? "Loaded" : "Missing");

require('./db');

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("AEROX CHAT BACKEND RUNNING");
});

app.listen(PORT, () => {
  console.log(`Server running in development mode on port ${PORT}`);
});
