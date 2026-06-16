// frontend/src/hooks/useCurriculum.js
// Encapsulates all curriculum generation state and logic.
// Components just call this hook — no fetch logic in components.

import { useState, useRef, useCallback } from "react";
import { streamGenerate, fetchSample, fetchHistory, fetchHistoryById, deleteHistory } from "../services/api.js";

export function useCurriculum() {
  // ── Phase: "input" | "generating" | "transitioning" | "dashboard" ──────────
  const [phase,        setPhase]        = useState("input");
  const [curriculum,   setCurriculum]   = useState(null);
  const [progressSteps,setProgressSteps]= useState([]);
  const [error,        setError]        = useState(null);
  const [history,      setHistory]      = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const abortRef = useRef(null);

  // ── Generate ─────────────────────────────────────────────────────────────────
  const generate = useCallback((input) => {
    setPhase("generating");
    setProgressSteps([]);
    setError(null);

    const controller = streamGenerate(input, {
      onProgress: (step) => setProgressSteps((prev) => [...prev, step]),
      onComplete: (data) => {
        setPhase("transitioning");
        setTimeout(() => { setCurriculum(data); setPhase("dashboard"); }, 500);
      },
      onError: async (msg) => {
        // Fallback to sample data when API is unavailable
        console.warn("API error, falling back to sample:", msg);
        try {
          const sample = await fetchSample();
          setPhase("transitioning");
          setTimeout(() => { setCurriculum(sample); setPhase("dashboard"); }, 500);
        } catch {
          setError("Could not connect to the server. Is the backend running?");
          setPhase("input");
        }
      },
    });

    abortRef.current = controller;
  }, []);

  // ── Cancel ───────────────────────────────────────────────────────────────────
  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setPhase("input");
    setCurriculum(null);
    setError(null);
  }, []);

  // ── Reset ────────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    setCurriculum(null);
    setPhase("input");
    setError(null);
  }, []);

  // ── History ──────────────────────────────────────────────────────────────────
  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const items = await fetchHistory();
      setHistory(items);
    } catch { setHistory([]); }
    finally { setHistoryLoading(false); }
  }, []);

  const loadFromHistory = useCallback(async (id) => {
    try {
      const entry = await fetchHistoryById(id);
      if (entry?.curriculum) {
        setPhase("transitioning");
        setTimeout(() => { setCurriculum(entry.curriculum); setPhase("dashboard"); }, 400);
      }
    } catch (err) { console.error("loadFromHistory:", err); }
  }, []);

  const removeFromHistory = useCallback(async (id) => {
    await deleteHistory(id);
    setHistory((prev) => prev.filter((h) => h.id !== id));
  }, []);

  return {
    phase, curriculum, progressSteps, error,
    history, historyLoading,
    generate, cancel, reset,
    loadHistory, loadFromHistory, removeFromHistory,
  };
}
