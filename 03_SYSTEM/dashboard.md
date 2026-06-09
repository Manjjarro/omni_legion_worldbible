# 📊 OMNI-STUDIO-OS DASHBOARD

---

## 🎬 Scenes

```dataview
TABLE sequence AS "Seq", status AS "Status", storyboard_status AS "Storyboard", continuity_score AS "Continuity"
FROM "01_NODES/scenes"
SORT sequence ASC
```

---

## 🎥 Shots

```dataview
TABLE shot_number AS "Shot", scene AS "Scene", duration_seconds AS "Duration (s)", status AS "Status"
FROM "01_NODES/shots"
SORT shot_number ASC
```

---

## 👤 Characters

```dataview
TABLE tier AS "Tier", status AS "Status", failures AS "Fails", stability AS "Stability"
FROM "01_NODES/characters"
SORT tier ASC
```

---

## 🖼️ Image Runs

```dataview
TABLE scene AS "Scene", shot AS "Shot", engine AS "Engine", seed AS "Seed", score AS "Score", winner AS "Winner"
FROM "02_PRODUCTION/generated_images"
SORT file.ctime DESC
```

---

## 🎞️ Video Runs

```dataview
TABLE scene AS "Scene", shot AS "Shot", engine AS "Engine", seed AS "Seed", score AS "Score", winner AS "Winner"
FROM "02_PRODUCTION/generated_video"
SORT file.ctime DESC
```

---

## ⚠️ Failed / Weak Nodes

```dataview
TABLE type AS "Type", failures AS "Fails", stability AS "Stability"
FROM "01_NODES"
WHERE failures > 0 OR stability < 1.0
SORT failures DESC
```
