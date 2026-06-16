// backend/models/History.js
// Shape and helpers for saved curriculum history entries.

import crypto from "crypto";

/**
 * Creates a new history entry wrapping a curriculum.
 */
export function createHistoryEntry(curriculum) {
  return {
    id:        crypto.randomUUID(),
    savedAt:   new Date().toISOString(),
    meta: {
      topic:       curriculum.meta?.topic       || "Unknown",
      ageGroup:    curriculum.meta?.ageGroup    || "",
      difficulty:  curriculum.meta?.difficulty  || "",
      specialNeeds:curriculum.meta?.specialNeeds|| "None",
    },
    curriculum, // full data
  };
}

/**
 * Strips full curriculum from an entry to produce a list summary.
 */
export function toSummary({ id, savedAt, meta }) {
  return { id, savedAt, meta };
}
