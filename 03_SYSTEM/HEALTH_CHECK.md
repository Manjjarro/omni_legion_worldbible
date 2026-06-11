---
type: system
id: HEALTH_CHECK
version: "3.0"
---

# Health Check

```dataviewjs
function resolvePath(val) {
  if (!val) return null;
  if (typeof val === "object" && val.path) return val.path;
  if (typeof val === "string") return val.replace(/^\[\[|\]\]$/g, "");
  return String(val);
}

function keyVariants(val) {
  const raw = resolvePath(val);
  if (!raw) return [];
  return [...new Set([
    raw,
    raw.split("/").pop(),
    raw.replace(/\.md$/i, "")
  ].filter(Boolean))];
}

function hasPage(ref) {
  return keyVariants(ref).some(k => !!dv.page(k));
}

const shots = dv.pages('"01_NODES/shots"');
const scenes = dv.pages('"01_NODES/scenes"');
const chars = dv.pages('"01_NODES/characters"');
const arcs = dv.pages('"01_NODES/arcs"');
const eps = dv.pages('"01_NODES/episodes"');
const factions = dv.pages('"01_NODES/factions"');
const locations = dv.pages('"01_NODES/locations"');

const events = dv.pages('"01_NODES/events"').where(p => p.type === "event");
const states = dv.pages('"01_NODES/state"').where(p => p.type === "character_state");

const stateCharKeys = new Set(
  states.array().flatMap(s => [
    ...keyVariants(s.character),
    ...keyVariants(s.file.name),
    ...keyVariants(s.file.path)
  ])
);

let critical = [];
let warnings = [];
let v2checks = [];

// ── SHOTS ─────────────────────────────────────────────────────────────────
for (const shot of shots) {
  if (!shot.scene) critical.push(`❌ ${shot.file.name} missing scene`);
  if (!shot.characters || shot.characters.length === 0) warnings.push(`⚠️ ${shot.file.name} missing characters`);
  if (!shot.camera) warnings.push(`⚠️ ${shot.file.name} missing camera`);
  if (!shot.motion) warnings.push(`⚠️ ${shot.file.name} missing motion`);
  if (shot.duration_seconds == null) warnings.push(`⚠️ ${shot.file.name} missing duration_seconds`);
  if (shot.shot_number == null) warnings.push(`⚠️ ${shot.file.name} missing shot_number`);
  if (shot.scene && !hasPage(shot.scene)) critical.push(`❌ ${shot.file.name} broken scene link`);
}

// ── SCENES ────────────────────────────────────────────────────────────────
for (const scene of scenes) {
  if (!scene.episode) critical.push(`❌ ${scene.file.name} missing episode`);
  if (!hasPage(scene.episode)) critical.push(`❌ ${scene.file.name} broken episode link`);
  if (!scene.shots || scene.shots.length === 0) critical.push(`❌ ${scene.file.name} missing shots`);
  if (!scene.visual_anchor) critical.push(`❌ ${scene.file.name} missing visual_anchor`);
  if (!scene.goal) warnings.push(`⚠️ ${scene.file.name} missing goal`);
  if (!scene.conflict) warnings.push(`⚠️ ${scene.file.name} missing conflict`);
  if (!scene.stakes) warnings.push(`⚠️ ${scene.file.name} missing stakes`);
}

// ── CHARACTERS ────────────────────────────────────────────────────────────
for (const char of chars) {
  if (!char.identity_anchors || char.identity_anchors.length === 0) critical.push(`❌ ${char.file.name} missing identity_anchors`);
  if (!char.psychological_anchors || char.psychological_anchors.length === 0) warnings.push(`⚠️ ${char.file.name} missing psychological_anchors`);
  if (!char.combat_anchors || char.combat_anchors.length === 0) warnings.push(`⚠️ ${char.file.name} missing combat_anchors`);

  const charKeys = [...new Set([...keyVariants(char.file.name), ...keyVariants(char.file.path)])];
  if (!charKeys.some(k => stateCharKeys.has(k))) {
    v2checks.push(`🔷 ${char.file.name} has no CHARACTER_STATE node — create in 01_NODES/state/`);
  }
}

// ── ARCS ──────────────────────────────────────────────────────────────────
for (const arc of arcs) {
  if (!arc.theme) warnings.push(`⚠️ ${arc.file.name} missing theme`);
  if (!arc.core_question) warnings.push(`⚠️ ${arc.file.name} missing core_question`);
}

// ── EPISODES ──────────────────────────────────────────────────────────────
for (const ep of eps) {
  if (ep.arc == null) critical.push(`❌ ${ep.file.name} missing arc`);
  if (!hasPage(ep.arc)) critical.push(`❌ ${ep.file.name} broken arc link`);
  if (ep.episode_number == null) warnings.push(`⚠️ ${ep.file.name} missing episode_number`);
}

// ── FACTIONS & LOCATIONS ──────────────────────────────────────────────────
for (const item of factions) {
  if (!item.leader) warnings.push(`⚠️ ${item.file.name} missing leader`);
}
for (const item of locations) {
  if (!item.region) warnings.push(`⚠️ ${item.file.name} missing region`);
}

// ── V2 EVENT CHECKS ────────────────────────────────────────────────────────
if (events.length === 0) {
  v2checks.push(`🔷 No EVENT nodes found — create first EVENT in 01_NODES/events/`);
} else {
  for (const ev of events) {
    if (!ev.consequences || ev.consequences.length === 0)
      v2checks.push(`🔷 ${ev.file.name} has no consequences defined`);
    if (!ev.participants || ev.participants.length === 0)
      v2checks.push(`🔷 ${ev.file.name} has no participants listed`);
    if (ev.delta_applied === false)
      v2checks.push(`🔷 ${ev.file.name} — delta_applied: false. Run state propagation.`);
  }
}

// ── V2 ARC STATE LOCK COMPLIANCE ──────────────────────────────────────────
for (const state of states) {
  if (!state.physical_state || state.physical_state.length === 0)
    v2checks.push(`🔷 ${state.file.name} missing physical_state`);
  if (!state.scarring_log || state.scarring_log.length === 0)
    v2checks.push(`🔷 ${state.file.name} missing scarring_log — progression_rule requires scar tracking`);
  if (!state.forbidden_drift || state.forbidden_drift.length === 0)
    v2checks.push(`🔷 ${state.file.name} missing forbidden_drift — ARC_STATE_LOCK not enforced`);
}

// ── OUTPUT ────────────────────────────────────────────────────────────────
dv.paragraph("## ❌ Critical");
dv.list(critical.length ? critical : ["✅ No critical issues found."]);

dv.paragraph("## ⚠️ Warnings");
dv.list(warnings.length ? warnings : ["✅ No warnings found."]);

dv.paragraph("## 🔷 V2 Integration Checks (Events / State / ARC Lock)");
dv.list(v2checks.length ? v2checks : ["✅ All V2 integration checks passed."]);
```
