// backend/services/FoundryIQ.js
// Retrieves grounded pedagogical knowledge from Microsoft Foundry IQ.
// Falls back to rich static context when Foundry is not configured.

import config from "../config/app.js";

const STATIC_CONTEXT = `
BLOOM'S TAXONOMY LEVELS:
- Remember   : define, list, recall, identify, name, state
- Understand : explain, describe, summarize, classify, compare
- Apply      : use, solve, demonstrate, execute, implement
- Analyze    : differentiate, organize, examine, break down
- Evaluate   : judge, critique, justify, assess, defend
- Create     : design, construct, produce, generate, plan

COGNITIVE LOAD THEORY (Sweller, 1988):
- Reduce extraneous load (poor design). Manage intrinsic load (material complexity).
- Maximize germane load (schema building). For novices: worked examples first.

VYGOTSKY'S ZPD:
- Pitch each day's challenge just beyond current mastery.
- Use peer work and scaffolding to bridge the ZPD.

UNIVERSAL DESIGN FOR LEARNING (UDL):
- Multiple means of representation, action/expression, and engagement.
- Chunk instructions. Front-load vocabulary. Offer alternatives.

5E LESSON MODEL:
- Engage (5 min) → Explore (15 min) → Explain (15 min) → Elaborate (10 min) → Evaluate (5 min)

ASSESSMENT BEST PRACTICES:
- Align every question to one Bloom's level.
- Use plausible distractors based on common misconceptions.
- Spaced practice across days improves retention.
`;

const STATIC_CITATIONS = [
  "Bloom et al. (1956) — Taxonomy of Educational Objectives",
  "Sweller (1988) — Cognitive Load Theory",
  "Vygotsky (1978) — Mind in Society",
  "CAST (2018) — Universal Design for Learning Guidelines",
];

/**
 * Main entry point. Returns { context, source, citations }.
 */
export async function retrievePedagogyContext(topic, ageGroup, difficulty) {
  if (config.foundry.isConfigured) {
    try {
      return await _queryFoundry(topic, ageGroup, difficulty);
    } catch (err) {
      console.warn("[FoundryIQ] Query failed, using static fallback:", err.message);
    }
  }
  return { context: STATIC_CONTEXT, source: "static", citations: STATIC_CITATIONS };
}

async function _queryFoundry(topic, ageGroup, difficulty) {
  const cs = config.foundry.connectionString;
  const params = Object.fromEntries(
    cs.split(";").map((p) => { const [k, ...v] = p.split("="); return [k.trim(), v.join("=").trim()]; })
  );
  const endpoint    = params.endpoint    || config.azure.endpoint;
  const apiKey      = params.key         || config.azure.apiKey;
  const projectName = params.projectName || "curriculum-agent";

  // Create agent
  const agentRes = await fetch(`${endpoint}agents/v1.0/projects/${projectName}/agents`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": apiKey },
    body: JSON.stringify({
      model: config.azure.deployment,
      name: "pedagogy-retriever",
      instructions: "Return grounded, cited pedagogical guidance.",
      tools: [{ type: "file_search" }],
    }),
  });
  if (!agentRes.ok) throw new Error(`Agent create failed: ${agentRes.status}`);
  const agent = await agentRes.json();

  // Create thread
  const threadRes = await fetch(`${endpoint}agents/v1.0/projects/${projectName}/threads`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": apiKey },
    body: JSON.stringify({
      messages: [{
        role: "user",
        content: `Retrieve pedagogical guidance for "${topic}" — ${ageGroup} — ${difficulty} level.`,
      }],
    }),
  });
  const thread = await threadRes.json();

  // Run
  const runRes = await fetch(`${endpoint}agents/v1.0/projects/${projectName}/threads/${thread.id}/runs`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": apiKey },
    body: JSON.stringify({ assistant_id: agent.id }),
  });
  const run = await runRes.json();

  // Poll
  let status = run.status;
  let attempts = 0;
  while (status === "queued" || status === "in_progress") {
    if (attempts++ > 15) throw new Error("Foundry IQ timeout");
    await new Promise((r) => setTimeout(r, 2000));
    const poll = await fetch(
      `${endpoint}agents/v1.0/projects/${projectName}/threads/${thread.id}/runs/${run.id}`,
      { headers: { "api-key": apiKey } }
    );
    status = (await poll.json()).status;
  }
  if (status !== "completed") throw new Error(`Foundry run ended with: ${status}`);

  // Get messages
  const msgRes = await fetch(
    `${endpoint}agents/v1.0/projects/${projectName}/threads/${thread.id}/messages`,
    { headers: { "api-key": apiKey } }
  );
  const messages = await msgRes.json();
  const msg = messages.data?.find((m) => m.role === "assistant");
  const context   = msg?.content?.[0]?.text?.value || STATIC_CONTEXT;
  const citations = (msg?.content?.[0]?.text?.annotations || []).map((a) => a.text).filter(Boolean);

  return { context, source: "foundry_iq", citations };
}
