import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Route for streaming chat responses
  app.post("/api/chat-stream", async (req, res) => {
    const { messages, systemPrompt } = req.body;
    
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    try {
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY sozlanmagan. Iltimos, Secrets bo'limida kalitni kiriting.");
      }

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
  app.post("/api/chat", async (req, res) => {
    const { messages, systemPrompt } = req.body;
    try {
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY sozlanmagan. Iltimos, Secrets bo'limida kalitni kiriting.");
      }

      const contents = (messages || []).map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content || "" }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction: systemPrompt || "Siz VeloxAI ismli o'ta aqlli va tezkor sun'iy intellekt yordamchisiz. Foydalanuvchining har qanday savollariga aniq, ravshan va har taraflama mukammal javob berasiz.",
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Chat non-stream error:", error);
      res.status(500).json({ error: error.message || String(error) });
    }
  });

  // API Route for image generation
  app.post("/api/generate-image", async (req, res) => {
    const { prompt, aspectRatio = "1:1" } = req.body;
    try {
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY sozlanmagan. Secrets menyusini tekshiring.");
      }

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
  app.post("/api/text-to-speech", async (req, res) => {
    const { text, voice = "Kore" } = req.body;
    try {
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY sozlanmagan.");
      }

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

  // Vite middleware for development (Express v4 format app.use)
  if (process.env.NODE_ENV !== "production") {
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

startServer();
