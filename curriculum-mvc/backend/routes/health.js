// backend/routes/health.js

import { Router } from "express";
import { getHealth } from "../controllers/HealthController.js";

const router = Router();

/**
 * @route  GET /api/health
 * @desc   Server health check + config status
 * @access Public
 */
router.get("/", getHealth);

export default router;
