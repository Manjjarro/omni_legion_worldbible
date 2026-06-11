// Canonical Reference Resolver v4.1
function normalizeRef(ref){
 if(!ref) return null;
 if(typeof ref==="object" && ref.path) return ref.path.replace(/\.md$/i,"");
 return String(ref).replace(/^\[\[|\]\]$/g,"").replace(/\.md$/i,"");
}

function pageFor(dv,ref){
 const k=normalizeRef(ref);
 if(!k || !dv || typeof dv.page!=="function") return null;
 return dv.page(k)||dv.page(k.split("/").pop())||null;
}

function sameEntity(dvOrA,aOrB,bMaybe){
 let dv = dvOrA;
 let a = aOrB;
 let b = bMaybe;

 // Backward-compatible call signature: sameEntity(a, b)
 if(arguments.length === 2){
   b = aOrB;
   a = dvOrA;
   dv = typeof globalThis !== "undefined" ? globalThis.dv : undefined;
 }

 if(!dv || typeof dv.page !== "function") return false;

 const pa=typeof a==="object" && a?.file ? a : pageFor(dv,a);
 const pb=typeof b==="object" && b?.file ? b : pageFor(dv,b);
 if(!pa||!pb) return false;

 return [pa.file?.path,pa.file?.name,pa.id].filter(Boolean)
   .some(v=>[pb.file?.path,pb.file?.name,pb.id].includes(v));
}

if(typeof module!=="undefined"){
 module.exports={normalizeRef,pageFor,sameEntity};
}
