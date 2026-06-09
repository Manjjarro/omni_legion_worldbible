<%*
const scene = tp.file.find_tfile(tp.file.title);
const content = await app.vault.read(scene);

// extract links
function links(text){
  return (text.match(/\[\[(.*?)\]\]/g)||[])
  .map(x=>x.replace("[[","").replace("]]",""));
}

const refs = links(content);

let character = "";
let style = "";
let failures = [];

for (let r of refs){
  let file = app.metadataCache.getFirstLinkpathDest(r,"");
  if(!file) continue;

  let c = await app.vault.read(file);

  if(c.includes("type: character")){
    character = c.match(/Identity Anchor([\s\S]*?)(?=\n##|$)/)?.[1] || "";
  }

  if(c.includes("type: style")){
    style = c.match(/Style Block([\s\S]*?)(?=\n##|$)/)?.[1] || "";
  }

  if(c.includes("type: failure")){
    failures.push("instability");
  }
}

// scene extraction
const sceneText = content.replace(/---[\s\S]*?---/,"").trim();

// failure injection
const failureText = failures.length
? "Avoid known instability patterns: " + failures.join(", ")
: "No prior failure constraints";

// FINAL PROMPT
const prompt = `
CHARACTER:
${character.trim()}

SCENE:
${sceneText}

STYLE:
${style.trim()}

CAMERA:
slow stable framing, minimal motion

NEGATIVE:
drift, flicker, distortion, identity shift

${failureText}
`.replace(/\s+/g," ").trim();

tR += "# COMPILED PROMPT\n\n" + prompt;
%>