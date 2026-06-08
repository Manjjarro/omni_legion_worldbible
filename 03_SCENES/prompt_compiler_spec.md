# PROMPT COMPILER SPECIFICATION (DETERMINISTIC OUTPUT RULES)

## INPUT ORDER (STRICT)
1. Canon rules
2. Character file
3. Scene intent
4. Episode state
5. Location state

---

## OUTPUT FORMAT (FIXED ORDER ONLY)

1. SUBJECT LOCK
2. ENVIRONMENT LOCK
3. ACTION SEQUENCE
4. CAMERA VECTOR
5. LIGHTING PROFILE
6. MOTION BEHAVIOR
7. NEGATIVE CONSTRAINTS
8. STYLE LOCK STRING (MUST BE LAST LINE)

---

## FORBIDDEN OPERATIONS

- reordering sections
- merging subject + environment
- adding descriptive adjectives outside schema blocks
- omitting negative constraints

---

## OUTPUT VALIDITY RULE

If any section is missing → prompt is INVALID

No partial prompts allowed.