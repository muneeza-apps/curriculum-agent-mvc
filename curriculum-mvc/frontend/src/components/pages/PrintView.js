import React from "react";

const BLOOM_COLORS = {
  Remember: "#6366f1", Understand: "#8b5cf6", Apply: "#06b6d4",
  Analyze: "#f59e0b", Evaluate: "#ef4444", Create: "#10b981",
};

export default function PrintView({ curriculum, onClose }) {
  const { meta, objectives, lessonPlans, quizzes, activities, weeklyProject, progression } = curriculum;

  return (
    <div className="print-overlay">
      {/* Screen-only controls */}
      <div className="print-controls no-print">
        <div className="print-controls-inner">
          <div>
            <h2>Print Preview</h2>
            <p>Optimised for A4 paper · Teachers can print or save as PDF from browser</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="print-action-btn" onClick={() => window.print()}>🖨️ Print / Save PDF</button>
            <button className="print-close-btn" onClick={onClose}>✕ Close</button>
          </div>
        </div>
      </div>

      <div className="print-document">
        {/* ── Cover ── */}
        <div className="print-cover">
          <div className="print-cover-tag">5-Day Curriculum Plan</div>
          <h1 className="print-title">{meta.topic}</h1>
          <div className="print-cover-meta">
            <span>{meta.ageGroup}</span>
            <span className="print-dot">·</span>
            <span>{meta.difficulty}</span>
            {meta.specialNeeds !== "None" && (
              <>
                <span className="print-dot">·</span>
                <span>Accessibility: {meta.specialNeeds}</span>
              </>
            )}
          </div>
          <div className="print-cover-date">
            Generated {new Date(meta.generatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            {" "}· Microsoft Foundry IQ Agent
          </div>

          {/* Prerequisites & Key Concepts */}
          <div className="print-cover-grid">
            {objectives?.prerequisites && (
              <div className="print-cover-box">
                <div className="print-box-label">Prerequisites</div>
                <ul>{objectives.prerequisites.map((p, i) => <li key={i}>{p}</li>)}</ul>
              </div>
            )}
            {objectives?.key_concepts && (
              <div className="print-cover-box">
                <div className="print-box-label">Key Concepts</div>
                <div className="print-concept-chips">
                  {objectives.key_concepts.map((c, i) => <span key={i} className="print-chip">{c}</span>)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Weekly Objectives Table ── */}
        <section className="print-section">
          <h2 className="print-section-title">Learning Objectives</h2>
          <table className="print-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Objective</th>
                <th>Bloom's Level</th>
              </tr>
            </thead>
            <tbody>
              {objectives?.objectives?.map((o) => (
                <tr key={o.day}>
                  <td className="print-day-cell">Day {o.day}</td>
                  <td>{o.objective}</td>
                  <td>
                    <span className="print-bloom" style={{ background: BLOOM_COLORS[o.bloom_level] }}>
                      {o.bloom_level}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* ── Lesson Plans ── */}
        <section className="print-section">
          <h2 className="print-section-title">Daily Lesson Plans</h2>
          {lessonPlans?.map((lesson) => (
            <div key={lesson.day} className="print-lesson-block">
              <div className="print-lesson-header">
                <span className="print-day-badge">Day {lesson.day}</span>
                <span className="print-lesson-title">{lesson.title}</span>
              </div>

              {/* Objective */}
              <div className="print-objective-row">
                <strong>Objective:</strong> {lesson.objective_targeted}
              </div>

              {/* Lesson plan table */}
              <table className="print-table print-lesson-table">
                <thead>
                  <tr><th>Phase</th><th>Duration</th><th>Description</th><th>Method</th></tr>
                </thead>
                <tbody>
                  {lesson.lesson_plan && Object.entries(lesson.lesson_plan).map(([key, val]) => (
                    <tr key={key}>
                      <td className="print-phase-cell">
                        {key.replace(/_/g," ").replace(/\b\w/g, l => l.toUpperCase())}
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>{val.duration}</td>
                      <td>{val.description}</td>
                      <td>{val.method || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Materials */}
              {lesson.materials_needed && (
                <div className="print-materials">
                  <strong>Materials:</strong> {lesson.materials_needed.join(", ")}
                </div>
              )}

              {/* Differentiation */}
              {lesson.differentiation && (
                <div className="print-diff-grid">
                  <div className="print-diff-box print-diff-support">
                    <div className="print-diff-label">🤝 Struggling Learners</div>
                    <div>{lesson.differentiation.for_struggling}</div>
                  </div>
                  <div className="print-diff-box print-diff-advanced">
                    <div className="print-diff-label">🚀 Advanced Learners</div>
                    <div>{lesson.differentiation.for_advanced}</div>
                  </div>
                  <div className="print-diff-box print-diff-special">
                    <div className="print-diff-label">♿ Special Needs</div>
                    <div>{lesson.differentiation.for_special_needs}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </section>

        {/* ── Quizzes ── */}
        <section className="print-section">
          <h2 className="print-section-title">Assessments & Quizzes</h2>
          {quizzes?.map((quiz) => (
            <div key={quiz.day} className="print-quiz-block">
              <div className="print-quiz-header">
                Day {quiz.day} Quiz
                <span className="print-difficulty">Difficulty: {quiz.difficulty_score}/10</span>
              </div>
              {quiz.questions?.map((q, i) => (
                <div key={i} className="print-question">
                  <div className="print-q-stem">
                    <span className="print-q-num">Q{i+1}</span>
                    <span className="print-q-bloom">[{q.bloom_level}]</span>
                    {q.question}
                  </div>
                  <div className="print-options">
                    {q.options?.map((opt, j) => (
                      <div
                        key={j}
                        className={`print-option ${opt[0] === q.correct_answer ? "print-correct" : ""}`}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                  <div className="print-answer">
                    ✓ Answer: {q.correct_answer} — {q.explanation}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </section>

        {/* ── Activities ── */}
        <section className="print-section">
          <h2 className="print-section-title">Daily Activities</h2>
          <table className="print-table">
            <thead>
              <tr><th>Day</th><th>Activity</th><th>Type</th><th>Time</th><th>Learning Outcome</th></tr>
            </thead>
            <tbody>
              {activities?.map((a) => (
                <tr key={a.day}>
                  <td className="print-day-cell">Day {a.day}</td>
                  <td><strong>{a.title}</strong><br/><small>{a.description}</small></td>
                  <td>{a.type}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{a.estimated_time}</td>
                  <td>{a.learning_outcome}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* ── Weekly Project ── */}
        {weeklyProject && (
          <section className="print-section">
            <h2 className="print-section-title">Weekly Capstone Project</h2>
            <div className="print-project-box">
              <div className="print-project-title">{weeklyProject.title}</div>
              <p>{weeklyProject.description}</p>
              <div className="print-deliverable">
                <strong>Deliverable:</strong> {weeklyProject.deliverable}
              </div>
              <div className="print-rubric">
                <strong>Assessment Rubric:</strong>
                <ol>{weeklyProject.rubric?.map((r, i) => <li key={i}>{r}</li>)}</ol>
              </div>
            </div>
          </section>
        )}

        {/* ── Difficulty Progression ── */}
        {progression?.progression && (
          <section className="print-section">
            <h2 className="print-section-title">Difficulty Progression</h2>
            <table className="print-table">
              <thead>
                <tr><th>Day</th><th>Score</th><th>Stage</th><th>Focus</th><th>Cognitive Load</th></tr>
              </thead>
              <tbody>
                {progression.progression.map((p) => (
                  <tr key={p.day}>
                    <td className="print-day-cell">Day {p.day}</td>
                    <td>{p.score}/10</td>
                    <td>{p.label}</td>
                    <td>{p.focus}</td>
                    <td>{p.cognitive_load}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {progression.rationale && (
              <p className="print-rationale">{progression.rationale}</p>
            )}
          </section>
        )}

        {/* ── Footer ── */}
        <div className="print-footer">
          <span>Curriculum Builder Agent · Microsoft Foundry IQ</span>
          <span>Generated {new Date(meta.generatedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
