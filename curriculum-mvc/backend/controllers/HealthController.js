// backend/controllers/HealthController.js

import config from "../config/app.js";
import { ok } from "../utils/response.js";

export function getHealth(req, res) {
  ok(res, {
    status: "ok",
    env: config.server.env,
    azureOpenAI: config.isAzureConfigured ? "configured" : "not configured — sample data mode",
    foundryIQ:   config.foundry.isConfigured ? "configured" : "static fallback",
  });
}
