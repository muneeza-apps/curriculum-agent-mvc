import React from "react";

export function SkeletonLine({ width = "100%", height = "14px", style = {} }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: "6px", ...style }}
    />
  );
}

export function SkeletonCard({ children, style = {} }) {
  return (
    <div className="skeleton-card" style={style}>
      {children}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="dashboard skeleton-dashboard">
      {/* Header skeleton */}
      <div className="dash-header">
        <div className="dash-meta">
          <SkeletonLine width="80px" height="28px" />
          <SkeletonLine width="100px" height="22px" />
          <SkeletonLine width="80px" height="22px" />
        </div>
        <div className="dash-title-row">
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <SkeletonLine width="320px" height="32px" />
            <SkeletonLine width="200px" height="16px" />
          </div>
          <SkeletonLine width="120px" height="36px" />
        </div>
      </div>

      {/* Objectives strip skeleton */}
      <div className="objectives-strip">
        {[1,2,3,4,5].map((i) => (
          <div key={i} style={{ padding: "14px 16px", borderRight: "1px solid var(--border)" }}>
            <SkeletonLine width="40px" height="12px" style={{ marginBottom: "8px" }} />
            <SkeletonLine width="90%" height="13px" style={{ marginBottom: "4px" }} />
            <SkeletonLine width="70%" height="13px" style={{ marginBottom: "10px" }} />
            <SkeletonLine width="70px" height="20px" style={{ borderRadius: "100px" }} />
          </div>
        ))}
      </div>

      {/* Body skeleton */}
      <div className="dash-body">
        <div className="dash-main" style={{ padding: "24px" }}>
          {/* Day tabs */}
          <div style={{ display: "flex", gap: "4px", marginBottom: "16px" }}>
            {[1,2,3,4,5].map((i) => (
              <SkeletonLine key={i} width="60px" height="32px" style={{ borderRadius: "8px" }} />
            ))}
          </div>
          {/* Content tabs */}
          <div style={{ display: "flex", gap: "0", marginBottom: "24px", borderBottom: "1px solid var(--border)", paddingBottom: "0" }}>
            {[1,2,3].map((i) => (
              <SkeletonLine key={i} width="110px" height="14px" style={{ margin: "0 8px 12px" }} />
            ))}
          </div>
          {/* Lesson plan skeleton */}
          <SkeletonLine width="40%" height="24px" style={{ marginBottom: "12px" }} />
          <SkeletonLine width="100%" height="48px" style={{ marginBottom: "24px", borderRadius: "8px" }} />
          {[1,2,3,4,5].map((i) => (
            <div key={i} style={{ display: "flex", gap: "16px", marginBottom: "16px", alignItems: "flex-start" }}>
              <SkeletonLine width="54px" height="32px" style={{ flexShrink: 0, borderRadius: "8px" }} />
              <div style={{ flex: 1 }}>
                <SkeletonLine width="30%" height="13px" style={{ marginBottom: "6px" }} />
                <SkeletonLine width="85%" height="13px" />
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar skeleton */}
        <div className="dash-sidebar">
          <SkeletonCard>
            <SkeletonLine width="60%" height="14px" style={{ marginBottom: "14px" }} />
            <SkeletonLine width="100%" height="180px" style={{ borderRadius: "8px" }} />
          </SkeletonCard>
          <SkeletonCard>
            <SkeletonLine width="50%" height="14px" style={{ marginBottom: "12px" }} />
            <SkeletonLine width="100%" height="13px" style={{ marginBottom: "8px" }} />
            <SkeletonLine width="80%" height="13px" style={{ marginBottom: "8px" }} />
            <SkeletonLine width="90%" height="13px" />
          </SkeletonCard>
          <SkeletonCard>
            <SkeletonLine width="40%" height="14px" style={{ marginBottom: "12px" }} />
            {[1,2,3].map((i) => (
              <div key={i} style={{ marginBottom: "12px" }}>
                <SkeletonLine width="30%" height="11px" style={{ marginBottom: "4px" }} />
                <SkeletonLine width="70%" height="13px" style={{ marginBottom: "4px" }} />
                <SkeletonLine width="55%" height="11px" />
              </div>
            ))}
          </SkeletonCard>
        </div>
      </div>
    </div>
  );
}
