---
type: stochastic_prompt
id: PRMPT_<% tp.file.title %>
version: v1
status: draft
confidence: 0.1
---

# 🎲 AUTOMATED PROMPT COMPILER v2

## 1. IDENTITY ANCHOR (Weight: 0.8)
- **Target Node:** [[CHAR_XXX]]
- **Injected Identity String:** Copy from target's frontmatter fields.

## 2. SCENE INTENT & STAGING (Weight: 0.6)
- **Movement Level:** [Low | Medium | High]
- **Environment Context:** 

## 3. MASTER STYLIZATION BIAS (Weight: 0.5)
> [!NOTE]
> *Pulled directly from [[style_memory]]. Do not mutate individual words.*
- `sharp 2D cell-shaded anime style, bold hand-drawn ink contours, flat color blocks, high-contrast lighting, 0% 3D gradients, MAPPA keyframe finish`

## 4. STOCHASTIC COMPILED OUTPUT STRINGS
*Run these specific variance mixtures through your diffusion models:*

### 🔹 V1: High Stability Mix (Identity Conservative)
```text
[Identity Anchor Description Here] + sharp 2D cell-shaded anime style, bold hand-drawn ink contours, flat color blocks, high-contrast lighting, 0% 3D gradients, MAPPA keyframe finish --ar 16:9