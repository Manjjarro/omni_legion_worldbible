---
type: system
id: STATUS_ROLLUP
version: "3.0"
---

# Status Rollup

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

function sameNode(ref, page) {
  if (!ref || !page) return false;
  const pageKeys = new Set([page.file.name, page.file.path, page.id].filter(Boolean));
  return keyVariants(ref).some(k => pageKeys.has(k));
}

const weights = {
  Approved: 1.0,
  Winner: 1.0,
  Review: 0.6,
  Planned: 0.2,
  Draft: 0.1,
  Failed: 0.0
};

const scenes = dv.pages('"01_NODES/scenes"').sort(s => s.sequence ?? 999, "asc");
const images = dv.pages('"02_PRODUCTION/generated_images"').array();
const videos = dv.pages('"02_PRODUCTION/generated_video"').array();

const rows = [];
for (const scene of scenes) {
  const shots = (scene.shots ?? []).map(resolvePath).map(p => dv.page(p)).filter(Boolean);
  const total = shots.length;
  const avg = total ? shots.reduce((sum, shot) => sum + (weights[shot.status] ?? 0), 0) / total : 0;
  const winners = images.filter(r => r.winner === true && sameNode(r.scene, scene)).length
    + videos.filter(r => r.winner === true && sameNode(r.scene, scene)).length;

  rows.push([
    scene.file.link,
    scene.sequence ?? "—",
    `${total} shots`,
    `${Math.round(avg * 100)}%`,
    `🏆 ${winners}`
  ]);
}
dv.table(["Scene", "Seq", "Shots", "Stability", "Winners"], rows);
```
