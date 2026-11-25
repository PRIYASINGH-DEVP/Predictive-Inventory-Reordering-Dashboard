/* Demo data: products + 12 weeks of sales, created on first run */
const placeholder=(name,c)=>{const i=name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
 return 'data:image/svg+xml;utf8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c}"/><stop offset="1" stop-color="#2dd4bf"/></linearGradient></defs><rect width="80" height="80" rx="16" fill="url(#g)"/><text x="40" y="50" font-size="26" font-family="Arial" font-weight="700" fill="#fff" text-anchor="middle">${i}</text></svg>`)};

function seed(force){
 if(!force&&SP.get('products'))return;
 const cols=['#7c83ff','#f472b6','#fb923c','#60a5fa'];
 // [name, category, supplier, price, qty, minStock, sold in last 30 days]
 const rows=[
  ['Wireless Mouse X2','Electronics','TechNova',899,142,30,96],['Mechanical Keyboard','Electronics','TechNova',3499,64,20,41],
  ['USB-C Hub 7-in-1','Electronics','PortHub',1999,0,25,88],['Ergo Office Chair','Furniture','SitWell',8999,8,10,22],
  ['Standing Desk','Furniture','SitWell',15999,14,6,9],['Desk Lamp Pro','Home','Lumo',1299,19,15,34],
  ['Notebook A5 Pack','Stationery','PaperCo',249,420,100,60],['Gel Pen Box 50','Stationery','PaperCo',399,210,80,175],
  ['Water Bottle 1L','Home','HydroPure',599,5,20,72],['Bluetooth Speaker','Electronics','SoundBay',2499,38,15,52],
  ['Laptop Stand','Electronics','PortHub',1499,77,20,19],['Yoga Mat','Fitness','FlexFit',999,120,25,8],
  ['Dumbbell Set 10kg','Fitness','FlexFit',2799,16,10,27],['Webcam HD 1080p','Electronics','TechNova',2199,9,12,37]];
 SP.set('products',rows.map((r,i)=>({id:uid(),name:r[0],cat:r[1],sup:r[2],price:r[3],qty:r[4],min:r[5],sold:r[6],img:placeholder(r[0],cols[i%4])})));
 const rev=[182,196,174,210,228,215,246,262,251,288,301,326],ord=[210,225,198,240,262,250,281,300,288,330,347,372];
 SP.set('sales',rev.map((r,i)=>({w:'W'+(i+1),rev:r*1000,orders:ord[i]})));
}
