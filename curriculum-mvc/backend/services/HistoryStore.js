// backend/services/HistoryStore.js
// Handles reading/writing curriculum history to a local JSON file.
// In production you'd swap this for a real DB (Postgres, MongoDB).

import fs   from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { createHistoryEntry, toSummary } from "../models/History.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORE_PATH = path.join(__dirname, "../data/history.json");
const MAX_ENTRIES = 50;

async function ensureStore() {
  const dir = path.dirname(STORE_PATH);
  await fs.mkdir(dir, { recursive: true });
  try {
    await fs.access(STORE_PATH);
  } catch {
    await fs.writeFile(STORE_PATH, JSON.stringify({ curricula: [] }, null, 2));
  }
}

async function read() {
  await ensureStore();
  const raw = await fs.readFile(STORE_PATH, "utf-8");
  return JSON.parse(raw);
}

async function write(data) {
  await fs.writeFile(STORE_PATH, JSON.stringify(data, null, 2));
}

export async function save(curriculum) {
  const store = await read();
  const entry = createHistoryEntry(curriculum);
  store.curricula.unshift(entry);
  if (store.curricula.length > MAX_ENTRIES)
    store.curricula = store.curricula.slice(0, MAX_ENTRIES);
  await write(store);
  return entry;
}

export async function list() {
  const store = await read();
  return store.curricula.map(toSummary);
}

export async function getById(id) {
  const store = await read();
  return store.curricula.find((c) => c.id === id) || null;
}

export async function remove(id) {
  const store = await read();
  const before = store.curricula.length;
  store.curricula = store.curricula.filter((c) => c.id !== id);
  await write(store);
  return store.curricula.length < before;
}
