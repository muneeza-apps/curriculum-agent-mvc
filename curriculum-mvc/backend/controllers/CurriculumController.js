// backend/controllers/CurriculumController.js
// Handles HTTP logic. Calls agent + services. Never touches DB directly.

import { runCurriculumAgent } from "../agent/curriculumAgent.js";
import * as HistoryStore from "../services/HistoryStore.js";
import { ok, fail, notFound, serverError } from "../utils/response.js";

// ── POST /api/curricula  (SSE streaming) ─────────────────────────────────────
export async function generate(req, res) {
  const input = req.curriculumInput; // set by validate middleware

  // SSE headers
  res.setHeader("Content-Type",  "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection",    "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  const emit = (type, data) => res.write(`data: ${JSON.stringify({ type, ...data })}\n\n`);
  const heartbeat = setInterval(() => res.write(": ping\n\n"), 15000);

  try {
    const result = await runCurriculumAgent(input, (progress) => emit("progress", progress));

    // Auto-save
    try {
      const saved = await HistoryStore.save(result.curriculum);
      result.curriculum.meta.savedId = saved.id;
    } catch (e) {
      console.warn("[CurriculumController] save failed:", e.message);
    }

    emit("complete", { curriculum: result.curriculum });
  } catch (err) {
    console.error("[CurriculumController.generate]", err.message);
    emit("error", { message: err.message });
  } finally {
    clearInterval(heartbeat);
    res.end();
  }
}

// ── GET /api/curricula/sample ─────────────────────────────────────────────────
export function getSample(req, res) {
  // Returns rich static sample so the UI works without an API key
  ok(res, { curriculum: buildSampleCurriculum() });
}

// ── GET /api/curricula ────────────────────────────────────────────────────────
export async function listHistory(req, res) {
  try {
    const items = await HistoryStore.list();
    ok(res, { items });
  } catch (err) { serverError(res, err); }
}

// ── GET /api/curricula/:id ────────────────────────────────────────────────────
export async function getHistory(req, res) {
  try {
    const entry = await HistoryStore.getById(req.params.id);
    if (!entry) return notFound(res);
    ok(res, { entry });
  } catch (err) { serverError(res, err); }
}

// ── DELETE /api/curricula/:id ─────────────────────────────────────────────────
export async function deleteHistory(req, res) {
  try {
    const deleted = await HistoryStore.remove(req.params.id);
    if (!deleted) return notFound(res);
    ok(res, { deleted: true });
  } catch (err) { serverError(res, err); }
}

// ── Sample data builder ───────────────────────────────────────────────────────
function buildSampleCurriculum() {
  return {
    meta: {
      topic: "Introduction to Python Programming",
      subject: "Computer Science",
      ageGroup: "Grade 9-10 (14-16 years)",
      difficulty: "Beginner",
      specialNeeds: "None",
      generatedAt: new Date().toISOString(),
      totalDays: 5,
      iqSource: "static",
      iqCitations: [
        "Bloom et al. (1956) — Taxonomy of Educational Objectives",
        "Sweller (1988) — Cognitive Load Theory",
        "Vygotsky (1978) — Mind in Society",
      ],
      generationTimeMs: 4800,
    },
    objectives: {
      objectives: [
        { objective: "Students will be able to define programming and explain Python's role", bloom_level: "Remember",   day: 1 },
        { objective: "Students will be able to write basic Python scripts using variables",   bloom_level: "Understand", day: 2 },
        { objective: "Students will be able to apply conditional logic to real problems",     bloom_level: "Apply",      day: 3 },
        { objective: "Students will be able to analyze loop structures and their use cases",  bloom_level: "Analyze",    day: 4 },
        { objective: "Students will be able to create a functional Python mini-project",      bloom_level: "Create",     day: 5 },
      ],
      prerequisites: ["Basic computer skills", "Mathematical logic"],
      key_concepts: ["Variables", "Data types", "Conditionals", "Loops", "Functions"],
      teaching_approach: "Hands-on coding with real-world examples and pair programming.",
    },
    lessonPlans: [1,2,3,4,5].map((day) => ({
      day,
      title: ["Welcome to Python","Variables & Data Types","Conditionals","Loops","Capstone Project"][day-1],
      objective_targeted: ["Define programming","Write Python scripts","Apply conditionals","Analyze loops","Create a project"][day-1],
      lesson_plan: {
        warm_up:              { duration:"5 min",  description:"Activate prior knowledge with a quick question", method:"Discussion" },
        instruction:          { duration:"15 min", description:"Direct teaching with live demo",                 method:"Live Demo" },
        guided_practice:      { duration:"15 min", description:"Code-along with the teacher",                   method:"Pair Work" },
        independent_activity: { duration:"10 min", description:"Individual coding exercise" },
        wrap_up:              { duration:"5 min",  description:"Exit ticket — what did you learn?" },
      },
      materials_needed: ["Computers with Python 3", "Projector", "Exercise sheet"],
      differentiation: {
        for_struggling:   "Provide code templates to modify",
        for_advanced:     "Extension challenge problems",
        for_special_needs:"Larger font, printed step-by-step guide",
      },
    })),
    quizzes: [1,2,3,4,5].map((day) => ({
      day,
      difficulty_score: day + 1,
      questions: [
        { question:`Day ${day} sample question about Python`, options:["A. Option A","B. Option B","C. Option C","D. Option D"], correct_answer:"B", explanation:"Option B is correct because it demonstrates the concept.", bloom_level:["Remember","Understand","Apply","Analyze","Evaluate"][day-1] },
        { question:`Day ${day} second question`, options:["A. Option A","B. Option B","C. Option C","D. Option D"], correct_answer:"A", explanation:"Option A is correct.", bloom_level:["Remember","Understand","Apply","Analyze","Evaluate"][day-1] },
        { question:`Day ${day} third question`, options:["A. Option A","B. Option B","C. Option C","D. Option D"], correct_answer:"C", explanation:"Option C is correct.", bloom_level:["Remember","Understand","Apply","Analyze","Evaluate"][day-1] },
      ],
    })),
    activities: [1,2,3,4,5].map((day) => ({
      day,
      title: `Day ${day} Activity`,
      type: ["Individual","Pair Work","Group","Game","Project"][day-1],
      description: `Hands-on activity for Day ${day} reinforcing the lesson objective.`,
      instructions: ["Open the exercise file","Complete the tasks","Test your solution","Share with a partner"],
      estimated_time: "20 minutes",
      learning_outcome: `Demonstrate mastery of Day ${day} concepts`,
    })),
    resources: [
      { title:"Python.org Official Tutorial",  type:"Website",     description:"Official beginner guide",          url:"https://docs.python.org/3/tutorial/", for_day:1 },
      { title:"CS50P — Harvard Python Course", type:"Video",       description:"Free video lectures on Python",    url:"https://cs50.harvard.edu/python/",    for_day:1 },
      { title:"Repl.it — Online Python IDE",   type:"Tool",        description:"Run Python in the browser",        url:"https://replit.com/",                 for_day:2 },
      { title:"Python Tutor — Visualizer",     type:"Interactive", description:"See code execute step-by-step",    url:"https://pythontutor.com/",            for_day:4 },
      { title:"Futurecoder.io",                type:"Interactive", description:"Interactive Python lessons",        url:"https://futurecoder.io/",             for_day:3 },
    ],
    weeklyProject: {
      title: "Python Capstone: Choose Your App",
      description: "Build a complete Python program solving a real problem using all week's concepts.",
      deliverable: "A .py file with inline comments explaining each section",
      rubric: [
        "Correct use of variables with meaningful names",
        "At least 2 conditional blocks",
        "At least 1 loop serving a purpose",
        "Program runs without errors on 3 test inputs",
      ],
    },
    progression: {
      progression: [
        { day:1, score:2, label:"Foundation", focus:"Syntax basics",      cognitive_load:"Low" },
        { day:2, score:3, label:"Building",   focus:"Variables & types",   cognitive_load:"Low-Medium" },
        { day:3, score:5, label:"Applying",   focus:"Conditional logic",   cognitive_load:"Medium" },
        { day:4, score:6, label:"Deepening",  focus:"Loop structures",     cognitive_load:"Medium-High" },
        { day:5, score:8, label:"Mastery",    focus:"Integration project", cognitive_load:"High" },
      ],
      rationale: "Progressive scaffolding follows Vygotsky's ZPD — each day's challenge sits just beyond current mastery. Sweller's worked-example effect is applied Days 1-3; problem-solving takes over Days 4-5.",
      assessment_strategy: "Daily exit tickets for formative data; capstone project is summative.",
    },
  };
}
