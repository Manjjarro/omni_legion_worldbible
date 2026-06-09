---
type: character
id: CHAR_XXX
name: Character Name
faction: Unassigned
status: Active
created: <% tp.file.creation_date() %>
---

## 1. Visual Turnaround Reference Sheets
- **Master Sheet Path:** [[02_ASSETS/images/characters/CHAR_XXX_turnaround.png]]
- **Views Completed:** Front | Profile | Back

## 2. Mandatory Core Character Tags
> [!IMPORTANT]
> These tags must be paired with the System Style Anchor in every generation prompt.
- **Hair/Head:** - **Eyes:** - **Attire/Gear:** ## 3. Production Log & Seed History
| Asset ID | Prompt Variation Key | Seed Used | Status (Locked/Failed) |
| --- | --- | --- | --- |
| [[PRMPT_000]] | Base Pose Reference | | |

## 4. Narrative & Progression Milestones
- **Current Tier/Rank:** - **Active Traits:** - **Evolution Queue:** ```

---

### Template B: Prompt Block & Asset Record
**File Path:** `Templates/Prompt_Template.md`  
*Use this to log every individual generation, track style pass/fail metrics, and control prompt evolution[cite: 7, 8].*

```markdown
---
type: prompt_block
id: PRMPT_XXX
associated_scene: [[SCENE_XXX]]
associated_character: [[CHAR_XXX]]
engine: Flux 2 Dev
status: Iterating
---

## 1. Active Generation Architecture

### Core Prompt String
```text
[INSERT CHARACTER TAGS / ENVIRONMENT SCENERY HERE] + sharp 2D cell-shaded anime style, bold hand-drawn ink contours, flat color blocks, high-contrast lighting, 0% 3D gradients, MAPPA/Wit Studio keyframe finish