/* ==========================================================
   AI prediction engine (pure JS heuristics, no backend)
   daily rate = sold in 30 days / 30
   days left  = stock / daily rate
   reorder    = rate * (lead time + safety days) - current stock
   ========================================================== */
const Predict={
 LEAD:14,SAFE:7,
 analyze(){
  const P=SP.get('products',[]),n=P.length||1,avg=P.reduce((a,p)=>a+p.sold,0)/n;
  const items=P.map(p=>{
   const rate=p.sold/30,days=rate>0?Math.floor(p.qty/rate):999,need=Math.ceil(rate*(this.LEAD+this.SAFE));
   return{...p,st:stat(p),rate,days,reorder:Math.max(0,need-p.qty),tag:p.sold>=avg*1.4?'fast':p.sold<=avg*.4?'slow':'normal'};
  });
  const out=items.filter(i=>i.st==='out').length,low=items.filter(i=>i.st==='low').length,slow=items.filter(i=>i.tag==='slow').length;
  return{
   items,avg,
   health:Math.max(0,Math.round(100-(out+low*.5+slow*.25)/n*100)),
   fast:items.filter(i=>i.tag==='fast').sort((a,b)=>b.sold-a.sold),
   slow:items.filter(i=>i.tag==='slow').sort((a,b)=>a.sold-b.sold),
   low:items.filter(i=>i.st!=='ok'),
   reorder:items.filter(i=>i.reorder>0&&(i.st!=='ok'||i.days<=this.LEAD)).sort((a,b)=>a.days-b.days)
  };
 },
 /* Human-readable AI insight cards */
 insights(a){
  const o=[],out=a.items.filter(i=>i.st==='out');
  if(out.length)o.push({t:out.length+' product'+(out.length>1?'s are':' is')+' out of stock',x:out.map(i=>i.name).join(', ')+'. Reorder now to stop lost sales.'});
  if(a.fast[0])o.push({t:a.fast[0].name+' is your top seller',x:`About ${a.fast[0].rate.toFixed(1)} units per day. Current stock lasts ${a.fast[0].days>=999?'a long time':a.fast[0].days+' days'}.`});
  if(a.slow[0])o.push({t:a.slow[0].name+' is moving slowly',x:`Only ${a.slow[0].sold} units sold in 30 days. Consider a discount or bundle offer.`});
  const r=a.reorder.reduce((s,i)=>s+i.reorder*i.price,0);
  if(a.reorder.length)o.push({t:'Reorder plan ready',x:`${a.reorder.length} products need restocking. Estimated order value ${money(r)}.`});
  o.push({t:'Inventory health: '+a.health+'/100',x:a.health>=80?'Stock levels look good overall.':a.health>=60?'Some products need attention soon.':'Many products are at risk. Act on the reorder list.'});
  return o;
 }
};
