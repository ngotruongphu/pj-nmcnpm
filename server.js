// 🧠 Route chính gọi OpenAI ChatGPT
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from 'dotenv'; 

dotenv.config();

// 🏗️ Khởi tạo app
const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/ai", async (req, res) => {
  const { inputs } = req.body;
  if (!inputs) return res.status(400).json({ error: "Missing inputs" });

  try {
    // Gọi ChatGPT API (GPT-4o-mini miễn phí nếu bạn dùng key thật)
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}` // 🔑 Thay bằng key thật
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",  // hoặc "gpt-4o", "gpt-3.5-turbo"
        messages: [
          { role: "system", content: "Bạn là trợ lý AI thân thiện, nói tiếng Việt." },
          { role: "user", content: inputs }
        ]
      })
    });

    const data = await response.json();
    console.log("🧠 ChatGPT response:", data);

    // Trích xuất nội dung trả lời
    const reply = data?.choices?.[0]?.message?.content || "🤖 Không có phản hồi.";
    res.json({ reply });
  } catch (err) {
    console.error("🔥 Lỗi gọi ChatGPT:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

app.listen(3000, () => console.log("✅ Server running on http://localhost:3000"));