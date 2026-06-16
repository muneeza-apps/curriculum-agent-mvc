// backend/routes/index.js
// Single place to mount all route groups.

import { Router } from "express";
import curriculumRoutes from "./curriculum.js";
import healthRoutes     from "./health.js";

const router = Router();

router.use("/curricula", curriculumRoutes);
router.use("/health",    healthRoutes);

// 404 for unknown API paths
router.use((req, res) => {
  res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.originalUrl}` });
});

export default router;
