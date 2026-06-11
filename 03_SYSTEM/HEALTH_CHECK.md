---
type: system
version: '4.3'
---
# Health Check (Production Hardened)

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
  return [...new Set([raw, raw.split("/").pop(), raw.replace(/\.md$/i, "")].filter(Boolean))];
}

function hasPage(ref) {
  return keyVariants(ref).some(k => !!dv.page(k));
}

function hasFile(path) {
  const normalized = resolvePath(path);
  if (!normalized) return false;
  return !!app.vault.getAbstractFileByPath(normalized) || !!app.vault.getAbstractFileByPath(normalized + ".md");
}

function uniq(arr) { return [...new Set(arr.filter(Boolean))]; }

const scenes = dv.pages('"01_NODES/scenes"').array();
const shots = dv.pages('"01_NODES/shots"').array();
const chars = dv.pages('"01_NODES/characters"').array();
const arcs = dv.pages('"01_NODES/arcs"').array();
const eps = dv.pages('"01_NODES/episodes"').array();
const events = dv.pages('"01_NODES/events"').array();
const states = dv.pages('"01_NODES/state"').array();
const factions = dv.pages('"01_NODES/factions"').array();
const locations = dv.pages('"01_NODES/locations"').array();

const allowed = new Set(["Draft","Planned","Prompted","Generating","Review","Winner","Approved","Complete","Failed","Pending","Canonical","Review Needed"]);

let critical = [];
let warnings = [];
let info = [];

// duplicate IDs
const ids = new Map();
for (const p of [...scenes, ...shots, ...chars, ...arcs, ...eps, ...events, ...states, ...factions, ...locations]) {
  const id = p.id ?? p.file.name;
  if (ids.has(id)) critical.push(`❌ Duplicate id: ${id} (${ids.get(id)} and ${p.file.name})`);
  else ids.set(id, p.file.name);
}

// scenes
for (const scene of scenes) {
  if (!scene.episode) critical.push(`❌ ${scene.file.name} missing episode`);
  else if (!hasPage(scene.episode)) critical.push(`❌ ${scene.file.name} broken episode link`);
  if (!scene.shots || scene.shots.length === 0) critical.push(`❌ ${scene.file.name} missing shots`);
  if (!scene.visual_anchor) warnings.push(`⚠️ ${scene.file.name} missing visual_anchor`);
  if (!scene.goal) warnings.push(`⚠️ ${scene.file.name} missing goal`);
  if (!scene.conflict) warnings.push(`⚠️ ${scene.file.name} missing conflict`);
  if (!scene.stakes) warnings.push(`⚠️ ${scene.file.name} missing stakes`);
  if (!scene.story_function) warnings.push(`⚠️ ${scene.file.name} missing story_function`);
  if (scene.status && !allowed.has(scene.status)) warnings.push(`⚠️ ${scene.file.name} has unusual status "${scene.status}"`);
}

// shots
for (const shot of shots) {
  if (!shot.scene) critical.push(`❌ ${shot.file.name} missing scene`);
  else if (!hasPage(shot.scene)) critical.push(`❌ ${shot.file.name} broken scene link`);
  if (!shot.camera) warnings.push(`⚠️ ${shot.file.name} missing camera`);
  if (!shot.motion) warnings.push(`⚠️ ${shot.file.name} missing motion`);
  if (shot.duration_seconds == null) warnings.push(`⚠️ ${shot.file.name} missing duration_seconds`);
  if (!shot.characters || shot.characters.length === 0) warnings.push(`⚠️ ${shot.file.name} has no characters listed`);
  if (shot.status && !allowed.has(shot.status)) warnings.push(`⚠️ ${shot.file.name} has unusual status "${shot.status}"`);

  const completed = ["Winner", "Approved", "Complete"].includes(String(shot.status ?? ""));
  if (completed && !shot.image_source) critical.push(`❌ ${shot.file.name} is ${shot.status} but missing image_source`);
  if (completed && !shot.video_source) critical.push(`❌ ${shot.file.name} is ${shot.status} but missing video_source`);
  if (completed && shot.image_source && !hasFile(shot.image_source)) critical.push(`❌ ${shot.file.name} image_source does not resolve to a file: ${shot.image_source}`);
  if (completed && shot.video_source && !hasFile(shot.video_source)) critical.push(`❌ ${shot.file.name} video_source does not resolve to a file: ${shot.video_source}`);
}

// chars
for (const char of chars) {
  if (!char.identity_anchors || char.identity_anchors.length === 0) critical.push(`❌ ${char.file.name} missing identity_anchors`);
  if (!char.psychological_anchors || char.psychological_anchors.length === 0) warnings.push(`⚠️ ${char.file.name} missing psychological_anchors`);
  if (!char.combat_anchors || char.combat_anchors.length === 0) warnings.push(`⚠️ ${char.file.name} missing combat_anchors`);
}

// arcs / eps
for (const arc of arcs) {
  if (!arc.core_question) warnings.push(`⚠️ ${arc.file.name} missing core_question`);
  if (!arc.theme) warnings.push(`⚠️ ${arc.file.name} missing theme`);
}
for (const ep of eps) {
  if (!ep.arc) critical.push(`❌ ${ep.file.name} missing arc`);
  else if (!hasPage(ep.arc)) critical.push(`❌ ${ep.file.name} broken arc link`);
  if (ep.episode_number == null) warnings.push(`⚠️ ${ep.file.name} missing episode_number`);
  if (!ep.title) warnings.push(`⚠️ ${ep.file.name} missing title`);
  if (ep.status && !allowed.has(ep.status)) warnings.push(`⚠️ ${ep.file.name} has unusual status "${ep.status}"`);
}

// events
for (const ev of events) {
  if (!ev.participants || ev.participants.length === 0) warnings.push(`⚠️ ${ev.file.name} has no participants`);
  if (!ev.consequences || ev.consequences.length === 0) warnings.push(`⚠️ ${ev.file.name} has no consequences`);
  if (ev.delta_applied === false) warnings.push(`⚠️ ${ev.file.name} delta_applied is false`);
  if (ev.status && !allowed.has(ev.status)) warnings.push(`⚠️ ${ev.file.name} has unusual status "${ev.status}"`);
}

// state
for (const st of states) {
  if (!st.character) critical.push(`❌ ${st.file.name} missing character`);
  else if (!hasPage(st.character)) critical.push(`❌ ${st.file.name} broken character link`);
  if (!st.physical_state || st.physical_state.length === 0) warnings.push(`⚠️ ${st.file.name} missing physical_state`);
  if (!st.scarring_log || st.scarring_log.length === 0) warnings.push(`⚠️ ${st.file.name} missing scarring_log`);
  if (!st.forbidden_drift || st.forbidden_drift.length === 0) warnings.push(`⚠️ ${st.file.name} missing forbidden_drift`);
  if (st.status && !allowed.has(st.status)) warnings.push(`⚠️ ${st.file.name} has unusual status "${st.status}"`);
}

// factions / locations
for (const item of factions) if (!item.leader) warnings.push(`⚠️ ${item.file.name} missing leader`);
for (const item of locations) if (!item.region) warnings.push(`⚠️ ${item.file.name} missing region`);

info.push(`Scanned nodes: ${scenes.length + shots.length + chars.length + arcs.length + eps.length + events.length + states.length + factions.length + locations.length}`);

dv.paragraph("## Critical");
dv.list(uniq(critical).length ? uniq(critical) : ["✅ No critical issues found."]);

dv.paragraph("## Warnings");
dv.list(uniq(warnings).length ? uniq(warnings) : ["✅ No warnings found."]);

dv.paragraph("## Info");
dv.list(info);
```
