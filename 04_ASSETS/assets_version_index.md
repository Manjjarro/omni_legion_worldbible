# ASSET VERSION INDEX

Each generated asset MUST be tracked as immutable versions.

---

## FORMAT

asset_id:
scene_id:
version:
model:
seed:
qa_score:

---

## RULE

- NEVER overwrite an asset
- NEVER delete failed assets
- ALWAYS increment version on regeneration

---

## EXAMPLE

asset_001_001:
scene: scene_001_001
version: v3
model: kling_3
seed: 1938821
qa_score: 46