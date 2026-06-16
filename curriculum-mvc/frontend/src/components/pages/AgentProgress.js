import React from "react";

const STEP_LABELS = [
  { step: 0, label: "Fetching Foundry IQ context",  icon: "🌐", desc: "Retrieving grounded pedagogical knowledge" },
  { step: 1, label: "Generating objectives",         icon: "🔍", desc: "Mapping Bloom's Taxonomy to your topic" },
  { step: 2, label: "Building lesson plans",         icon: "📋", desc: "Designing 5 daily 50-minute sessions in parallel" },
  { step: 3, label: "Creating quizzes",              icon: "✏️", desc: "Generating aligned MCQ assessments" },
  { step: 4, label: "Designing activities",          icon: "🎯", desc: "Hands-on tasks and curated resources" },
  { step: 5, label: "Mapping difficulty progression",icon: "📈", desc: "Cognitive load curve across the week" },
  { step: 6, label: "Curriculum ready",              icon: "✅", desc: "All steps complete" },
];

export default function AgentProgress({ steps, onCancel }) {
  const completedSteps = steps.map((s) => s.step);
  const currentStep = completedSteps.length > 0 ? Math.max(...completedSteps) : -1;
  const pct = Math.round((completedSteps.length / 7) * 100);

  return (
    <div className="progress-page">
      <div className="progress-header">
        <div className="thinking-indicator">
          <span className="dot" /><span className="dot" /><span className="dot" />
        </div>
        <h2>Agent is reasoning through your curriculum</h2>
        <p>Microsoft Foundry IQ is retrieving pedagogical knowledge and building your week</p>
      </div>

      <div className="steps-list">
        {STEP_LABELS.map(({ step, label, icon, desc }) => {
          const isDone = completedSteps.includes(step);
          const isActive = step === currentStep + 1;
          return (
            <div
              key={step}
              className={`step-item ${isDone ? "step-done" : ""} ${isActive ? "step-active" : ""}`}
            >
              <div className="step-icon-wrap">
                {isDone ? <span className="check">✓</span> : <span>{icon}</span>}
              </div>
              <div className="step-text">
                <div className="step-label">{label}</div>
                <div className="step-desc">{desc}</div>
              </div>
              {isActive && <div className="step-spinner" />}
            </div>
          );
        })}
      </div>

      <div className="progress-bar-wrap">
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="progress-footer">
        <p className="progress-pct">{pct}% complete</p>
        {onCancel && (
          <button className="cancel-btn" onClick={onCancel}>Cancel</button>
        )}
      </div>
    </div>
  );
}
