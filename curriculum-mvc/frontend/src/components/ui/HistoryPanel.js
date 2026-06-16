import React from "react";

const DIFFICULTY_COLOR = {
  Beginner: "#10b981",
  Intermediate: "#f59e0b",
  Advanced: "#ef4444",
};

function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function HistoryPanel({ items, loading, onLoad, onDelete, onClose }) {
  return (
    <>
      {/* Backdrop */}
      <div className="history-backdrop" onClick={onClose} />

      {/* Panel */}
      <div className="history-panel">
        <div className="history-header">
          <div>
            <h2>Saved Curricula</h2>
            <p className="history-count">
              {loading ? "Loading..." : `${items.length} curriculum${items.length !== 1 ? "s" : ""} saved`}
            </p>
          </div>
          <button className="history-close" onClick={onClose}>✕</button>
        </div>

        <div className="history-list">
          {loading && (
            <div className="history-empty">
              <div className="history-spinner" />
              <p>Loading history...</p>
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="history-empty">
              <div className="history-empty-icon">📚</div>
              <p>No curricula saved yet.</p>
              <p className="history-empty-sub">Generate your first one to see it here.</p>
            </div>
          )}

          {!loading && items.map((item) => (
            <div key={item.id} className="history-item">
              <div className="history-item-main">
                <div className="history-item-topic">{item.meta.topic}</div>
                <div className="history-item-meta">
                  <span
                    className="history-diff-badge"
                    style={{ color: DIFFICULTY_COLOR[item.meta.difficulty] || "#94a3b8" }}
                  >
                    {item.meta.difficulty}
                  </span>
                  <span className="history-sep">·</span>
                  <span className="history-age-group">{item.meta.ageGroup}</span>
                  {item.meta.specialNeeds && item.meta.specialNeeds !== "None" && (
                    <>
                      <span className="history-sep">·</span>
                      <span className="history-needs">♿ {item.meta.specialNeeds}</span>
                    </>
                  )}
                </div>
                <div className="history-item-time">{timeAgo(item.savedAt)}</div>
              </div>
              <div className="history-item-actions">
                <button
                  className="history-load-btn"
                  onClick={() => onLoad(item.id)}
                >
                  Open
                </button>
                <button
                  className="history-delete-btn"
                  onClick={() => onDelete(item.id)}
                  title="Delete"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
