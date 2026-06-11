---
type: system
id: DELTA_VISUALIZER
version: "3.0"
---

# Delta Visualizer — Character Progression Timeline

Shows each character's scarring_log, state deltas, and conditional visual anchor evolution across all episodes.

## Character State Timeline

```dataviewjs
function resolvePath(val) {
  if (!val) return null;
  if (typeof val === "object" && val.path) return val.path;
  if (typeof val === "string") return val.replace(/^\[\[|\]\]$/g, "");
  return String(val);
}

function pageFor(ref) {
  const raw = resolvePath(ref);
  if (!raw) return null;
  return dv.page(raw) ?? dv.page(raw.split("/").pop()) ?? null;
}

const states = dv.pages('"01_NODES/state"')
  .where(p => p.type === "character_state")
  .sort(p => p.episode_range ?? "", "asc")
  .array();

if (states.length === 0) {
  dv.paragraph("⚠️ No character state nodes found. Create STATE_ nodes in `01_NODES/state/`.");
} else {
  for (const state of states) {
    const char = pageFor(state.character);
    const charName = char?.name ?? char?.file?.name ?? resolvePath(state.character) ?? "Unknown Character";

    dv.paragraph(`### ${charName} — ${state.episode_range ?? "?"}`);

    const physical = Array.isArray(state.physical_state) ? state.physical_state : [state.physical_state ?? "—"];
    dv.paragraph("**Physical State**");
    dv.list(physical);

    const scars = Array.isArray(state.scarring_log) ? state.scarring_log : [state.scarring_log ?? "No scars logged"];
    dv.paragraph("**Scarring Log**");
    dv.list(scars);

    const deltas = Array.isArray(state.delta_from_baseline) ? state.delta_from_baseline : [state.delta_from_baseline ?? "No deltas recorded"];
    dv.paragraph("**Deltas from Baseline**");
    dv.list(deltas);

    const forbidden = Array.isArray(state.forbidden_drift) ? state.forbidden_drift : [state.forbidden_drift ?? "—"];
    dv.paragraph("**Locked (Forbidden Drift)**");
    dv.list(forbidden.map(f => `🔒 ${f}`));

    const lastEvent = pageFor(state.last_event);
    if (lastEvent) {
      dv.paragraph(`**Last Event**: [[${lastEvent.file.name}]] — ${lastEvent.title ?? ""}`);
    }

    dv.paragraph("---");
  }
}
```

## Active Event Consequences Map

```dataviewjs
const events = dv.pages('"01_NODES/events"')
  .where(p => p.type === "event")
  .sort(p => p.sequence ?? 999, "asc")
  .array();

if (events.length === 0) {
  dv.paragraph("⚠️ No event nodes found.");
} else {
  const rows = [];
  for (const ev of events) {
    const status = ev.status ?? "—";
    const delta = ev.delta_applied === true ? "✅ Applied" : ev.delta_applied === false ? "⏳ Pending" : "—";
    const participants = Array.isArray(ev.participants) ? ev.participants.join(", ") : ev.participants ?? "—";
    const consecCount = Array.isArray(ev.consequences) ? ev.consequences.length : (ev.consequences ? 1 : 0);
    rows.push([ev.file.link, ev.title ?? "—", status, delta, participants, consecCount]);
  }
  dv.table(["Event", "Title", "Status", "Delta", "Participants", "Consequences"], rows);
}
```

## Conditional Visual Anchors

```dataviewjs
function resolvePath(val) {
  if (!val) return null;
  if (typeof val === "object" && val.path) return val.path;
  if (typeof val === "string") return val.replace(/^\[\[|\]\]$/g, "");
  return String(val);
}

function pageFor(ref) {
  const raw = resolvePath(ref);
  if (!raw) return null;
  return dv.page(raw) ?? dv.page(raw.split("/").pop()) ?? null;
}

const states = dv.pages('"01_NODES/state"')
  .where(p => p.type === "character_state")
  .array();

const conditionals = [];
for (const state of states) {
  const char = pageFor(state.character);
  const charName = char?.name ?? char?.file?.name ?? resolvePath(state.character) ?? "Unknown Character";
  const deltas = Array.isArray(state.delta_from_baseline) ? state.delta_from_baseline : [];
  for (const d of deltas) {
    conditionals.push({ character: charName, episode: state.episode_range ?? "?", delta: d });
  }
}

if (conditionals.length === 0) {
  dv.paragraph("No conditional anchors recorded yet. Add entries to `delta_from_baseline` in STATE nodes.");
} else {
  dv.table(["Character", "Episode", "Conditional Anchor"], conditionals.map(c => [c.character, c.episode, c.delta]));
}
```
