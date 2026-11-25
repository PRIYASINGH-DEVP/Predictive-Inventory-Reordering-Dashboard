/* Dashboard: KPI cards, hero scene, health ring, AI insights */
page(()=>{
 const a=Predict.analyze(),S=SP.get('sales',[]),u=Auth.session();
 $('#uname').textContent=u.name.split(' ')[0];
 $('#heroTxt').textContent=a.reorder.length?`AI found ${a.reorder.length} products that need reordering soon.`:'All products have healthy stock levels.';
 const vals={tp:a.items.length,rev:a.items.reduce((s,p)=>s+p.price*p.sold,0),ord:S.slice(-4).reduce((s,x)=>s+x.orders,0),low:a.low.length,re:a.reorder.length};
 setTimeout(()=>$$('[data-count]').forEach(el=>countUp(el,vals[el.dataset.count],el.dataset.count==='rev')),650);
 $('#ring').style.setProperty('--v',a.health);$('#ring b').textContent=a.health;
 $('#healthTxt').textContent=`${a.fast.length} fast movers, ${a.slow.length} slow movers.`;
 $('#ins').innerHTML=Predict.insights(a).slice(0,4).map(i=>`<div class="ins"><b>${esc(i.t)}</b><p>${esc(i.x)}</p></div>`).join('');
 $('#alerts').innerHTML=a.low.slice(0,5).map(p=>`<li><span>${esc(p.name)}</span><span class="b ${p.st}">${p.qty} left</span></li>`).join('')||'<li>No alerts</li>';
 initScene('hero3d',{mode:'warehouse'});
});
