const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

// Load environment variables - MUST be first
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const GROQ_BASE_URL = (process.env.GROQ_BASE_URL || "").trim();
const GROQ_MODEL_NAME = process.env.GROQ_MODEL_NAME || "llama-3.1-8b-instant";
const OPENAI_MODEL_NAME = process.env.OPENAI_MODEL_NAME || "gpt-4o-mini";
const DIST_DIR = path.join(__dirname, "dist");
const DIST_INDEX = path.join(DIST_DIR, "index.html");
const isDevelopment = process.env.NODE_ENV !== "production";

// CORS configuration - allow requests from Vite dev server
app.use(
  cors({
    origin: isDevelopment
      ? ["http://localhost:5173", "http://localhost:5174"]
      : false,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Only serve static files in production
if (!isDevelopment) {
  app.use(express.static(DIST_DIR));
}

/**
 * ensureClient()
 * - Creates a single OpenAI client instance and reuses it.
 * - Supports GROQ API key (GROQ_API_KEY) or OpenAI key (OPENAI_API_KEY).
 */
const ensureClient = (() => {
  let client;

  return () => {
    if (client) return client;

    // Prefer GROQ key if present, otherwise fallback to OpenAI key
    const groqKey = (process.env.GROQ_API_KEY || "").trim();
    const openaiKey = (process.env.OPENAI_API_KEY || "").trim();
    const apiKey = groqKey || openaiKey;

    if (!apiKey) {
      throw new Error(
        "API key missing. Please set GROQ_API_KEY or OPENAI_API_KEY in your .env file at the project root."
      );
    }

    const config = { apiKey };
    if (GROQ_BASE_URL) {
      config.baseURL = GROQ_BASE_URL;
    }

    client = new OpenAI(config);
    return client;
  };
})();

const lengthConfig = {
  short: { label: "8 lines", maxTokens: 200 },
  medium: { label: "16 lines", maxTokens: 400 },
  long: { label: "24 lines", maxTokens: 600 },
};

app.post("/api/lyrics", async (req, res) => {
  const { theme, mood, length } = req.body || {};

  if (!theme || !mood || !length) {
    return res
      .status(400)
      .json({ error: "theme, mood, and length are required" });
  }

  const config = lengthConfig[length];
  if (!config) {
    return res.status(400).json({ error: "Invalid length option" });
  }

  try {
    const client = ensureClient();

    const completion = await client.chat.completions.create({
      model: GROQ_BASE_URL ? GROQ_MODEL_NAME : OPENAI_MODEL_NAME,
      temperature: 0.85,
      max_tokens: config.maxTokens,
      messages: [
        {
          role: "system",
          content:
            "You are a Grammy-winning rap lyricist. Write vivid, original rap verses with strong imagery and internal rhymes. Provide lyrics only—no explanations.",
        },
        {
          role: "user",
          content: `Write a ${config.label} rap verse about the theme "${theme}" with a ${mood} vibe. Keep each line punchy and rhythmic.`,
        },
      ],
    });

    const lyrics = completion?.choices?.[0]?.message?.content?.trim();
    if (!lyrics) {
      throw new Error("OpenAI returned an empty response");
    }

    return res.json({ lyrics });
  } catch (error) {
    console.error("Error generating lyrics:", error.message);
    const status =
      error.message && error.message.includes("API key") ? 500 : 502;
    return res.status(status).json({
      error: "Failed to generate lyrics",
      details: isDevelopment ? error.message : undefined,
    });
  }
});

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", port: PORT, timestamp: new Date().toISOString() });
});

// Serve static files in production
app.get(/.*/, (_req, res) => {
  if (fs.existsSync(DIST_INDEX)) {
    return res.sendFile(DIST_INDEX);
  }

  return res.status(200).type("html").send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Rap Lyrics Generator</title>
    <style>
      body { font-family: Arial, sans-serif; background: #111; color: #eee; text-align: center; padding: 4rem; }
      a { color: #58c4ff; }
    </style>
  </head>
  <body>
    <h1>Frontend build not found</h1>
    <p>No compiled assets were found in the <code>dist</code> directory. Run <code>npm run build</code> to generate the frontend bundle.</p>
  </body>
</html>`);
});

// Start server with comprehensive error handling
const startServer = () => {
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log("\n" + "=".repeat(60));
    console.log("✅ Rap Lyrics Generator Server");
    console.log("=".repeat(60));
    console.log(`🚀 Server: http://localhost:${PORT}`);
    console.log(`📡 API: http://localhost:${PORT}/api/lyrics`);
    console.log(`❤️  Health: http://localhost:${PORT}/api/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log("=".repeat(60) + "\n");
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error("\n" + "=".repeat(60));
      console.error("❌ PORT CONFLICT");
      console.error("=".repeat(60));
      console.error(`Port ${PORT} is already in use!\n`);
      console.error("Windows PowerShell:");
      console.error(`  netstat -ano | findstr :${PORT}`);
      console.error(`  taskkill /PID <PID_NUMBER> /F\n`);
      console.error("Mac/Linux:");
      console.error(`  lsof -i :${PORT}`);
      console.error(`  kill -9 $(lsof -t -i:${PORT})\n`);
      console.error("=".repeat(60) + "\n");
    } else {
      console.error("\n❌ Server failed to start:");
      console.error(error.message);
    }
    process.exit(1);
  });

  // Graceful shutdown handlers
  const shutdown = (signal) => {
    console.log(`\n🛑 ${signal} received, shutting down gracefully...`);
    server.close(() => {
      console.log("✅ Server closed");
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      console.error("❌ Forced shutdown");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  // Handle unhandled promise rejections
  process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
  });

  return server;
};

// Validate environment before starting
const validateEnvironment = () => {
  const groqKey = (process.env.GROQ_API_KEY || "").trim();
  const openaiKey = (process.env.OPENAI_API_KEY || "").trim();
  const hasApiKey = groqKey || openaiKey;

  if (!hasApiKey) {
    console.warn("\n⚠️  WARNING: No API key found in .env");
    console.warn("   The server will start, but /api/lyrics will fail.");
    console.warn("   Add either OPENAI_API_KEY or GROQ_API_KEY to .env\n");
  }

  return true;
};

// Start the server
try {
  validateEnvironment();
  startServer();
} catch (error) {
  console.error("Fatal error during startup:", error.message);
  process.exit(1);
}
