---
type: system
version: '4.3'
---
# Asset Audit

```dataviewjs
function resolvePath(val) {
  if (!val) return null;
  if (typeof val === "object" && val.path) return val.path;
  if (typeof val === "string") return val.replace(/^\[\[|\]\]$/g, "");
  return String(val);
}

function hasFile(path) {
  const normalized = resolvePath(path);
  if (!normalized) return false;
  return !!app.vault.getAbstractFileByPath(normalized) || !!app.vault.getAbstractFileByPath(normalized + ".md");
}

const shots = dv.pages('"01_NODES/shots"').array();
const rows = [];
for (const shot of shots) {
  const completed = ["Winner", "Approved", "Complete"].includes(String(shot.status ?? ""));
  const imageOk = !shot.image_source ? "—" : (hasFile(shot.image_source) ? "✅" : "❌");
  const videoOk = !shot.video_source ? "—" : (hasFile(shot.video_source) ? "✅" : "❌");
  rows.push([shot.file.link, shot.status ?? "—", completed ? imageOk : "—", completed ? videoOk : "—"]);
}
dv.table(["Shot", "Status", "Image Exists", "Video Exists"], rows);
```
