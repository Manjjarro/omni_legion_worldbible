<%*
const scene = tp.file.find_tfile(tp.file.title);
const content = await app.vault.read(scene);

// extract links
function links(text){
  return (text.match(/\[\[(.*?)\]\]/g)||[])
  .map(x=>x.replace("[[","").replace("]]",""));
}

const refs = links(content);

let bestCharacter = null;
let bestStyle = null;
let failures = [];

let charWeight = 0;
let styleWeight = 0;

// collect nodes
for (let r of refs){
  let file = app.metadataCache.getFirstLinkpathDest(r,"");
  if(!file) continue;

  let c = await app.vault.read(file);

  // CHARACTER EXTRACTION
  if(c.includes("type: character")){
    const w = parseFloat(c.match(/weight:\s*([0-9.]+)/)?.[1] || 0.5);
    if(w > charWeight){
      charWeight = w;
      bestCharacter = c.match(/Identity Anchor([\s\S]*?)(?=\n##|$)/)?.[1] || "";
    }
  }

  // STYLE EXTRACTION
  if(c.includes("type: style")){
    const w = parseFloat(c.match(/weight:\s*([0-9.]+)/)?.[1] || 0.5);
    if(w > styleWeight){
      styleWeight = w;
      bestStyle = c.match(/Style Block([\s\S]*?)(?=\n##|$)/)?.[1] || "";
    }
  }

  // FAILURES
  if(c.includes("type: failure")){
    failures.push("instability");
  }
}

// scene body extraction
const sceneText = content.replace(/---[\s\S]*?---/,"").trim();

// failure logic injection
let failureBlock = failures.length
? "AVOID PATTERNS: identity drift, temporal instability, semantic mismatch"
: "No known failure constraints";

// WEIGHTED PROMPT OUTPUT
const prompt = `CHARACTER (weight ${charWeight.toFixed(2)}): ${bestCharacter.trim() || "UNKNOWN"} SCENE: ${sceneText} STYLE (weight ${styleWeight.toFixed(2)}): ${bestStyle.trim() || "default cinematic style"} CAMERA: slow stable motion, controlled framing NEGATIVE: drift, flicker, distortion, identity shift ${failureBlock}`.replace(/\s+/g," ").trim();

tR += "# WEIGHTED COMPILED PROMPT\n\n" + prompt;
%>