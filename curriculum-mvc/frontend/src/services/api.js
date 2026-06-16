// frontend/src/services/api.js
// All HTTP calls go through here. Components never call fetch() directly.
// Base URL comes from CRA proxy in dev, same origin in production.

const BASE = "/api";

/**
 * Streams curriculum generation via SSE.
 * Calls onProgress({ step, message }) for each step.
 * Calls onComplete(curriculum) when done.
 * Calls onError(message) on failure.
 * Returns an AbortController so the caller can cancel.
 */
export function streamGenerate(input, { onProgress, onComplete, onError }) {
  const controller = new AbortController();

  (async () => {
    try {
      const res = await fetch(`${BASE}/curricula`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        onError(err.error || "Request failed");
        return;
      }

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer    = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop(); // keep incomplete line

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === "progress") onProgress({ step: event.step, message: event.message });
            if (event.type === "complete")  onComplete(event.curriculum);
            if (event.type === "error")     onError(event.message);
          } catch { /* skip malformed lines */ }
        }
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      onError(err.message);
    }
  })();

  return controller;
}

/** GET /api/curricula/sample */
export async function fetchSample() {
  const res  = await fetch(`${BASE}/curricula/sample`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.curriculum;
}

/** GET /api/curricula/history */
export async function fetchHistory() {
  const res  = await fetch(`${BASE}/curricula/history`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.items;
}

/** GET /api/curricula/history/:id */
export async function fetchHistoryById(id) {
  const res  = await fetch(`${BASE}/curricula/history/${id}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.entry;
}

/** DELETE /api/curricula/history/:id */
export async function deleteHistory(id) {
  const res  = await fetch(`${BASE}/curricula/history/${id}`, { method: "DELETE" });
  const data = await res.json();
  return data.success;
}

/** GET /api/health */
export async function fetchHealth() {
  const res  = await fetch(`${BASE}/health`);
  return res.json();
}
