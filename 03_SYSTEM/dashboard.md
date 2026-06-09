```dataviewjs
// 1. Rename 'type' to 'targetType' to eliminate the engine naming conflict
let targetType = "scene";

// 2. Query your pages safely using the isolated filter variable
let pages = dv.pages('"01_NODES"').where(p => p.type === targetType);

// 3. Render the dashboard layout cleanly
dv.table(["Scene", "Status", "Visual Anchor", "Reliability"], 
    pages.sort(p => p.sequence, 'asc').map(p => [
        p.file.link, 
        p.storyboard_status || p.status, 
        p.preview_image || p.visual_anchor, 
        p.stability || p.stability_score
    ])
);