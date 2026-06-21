const mysql = require("mysql2/promise");
require("dotenv").config();

async function initDatabase() {
  const dbName = process.env.DB_NAME || "calorie_check";

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "25060"),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: dbName,
    charset: "utf8mb4",
    ssl: { rejectUnauthorized: false },
  });

  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255),
      display_name VARCHAR(255),
      avatar_url VARCHAR(500),
      provider ENUM('local','google') DEFAULT 'local',
      provider_id VARCHAR(255),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_provider (provider, provider_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS analyses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      image_path VARCHAR(500) NOT NULL,
      description TEXT,
      name VARCHAR(255) NOT NULL,
      name_en VARCHAR(255),
      calories INT DEFAULT 0,
      protein FLOAT DEFAULT 0,
      carbs FLOAT DEFAULT 0,
      fat FLOAT DEFAULT 0,
      fiber FLOAT DEFAULT 0,
      ingredients JSON,
      nutrition_details JSON,
      health_tip TEXT,
      confidence VARCHAR(20) DEFAULT 'medium',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS followups (
      id INT AUTO_INCREMENT PRIMARY KEY,
      analysis_id INT NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (analysis_id) REFERENCES analyses(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // Add user_id column if table already exists without it
  try {
    await connection.query(
      "ALTER TABLE analyses ADD COLUMN user_id INT AFTER id, ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE"
    );
    console.log("Added user_id column to analyses table.");
  } catch {
    // Column already exists
  }

  console.log(`Database "${dbName}" initialized successfully.`);
  console.log("Tables created: users, analyses, followups");
  await connection.end();
}

initDatabase().catch((err) => {
  console.error("Failed to initialize database:", err.message);
  process.exit(1);
});
