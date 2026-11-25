/* Analytics: five Chart.js charts, redrawn on theme/accent change */
page(()=>{
 function draw(){
  const P=SP.get('products',[]),S=SP.get('sales',[]),c=Charts.pal();
  Charts.make('c1',{type:'line',data:{labels:S.map(s=>s.w),datasets:[{label:'Orders',data:S.map(s=>s.orders),borderColor:c[1],backgroundColor:c[1]+'33',fill:true,tension:.4,pointRadius:3}]}});
  const n={ok:0,low:0,out:0};P.forEach(p=>n[stat(p)]++);
  Charts.make('c2',{type:'doughnut',data:{labels:['In stock','Low stock','Out of stock'],datasets:[{data:[n.ok,n.low,n.out],backgroundColor:[c[1],'#fcd34d','#f87171'],borderWidth:0}]},options:{cutout:'65%'}});
  const cat={};P.forEach(p=>cat[p.cat]=(cat[p.cat]||0)+p.qty);
  Charts.make('c3',{type:'bar',data:{labels:Object.keys(cat),datasets:[{label:'Units in stock',data:Object.values(cat),backgroundColor:c,borderRadius:8}]},options:{plugins:{legend:{display:false}}}});
  const top=[...P].sort((a,b)=>b.price*b.sold-a.price*a.sold).slice(0,8);
  Charts.make('c4',{type:'bar',data:{labels:top.map(p=>p.name),datasets:[{label:'Revenue (30 days)',data:top.map(p=>p.price*p.sold),backgroundColor:c[0],borderRadius:8}]},options:{plugins:{legend:{display:false}}}});
  const lo=P.filter(p=>stat(p)!=='ok');
  Charts.make('c5',{type:'bar',data:{labels:lo.map(p=>p.name),datasets:[{label:'In stock',data:lo.map(p=>p.qty),backgroundColor:'#f87171',borderRadius:6},{label:'Minimum level',data:lo.map(p=>p.min),backgroundColor:c[1],borderRadius:6}]},options:{indexAxis:'y'}});
 }
 document.addEventListener('themechange',draw);draw();
});
