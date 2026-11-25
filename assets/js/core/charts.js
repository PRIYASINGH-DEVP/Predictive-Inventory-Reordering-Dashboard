/* Chart.js helper: theme-aware colours, destroys old chart before redraw */
const Charts={
 list:{},
 css(v){return getComputedStyle(document.documentElement).getPropertyValue(v).trim()},
 pal(){return[this.css('--accent'),this.css('--accent2'),'#f472b6','#fcd34d','#60a5fa','#fb923c']},
 make(id,cfg){
  if(this.list[id])this.list[id].destroy();
  Chart.defaults.color=this.css('--mu');Chart.defaults.font.family='Inter, sans-serif';
  const grid=this.css('--bd');
  cfg.options=Object.assign({responsive:true,maintainAspectRatio:false,animation:{duration:1100,easing:'easeOutQuart'}},cfg.options||{});
  if(cfg.type!=='doughnut')cfg.options.scales=Object.assign({x:{grid:{color:grid}},y:{grid:{color:grid},beginAtZero:true}},cfg.options.scales||{});
  return this.list[id]=new Chart($('#'+id),cfg);
 }
};
