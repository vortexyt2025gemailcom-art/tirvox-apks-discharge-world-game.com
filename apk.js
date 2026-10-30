/* Tirvox · catálogo de APK: subir, descargar, calificar, comentar y borrar */
function uploadDialog(){
 if(!currentUser)return authDialog("login");
 openModal(`<h2>Subir APK a la nube</h2><label>Nombre del juego o aplicación</label><input id="apkName" maxlength="60" placeholder="Nombre">
 <label>Descripción</label><textarea id="apkDesc" rows="3" maxlength="500" placeholder="Descripción (opcional)"></textarea>
 <label>Archivo APK</label><input id="apkFile" type="file" accept=".apk,application/vnd.android.package-archive">
 <p class="small">Tamaño máximo: 100 MB. El archivo será visible para todos.</p><p class="err" id="uploadError"></p>
 <button id="uploadGo">Subir a la nube</button> <button class="g" onclick="closeModal()">Cancelar</button>`);
 $("#uploadGo").onclick=async()=>{
  const btn=$("#uploadGo"),err=$("#uploadError");btn.disabled=true;err.textContent="";
  try{
   const name=$("#apkName").value.trim(),desc=$("#apkDesc").value.trim(),file=$("#apkFile").files[0];
   if(!name)throw Error("Escribí el nombre.");
   if(!file)throw Error("Elegí un archivo APK.");
   if(!/\.apk$/i.test(file.name))throw Error("El archivo debe terminar en .apk.");
   if(file.size>100*1024*1024)throw Error("El APK supera los 100 MB.");
   const sig=new Uint8Array(await file.slice(0,4).arrayBuffer());
   if(sig[0]!==0x50||sig[1]!==0x4b)throw Error("El archivo no parece ser un APK válido.");
   err.className="mu";err.textContent="Subiendo… no cierres esta ventana.";
   const id=db.collection("apks").doc().id;
   const ref=storage.ref(`apks/${currentUser.uid}/${id}.apk`);
   await ref.put(file,{contentType:"application/vnd.android.package-archive",customMetadata:{ownerUid:currentUser.uid}});
   await db.collection("apks").doc(id).set({name,desc,fileName:file.name,size:file.size,storagePath:ref.fullPath,ownerUid:currentUser.uid,ownerName:currentUser.displayName||currentUser.email,createdAt:firebase.firestore.FieldValue.serverTimestamp()});
   closeModal();setNotice("APK publicado en Tirvox.","ok");
  }catch(e){err.className="err";err.textContent=e.message||"No se pudo subir.";btn.disabled=false}
 };
}
function render(){
 const q=$("#search").value.trim().toLocaleLowerCase("es"),items=games.filter(g=>g.name.toLocaleLowerCase("es").includes(q)||String(g.desc||"").toLocaleLowerCase("es").includes(q));
 if(!items.length){$("#catalog").innerHTML='<p class="mu">No hay resultados. Probá otro nombre.</p>';return}
 $("#catalog").innerHTML=items.map(g=>`<article class="card">
 <b>${esc(g.name)}</b><p class="mu">${esc(g.desc||"Sin descripción")}</p>
 <p class="small">Subido por ${esc(g.ownerName||"Usuario")} · ${formatSize(g.size)}</p>
 <div class="row"><span class="tag" id="rating-${g.id}">Cargando estrellas…</span><button data-download="${g.id}">Descargar APK</button>
 <button class="g" data-comments="${g.id}">Comentarios</button>
 ${currentUser&&currentUser.uid===g.ownerUid?`<button class="d" data-delete="${g.id}">Borrar</button>`:""}</div>
 </article>`).join("");
 items.forEach(g=>loadRating(g.id));
 document.querySelectorAll("[data-download]").forEach(b=>b.onclick=()=>downloadApk(b.dataset.download,b));
 document.querySelectorAll("[data-comments]").forEach(b=>b.onclick=()=>commentsDialog(b.dataset.comments));
 document.querySelectorAll("[data-delete]").forEach(b=>b.onclick=()=>deleteApk(b.dataset.delete));
}
function formatSize(n){return n?`${(n/1048576).toFixed(1)} MB`:"Tamaño desconocido"}
async function loadRating(id){
 try{
  const snap=await db.collection("apks").doc(id).collection("ratings").get();
  const vals=snap.docs.map(d=>Number(d.data().stars)||0).filter(x=>x>=1&&x<=5);
  const avg=vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:0;
  const el=$(`#rating-${CSS.escape(id)}`);if(el)el.textContent=vals.length?`★ ${avg.toFixed(1)} / 5 (${vals.length})`:"Sin calificaciones";
 }catch{const el=$(`#rating-${CSS.escape(id)}`);if(el)el.textContent="Calificación no disponible"}
}
async function downloadApk(id,btn){
 try{btn.disabled=true;const g=games.find(x=>x.id===id);if(!g)throw Error("APK no encontrado.");
  const url=await storage.ref(g.storagePath).getDownloadURL();const a=document.createElement("a");a.href=url;a.download=g.fileName||"app.apk";a.rel="noopener";document.body.append(a);a.click();a.remove();
 }catch(e){setNotice("No se pudo descargar: "+(e.message||"error"))}finally{btn.disabled=false}
}
async function commentsDialog(id){
 const g=games.find(x=>x.id===id);if(!g)return;
 openModal(`<h2>${esc(g.name)}</h2><p class="mu">Calificación de 1 a 5 estrellas</p>
 <div class="row" id="starChoices">${[1,2,3,4,5].map(n=>`<button class="g" data-star="${n}" aria-label="${n} estrellas">${"★".repeat(n)}</button>`).join("")}</div>
 <label>Comentario</label><textarea id="commentText" rows="3" maxlength="500" placeholder="Escribí tu opinión…"></textarea>
 <p class="err" id="commentError"></p><button id="postComment">Publicar comentario y calificación</button>
 <h2 style="margin-top:18px">Comentarios</h2><div id="commentList"><p class="mu">Cargando…</p></div>
 <button class="g" onclick="closeModal()">Cerrar</button>`);
 let chosen=0;
 document.querySelectorAll("[data-star]").forEach(b=>b.onclick=()=>{chosen=Number(b.dataset.star);document.querySelectorAll("[data-star]").forEach(x=>x.style.background=Number(x.dataset.star)===chosen?"var(--ac)":"transparent")});
 $("#postComment").onclick=async()=>{
  if(!currentUser)return authDialog("login");
  const err=$("#commentError"),body=$("#commentText").value.trim();
  if(!chosen){err.textContent="Elegí una cantidad de estrellas.";return}
  if(!body){err.textContent="Escribí un comentario.";return}
  try{
   const batch=db.batch(),ratingRef=db.collection("apks").doc(id).collection("ratings").doc(currentUser.uid);
   batch.set(ratingRef,{stars:chosen,userId:currentUser.uid,userName:currentUser.displayName||currentUser.email,updatedAt:firebase.firestore.FieldValue.serverTimestamp()});
   const commentRef=db.collection("apks").doc(id).collection("comments").doc();
   batch.set(commentRef,{text:body,userId:currentUser.uid,userName:currentUser.displayName||currentUser.email,createdAt:firebase.firestore.FieldValue.serverTimestamp()});
   await batch.commit();$("#commentText").value="";err.className="ok";err.textContent="Publicado.";loadRating(id);loadComments(id);
  }catch(e){err.textContent=e.message||"No se pudo publicar."}
 };
 loadComments(id);
}
async function loadComments(id){
 const el=$("#commentList");if(!el)return;
 try{
  const snap=await db.collection("apks").doc(id).collection("comments").orderBy("createdAt","desc").limit(50).get();
  if(!el.isConnected)return;
  if(snap.empty){el.innerHTML='<p class="mu">Todavía no hay comentarios.</p>';return}
  el.innerHTML=snap.docs.map(d=>{const c=d.data();return `<div class="comment"><b>${esc(c.userName||"Usuario")}</b><p>${esc(c.text)}</p><span class="small">${c.createdAt?.toDate?c.createdAt.toDate().toLocaleString():""}</span>${currentUser&&currentUser.uid===c.userId?` <button class="d" data-delcomment="${d.id}">Borrar</button>`:""}</div>`}).join("");
  el.querySelectorAll("[data-delcomment]").forEach(b=>b.onclick=async()=>{try{await db.collection("apks").doc(id).collection("comments").doc(b.dataset.delcomment).delete();loadComments(id)}catch(e){setNotice("No se pudo borrar el comentario.")}});
 }catch(e){el.textContent="No se pudieron cargar los comentarios."}
}
async function deleteApk(id){
 const g=games.find(x=>x.id===id);if(!g||!currentUser||g.ownerUid!==currentUser.uid)return;
 if(!confirm(`¿Borrar "${g.name}" y sus comentarios?`))return;
 try{
  const ref=db.collection("apks").doc(id);
  for(const sub of ["comments","ratings"]){const s=await ref.collection(sub).get();let batch=db.batch();for(const d of s.docs)batch.delete(d.ref);if(!s.empty)await batch.commit()}
  await storage.ref(g.storagePath).delete();await ref.delete();setNotice("APK eliminado.","ok");
 }catch(e){setNotice("No se pudo borrar: "+(e.message||"error"))}
                                                                          }
  
