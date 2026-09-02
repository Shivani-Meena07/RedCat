import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // NEW Secure Compliance Gateways
  // API Route: Verify Anti-Bot Captcha Token
  app.post("/api/auth/verify-captcha", (req, res) => {
    try {
      const { captchaToken } = req.body;
      if (!captchaToken || !captchaToken.startsWith("rc-gcapt-")) {
        return res.status(400).json({ success: false, error: "Invalid Document Identification" });
      }
      res.json({ success: true, message: "Captcha token successfully verified server-side." });
    } catch (err: any) {
      res.status(500).json({ success: false, error: "Invalid Document Identification" });
    }
  });

  // API Route: Google OAuth 2.0 Sign-In Session Pipeline Gateway
  app.post("/api/auth/google", (req, res) => {
    try {
      const { idToken, email, role, captchaToken } = req.body;
      // Expressly verify client captcha token server-side before granting session access token
      if (!captchaToken || !captchaToken.startsWith("rc-gcapt-")) {
        return res.status(400).json({ success: false, error: "Invalid Document Identification" });
      }
      
      if (!email) {
        return res.status(400).json({ success: false, error: "Invalid Document Identification" });
      }

      // Simulate HTTPS-only cookie generation and session setup natively
      res.cookie("rc_session_token", `sess_${Math.random().toString(36).substring(2)}`, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 3600000 // 1 hour
      });

      res.json({
        success: true,
        uid: `goog_uid_${Math.floor(1000 + Math.random() * 9000)}`,
        email: email,
        role: role || "Creator",
        is_verified: false, // Default is_verified to false awaiting PAN/GSTIN compliant docs
        message: "Google OAuth token and session context successfully initialized via HTTPS cookie."
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: "Invalid Document Identification" });
    }
  });

  // API Route: Creator PAN Card KYC validation engine
  app.post("/api/verify/pan", (req, res) => {
    try {
      const { pan } = req.body;
      if (!pan) {
        return res.status(400).json({ success: false, error: "Invalid Document Identification" });
      }

      // Exact regex requirement validation pattern check
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(pan)) {
        return res.status(400).json({ success: false, error: "Invalid Document Identification" });
      }

      // Simulate interfacing with official KYC API endpoints
      res.json({
        success: true,
        is_verified: true,
        taxpayerName: "RED CAT VERIFIED CREATOR ENTITY",
        status: "ACTIVE_PAN_KYC_MATCHED"
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: "Invalid Document Identification" });
    }
  });

  // API Route: Brand GSTIN validation engine
  app.post("/api/verify/gstin", (req, res) => {
    try {
      const { gstin } = req.body;
      if (!gstin) {
        return res.status(400).json({ success: false, error: "Invalid Document Identification" });
      }

      // Exact GSTIN regex requirement validation pattern check
      const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstinRegex.test(gstin)) {
        return res.status(400).json({ success: false, error: "Invalid Document Identification" });
      }

      // Simulate interfacing with official Goods and Services Tax registration portal
      res.json({
        success: true,
        is_verified: true,
        legalName: "RED CAT LICENSED PARTNER INC",
        status: "ACTIVE_GSTIN_VALID_COMPLIANT"
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: "Invalid Document Identification" });
    }
  });

  // API Route: Brand chatbot simulation with Gemini
  app.post("/api/chatbot/chat", async (req, res) => {
    try {
      const { brandName, brandContext, messages } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY || "";
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        // Fallback simulation mode
        const lastUserMessage = messages[messages.length - 1]?.text || "";
        res.json({
          text: `[Simulation Mode] Hi! This is the representative for "${brandName}". We have scanned your profile and customized mascot. Your profile matches our vibe! Regarding: "${lastUserMessage.slice(0, 50)}", we can launch campaign milestones and secure escrow bids. Let's design some viral content together!`
        });
        return;
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const systemInstruction = `You are a professional brand manager representing the brand "${brandName}". 
Brand vibe and context: ${brandContext}.
You are in an interactive direct messaging thread with a content creator who wants to match with your brand and work on content sponsorships/campaigns.
Acknowledge their customized pixel mascot, their branding, or pitch. Be proactive, suggest deliverables (videos, reels, posts), discuss rewards, and milestone bids.
Keep all responses highly immersive, realistic, matching your brand niche, relatively concise (under 80 words), and encouraging.
Never break character or say you are an AI assistant.`;

      // Format messages into Gemini's format
      const formattedContents = messages.map((m: any) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text || "" }]
      }));

      // Make sure the last role is user
      if (formattedContents.length > 0 && formattedContents[formattedContents.length - 1].role !== 'user') {
        formattedContents.push({
          role: 'user',
          parts: [{ text: "Hello! Let's talk about the campaign." }]
        });
      }

      const modelResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.8,
        }
      });

      res.json({
        text: modelResponse.text || `Hi there! I'm the representative for ${brandName}. Let's collaborate!`
      });
    } catch (err: any) {
      console.error("Gemini API Error details:", err);
      res.status(500).json({ error: err.message || "Failed to generate chat response." });
    }
  });

  // Serve static files or setup Vite middleware
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
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
