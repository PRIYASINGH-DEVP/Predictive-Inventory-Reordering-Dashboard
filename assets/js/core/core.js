'use strict';
/* ==========================================================
   StockPilot core: storage, utils, auth, theme, toast,
   layout (sidebar + topbar), effects, boot
   ========================================================== */

/* ---------- Storage (all keys namespaced "sp:") ---------- */
const SP={
 get(k,d){try{const v=localStorage.getItem('sp:'+k);return v===null?d:JSON.parse(v)}catch(e){return d}},
 set(k,v){localStorage.setItem('sp:'+k,JSON.stringify(v))},
 del(k){localStorage.removeItem('sp:'+k)},
 backup(){const o={};Object.keys(localStorage).filter(k=>k.startsWith('sp:')).forEach(k=>o[k]=localStorage.getItem(k));return JSON.stringify(o,null,2)},
 restore(j){const o=JSON.parse(j);if(!o||typeof o!=='object')throw new Error('bad');Object.keys(o).forEach(k=>k.startsWith('sp:')&&localStorage.setItem(k,o[k]))}
};

/* ---------- Utils ---------- */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const money=n=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n);
const debounce=(f,t=200)=>{let x;return(...a)=>{clearTimeout(x);x=setTimeout(()=>f(...a),t)}};
const stat=p=>p.qty<=0?'out':p.qty<=p.min?'low':'ok';
const STAT_LABEL={ok:'In stock',low:'Low stock',out:'Out of stock'};
const page=f=>{if(!window.__stop)f()};              // run page code only when authorised
function download(name,text,type='text/plain'){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)}
function countUp(el,to,isMoney){const t0=performance.now();(function f(t){const k=Math.min(1,(t-t0)/1000),v=Math.round(to*(1-Math.pow(1-k,3)));el.textContent=isMoney?money(v):v.toLocaleString('en-IN');if(k<1)requestAnimationFrame(f)})(t0)}
function animateIn(sel){if(window.gsap&&!matchMedia('(prefers-reduced-motion:reduce)').matches)gsap.from(sel,{y:22,opacity:0,duration:.6,stagger:.07,ease:'power2.out',clearProps:'all'})}

/* ---------- Toasts ---------- */
function toast(msg,type='ok',ms=3200){
 let box=$('#toasts');if(!box){box=document.createElement('div');box.id='toasts';box.setAttribute('aria-live','polite');document.body.append(box)}
 const t=document.createElement('div');t.className='toast '+type;t.innerHTML='<i></i><span>'+esc(msg)+'</span>';box.append(t);
 setTimeout(()=>{t.classList.add('out');setTimeout(()=>t.remove(),300)},ms);
}

/* ---------- Auth (demo only: passwords are hashed client-side, not secure) ---------- */
const Auth={
 hash(s){let h=5381;for(const c of 'sp$'+s)h=(h*33^c.charCodeAt(0))>>>0;return h.toString(36)},
 users(){return SP.get('users',[])},
 session(){try{return JSON.parse(sessionStorage.getItem('sp:session')||localStorage.getItem('sp:session'))}catch(e){return null}},
 start(u,remember){const s=JSON.stringify({id:u.id,name:u.name,email:u.email});sessionStorage.removeItem('sp:session');localStorage.removeItem('sp:session');(remember?localStorage:sessionStorage).setItem('sp:session',s)},
 rename(name){const s=this.session(),us=this.users();us.forEach(u=>{if(u.id===s.id)u.name=name});SP.set('users',us);s.name=name;(localStorage.getItem('sp:session')?localStorage:sessionStorage).setItem('sp:session',JSON.stringify(s))},
 logout(){sessionStorage.removeItem('sp:session');localStorage.removeItem('sp:session');location.href='login.html'},
 require(){const s=this.session();if(!s){window.__stop=true;location.replace('login.html');return null}return s}
};

/* ---------- Theme + accent ---------- */
const Theme={
 init(){document.documentElement.dataset.theme=SP.get('theme','dark');document.documentElement.style.setProperty('--accent',SP.get('accent','#7c83ff'))},
 set(t){const h=document.documentElement;h.classList.add('tt');h.dataset.theme=t;SP.set('theme',t);setTimeout(()=>h.classList.remove('tt'),500);document.dispatchEvent(new Event('themechange'))},
 toggle(){this.set(document.documentElement.dataset.theme==='dark'?'light':'dark')},
 accent(c){document.documentElement.style.setProperty('--accent',c);SP.set('accent',c);document.dispatchEvent(new Event('themechange'))}
};

/* ---------- Layout: injects sidebar + topbar into every app page ---------- */
const ICON={
 dashboard:'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z',
 inventory:'M21 8l-9-5-9 5v8l9 5 9-5zM3 8l9 5 9-5M12 13v8',
 predictions:'M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4z',
 analytics:'M4 20V10M10 20V4M16 20v-7M22 20H2',
 reports:'M6 2h9l5 5v15H6zM14 2v6h6M9 13h8M9 17h8',
 settings:'M12 15a3 3 0 100-6 3 3 0 000 6zM12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2',
 bell:'M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9M10 21a2 2 0 004 0',
 search:'M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4-4',
 theme:'M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z',
 menu:'M3 6h18M3 12h18M3 18h18',logout:'M9 21H5V3h4M16 17l5-5-5-5M21 12H9'
};
const svg=n=>`<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="${ICON[n]}"/></svg>`;
const NAV=[['dashboard','Dashboard'],['inventory','Inventory'],['predictions','AI Predictions'],['analytics','Analytics'],['reports','Reports'],['settings','Settings']];

const Layout={
 init(){
  const u=Auth.require();if(!u)return;
  const pg=document.body.dataset.page,low=SP.get('products',[]).filter(p=>stat(p)!=='ok');
  $('.app').insertAdjacentHTML('afterbegin',`<aside class="side glass" id="side" aria-label="Main navigation">
   <a class="brand" href="dashboard.html"><span class="logo"></span>StockPilot</a>
   ${NAV.map(([k,l])=>`<a class="nav" href="${k}.html" ${k===pg?'aria-current="page"':''}>${svg(k)}${l}</a>`).join('')}
   <div class="me"><span class="av">${esc(u.name[0]||'U').toUpperCase()}</span><div style="min-width:0;flex:1"><div style="font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis">${esc(u.name)}</div><div class="mu" style="font-size:11px">Admin</div></div>
   <button class="ib" id="logout" aria-label="Log out" style="width:36px;height:36px">${svg('logout')}</button></div></aside>`);
  $('#view').insertAdjacentHTML('afterbegin',`<header class="top">
   <button class="ib menu-btn" id="menuBtn" aria-label="Open menu" aria-controls="side">${svg('menu')}</button>
   <form id="gform" role="search"><input class="in" id="gsearch" type="search" placeholder="Search products (press /)" aria-label="Search products"></form>
   <div class="drop-wrap"><button class="ib" id="bell" aria-label="Notifications" aria-expanded="false">${svg('bell')}${low.length?`<span class="badge">${low.length}</span>`:''}</button>
    <div class="drop glass" id="bellDrop"><h3>Inventory alerts</h3>${low.length?low.slice(0,6).map(p=>`<a href="inventory.html?q=${encodeURIComponent(p.name)}">${esc(p.name)} <span class="b ${stat(p)}">${p.qty} left</span></a>`).join(''):'<p>All stock levels are healthy.</p>'}</div></div>
   <button class="ib" id="themeBtn" aria-label="Toggle dark or light theme">${svg('theme')}</button></header>`);
  // events
  $('#logout').onclick=()=>Auth.logout();
  $('#themeBtn').onclick=()=>Theme.toggle();
  $('#menuBtn').onclick=()=>$('#side').classList.toggle('open');
  $('#gform').onsubmit=e=>{e.preventDefault();location.href='inventory.html?q='+encodeURIComponent($('#gsearch').value)};
  $('#bell').onclick=e=>{e.stopPropagation();const d=$('#bellDrop').classList.toggle('open');$('#bell').setAttribute('aria-expanded',d)};
  document.addEventListener('click',e=>{if(!e.target.closest('.drop-wrap'))$('#bellDrop').classList.remove('open');if(!e.target.closest('#side,#menuBtn'))$('#side').classList.remove('open')});
  document.addEventListener('keydown',e=>{if(e.key==='/'&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)){e.preventDefault();$('#gsearch').focus()}if(e.key==='Escape')$('#bellDrop').classList.remove('open')});
  // skeleton loading state, then entrance animation
  document.body.classList.add('loading');setTimeout(()=>document.body.classList.remove('loading'),650);
  animateIn('.tilt, .glass.pad');
  if(low.length&&!sessionStorage.getItem('sp:warned')){sessionStorage.setItem('sp:warned',1);setTimeout(()=>toast(low.length+' products need attention','warn',4500),900)}
 }
};

/* ---------- Effects: custom cursor, ripple, tilt, page transitions ---------- */
const Fx={init(){
 if(matchMedia('(hover:hover)').matches){
  const c=document.createElement('div');c.className='cur';document.body.append(c);let x=0,y=0,cx=0,cy=0;
  addEventListener('mousemove',e=>{x=e.clientX;y=e.clientY});
  (function f(){cx+=(x-cx)*.2;cy+=(y-cy)*.2;c.style.left=cx+'px';c.style.top=cy+'px';requestAnimationFrame(f)})();
  document.addEventListener('mouseover',e=>c.classList.toggle('big',!!e.target.closest('a,button,input,select,label')));
 }
 document.addEventListener('click',e=>{const b=e.target.closest('.btn');if(!b)return;const r=b.getBoundingClientRect(),s=Math.max(r.width,r.height),i=document.createElement('i');i.className='rip';i.style.cssText=`width:${s}px;height:${s}px;left:${e.clientX-r.left-s/2}px;top:${e.clientY-r.top-s/2}px`;b.append(i);setTimeout(()=>i.remove(),600)});
 document.addEventListener('mousemove',e=>{const t=e.target.closest('.tilt');if(!t)return;const r=t.getBoundingClientRect(),px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;t.style.transform=`perspective(700px) rotateY(${px*10}deg) rotateX(${-py*10}deg) translateY(-3px)`});
 document.addEventListener('mouseout',e=>{const t=e.target.closest('.tilt');if(t&&!t.contains(e.relatedTarget))t.style.transform=''});
 document.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(!a||a.target||e.ctrlKey||e.metaKey||e.defaultPrevented)return;const h=a.getAttribute('href');if(!h||h[0]==='#'||/^(https?:|mailto:)/.test(h))return;e.preventDefault();document.body.classList.add('leaving');setTimeout(()=>location.href=h,200)});
 addEventListener('pageshow',()=>document.body.classList.remove('leaving'));
}};

/* ---------- Boot ---------- */
Theme.init();
if(typeof seed==='function')seed();
if(document.body.dataset.page)Layout.init();
Fx.init();
