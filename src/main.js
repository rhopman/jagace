import {createSideViewRenderer} from './side-view.js';
import {extendConveyor} from './conveyors.js';
import {iconMarkup,createSprites} from './art.js';
import {elements,recipes,key,fresh,price,place,remove,tick} from './engine.js';
const sprites=createSprites();
const $=s=>document.querySelector(s);let state;try{const saved=JSON.parse(localStorage.getItem('jagace-v1'));state=saved?.blocks&&saved?.unlocked?saved:fresh();}catch{state=fresh();}
let tab='build',selection=null,direction=0,factoryRecipe='lava',paused=false,speed=1,zoom=1,hover=null,erase=false;const canvas=$('#game'),ctx=canvas.getContext('2d');let cell=49,ox=0,oy=0,W=0,H=0;const COLS=12,ROWS=9;
const sideView=createSideViewRenderer(ctx,sprites);
function viewport(){return {ox,oy,cell,cols:COLS,rows:ROWS,width:W,height:H};}
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('show'),3000)}
function shop(){document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));$('#discovered').textContent=`${state.unlocked.length}/${Object.keys(elements).length}`;if(tab==='elements'){$('#shop-content').innerHTML='<div class="shop-label">YOUR ELEMENT COLLECTION</div>'+Object.entries(elements).map(([id,e])=>`<div class="element-entry"><span class="icon" style="background:${e.bg};color:${e.color}">${iconMarkup(id)}</span><div><b>${e.name}</b><small>${state.unlocked.includes(id)?`◈ ${e.value} per element · ${e.interval}s production`:'Locked · Build its factory to unlock'}</small></div></div>`).join('');return;}
function item(type,el,name,icon,bg,color,desc){const cost=price(type,el);const selected=selection?.type===type&&selection?.el===el;return `<button class="shop-item ${selected?'selected':''}" data-type="${type}" data-el="${el||''}" ${type==='producer'&&!state.unlocked.includes(el)?'disabled':''}><span class="icon" style="background:${bg};color:${color}">${iconMarkup(type==='producer'?el:type)}</span><span class="item-text"><b>${name}</b><small>${desc}</small></span><span class="price">◈ ${cost}</span></button>`;}
$('#shop-content').innerHTML='<div class="shop-label">PRODUCTION</div><div class="production-list" aria-label="Unlocked producers">'+Object.entries(elements).filter(([id])=>state.unlocked.includes(id)||id==='lava').map(([id,e])=>item('producer',id,e.name+' producer',e.icon,e.bg,e.color,`1 ${e.name.toLowerCase()} every ${e.interval}s`)).join('')+'</div><div class="shop-divider"></div><div class="shop-label">COMBINE & CONNECT</div>'+item('factory',factoryRecipe,'Factory','▥','#e4e8d9','#6b8055','Two elements. Something new.')+`<select class="factory-choice" id="factory-recipe" aria-label="Factory recipe">${Object.entries(recipes).map(([id,inputs])=>`<option value="${id}" ${factoryRecipe===id?'selected':''}>${inputs.map(i=>elements[i].name).join(' + ')} → ${elements[id].name}</option>`).join('')}</select>`+item('belt',null,'Conveyor belt','⇢','#e7e9e2','#78826e','Belts across. Lifts between levels.')+item('seller',null,'Selling block','◈','#f1e8c9','#ab9351','Turn any element into money');
$('#shop-content').querySelectorAll('.shop-item').forEach(b=>b.onclick=()=>{erase=false;selection={type:b.dataset.type,el:b.dataset.el||null};shop();updateHint()});$('#factory-recipe').onchange=e=>{factoryRecipe=e.target.value;if(selection?.type==='factory')selection.el=factoryRecipe;shop();updateHint()};}
function updateHint(){const name=erase?'Remove blocks':selection?(selection.type==='producer'?elements[selection.el].name+' producer':selection.type==='factory'?elements[selection.el].name+' factory':selection.type==='belt'?'Conveyor belt':'Selling block'):null;$('#selection-text').innerHTML=name?`<i class="key">↖</i> ${name} · ${erase?'50% refund':`output ${['right','down','left','up'][direction]}`}`:'<i class="key">↖</i> Select a block to start building';$('#placement-hint').textContent=erase?'Click a block to remove it':selection?(selection.type==='belt'?'Drag to connect belts · Corners turn automatically':'Click an empty tile to place · R to rotate'):'Build up. Connect across. Keep growing.';canvas.style.cursor=selection||erase?'crosshair':'default';}
function stats(){$('#money').textContent=Math.floor(state.money).toLocaleString();$('#sold-count').textContent=state.sold.toLocaleString();$('#total-earned').textContent=state.earned.toLocaleString();$('#block-count').textContent=Object.keys(state.blocks).length;$('#rate').textContent=Math.round(state.earned/Math.max(state.clock,1)*60).toLocaleString();}
function resize(){const r=canvas.parentElement.getBoundingClientRect();W=r.width;H=r.height;canvas.width=W*devicePixelRatio;canvas.height=H*devicePixelRatio;ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);cell=Math.min((W-55)/COLS,(H-100)/ROWS)*zoom;ox=(W-COLS*cell)/2;oy=(H-ROWS*cell)/2+8;}
function rounded(x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();}}

function drawBlock(b,ghost=false){sideView.drawBlock(state,b,viewport(),ghost);}
function draw(){
  ctx.clearRect(0,0,W,H);
  sideView.drawBackdrop(viewport(),!!selection||erase);
  Object.values(state.blocks).filter(b=>b.type==='belt').forEach(b=>drawBlock(b));
  Object.values(state.blocks).filter(b=>b.type!=='belt').forEach(b=>drawBlock(b));
  for(const particle of state.particles)sideView.drawCargo(particle,viewport());

if(hover&&hover.x>=0&&hover.x<COLS&&hover.y>=0&&hover.y<ROWS){const b=state.blocks[key(hover.x,hover.y)];if(selection&&!b)drawBlock({...hover,...selection,dir:direction},true);ctx.strokeStyle=erase?'#c98568':'#8a9d73';ctx.lineWidth=2;ctx.strokeRect(ox+hover.x*cell+1,oy+hover.y*cell+1,cell-3,cell-3);if(b){const desc=b.type==='factory'?`${elements[b.el].name} · ${recipes[b.el].map(e=>`${elements[e].name}: ${b.stock[e]||0}`).join(' / ')}`:b.type==='producer'?`${elements[b.el].name} · every ${elements[b.el].interval}s`:b.type==='seller'?'Sells every element':(b.dir%2?'Lift · ':'Conveyor · ')+['right','down','left','up'][b.dir];ctx.font='10px sans-serif';const width=ctx.measureText(desc).width+22;const tx=Math.max(4,Math.min(W-width-4,ox+hover.x*cell));const ty=Math.max(48,oy+hover.y*cell-31);rounded(tx,ty,width,24,5,'#fbfaf3','#d4dac5');ctx.fillStyle='#637454';ctx.textAlign='left';ctx.fillText(desc,tx+11,ty+16);}}}
let beltStroke=null;
function trackPointer(e){
  const r=canvas.getBoundingClientRect();
  hover={x:Math.floor((e.clientX-r.left-ox)/cell),y:Math.floor((e.clientY-r.top-oy)/cell)};
}
function inBounds(tile){return tile&&tile.x>=0&&tile.y>=0&&tile.x<COLS&&tile.y<ROWS;}
canvas.onpointermove=e=>{
  trackPointer(e);
  if(!beltStroke||selection?.type!=='belt'||!inBounds(hover))return;
  while(beltStroke.x!==hover.x||beltStroke.y!==hover.y){
    const next={...beltStroke};
    if(next.x!==hover.x)next.x+=Math.sign(hover.x-next.x);
    else next.y+=Math.sign(hover.y-next.y);
    const result=extendConveyor(state,beltStroke,next);
    if(result.error){toast(result.error);beltStroke=null;break;}
    direction=result.direction;beltStroke=next;
    if(result.joinedExisting){beltStroke=null;break;}
  }
  stats();updateHint();save();
};
canvas.onpointerleave=()=>{if(!beltStroke)hover=null};
function finishStroke(e){beltStroke=null;if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);save();}
canvas.onpointerup=finishStroke;canvas.onpointercancel=finishStroke;
canvas.onpointerdown=e=>{
  trackPointer(e);
  if(!inBounds(hover))return;
  const {x,y}=hover,b=state.blocks[key(x,y)];
  if(erase||e.button===2){if(remove(state,x,y)){toast('Block removed. 50% refunded.');stats();save();}return;}
  if(selection){
    const err=place(state,x,y,selection.type,selection.el,direction);
    if(err)toast(err);
    else{
      if(selection.type==='belt'){beltStroke={x,y};canvas.setPointerCapture(e.pointerId);}
      if(selection.type==='factory'){toast(`${elements[selection.el].name} producer unlocked!`);shop();}
      stats();save();
    }
  }else if(b){direction=(b.dir+1)%4;b.dir=direction;toast('Output rotated '+['right','down','left','up'][direction]);save();}
};
canvas.oncontextmenu=e=>e.preventDefault();
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;shop()});document.onkeydown=e=>{if(e.target.matches('select,input,button'))return;if(e.key.toLowerCase()==='r'){direction=(direction+1)%4;updateHint()}if(e.key==='Escape'){beltStroke=null;selection=null;erase=false;shop();updateHint()}if(e.key==='Backspace'||e.key==='Delete'){e.preventDefault();erase=!erase;selection=null;shop();updateHint()}if(e.code==='Space'){e.preventDefault();$('#pause').click()}};
$('#pause').onclick=()=>{paused=!paused;$('#pause').textContent=paused?'▶':'Ⅱ';$('#pause').title=paused?'Resume simulation':'Pause simulation'};$('#speed').onclick=()=>{speed=speed===1?2:speed===2?4:1;$('#speed').textContent=speed+'×'};$('#center').onclick=()=>{selection=null;erase=false;zoom=1;$('#zoom-label').textContent='100%';resize();shop();updateHint()};function setZoom(d){zoom=Math.max(.65,Math.min(1.35,zoom+d));$('#zoom-label').textContent=Math.round(zoom*100)+'%';resize()}$('#zoom-in').onclick=()=>setZoom(.1);$('#zoom-out').onclick=()=>setZoom(-.1);
const modal=$('#modal');$('#close-modal').onclick=()=>modal.close();modal.onclick=e=>{if(e.target===modal)modal.close()};$('#help').onclick=()=>{$('#modal-content').innerHTML='<div class="eyebrow">WELCOME TO THE ELEMENT FACTORY</div><h2>Make a little. Make more.</h2><p>Your factory is shown from the side. Horizontal conveyors carry elements across each level; vertical conveyors act as lifts between levels. Your starter line combines Earth + Fire into Lava, then sells it. You have ◈ 850 to expand.</p><ol><li>Choose a producer or building, then click an empty tile. Blocks output in the arrow direction.</li><li>Select Conveyor belt and drag across empty tiles to draw a connected path. Corners turn automatically, and neighboring belts join visually. Belts merge incoming elements into their arrow direction. End paths beside producers, factories, or selling blocks. Press <b>R</b> to rotate before placing, or click an existing block with nothing selected to rotate it.</li><li>Choose a recipe below Factory before placing it. Feed both ingredients into adjacent sides; its output follows its arrow.</li><li>Building a factory unlocks a producer for that element. Advanced producers cost more and drop less often.</li><li>Generic selling blocks accept every element. Press Backspace for removal mode (50% refund), Escape to deselect, or Space to pause.</li></ol><p>Your factory saves automatically in this browser. Keep experimenting — there’s no finish line.</p>';modal.showModal()};
$('#recipes-button').onclick=()=>{$('#modal-content').innerHTML='<div class="eyebrow">THE DISCOVERY NOTEBOOK</div><h2>Something new, from two.</h2><p>24 elements. 20 combinations. Every factory costs ◈ 150 and unlocks its producer. Follow the ingredients to grow your production chain.</p>'+Object.entries(recipes).map(([el,inputs])=>`<div class="recipe-row"><span>${inputs.map(i=>`<span class="recipe-ingredient">${iconMarkup(i)} ${elements[i].name}</span>`).join(' + ')} → <b>${elements[el].name}</b><br><small>Sell for ◈ ${elements[el].value} · Producer ◈ ${elements[el].cost}</small></span><button data-recipe="${el}">Build ↗</button></div>`).join('');modal.querySelectorAll('[data-recipe]').forEach(b=>b.onclick=()=>{factoryRecipe=b.dataset.recipe;selection={type:'factory',el:factoryRecipe};erase=false;tab='build';shop();updateHint();modal.close()});modal.showModal()};$('#reset').onclick=()=>{$('#modal-content').innerHTML='<h2>A fresh beginning?</h2><p>This will reset your factory, discoveries, and earnings to the starter layout.</p><button id="confirm-reset" class="factory-choice">Reset factory</button>';$('#confirm-reset').onclick=()=>{state=fresh();selection=null;erase=false;shop();stats();updateHint();save();modal.close();toast('A new factory. Endless possibilities.')};modal.showModal()};
function save(){try{localStorage.setItem('jagace-v1',JSON.stringify(state))}catch{toast('Browser storage unavailable. Keep this tab open to retain progress.')}}window.addEventListener('beforeunload',save);setInterval(save,4000);let last=performance.now(),ui=0;function frame(now){let dt=Math.min((now-last)/1000,.1);last=now;if(!paused){let remaining=dt*speed;while(remaining>0){const step=Math.min(remaining,.05);tick(state,step);remaining-=step;}}ui+=dt;if(ui>.25){stats();ui=0;}draw();requestAnimationFrame(frame)}new ResizeObserver(resize).observe(canvas.parentElement);document.querySelectorAll('.recipe-example .element').forEach(node=>{const el=['earth','fire','lava'].find(id=>node.classList.contains(id));if(el)node.innerHTML=iconMarkup(el)});
shop();stats();updateHint();resize();requestAnimationFrame(frame);
