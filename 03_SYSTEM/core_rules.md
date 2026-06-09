# OMNI-LEGION OS — CORE RULES

## SYSTEM TYPE
Probabilistic production memory system for AI video generation.

---

## CORE LOOP

1. Create or update node (Character / Scene / Style)
2. Link dependencies
3. Compile prompt
4. Generate externally
5. Log output
6. Record failure (if any)
7. Update ONLY ONE node per iteration

---

## NODE PRIORITY

- Stable nodes are preferred
- New nodes are low confidence
- Failed nodes reduce future usage probability

---

## FAILURE TYPES (ONLY 3)

1. Identity Failure → character drift
2. Temporal Failure → flicker / instability
3. Semantic Failure → prompt misinterpretation

---

## GOLDEN RULE

Simplicity increases stability.