/* Tirvox · núcleo: estado y utilidades compartidas */
let auth=null, db=null, storage=null, currentUser=null, games=[], unsubGames=null;
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function openModal(content){$("#modalRoot").innerHTML=`<div class="modal" id="modal"><div class="sheet">${content}</div></div>`;$("#modal").addEventListener("click",e=>{if(e.target.id==="modal")closeModal()})}
function closeModal(){$("#modalRoot").innerHTML=""}
function setNotice(msg="",kind="err"){$("#notice").className=kind;$("#notice").textContent=msg}
