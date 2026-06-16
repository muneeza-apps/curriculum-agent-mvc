// backend/middleware/validate.js
// Runs model validation before the request reaches a controller.

import { validateCurriculumInput, buildCurriculumInput } from "../models/Curriculum.js";
import { fail } from "../utils/response.js";

export function validateGenerate(req, res, next) {
  const input = buildCurriculumInput(req.body);
  const { valid, errors } = validateCurriculumInput(input);
  if (!valid) return fail(res, errors.join("; "));
  req.curriculumInput = input; // attach clean input for controller
  next();
}
