/* Settings: profile, theme, accent colour, backup, restore, reset */
page(()=>{
 const u=Auth.session();$('#sname').value=u.name;$('#semail').value=u.email;
 $('#pform').onsubmit=e=>{e.preventDefault();const n=$('#sname').value.trim();if(n.length<2)return toast('Enter your full name.','err');Auth.rename(n);toast('Profile saved')};
 const mark=()=>{$$('[data-theme-btn]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.themeBtn===document.documentElement.dataset.theme));
  $$('.sw').forEach(b=>b.setAttribute('aria-pressed',b.dataset.c===SP.get('accent','#7c83ff')))};
 $$('[data-theme-btn]').forEach(b=>b.onclick=()=>{Theme.set(b.dataset.themeBtn);mark()});
 $('#swatches').innerHTML=['#7c83ff','#2dd4bf','#f472b6','#fb923c','#60a5fa','#a3e635'].map(c=>`<button class="sw" data-c="${c}" style="background:${c}" aria-label="Accent ${c}"></button>`).join('');
 $('#swatches').onclick=e=>{const b=e.target.closest('.sw');if(b){Theme.accent(b.dataset.c);mark();toast('Accent colour updated')}};
 $('#backup').onclick=()=>{download('stockpilot-backup-'+new Date().toISOString().slice(0,10)+'.json',SP.backup(),'application/json');toast('Backup downloaded')};
 $('#restore').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();
  r.onload=()=>{try{SP.restore(r.result);toast('Backup restored. Reloading...');setTimeout(()=>location.reload(),900)}catch(x){toast('This file is not a valid StockPilot backup.','err')}};r.readAsText(f)};
 $('#reset').onclick=()=>{if(confirm('Reset products and sales to the demo data? Your account stays.')){SP.del('products');SP.del('sales');seed(true);toast('Demo data restored','warn')}};
 $('#out').onclick=()=>Auth.logout();
 mark();
});
