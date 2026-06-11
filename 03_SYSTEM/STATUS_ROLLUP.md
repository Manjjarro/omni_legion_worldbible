---
type: system
version: '4.3'
---
# Status Rollup (Indexed)

```dataviewjs
const images=dv.pages('"02_PRODUCTION/generated_images"').array();
const index=new Map();
for(const i of images){
 const k=String(i.scene||"");
 index.set(k,(index.get(k)||0)+Number(i.winner===true));
}
dv.table(["Scene","Winners"],
dv.pages('"01_NODES/scenes"').array().map(s=>[s.file.link,index.get(s.file.name)||0]));
```
