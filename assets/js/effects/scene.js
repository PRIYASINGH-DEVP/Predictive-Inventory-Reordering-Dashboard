/* Three.js scenes: "floating" boxes (auth background) and "warehouse" (dashboard hero).
   Skips silently if Three.js is missing or the user prefers reduced motion. */
function initScene(id,o={}){
 const c=document.getElementById(id);
 if(!c||!window.THREE||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
 const W=()=>c.clientWidth||innerWidth,H=()=>c.clientHeight||innerHeight;
 const r=new THREE.WebGLRenderer({canvas:c,alpha:true,antialias:true});r.setPixelRatio(Math.min(devicePixelRatio,2));
 const s=new THREE.Scene(),cam=new THREE.PerspectiveCamera(50,1,.1,100);
 s.add(new THREE.AmbientLight(0xffffff,.75));const dl=new THREE.DirectionalLight(0xffffff,.9);dl.position.set(4,8,6);s.add(dl);
 const cols=[0x7c83ff,0x2dd4bf,0xf472b6,0xfcd34d],mat=i=>new THREE.MeshStandardMaterial({color:cols[i%4],roughness:.4,metalness:.15});
 let mx=0,my=0,tick;
 if(o.mode==='warehouse'){
  cam.position.set(0,3.2,9);const g=new THREE.Group();s.add(g);
  const floor=new THREE.GridHelper(16,16,0x7c83ff,0x7c83ff);floor.material.transparent=true;floor.material.opacity=.25;floor.position.y=-1.2;g.add(floor);
  for(let x=-1;x<=1;x++)for(let y=0;y<3;y++)for(let z=0;z<2;z++){const b=new THREE.Mesh(new THREE.BoxGeometry(1.1,.8,1.1),mat(x+y+z+3));b.position.set(x*3,y*1.05-.7,z*1.6-3);g.add(b)}
  const mover=new THREE.Mesh(new THREE.BoxGeometry(.9,.7,.9),mat(1));mover.position.set(-6,-.8,1.5);g.add(mover);   // box on the "conveyor"
  tick=t=>{mover.position.x=(t*.9)%12-6;g.rotation.y=Math.sin(t*.2)*.25+mx*.3;g.rotation.x=my*.1};
 }else{
  cam.position.z=9;const items=[];
  for(let i=0;i<(o.n||20);i++){const b=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),mat(i));b.position.set((Math.random()-.5)*18,(Math.random()-.5)*10,(Math.random()-.5)*6);b.scale.setScalar(.4+Math.random()*.9);b.userData={s:.004+Math.random()*.01,p:Math.random()*6,y:b.position.y};items.push(b);s.add(b)}
  tick=t=>{items.forEach(b=>{b.rotation.x+=b.userData.s;b.rotation.y+=b.userData.s*1.3;b.position.y=b.userData.y+Math.sin(t+b.userData.p)*.4});s.rotation.y=mx*.15;s.rotation.x=my*.1};
 }
 addEventListener('mousemove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5});
 const rs=()=>{r.setSize(W(),H(),false);cam.aspect=W()/H();cam.updateProjectionMatrix()};rs();addEventListener('resize',rs);
 const clk=new THREE.Clock();(function a(){requestAnimationFrame(a);tick(clk.getElapsedTime());r.render(s,cam)})();
}
