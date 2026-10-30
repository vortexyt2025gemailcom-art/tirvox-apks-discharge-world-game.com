/* Tirvox · perfil de usuario */
function profileDialog(){
 if(!currentUser)return authDialog("login");
 const mine=games.filter(g=>g.ownerUid===currentUser.uid),name=currentUser.displayName||"";
 openModal(`<h2>Mi perfil</h2>
 <div class="row" style="align-items:center"><div class="logo">${esc((name||currentUser.email)[0].toUpperCase())}</div><div><b>${esc(name||"Sin nombre")}</b><p class="small" style="margin:0">${esc(currentUser.email)}</p></div></div>
 <label>Nombre público</label><input id="pName" maxlength="35" value="${esc(name)}">
 <p class="err" id="pMsg"></p>
 <div class="row"><button id="pSave">Guardar cambios</button><button class="g" id="pOut">Cerrar sesión</button></div>
 <h2 style="margin-top:14px">Mis APK (${mine.length})</h2>
 ${mine.length?mine.map(g=>`<p class="comment"><b>${esc(g.name)}</b> <span class="small">${formatSize(g.size)}</span></p>`).join(""):'<p class="mu">Todavía no subiste ningún APK.</p>'}
 <button class="g" onclick="closeModal()">Cerrar</button>`);
 $("#pOut").onclick=()=>{closeModal();auth.signOut()};
 $("#pSave").onclick=async()=>{
  const n=$("#pName").value.trim(),m=$("#pMsg");
  if(!n){m.className="err";m.textContent="Escribí un nombre.";return}
  try{
   await currentUser.updateProfile({displayName:n});
   await db.collection("users").doc(currentUser.uid).set({name:n},{merge:true});
   updateAccount();m.className="ok";m.textContent="Perfil actualizado.";
  }catch(e){m.className="err";m.textContent=e.message||"No se pudo guardar."}
 };
}
