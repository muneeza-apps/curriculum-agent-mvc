// backend/routes/curriculum.js
// Maps HTTP verbs + paths → controller methods.
// All business logic stays in the controller.

import { Router } from "express";
import { validateGenerate } from "../middleware/validate.js";
import {
  generate,
  getSample,
  listHistory,
  getHistory,
  deleteHistory,
} from "../controllers/CurriculumController.js";

const router = Router();

/**
 * @route  POST /api/curricula
 * @desc   Generate a new curriculum (SSE streaming)
 * @access Public
 * @body   { topic, ageGroup, difficulty, specialNeeds?, subject? }
 */
router.post("/", validateGenerate, generate);

/**
 * @route  GET /api/curricula/sample
 * @desc   Returns static sample curriculum (no API key needed)
 * @access Public
 */
router.get("/sample", getSample);

/**
 * @route  GET /api/curricula/history
 * @desc   List all saved curricula (summaries only)
 * @access Public
 */
router.get("/history", listHistory);

/**
 * @route  GET /api/curricula/history/:id
 * @desc   Get one full saved curriculum by ID
 * @access Public
 */
router.get("/history/:id", getHistory);

/**
 * @route  DELETE /api/curricula/history/:id
 * @desc   Delete a saved curriculum by ID
 * @access Public
 */
router.delete("/history/:id", deleteHistory);

export default router;
