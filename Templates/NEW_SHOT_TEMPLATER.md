<%*
const shotNum = tp.user.shotNumber ?? "001";
const shotId = `SHOT_${shotNum}`;
const sceneLink = tp.user.sceneId ? `[[${tp.user.sceneId}]]` : "[[SCENE_XXX]]";
tR += `---
type: shot
id: ${shotId}
series: Grimverse
scene: ${sceneLink}
shot_number: ${parseInt(shotNum, 10) || 1}
duration_seconds: 6
fps: 24
camera: ""
motion: ""
composition: ""
status: Planned
priority: 1
characters: []
image_source: ""
video_source: ""
motion_strength: 0.65
version: "2.5"
---

# Shot: ${shotId}

## Action

## Camera

## Motion

## Composition

## Audio

## Linked Assets
`;
%>