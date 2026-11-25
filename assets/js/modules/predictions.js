/* AI Predictions page: health score, runway bars, movers, reorder table */
page(()=>{
 function draw(){
  const a=Predict.analyze();
  $('#ring').style.setProperty('--v',a.health);$('#ring b').textContent=a.health;
  $('#ins').innerHTML=Predict.insights(a).map(i=>`<div class="ins"><b>${esc(i.t)}</b><p>${esc(i.x)}</p></div>`).join('');
  // stock runway: days of stock left, lowest first
  const run=[...a.items].sort((x,y)=>x.days-y.days).slice(0,8);
  $('#runway').innerHTML=run.map(i=>`<div style="margin-bottom:12px"><div class="row between"><span style="font-size:14px">${esc(i.name)}</span><span class="b ${i.days<=7?'out':i.days<=21?'low':'ok'}">${i.days>=999?'No sales':i.days+' days'}</span></div><div class="pbar"><i data-w="${Math.min(100,i.days/60*100)}"></i></div></div>`).join('');
  requestAnimationFrame(()=>setTimeout(()=>$$('#runway i').forEach(b=>b.style.width=b.dataset.w+'%'),50));
  const li=(L,fn)=>L.slice(0,5).map(i=>`<li><span>${esc(i.name)}</span><span class="mu">${fn(i)}</span></li>`).join('')||'<li>None</li>';
  $('#fast').innerHTML=li(a.fast,i=>i.sold+' sold / 30d');$('#slow').innerHTML=li(a.slow,i=>i.sold+' sold / 30d');
  $('#rrows').innerHTML=a.reorder.map(i=>`<tr><td>${esc(i.name)}</td><td>${i.qty}</td><td>${i.days>=999?'-':i.days+' days'}</td><td><b>${i.reorder}</b></td><td>${money(i.reorder*i.price)}</td><td><button class="btn sm" data-id="${i.id}" data-q="${i.reorder}">Mark as ordered</button></td></tr>`).join('');
  $('#rempty').hidden=a.reorder.length>0;
  const n=a.items.length-a.fast.length-a.slow.length;
  Charts.make('mix',{type:'doughnut',data:{labels:['Fast','Normal','Slow'],datasets:[{data:[a.fast.length,n,a.slow.length],backgroundColor:[Charts.css('--accent2'),Charts.css('--accent'),'#fcd34d'],borderWidth:0}]},options:{cutout:'68%'}});
 }
 $('#rrows').onclick=e=>{const b=e.target.closest('button');if(!b)return;
  const A=SP.get('products',[]),p=A.find(x=>x.id===b.dataset.id);p.qty+=+b.dataset.q;SP.set('products',A);toast(`Ordered ${b.dataset.q} x ${p.name}. Stock updated.`);draw()};
 document.addEventListener('themechange',draw);draw();
});
