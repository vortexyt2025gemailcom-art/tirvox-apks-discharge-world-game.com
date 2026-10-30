/* Tirvox · arranque de la app (Firebase + eventos) */
const configured = Object.values(firebaseConfig).every(v => v && !v.startsWith("PEGAR_"));
function startFirebase(){
 if(!configured||!window.firebase){setNotice("Falta configurar Firebase. Completá firebaseConfig en index.html.");$("#catalog").innerHTML='<p class="mu">La interfaz ya está lista. Para activar cuentas y nube, completá la configuración Firebase.</p>';return}
 try{
  firebase.initializeApp(firebaseConfig);auth=firebase.auth();db=firebase.firestore();storage=firebase.storage();
  auth.onAuthStateChanged(user=>{currentUser=user;updateAccount();render()});
  unsubGames=db.collection("apks").orderBy("createdAt","desc").onSnapshot(s=>{games=s.docs.map(d=>({id:d.id,...d.data()}));render();setNotice("")},e=>setNotice("Error al leer el catálogo: "+e.message));
 }catch(e){setNotice("No se pudo iniciar Firebase: "+e.message)}
}
function startApp(){
 $("#loginBtn").onclick=()=>authDialog("login");$("#uploadBtn").onclick=uploadDialog;$("#search").oninput=render;
 startFirebase();
}
