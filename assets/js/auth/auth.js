/* Login, sign up and forgot-password logic (LocalStorage only) */
const Valid={
 email:v=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)?'':'Enter a valid email address.',
 pass:v=>v.length<8?'Password needs at least 8 characters.':!/[A-Za-z]/.test(v)||!/\d/.test(v)?'Use at least one letter and one number.':''
};
const msg=(t,type)=>{const m=$('#msg');m.className='msg '+type;m.textContent=t;m.hidden=false};
const fieldErr=(id,t)=>{$('#'+id+'-e').textContent=t;$('#'+id).setAttribute('aria-invalid',!!t);return!!t};
const go=(url,ms=900)=>setTimeout(()=>location.href=url,ms);

// show / hide password buttons
$$('[data-eye]').forEach(b=>b.onclick=()=>{const i=$('#'+b.dataset.eye),h=i.type==='password';i.type=h?'text':'password';b.textContent=h?'Hide':'Show';b.setAttribute('aria-label',h?'Hide password':'Show password')});

if(Auth.session()&&document.body.dataset.auth!=='forgot')location.replace('dashboard.html');
initScene('bg3d',{n:22});

const pg=document.body.dataset.auth;
if(pg==='login'){
 const rem=SP.get('remember',null);if(rem){$('#email').value=rem;$('#remember').checked=true}
 $('#form').onsubmit=e=>{e.preventDefault();
  const em=$('#email').value.trim().toLowerCase(),pw=$('#password').value;
  if(fieldErr('email',Valid.email(em))|fieldErr('password',pw?'':'Enter your password.'))return;
  const u=Auth.users().find(x=>x.email===em);
  if(!u||u.pw!==Auth.hash(pw))return msg('Email or password is incorrect.','err');
  $('#remember').checked?SP.set('remember',em):SP.del('remember');
  Auth.start(u,$('#remember').checked);msg('Welcome back, '+u.name.split(' ')[0]+'!','ok');go('dashboard.html');
 };
}
if(pg==='signup'){
 $('#form').onsubmit=e=>{e.preventDefault();
  const n=$('#name').value.trim(),em=$('#email').value.trim().toLowerCase(),pw=$('#password').value;
  if(fieldErr('name',n.length<2?'Enter your full name.':'')|fieldErr('email',Valid.email(em))|fieldErr('password',Valid.pass(pw))|fieldErr('confirm',$('#confirm').value!==pw?'Passwords do not match.':''))return;
  const us=Auth.users();if(us.some(x=>x.email===em))return msg('An account with this email already exists.','err');
  const u={id:uid(),name:n,email:em,pw:Auth.hash(pw)};us.push(u);SP.set('users',us);
  Auth.start(u,false);msg('Account created. Opening your dashboard...','ok');go('dashboard.html');
 };
}
if(pg==='forgot'){
 let user=null;
 $('#form').onsubmit=e=>{e.preventDefault();
  if(!user){const em=$('#email').value.trim().toLowerCase();if(fieldErr('email',Valid.email(em)))return;
   user=Auth.users().find(x=>x.email===em);
   if(!user){user=null;return msg('No account found with this email.','err')}
   $('#step2').hidden=false;$('#btn').textContent='Save new password';return msg('Account found. Choose a new password.','ok')}
  const pw=$('#password').value;if(fieldErr('password',Valid.pass(pw)))return;
  const us=Auth.users();us.find(x=>x.id===user.id).pw=Auth.hash(pw);SP.set('users',us);msg('Password updated. Redirecting to login...','ok');go('login.html');
 };
}
