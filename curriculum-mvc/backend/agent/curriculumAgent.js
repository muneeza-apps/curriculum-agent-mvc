// backend/agent/curriculumAgent.js
// The AI reasoning pipeline. Not a controller or service —
// it is the "brain" layer that orchestrates multiple LLM calls.

import OpenAI from "openai";
import config from "../config/app.js";
import { retrievePedagogyContext } from "../services/FoundryIQ.js";
import { withRetry } from "../utils/retry.js";

// ── OpenAI client (Azure endpoint) ───────────────────────────────────────────
const client = new OpenAI({
  apiKey:       config.azure.apiKey,
  baseURL:      `${config.azure.endpoint}openai/deployments/${config.azure.deployment}`,
  defaultQuery: { "api-version": config.azure.apiVersion },
  defaultHeaders:{ "api-key": config.azure.apiKey },
});

// ── LLM helper — always returns parsed JSON ──────────────────────────────────
async function llm(system, user, temperature = 0.7) {
  return withRetry(async () => {
    const res = await client.chat.completions.create({
      model: config.azure.deployment,
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
      temperature,
      response_format: { type: "json_object" },
      max_tokens: 2000,
    });
    const raw = res.choices[0].message.content;
    try { return JSON.parse(raw); }
    catch {
      const m = raw.match(/```(?:json)?\s*([\s\S]*?)```/) || raw.match(/(\{[\s\S]*\})/);
      if (m) return JSON.parse(m[1].trim());
      throw new Error("JSON parse failed");
    }
  });
}

// ── Fallbacks (used if a step crashes) ──────────────────────────────────────
const fallback = {
  objectives: (topic) => ({
    objectives: [1,2,3,4,5].map((d) => ({
      objective: `Day ${d}: Study ${topic}`,
      bloom_level: ["Remember","Understand","Apply","Analyze","Create"][d-1],
      day: d,
    })),
    prerequisites: [], key_concepts: [topic], teaching_approach: "Standard instruction",
  }),
  lessons: () => ({ days: Array.from({ length: 5 }, (_, i) => ({
    day: i+1, title: `Day ${i+1}`, objective_targeted: "",
    lesson_plan: {
      warm_up:              { duration:"5 min",  description:"Activate prior knowledge", method:"Discussion" },
      instruction:          { duration:"15 min", description:"Direct teaching",          method:"Lecture" },
      guided_practice:      { duration:"15 min", description:"Worked examples",          method:"Guided" },
      independent_activity: { duration:"10 min", description:"Independent practice" },
      wrap_up:              { duration:"5 min",  description:"Exit ticket" },
    },
    materials_needed: ["Whiteboard"],
    differentiation: { for_struggling:"Extra support", for_advanced:"Extension task", for_special_needs:"Modified materials" },
  })) }),
};

// ── Step functions ────────────────────────────────────────────────────────────
function step1_objectives(topic, ageGroup, difficulty, specialNeeds, ctx) {
  return llm(
    `You are an expert curriculum designer. Use this pedagogical knowledge:\n${ctx.context}\n\nRules: Return ONLY valid JSON. Use Bloom's Taxonomy verbs for objectives.`,
    `Topic: "${topic}" | Age: "${ageGroup}" | Difficulty: "${difficulty}" | Special Needs: "${specialNeeds}"
Return JSON:
{
  "objectives": [
    {"objective":"Students will be able to [verb] [skill]","bloom_level":"Remember","day":1},
    {"objective":"...","bloom_level":"Understand","day":2},
    {"objective":"...","bloom_level":"Apply","day":3},
    {"objective":"...","bloom_level":"Analyze","day":4},
    {"objective":"...","bloom_level":"Create","day":5}
  ],
  "prerequisites":["string"],
  "key_concepts":["string"],
  "teaching_approach":"string"
}`, 0.6
  );
}

function step2_lessons(topic, ageGroup, objectives, specialNeeds, ctx) {
  const list = objectives.map((o) => `Day ${o.day} [${o.bloom_level}]: ${o.objective}`).join("\n");
  return llm(
    `You are a master teacher using the 5E lesson model. Use this knowledge:\n${ctx.context}\n\nReturn ONLY valid JSON.`,
    `Topic: "${topic}" | Age: "${ageGroup}" | Special Needs: "${specialNeeds}"
Objectives:\n${list}
Return JSON with 5 days:
{"days":[{"day":1,"title":"string","objective_targeted":"string",
"lesson_plan":{"warm_up":{"duration":"5 min","description":"string","method":"string"},"instruction":{"duration":"15 min","description":"string","method":"string"},"guided_practice":{"duration":"15 min","description":"string","method":"string"},"independent_activity":{"duration":"10 min","description":"string"},"wrap_up":{"duration":"5 min","description":"string"}},
"materials_needed":["string"],"differentiation":{"for_struggling":"string","for_advanced":"string","for_special_needs":"string"}}]}`
  );
}

function step3_quizzes(topic, ageGroup, objectives, difficulty, ctx) {
  const scores = { Beginner:[2,3,5,6,7], Intermediate:[4,5,6,7,8], Advanced:[5,6,7,8,9] }[difficulty] || [3,4,5,6,7];
  const list   = objectives.map((o) => `Day ${o.day} [${o.bloom_level}]: ${o.objective}`).join("\n");
  return llm(
    `You are an assessment designer. Use this knowledge:\n${ctx.context}\n\nReturn ONLY valid JSON.`,
    `Topic: "${topic}" | Age: "${ageGroup}" | Difficulty: "${difficulty}"
Objectives:\n${list}
Generate 3 MCQ questions per day (15 total).
Return JSON:
{"quizzes":[{"day":1,"difficulty_score":${scores[0]},"questions":[{"question":"string","options":["A. ...","B. ...","C. ...","D. ..."],"correct_answer":"A","explanation":"string","bloom_level":"string"}]}]}`, 0.5
  );
}

function step4_activities(topic, ageGroup, objectives, ctx) {
  const list = objectives.map((o) => `Day ${o.day}: ${o.objective}`).join("\n");
  return llm(
    `You are a creative educator. Use this knowledge:\n${ctx.context}\n\nReturn ONLY valid JSON.`,
    `Topic: "${topic}" | Age: "${ageGroup}"
Objectives:\n${list}
Return JSON:
{"activities":[{"day":1,"title":"string","type":"Individual|Group|Game|Project|Discussion","description":"string","instructions":["Step 1","Step 2"],"estimated_time":"string","learning_outcome":"string"}],
"resources":[{"title":"string","type":"Video|Article|Tool|Website","description":"string","url":"https://...","for_day":1}],
"weekly_project":{"title":"string","description":"string","deliverable":"string","rubric":["criterion 1","criterion 2"]}}`, 0.8
  );
}

function step5_progression(topic, ageGroup, difficulty, ctx) {
  const scores = { Beginner:[2,3,5,6,7], Intermediate:[4,5,6,7,8], Advanced:[5,6,7,8,9] }[difficulty] || [3,4,5,6,7];
  return llm(
    `You are a learning science expert. Use this knowledge:\n${ctx.context}\n\nReturn ONLY valid JSON.`,
    `Topic: "${topic}" | Age: "${ageGroup}" | Difficulty: "${difficulty}"
Return JSON:
{"progression":[
  {"day":1,"score":${scores[0]},"label":"Foundation","focus":"string","cognitive_load":"Low"},
  {"day":2,"score":${scores[1]},"label":"Building",  "focus":"string","cognitive_load":"Low-Medium"},
  {"day":3,"score":${scores[2]},"label":"Applying",  "focus":"string","cognitive_load":"Medium"},
  {"day":4,"score":${scores[3]},"label":"Deepening", "focus":"string","cognitive_load":"Medium-High"},
  {"day":5,"score":${scores[4]},"label":"Mastery",   "focus":"string","cognitive_load":"High"}
],"rationale":"string","assessment_strategy":"string"}`, 0.5
  );
}

// ── Main orchestrator ─────────────────────────────────────────────────────────
export async function runCurriculumAgent(input, onProgress) {
  const { topic, ageGroup, difficulty, specialNeeds, subject } = input;
  const t0 = Date.now();

  // Step 0 — Foundry IQ
  onProgress({ step: 0, message: "Retrieving pedagogical knowledge from Foundry IQ..." });
  let iqContext;
  try {
    iqContext = await retrievePedagogyContext(topic, ageGroup, difficulty);
    console.log(`[Agent] IQ source: ${iqContext.source}`);
  } catch (err) {
    console.warn("[Agent] IQ fallback:", err.message);
    iqContext = { context: "Use standard pedagogical best practices.", source: "fallback", citations: [] };
  }

  // Step 1 — Objectives (must complete before other steps)
  onProgress({ step: 1, message: "Generating learning objectives..." });
  let objectivesData;
  try {
    objectivesData = await step1_objectives(topic, ageGroup, difficulty, specialNeeds, iqContext);
  } catch (err) {
    console.error("[Step 1]", err.message);
    objectivesData = fallback.objectives(topic);
  }

  // Steps 2–5 — parallel
  onProgress({ step: 2, message: "Building lesson plans, quizzes, activities, and progression (parallel)..." });
  const [r2, r3, r4, r5] = await Promise.allSettled([
    step2_lessons    (topic, ageGroup, objectivesData.objectives, specialNeeds, iqContext),
    step3_quizzes    (topic, ageGroup, objectivesData.objectives, difficulty, iqContext),
    step4_activities (topic, ageGroup, objectivesData.objectives, iqContext),
    step5_progression(topic, ageGroup, difficulty, iqContext),
  ]);

  onProgress({ step: 3, message: "Quizzes ready..." });
  onProgress({ step: 4, message: "Activities ready..." });
  onProgress({ step: 5, message: "Difficulty progression mapped..." });

  const lessons    = r2.status === "fulfilled" ? r2.value : fallback.lessons();
  const quizData   = r3.status === "fulfilled" ? r3.value : { quizzes: [] };
  const actData    = r4.status === "fulfilled" ? r4.value : { activities:[], resources:[], weekly_project:null };
  const progData   = r5.status === "fulfilled" ? r5.value : { progression:[], rationale:"", assessment_strategy:"" };

  [r2,r3,r4,r5].forEach((r,i)=> r.status==="rejected" && console.error(`[Step ${i+2}]`, r.reason?.message));

  const curriculum = {
    meta: {
      topic, subject: subject || topic, ageGroup, difficulty,
      specialNeeds: specialNeeds || "None",
      generatedAt: new Date().toISOString(),
      totalDays: 5,
      iqSource: iqContext.source,
      iqCitations: iqContext.citations,
      generationTimeMs: Date.now() - t0,
    },
    objectives:  objectivesData,
    lessonPlans: lessons.days,
    quizzes:     quizData.quizzes,
    activities:  actData.activities,
    resources:   actData.resources,
    weeklyProject: actData.weekly_project,
    progression: progData,
  };

  onProgress({ step: 6, message: "Curriculum ready!" });
  return { success: true, curriculum };
}
