# ⚖️ PRODUCTION PRIORITIZATION RULES

> [!IMPORTANT]
> **RULE 1: STABILITY OVER EXPERIMENTATION**
> Only nodes marked `status: stable` with a `confidence: >0.7` may be used as anchors for multi-character generation layers.

> [!WARNING]
> **RULE 2: THE FAILURE PENALTY**
> If a character accumulates >3 active `FAIL` nodes under a specific tag (e.g., `[low_light]`), that tag is completely restricted from all upcoming scene intent compilations until an isolated correction sprint is completed.

* **Rule 3 (Inheritance):** New nodes are initialized automatically at `status: draft` and `confidence: 0.1`. They cannot be combined with other draft nodes in a single generation step.
* **Rule 4 (Versioning):** Never create a new Prompt ID when fixing a style drift error. You must iterate the version string suffix (`_v1` ➔ `_v2` ➔ `_v3`) to maintain ancestral lineage tracking.