const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("./db");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "calorie-check-secret-key";

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, displayName: user.display_name },
    JWT_SECRET,
    { expiresIn: "30d" }
  );
}

// Auth middleware - attach to routes that need auth
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "กรุณาเข้าสู่ระบบ" });
  }

  try {
    const decoded = jwt.verify(header.split(" ")[1], JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Token ไม่ถูกต้องหรือหมดอายุ" });
  }
}

// --- POST /api/auth/register ---

router.post("/register", async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "กรุณากรอกอีเมลและรหัสผ่าน" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" });
    }

    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ? AND provider = 'local'",
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: "อีเมลนี้ถูกใช้งานแล้ว" });
    }

    const hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      "INSERT INTO users (email, password_hash, display_name, provider) VALUES (?, ?, ?, 'local')",
      [email, hash, displayName || email.split("@")[0]]
    );

    const user = {
      id: result.insertId,
      email,
      display_name: displayName || email.split("@")[0],
    };

    res.json({
      success: true,
      token: generateToken(user),
      user: { id: user.id, email, displayName: user.display_name },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาด กรุณาลองใหม่" });
  }
});

// --- POST /api/auth/login ---

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "กรุณากรอกอีเมลและรหัสผ่าน" });
    }

    const [users] = await pool.query(
      "SELECT * FROM users WHERE email = ? AND provider = 'local'",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }

    res.json({
      success: true,
      token: generateToken(user),
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        avatar: user.avatar_url,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาด กรุณาลองใหม่" });
  }
});

// --- POST /api/auth/google ---
// Frontend sends Google ID token, we verify and create/login user

router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: "ไม่พบข้อมูล Google" });
    }

    // Decode Google JWT (header.payload.signature)
    const payload = JSON.parse(
      Buffer.from(credential.split(".")[1], "base64").toString()
    );

    const { sub: googleId, email, name, picture } = payload;

    // Find or create user
    const [existing] = await pool.query(
      "SELECT * FROM users WHERE provider = 'google' AND provider_id = ?",
      [googleId]
    );

    let user;
    if (existing.length > 0) {
      user = existing[0];
      await pool.query(
        "UPDATE users SET display_name = ?, avatar_url = ? WHERE id = ?",
        [name, picture, user.id]
      );
    } else {
      const [result] = await pool.query(
        "INSERT INTO users (email, display_name, avatar_url, provider, provider_id) VALUES (?, ?, ?, 'google', ?)",
        [email, name, picture, googleId]
      );
      user = { id: result.insertId, email, display_name: name, avatar_url: picture };
    }

    res.json({
      success: true,
      token: generateToken(user),
      user: {
        id: user.id,
        email: user.email || email,
        displayName: user.display_name || name,
        avatar: user.avatar_url || picture,
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google" });
  }
});

// --- GET /api/auth/me ---

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const [users] = await pool.query(
      "SELECT id, email, display_name, avatar_url, provider FROM users WHERE id = ?",
      [req.user.id]
    );
    if (users.length === 0) {
      return res.status(404).json({ error: "ไม่พบผู้ใช้" });
    }
    const u = users[0];
    res.json({
      success: true,
      user: {
        id: u.id,
        email: u.email,
        displayName: u.display_name,
        avatar: u.avatar_url,
        provider: u.provider,
      },
    });
  } catch (error) {
    console.error("Me error:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาด" });
  }
});

module.exports = { router, authMiddleware };
