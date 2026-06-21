const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const OpenAI = require("openai");
const pool = require("./db");
const { router: authRouter, authMiddleware } = require("./auth");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "100mb" }));

app.use("/api/auth", authRouter);

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use("/uploads", express.static(uploadsDir));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// --- Helpers ---

function cleanJsonString(str) {
  let cleaned = str.replace(/```json\s*/gi, "").replace(/```\s*/g, "");
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) return null;
  cleaned = match[0];
  cleaned = cleaned.replace(/,\s*([\]}])/g, "$1");
  return cleaned;
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    const cleaned = cleanJsonString(text);
    if (cleaned) return JSON.parse(cleaned);
    throw new Error("ไม่สามารถอ่านผลวิเคราะห์จาก AI ได้ กรุณาลองใหม่");
  }
}

function saveBase64Image(dataUrl) {
  const matches = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches) return null;
  const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
  const filename = `${crypto.randomUUID()}.${ext}`;
  const filepath = path.join(uploadsDir, filename);
  fs.writeFileSync(filepath, Buffer.from(matches[2], "base64"));
  return filename;
}

// --- Prompt ---

const PROMPT = `คุณเป็นนักโภชนาการผู้เชี่ยวชาญ กรุณาวิเคราะห์ภาพอาหารที่ได้รับ (อาจมีหลายภาพจากหลายมุมมองของอาหารเดียวกัน ให้นำข้อมูลจากทุกภาพมาวิเคราะห์รวมกันเป็นคำตอบเดียว) และให้ข้อมูลดังนี้:

1. **ชื่ออาหาร**: ระบุชื่ออาหารที่เห็นในภาพ (ทั้งภาษาไทยและภาษาอังกฤษ)
2. **ส่วนประกอบหลัก**: ระบุวัตถุดิบหลักที่เห็น
3. **ปริมาณแคลอรี่โดยประมาณ**: ประเมินแคลอรี่ต่อจานที่เห็น (kcal)
4. **สารอาหารหลัก**:
   - โปรตีน (กรัม)
   - คาร์โบไฮเดรต (กรัม)
   - ไขมัน (กรัม)
   - ไฟเบอร์ (กรัม)
5. **คำอธิบายสารอาหารแต่ละตัว**: อธิบายรายละเอียดว่าสารอาหารแต่ละตัวมาจากส่วนประกอบไหนของอาหาร เป็นชนิดอะไร ดีหรือไม่ดีต่อสุขภาพอย่างไร ให้ข้อมูลเชิงลึกเพื่อให้ผู้ใช้เข้าใจ
6. **คำแนะนำด้านสุขภาพ**: ให้คำแนะนำสั้นๆ เกี่ยวกับอาหารนี้

กรุณาตอบเป็นภาษาไทย และจัดรูปแบบให้อ่านง่าย ใช้ JSON format ดังนี้:
{
  "name": "ชื่ออาหาร",
  "name_en": "Food Name in English",
  "ingredients": ["ส่วนประกอบ1", "ส่วนประกอบ2"],
  "calories": 000,
  "nutrition": {
    "protein": 00,
    "carbs": 00,
    "fat": 00,
    "fiber": 00
  },
  "nutritionDetails": {
    "protein": "อธิบายว่าโปรตีนมาจากอะไร เป็นโปรตีนชนิดใด มีประโยชน์อย่างไร",
    "carbs": "อธิบายว่าคาร์โบไฮเดรตมาจากอะไร เป็นคาร์บเชิงเดี่ยวหรือเชิงซ้อน ดีหรือไม่",
    "fat": "อธิบายว่าไขมันมาจากอะไร เป็นไขมันอิ่มตัวหรือไม่อิ่มตัว ดีหรือไม่ดีต่อสุขภาพ",
    "fiber": "อธิบายว่าไฟเบอร์มาจากอะไร ช่วยร่างกายอย่างไร"
  },
  "healthTip": "คำแนะนำด้านสุขภาพ",
  "confidence": "high/medium/low"
}

ถ้าภาพไม่ใช่อาหาร ให้ตอบ:
{
  "error": "ไม่พบอาหารในภาพ กรุณาถ่ายภาพอาหารใหม่อีกครั้ง"
}`;

// --- POST /api/analyze ---

app.post("/api/analyze", authMiddleware, upload.array("images", 5), async (req, res) => {
  try {
    // Collect all image URLs (from files or JSON body)
    const imageUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const base64 = file.buffer.toString("base64");
        imageUrls.push(`data:${file.mimetype};base64,${base64}`);
      }
    } else if (req.body.images && Array.isArray(req.body.images)) {
      imageUrls.push(...req.body.images);
    } else if (req.body.image) {
      imageUrls.push(req.body.image);
    }

    if (imageUrls.length === 0) {
      return res.status(400).json({ error: "กรุณาส่งภาพอาหาร" });
    }

    const description =
      typeof req.body.description === "string"
        ? req.body.description.trim()
        : "";

    let promptText = PROMPT;
    if (imageUrls.length > 1) {
      promptText += `\n\nผู้ใช้ส่งมา ${imageUrls.length} ภาพ ซึ่งเป็นอาหารเดียวกันจากหลายมุมมอง กรุณาวิเคราะห์รวมจากทุกภาพให้ได้ผลลัพธ์เดียวที่แม่นยำที่สุด`;
    }
    if (description) {
      promptText += `\n\nข้อมูลเพิ่มเติมจากผู้ใช้เกี่ยวกับอาหารนี้ (ใช้ประกอบการวิเคราะห์เพื่อความแม่นยำ เช่น วิธีปรุงหรือวัตถุดิบ): "${description}"`;
    }

    // Build content array with text + all images
    const content = [{ type: "text", text: promptText }];
    for (const url of imageUrls) {
      content.push({
        type: "image_url",
        image_url: { url, detail: "low" },
      });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content }],
      response_format: { type: "json_object" },
      max_tokens: 1500,
    });

    const text = response.choices[0].message.content;
    const parsed = safeJsonParse(text);

    if (parsed.error) {
      return res.json({ success: true, data: parsed });
    }

    // Save all images to disk
    const filenames = imageUrls
      .map((url) => saveBase64Image(url))
      .filter(Boolean);

    // Insert into DB (store multiple filenames as JSON array)
    const [result] = await pool.query(
      `INSERT INTO analyses
        (user_id, image_path, description, name, name_en, calories, protein, carbs, fat, fiber, ingredients, nutrition_details, health_tip, confidence)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        JSON.stringify(filenames),
        description || null,
        parsed.name || "",
        parsed.name_en || "",
        parsed.calories || 0,
        parsed.nutrition?.protein || 0,
        parsed.nutrition?.carbs || 0,
        parsed.nutrition?.fat || 0,
        parsed.nutrition?.fiber || 0,
        JSON.stringify(parsed.ingredients || []),
        JSON.stringify(parsed.nutritionDetails || null),
        parsed.healthTip || null,
        parsed.confidence || "medium",
      ]
    );

    res.json({
      success: true,
      data: parsed,
      analysisId: result.insertId,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({
      error: "เกิดข้อผิดพลาดในการวิเคราะห์ กรุณาลองใหม่อีกครั้ง",
      details: error.message,
    });
  }
});

// --- POST /api/followup ---

app.post("/api/followup", authMiddleware, async (req, res) => {
  try {
    const { analysisId, question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ error: "กรุณาพิมพ์คำถาม" });
    }

    if (!analysisId) {
      return res.status(400).json({ error: "ไม่พบข้อมูลอาหาร" });
    }

    const [rows] = await pool.query(
      "SELECT name, name_en, calories, protein, carbs, fat, fiber, ingredients FROM analyses WHERE id = ? AND user_id = ?",
      [analysisId, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "ไม่พบข้อมูลการวิเคราะห์" });
    }

    const ctx = rows[0];
    const ingredients =
      typeof ctx.ingredients === "string"
        ? JSON.parse(ctx.ingredients)
        : ctx.ingredients;

    const systemPrompt = `คุณเป็นนักโภชนาการผู้เชี่ยวชาญ ผู้ใช้ได้วิเคราะห์อาหารไปแล้วและได้ผลลัพธ์ดังนี้:

ชื่ออาหาร: ${ctx.name} (${ctx.name_en})
แคลอรี่: ${ctx.calories} kcal
โปรตีน: ${ctx.protein}g
คาร์โบไฮเดรต: ${ctx.carbs}g
ไขมัน: ${ctx.fat}g
ไฟเบอร์: ${ctx.fiber}g
ส่วนประกอบ: ${Array.isArray(ingredients) ? ingredients.join(", ") : ""}

กรุณาตอบคำถามของผู้ใช้โดยอ้างอิงจากข้อมูลอาหารนี้ ตอบเป็นภาษาไทย กระชับ เข้าใจง่าย`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question.trim() },
      ],
      max_tokens: 800,
    });

    const answer = response.choices[0].message.content;

    await pool.query(
      "INSERT INTO followups (analysis_id, question, answer) VALUES (?, ?, ?)",
      [analysisId, question.trim(), answer]
    );

    res.json({ success: true, answer });
  } catch (error) {
    console.error("Follow-up error:", error);
    res.status(500).json({
      error: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
      details: error.message,
    });
  }
});

// --- GET /api/history ---

app.get("/api/history", authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, image_path, name, name_en, calories, confidence, created_at FROM analyses WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );
    // Parse image_path JSON for each row
    for (const row of rows) {
      if (typeof row.image_path === "string") {
        try {
          row.image_path = JSON.parse(row.image_path);
        } catch {
          row.image_path = row.image_path ? [row.image_path] : [];
        }
      }
    }
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("History list error:", error);
    res.status(500).json({ error: "ไม่สามารถดึงประวัติได้" });
  }
});

// --- GET /api/history/:id ---

app.get("/api/history/:id", authMiddleware, async (req, res) => {
  try {
    const [analyses] = await pool.query(
      "SELECT * FROM analyses WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );

    if (analyses.length === 0) {
      return res.status(404).json({ error: "ไม่พบข้อมูล" });
    }

    const analysis = analyses[0];

    const [followups] = await pool.query(
      "SELECT question, answer, created_at FROM followups WHERE analysis_id = ? ORDER BY created_at ASC",
      [req.params.id]
    );

    // Normalize JSON fields
    if (typeof analysis.image_path === "string") {
      try {
        analysis.image_path = JSON.parse(analysis.image_path);
      } catch {
        analysis.image_path = analysis.image_path ? [analysis.image_path] : [];
      }
    }
    if (typeof analysis.ingredients === "string") {
      analysis.ingredients = JSON.parse(analysis.ingredients);
    }
    if (typeof analysis.nutrition_details === "string") {
      analysis.nutrition_details = JSON.parse(analysis.nutrition_details);
    }

    res.json({ success: true, data: { ...analysis, followups } });
  } catch (error) {
    console.error("History detail error:", error);
    res.status(500).json({ error: "ไม่สามารถดึงข้อมูลได้" });
  }
});

// --- DELETE /api/history/:id ---

app.delete("/api/history/:id", authMiddleware, async (req, res) => {
  try {
    const [analyses] = await pool.query(
      "SELECT image_path FROM analyses WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );

    if (analyses.length === 0) {
      return res.status(404).json({ error: "ไม่พบข้อมูล" });
    }

    // Delete image files (may be JSON array or single filename)
    if (analyses[0].image_path) {
      let paths = [];
      try {
        paths = JSON.parse(analyses[0].image_path);
      } catch {
        paths = [analyses[0].image_path];
      }
      for (const p of paths) {
        if (p) {
          const filepath = path.join(uploadsDir, p);
          if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
        }
      }
    }

    await pool.query("DELETE FROM analyses WHERE id = ? AND user_id = ?", [
      req.params.id,
      req.user.id,
    ]);

    res.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "ไม่สามารถลบข้อมูลได้" });
  }
});

// --- Version check (reads build timestamp from version.json) ---

app.get("/api/version", (req, res) => {
  try {
    const versionPath = path.join(__dirname, "..", "version.json");
    if (fs.existsSync(versionPath)) {
      const data = JSON.parse(fs.readFileSync(versionPath, "utf8"));
      return res.json(data);
    }
    res.json({ version: "dev", buildTime: new Date().toISOString() });
  } catch {
    res.json({ version: "dev", buildTime: new Date().toISOString() });
  }
});

// --- Health check ---

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Calorie Check API is running" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
