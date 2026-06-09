```dataviewjs
let targetType = "scene";

let pages = dv.pages('"01_NODES"').where(p => p.type === targetType);
dv.table(["Scene", "Status", "Visual Anchor", "Reliability"], 
    pages.sort(p => p.sequence, 'asc').map(p => [
        p.file.link, 
        p.storyboard_status || p.status, 
        p.preview_image || p.visual_anchor, 
        p.stability || p.stability_score
    ])
);