// backend/server.js
// App entry point. Wires together Express, middleware, routes.

import express from "express";
import cors    from "cors";
import path    from "path";
import { fileURLToPath } from "url";
import config       from "./config/app.js";
import apiRoutes    from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// ── Global middleware ─────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── API routes ────────────────────────────────────────────────────────────────
app.use("/api", apiRoutes);

// ── Serve React build (production only) ──────────────────────────────────────
if (config.server.isProd) {
  const build = path.join(__dirname, "public");
  app.use(express.static(build));
  app.get("*", (_req, res) => res.sendFile(path.join(build, "index.html")));
}

// ── Global error handler (must be last) ──────────────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(config.server.port, () => {
  console.log("\n🚀 Curriculum Agent API");
  console.log(`   http://localhost:${config.server.port}`);
  console.log(`   ENV        : ${config.server.env}`);
  console.log(`   Azure AI   : ${config.isAzureConfigured ? "✅ configured" : "⚠️  not configured (sample mode)"}`);
  console.log(`   Foundry IQ : ${config.foundry.isConfigured ? "✅ configured" : "⚠️  static fallback"}`);
  console.log("\n   Endpoints:");
  console.log("   POST   /api/curricula         — generate (SSE)");
  console.log("   GET    /api/curricula/sample  — sample data");
  console.log("   GET    /api/curricula/history — list saved");
  console.log("   GET    /api/curricula/history/:id");
  console.log("   DELETE /api/curricula/history/:id");
  console.log("   GET    /api/health\n");
});
