import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// Lazy initialization of GoogleGenAI client to avoid startup crashes
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY" || key === "GEMINI_API_KEY" || key.trim() === "") {
      throw new Error("GEMINI_API_KEY yozilmagan yoki noto'g'ri sozlash. Iltimos, AI Studio Secrets panelida yoki .env faylida o'zingizning haqiqiy Gemini API kalitingizni kiriting.");
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

// API Route for streaming chat responses
app.post(["/api/chat-stream", "/chat-stream", "/.netlify/functions/api/chat-stream"], async (req, res) => {
  const { messages, systemPrompt } = req.body;
  
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const ai = getAiClient();

    // Filter and map message history to Gemini payload
    const contents = (messages || []).map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content || "" }]
    }));

    // Create stream
    const responseStream = await ai.models.generateContentStream({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction: systemPrompt || "Siz VeloxAI ismli o'ta aqlli, tezkor va xushmuomala sun'iy intellekt yordamchisiz. Foydalanuvchining har qanday savollariga aniq, ravshan va har taraflama mukammal javob berasiz. Savollarga chiroyli tartibda, tushunarli qilish uchun markdown (ro'yxatlar, qalin matn, kod bloklari kabi) formatda javob bering.",
      }
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error: any) {
    console.error("Chat error:", error);
    res.write(`data: ${JSON.stringify({ error: error.message || String(error) })}\n\n`);
    res.end();
  }
});

// API Route for non-streaming chat responses
app.post(["/api/chat", "/chat", "/.netlify/functions/api/chat"], async (req, res) => {
  const { messages, systemPrompt } = req.body;
  try {
    const ai = getAiClient();

    const contents = (messages || []).map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content || "" }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction: systemPrompt || "Siz VeloxAI ismli o'ta aqlli va tezkor sun'iy intellekt yordamchisiz. Foydalanuvchining har qanday savollariga aniq, ravshan va har taraflama mukammal javob erasiz.",
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Chat non-stream error:", error);
    res.status(500).json({ error: error.message || String(error) });
  }
});

// API Route for image generation
app.post(["/api/generate-image", "/generate-image", "/.netlify/functions/api/generate-image"], async (req, res) => {
  const { prompt, aspectRatio = "1:1" } = req.body;
  try {
    const ai = getAiClient();

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        }
      }
    });

    let b64Data = "";
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          b64Data = part.inlineData.data;
          break;
        }
      }
    }

    if (!b64Data) {
      throw new Error("Tasvir yaratib bo'lmadi. Gemini API tasvir qaytarmadi.");
    }

    res.json({ imageUrl: `data:image/png;base64,${b64Data}` });
  } catch (error: any) {
    console.error("Image gen error:", error);
    res.status(500).json({ error: error.message || String(error) });
  }
});

// API Route for text to speech
app.post(["/api/text-to-speech", "/text-to-speech", "/.netlify/functions/api/text-to-speech"], async (req, res) => {
  const { text, voice = "Kore" } = req.body;
  try {
    const ai = getAiClient();

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Say clearly: ${text}` }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      res.json({ audioUrl: `data:audio/wav;base64,${base64Audio}` });
    } else {
      throw new Error("Ovoz hosil qilib bo'lmadi.");
    }
  } catch (error: any) {
    console.error("TTS error:", error);
    res.status(500).json({ error: error.message || String(error) });
  }
});

// Separate standard server runner (not for serverless environment)
async function startServer() {
  const PORT = 3000;

  // Vite middleware for development (Express v4 format app.use)
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

// Only start the server if we're not running in a Netlify or serverless environment
if (!process.env.NETLIFY && !process.env.LAMBDA_TASK_ROOT) {
  startServer();
}

export { app };
