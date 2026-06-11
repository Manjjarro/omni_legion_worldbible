<%*
const reviewId = tp.user.reviewId ?? tp.date.now("YYYYMMDDHHmm");
const sceneLink = tp.user.sceneId ? `[[${tp.user.sceneId}]]` : "";
const shotLink = tp.user.shotId ? `[[${tp.user.shotId}]]` : "";
const runLink = tp.user.runId ? `[[${tp.user.runId}]]` : "";
tR += `---\ntype: review\nid: REVIEW_${reviewId}\nseries: Grimverse\nscene: ${sceneLink}\nshot: ${shotLink}\nrun_reviewed: ${runLink}\nversion: "4.1"\n---\n`;
%>
