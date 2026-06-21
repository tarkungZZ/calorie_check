const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "25060"),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "calorie_check",
  waitForConnections: true,
  connectionLimit: 10,
  charset: "utf8mb4",
  ssl: { rejectUnauthorized: false },
});

module.exports = pool;
