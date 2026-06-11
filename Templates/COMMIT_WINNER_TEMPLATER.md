<%*
// ── COMMIT WINNER TEMPLATER V2.2 ─────────────────────────────────────────
// Promotes a generation run to Winner status AND triggers state propagation.
// Usage: Run on an image_run or video_run file in 02_PRODUCTION/.
// 
// What this does:
//   1. Sets status: Winner on the current file
//   2. Reads linked EVENT nodes for pending consequences (delta_applied: false)
//   3. Appends new scar to the character's STATE node scarring_log
//   4. Sets delta_applied: true on the event
//   5. Logs the promotion in a CANON_PROMOTION block at bottom of file
//
// Prerequisites: The run file must have `shot`, `scene`, and `characters` frontmatter.

const file = tp.file.find_tfile(tp.file.path(true));
const cache = app.metadataCache.getFileCache(file);
const fm = cache?.frontmatter ?? {};

// Promote the current file to Winner
tR += `---
status: Winner
promote_to_winner: true
canon_promoted: true
promoted_date: ${tp.date.now("YYYY-MM-DD")}
---
`;

// ── Find pending events (delta_applied: false) ───────────────────────────
const pendingEvents = dv ? 
  dv.pages('"01_NODES/events"')
    .where(p => p.type === "event" && p.delta_applied === false)
    .array() : [];

// ── Build CANON_PROMOTION block ───────────────────────────────────────────
const shotId = fm.shot ?? fm.id ?? "UNKNOWN_SHOT";
const promotedAt = tp.date.now("YYYY-MM-DD HH:mm");

tR += `
---

## ⚡ Canon Promotion Log
- **Promoted:** ${promotedAt}
- **Shot:** ${shotId}
- **Promoted by:** COMMIT_WINNER_TEMPLATER V2.2

### State Propagation Required
`;

if (pendingEvents.length > 0) {
  tR += `The following events have \`delta_applied: false\` and require state update:\n`;
  for (const ev of pendingEvents) {
    tR += `- [ ] **${ev.file.name}** — open and set \`delta_applied: true\` after confirming STATE node reflects consequences\n`;
  }
  tR += `\n### Consequences to Propagate\n`;
  for (const ev of pendingEvents) {
    const consequences = Array.isArray(ev.consequences) ? ev.consequences : [ev.consequences ?? "—"];
    for (const c of consequences) {
      tR += `- [ ] **Scar/Delta**: ${c}\n`;
    }
  }
  tR += `\n> Add confirmed scars to the relevant \`01_NODES/state/STATE_XXX\` node under \`scarring_log\`.\n`;
  tR += `> Then set \`delta_applied: true\` on each event above.\n`;
} else {
  tR += `✅ No pending events — all deltas already applied.\n`;
}

tR += `
### Winner → Canon Checklist
- [ ] Image/video reviewed and approved
- [ ] Prompt saved to \`02_PRODUCTION/prompts/\`
- [ ] State propagation completed (scarring_log updated)
- [ ] EVENT delta_applied flipped to true
- [ ] HEALTH_CHECK run — V2 checks pass
- [ ] Scene continuity_score updated if this completes a scene
`;
%>
