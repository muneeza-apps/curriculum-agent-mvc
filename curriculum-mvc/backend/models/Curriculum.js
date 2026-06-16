// backend/models/Curriculum.js
// The Model layer. Defines the shape of curriculum data and
// provides factory/validation helpers. No DB here — we use
// a file-based store, but the model is still the single source
// of truth for what a curriculum looks like.

export const AGE_GROUPS = [
  "Grade 1-2 (6-8 years)",
  "Grade 3-4 (8-10 years)",
  "Grade 5-6 (10-12 years)",
  "Grade 7-8 (12-14 years)",
  "Grade 9-10 (14-16 years)",
  "Grade 11-12 (16-18 years)",
  "University / Adult",
];

export const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];

export const SPECIAL_NEEDS = [
  "None",
  "Dyslexia",
  "ADHD",
  "English Language Learners (ELL)",
  "Visual Impairment",
  "Hearing Impairment",
  "Multiple Learning Differences",
];

/**
 * Validates raw input fields for curriculum generation.
 * Returns { valid: boolean, errors: string[] }
 */
export function validateCurriculumInput({ topic, ageGroup, difficulty, specialNeeds, subject }) {
  const errors = [];

  if (!topic || typeof topic !== "string")         errors.push("topic is required");
  else if (topic.trim().length < 3)                errors.push("topic must be at least 3 characters");
  else if (topic.trim().length > 200)              errors.push("topic must be under 200 characters");
  else if (/[<>{}\\]/.test(topic))                 errors.push("topic contains invalid characters");

  if (!ageGroup)                                   errors.push("ageGroup is required");
  else if (!AGE_GROUPS.includes(ageGroup))         errors.push(`ageGroup must be one of the allowed values`);

  if (!difficulty)                                 errors.push("difficulty is required");
  else if (!DIFFICULTIES.includes(difficulty))     errors.push(`difficulty must be Beginner, Intermediate, or Advanced`);

  if (specialNeeds && !SPECIAL_NEEDS.includes(specialNeeds))
    errors.push("specialNeeds value is not recognised");

  if (subject && typeof subject === "string" && subject.length > 100)
    errors.push("subject must be under 100 characters");

  return { valid: errors.length === 0, errors };
}

/**
 * Builds a clean, sanitised input object from raw request body.
 */
export function buildCurriculumInput(body) {
  return {
    topic:        String(body.topic || "").trim(),
    subject:      String(body.subject || "").trim(),
    ageGroup:     String(body.ageGroup || ""),
    difficulty:   String(body.difficulty || ""),
    specialNeeds: String(body.specialNeeds || "None"),
  };
}

/**
 * Attaches server-side metadata to a generated curriculum object.
 */
export function attachMeta(curriculum, { iqSource, iqCitations, generationTimeMs }) {
  return {
    ...curriculum,
    meta: {
      ...curriculum.meta,
      iqSource,
      iqCitations: iqCitations || [],
      generationTimeMs,
      generatedAt: new Date().toISOString(),
    },
  };
}
