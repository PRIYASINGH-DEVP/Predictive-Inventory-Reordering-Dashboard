/* Inventory: add, edit, delete, search, filter, sort, image upload */
page(()=>{
 const dlg=$('#dlg'),f=$('#pf');let img='';
 const state={q:new URLSearchParams(location.search).get('q')||'',cat:'',st:new URLSearchParams(location.search).get('status')||'',sort:'name'};
 $('#q').value=state.q;$('#fst').value=state.st;

 const all=()=>SP.get('products',[]);
 const save=a=>SP.set('products',a);

 function cats(){const c=[...new Set(all().map(p=>p.cat))].sort();$('#fcat').innerHTML='<option value="">All categories</option>'+c.map(x=>`<option>${esc(x)}</option>`).join('');$('#fcat').value=state.cat;$('#catlist').innerHTML=c.map(x=>`<option value="${esc(x)}">`).join('')}

 function render(){
  const q=state.q.toLowerCase();
  let L=all().filter(p=>(!q||(p.name+p.sup+p.cat).toLowerCase().includes(q))&&(!state.cat||p.cat===state.cat)&&(!state.st||stat(p)===state.st));
  const [k,d]=state.sort.split(':');L.sort((a,b)=>(typeof a[k]==='string'?a[k].localeCompare(b[k]):a[k]-b[k])*(d==='desc'?-1:1));
  $('#rows').innerHTML=L.map(p=>`<tr><td><img class="pimg" src="${p.img}" alt="">${esc(p.name)}</td><td>${esc(p.cat)}</td><td>${esc(p.sup)}</td><td>${money(p.price)}</td><td>${p.qty}</td><td><span class="b ${stat(p)}">${STAT_LABEL[stat(p)]}</span></td>
   <td style="white-space:nowrap"><button class="btn ghost sm" data-edit="${p.id}" aria-label="Edit ${esc(p.name)}">Edit</button> <button class="btn danger sm" data-del="${p.id}" aria-label="Delete ${esc(p.name)}">Delete</button></td></tr>`).join('');
  $('#empty').hidden=L.length>0;$('#count').textContent=L.length+' of '+all().length+' products';
 }

 // resize uploaded image to keep LocalStorage small
 function readImg(file){return new Promise(res=>{const r=new FileReader();r.onload=()=>{const i=new Image();i.onload=()=>{const c=document.createElement('canvas');c.width=c.height=120;const x=c.getContext('2d'),s=Math.min(i.width,i.height);x.drawImage(i,(i.width-s)/2,(i.height-s)/2,s,s,0,0,120,120);res(c.toDataURL('image/jpeg',.8))};i.src=r.result};r.readAsDataURL(file)})}

 function open(p){
  f.reset();$('#dtitle').textContent=p?'Edit product':'Add product';f.dataset.id=p?p.id:'';
  if(p){$('#pname').value=p.name;$('#pcat').value=p.cat;$('#psup').value=p.sup;$('#pprice').value=p.price;$('#pqty').value=p.qty;$('#pmin').value=p.min;$('#psold').value=p.sold}
  img=p?p.img:'';$('#prev').src=img||placeholder('New Product','#7c83ff');dlg.showModal();$('#pname').focus();
 }

 $('#addBtn').onclick=()=>open();
 $('#cancel').onclick=()=>dlg.close();
 $('#pimg').onchange=async e=>{if(e.target.files[0]){img=await readImg(e.target.files[0]);$('#prev').src=img}};
 f.onsubmit=e=>{e.preventDefault();
  const n=$('#pname').value.trim(),A=all(),id=f.dataset.id;
  const p={id:id||uid(),name:n,cat:$('#pcat').value.trim(),sup:$('#psup').value.trim(),price:+$('#pprice').value,qty:+$('#pqty').value,min:+$('#pmin').value,sold:+$('#psold').value||0,img:img||placeholder(n,'#7c83ff')};
  if(p.price<0||p.qty<0||p.min<0)return toast('Numbers cannot be negative.','err');
  if(id){A[A.findIndex(x=>x.id===id)]=p}else A.unshift(p);
  try{save(A)}catch(err){return toast('Storage is full. Use a smaller image.','err')}
  dlg.close();cats();render();toast(id?'Product updated':'Product added');
 };
 $('#rows').onclick=e=>{
  const ed=e.target.closest('[data-edit]'),dl=e.target.closest('[data-del]');
  if(ed)open(all().find(p=>p.id===ed.dataset.edit));
  if(dl&&confirm('Delete this product? This cannot be undone.')){save(all().filter(p=>p.id!==dl.dataset.del));cats();render();toast('Product deleted','warn')}
 };
 $('#q').oninput=debounce(e=>{state.q=e.target.value;render()});
 $('#fcat').onchange=e=>{state.cat=e.target.value;render()};
 $('#fst').onchange=e=>{state.st=e.target.value;render()};
 $('#sort').onchange=e=>{state.sort=e.target.value;render()};
 cats();render();
});
