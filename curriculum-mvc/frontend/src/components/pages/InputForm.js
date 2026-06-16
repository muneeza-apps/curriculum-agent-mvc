import React, { useState } from "react";

const AGE_GROUPS = [
  "Grade 1-2 (6-8 years)",
  "Grade 3-4 (8-10 years)",
  "Grade 5-6 (10-12 years)",
  "Grade 7-8 (12-14 years)",
  "Grade 9-10 (14-16 years)",
  "Grade 11-12 (16-18 years)",
  "University / Adult",
];

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];

const SPECIAL_NEEDS = [
  "None",
  "Dyslexia",
  "ADHD",
  "English Language Learners (ELL)",
  "Visual Impairment",
  "Hearing Impairment",
  "Multiple Learning Differences",
];

export default function InputForm({ onGenerate, error, onShowHistory }) {
  const [form, setForm] = useState({
    topic: "",
    subject: "",
    ageGroup: "",
    difficulty: "Beginner",
    specialNeeds: "None",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.topic || !form.ageGroup) return;
    setLoading(true);
    await onGenerate(form);
    setLoading(false);
  };

  const isValid = form.topic.trim() && form.ageGroup;

  return (
    <div className="form-page">
      <div className="form-topbar">
        <div className="hero-badge">🧠 Powered by Microsoft Foundry IQ</div>
        <button className="topbar-history-btn" onClick={onShowHistory}>📚 History</button>
      </div>
      <div className="form-hero">
        <h1 className="hero-title">
          Curriculum<br />
          <span className="accent">Builder Agent</span>
        </h1>
        <p className="hero-sub">
          Describe your lesson. The agent reasons through pedagogy,<br />
          Bloom's Taxonomy, and learning science — then builds your week.
        </p>
      </div>

      <div className="form-card">
        <div className="form-grid">
          <div className="field full-width">
            <label>Topic or Lesson</label>
            <input
              name="topic"
              type="text"
              placeholder="e.g. Introduction to Python, Photosynthesis, World War II causes"
              value={form.topic}
              onChange={handleChange}
            />
          </div>

          <div className="field full-width">
            <label>Subject Area <span className="optional">(optional)</span></label>
            <input
              name="subject"
              type="text"
              placeholder="e.g. Computer Science, Biology, History"
              value={form.subject}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label>Age Group / Grade Level</label>
            <select name="ageGroup" value={form.ageGroup} onChange={handleChange}>
              <option value="">Select grade level</option>
              {AGE_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div className="field">
            <label>Difficulty Level</label>
            <div className="pill-group">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  className={`pill ${form.difficulty === d ? "pill-active" : ""}`}
                  onClick={() => setForm({ ...form, difficulty: d })}
                  type="button"
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="field full-width">
            <label>Special Learning Needs <span className="optional">(for accessibility)</span></label>
            <select name="specialNeeds" value={form.specialNeeds} onChange={handleChange}>
              {SPECIAL_NEEDS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {error && <div className="error-msg">⚠️ {error}</div>}

        <button
          className={`generate-btn ${!isValid || loading ? "disabled" : ""}`}
          onClick={handleSubmit}
          disabled={!isValid || loading}
        >
          {loading ? "Building curriculum..." : "Generate Week Curriculum →"}
        </button>

        <p className="form-note">
          The agent runs 5 reasoning steps: objectives → lesson plans → quizzes → activities → progression
        </p>
      </div>

      <div className="feature-row">
        <div className="feature-chip">📚 Bloom's Taxonomy aligned</div>
        <div className="feature-chip">♿ Accessibility adapted</div>
        <div className="feature-chip">📊 Difficulty progression curve</div>
        <div className="feature-chip">📄 PDF export ready</div>
      </div>
    </div>
  );
}
