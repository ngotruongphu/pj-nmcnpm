import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from 'dotenv';

dotenv.config();

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
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}` 
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",  
        messages: [
          { role: "system", content: "Always and strictly reply in English. Never use any other language under any circumstances" },
          { role: "user", content: inputs }
        ]
      })
    });

    const data = await response.json();
    console.log("ChatGPT response:", data);

    const reply = data?.choices?.[0]?.message?.content || "No response from the server!";
    res.json({ reply });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

app.listen(3000, () => console.log("✅ Server running on http://localhost:3000"));
 