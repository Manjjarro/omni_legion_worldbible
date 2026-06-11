<%*
const sceneNum = tp.user.sceneNumber ?? "001";
const sceneId = `SCENE_${sceneNum}`;
const arcId = tp.user.arcId ?? "ARC_001";
const epId = tp.user.episodeId ?? "EP_001";
const title = tp.user.sceneTitle ?? "Scene Title";
tR += `---
type: scene
id: ${sceneId}
series: Grimverse
arc: ${arcId}
episode: ${epId}
sequence: ${parseInt(sceneNum, 10) || 1}
title: "${title}"
status: Planned
storyboard_status: Planned
goal: ""
conflict: ""
stakes: ""
emotion: ""
story_function: ""
visual_anchor: ""
characters: []
shots: []
continuity_score: 0
version: "2.5"
---

# Scene: ${title}

## Narrative Action

## Visual Plan

## Audio Plan

## Linked Characters

## Linked Shots
`;
%>