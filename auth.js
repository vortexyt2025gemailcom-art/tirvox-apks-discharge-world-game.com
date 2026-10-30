/* Tirvox · iniciar sesión, crear cuenta y restablecer contraseña */
function updateAccount(){
 const a=$("#accountArea");
 if(!currentUser){a.innerHTML='<button id="loginBtn">Iniciar sesión</button>';$("#loginBtn").onclick=()=>authDialog("login");return}/* Tirvox · iniciar sesión, crear cuenta y restablecer contraseña */
function updateAccount(){
 const a=$("#accountArea");
 if(!currentUser){a.innerHTML='<button id="loginBtn">Iniciar sesión</button>';$("#loginBtn").onclick=()=>authDialog("login");return}
 a.innerHTML=`<button class="g" id="profileBtn">👤 ${esc((currentUser.displayName||currentUser.email).slice(0,14))}</button>`;
 $("#profileBtn").onclick=profileDialog;
}
function authDialog(mode="login"){
 const create=mode==="create";
 openModal(`<h2>${create?"Crear cuenta":"Iniciar sesión"}</h2>
 ${create?'<label>Nombre público</label><input id="displayName" maxlength="35" placeholder="Tu nombre">':''}
 <label>Email</label><input id="email" type="email" autocomplete="email" placeholder="tu@email.com">
 <label>Contraseña</label><input id="password" type="password" autocomplete="${create?"new-password":"current-password"}" minlength="6" placeholder="Mínimo 6 caracteres">
 <p class="err" id="authError"></p><div class="row"><button id="authGo">${create?"Crear cuenta":"Entrar"}</button>
 <button class="g" id="switchAuth">${create?"Ya tengo cuenta":"Crear cuenta"}</button></div>
 ${!create?'<button class="g" id="resetPassword">Restablecer contraseña</button>':''}`);
 $("#authGo").onclick=async()=>{
  const btn=$("#authGo"),err=$("#authError");btn.disabled=true;err.textContent="";
  try{
   const email=$("#email").value.trim(),pass=$("#password").value;
   if(!email||pass.length<6)throw Error("Ingresá un email y una contraseña de al menos 6 caracteres.");
   if(create){
    const name=$("#displayName").value.trim();if(!name)throw Error("Escribí tu nombre público.");
    const cred=await auth.createUserWithEmailAndPassword(email,pass);
    await cred.user.updateProfile({displayName:name});
    currentUser=cred.user;updateAccount();
    await db.collection("users").doc(cred.user.uid).set({name,email,createdAt:firebase.firestore.FieldValue.serverTimestamp()});
   }else await auth.signInWithEmailAndPassword(email,pass);
   closeModal();
  }catch(e){err.textContent=authError(e);btn.disabled=false}
 };
 $("#switchAuth").onclick=()=>authDialog(create?"login":"create");
 if($("#resetPassword"))$("#resetPassword").onclick=async()=>{const email=$("#email").value.trim();if(!email)return $("#authError").textContent="Escribí tu email primero.";try{await auth.sendPasswordResetEmail(email);$("#authError").textContent="Te enviamos un correo para restablecer la contraseña."}catch(e){$("#authError").textContent=authError(e)}};
}
function authError(e){const m={"auth/email-already-in-use":"Ese email ya tiene una cuenta.","auth/invalid-email":"El email no es válido.","auth/weak-password":"La contraseña es demasiado corta.","auth/user-not-found":"No existe una cuenta con ese email.","auth/wrong-password":"Contraseña incorrecta.","auth/invalid-credential":"Email o contraseña incorrectos."};return m[e.code]||e.message||"Ocurrió un error."}
   
 a.innerHTML=`<button class="g" id="profileBtn">👤 ${esc((currentUser.displayName||currentUser.email).slice(0,14))}</button>`;
 $("#profileBtn").onclick=profileDialog;
}
function authDialog(mode="login"){
 const create=mode==="create";
 openModal(`<h2>${create?"Crear cuenta":"Iniciar sesión"}</h2>
 ${create?'<label>Nombre público</label><input id="displayName" maxlength="35" placeholder="Tu nombre">':''}
 <label>Email</label><input id="email" type="email" autocomplete="email" placeholder="tu@email.com">
 <label>Contraseña</label><input id="password" type="password" autocomplete="${create?"new-password":"current-password"}" minlength="6" placeholder="Mínimo 6 caracteres">
 <p class="err" id="authError"></p><div class="row"><button id="authGo">${create?"Crear cuenta":"Entrar"}</button>
 <button class="g" id="switchAuth">${create?"Ya tengo cuenta":"Crear cuenta"}</button></div>
 ${!create?'<button class="g" id="resetPassword">Restablecer contraseña</button>':''}`);
 $("#authGo").onclick=async()=>{
  const btn=$("#authGo"),err=$("#authError");btn.disabled=true;err.textContent="";
  try{
   const email=$("#email").value.trim(),pass=$("#password").value;
   if(!email||pass.length<6)throw Error("Ingresá un email y una contraseña de al menos 6 caracteres.");
   if(create){
    const name=$("#displayName").value.trim();if(!name)throw Error("Escribí tu nombre público.");
    const cred=await auth.createUserWithEmailAndPassword(email,pass);
    await cred.user.updateProfile({displayName:name});
    currentUser=cred.user;updateAccount();
    await db.collection("users").doc(cred.user.uid).set({name,email,createdAt:firebase.firestore.FieldValue.serverTimestamp()});
   }else await auth.signInWithEmailAndPassword(email,pass);
   closeModal();
  }catch(e){err.textContent=authError(e);btn.disabled=false}
 };
 $("#switchAuth").onclick=()=>authDialog(create?"login":"create");
 if($("#resetPassword"))$("#resetPassword").onclick=async()=>{const email=$("#email").value.trim();if(!email)return $("#authError").textContent="Escribí tu email primero.";try{await auth.sendPasswordResetEmail(email);$("#authError").textContent="Te enviamos un correo para restablecer la contraseña."}catch(e){$("#authError").textContent=authError(e)}};
}
function authError(e){const m={"auth/email-already-in-use":"Ese email ya tiene una cuenta.","auth/invalid-email":"El email no es válido.","auth/weak-password":"La contraseña es demasiado corta.","auth/user-not-found":"No existe una cuenta con ese email.","auth/wrong-password":"Contraseña incorrecta.","auth/invalid-credential":"Email o contraseña incorrectos."};return m[e.code]||e.message||"Ocurrió un error."}
