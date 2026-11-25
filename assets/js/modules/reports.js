/* Reports: inventory / sales / stock, exported as CSV or PDF */
page(()=>{
 const rs=n=>'Rs '+Math.round(n).toLocaleString('en-IN');   // jsPDF default fonts have no rupee glyph
 const REPORTS={
  inventory:()=>({title:'Inventory Report',head:['Product','Category','Supplier','Price','Qty','Status'],
   rows:SP.get('products',[]).map(p=>[p.name,p.cat,p.sup,rs(p.price),p.qty,STAT_LABEL[stat(p)]])}),
  sales:()=>({title:'Sales Report',head:['Week','Revenue','Orders','Avg order value'],
   rows:SP.get('sales',[]).map(s=>[s.w,rs(s.rev),s.orders,rs(s.rev/s.orders)])}),
  stock:()=>({title:'Stock Report',head:['Product','In stock','Minimum','Days left','Suggested reorder'],
   rows:Predict.analyze().items.filter(i=>i.st!=='ok'||i.reorder>0).map(i=>[i.name,i.qty,i.min,i.days>=999?'-':i.days,i.reorder])})
 };
 let cur='inventory';
 function show(){const r=REPORTS[cur]();$('#rtitle').textContent=r.title;
  $('#rhead').innerHTML='<tr>'+r.head.map(h=>`<th>${h}</th>`).join('')+'</tr>';
  $('#rbody').innerHTML=r.rows.map(x=>'<tr>'+x.map(c=>`<td>${esc(c)}</td>`).join('')+'</tr>').join('');
  $$('#tabs button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.r===cur))}
 $('#tabs').onclick=e=>{const b=e.target.closest('button');if(b){cur=b.dataset.r;show()}};
 $('#csv').onclick=()=>{const r=REPORTS[cur]();
  const q=v=>'"'+String(v).replace(/"/g,'""')+'"';
  download(cur+'-report.csv','\ufeff'+[r.head,...r.rows].map(x=>x.map(q).join(',')).join('\n'),'text/csv');toast('CSV downloaded')};
 $('#pdf').onclick=()=>{
  if(!window.jspdf)return toast('PDF library could not load. Check your internet connection.','err');
  const r=REPORTS[cur](),d=new window.jspdf.jsPDF();
  d.setFontSize(18);d.text('StockPilot - '+r.title,14,18);d.setFontSize(10);d.text('Generated '+new Date().toLocaleString(),14,25);
  d.autoTable({head:[r.head],body:r.rows,startY:32,headStyles:{fillColor:[124,131,255]},styles:{fontSize:9}});
  d.save(cur+'-report.pdf');toast('PDF downloaded')};
 show();
});
