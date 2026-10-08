export const elements={earth:{name:'Earth',icon:'◆',color:'#a38c57',bg:'#e9dfc8',value:3,cost:60,interval:3},wind:{name:'Wind',icon:'≋',color:'#80a49a',bg:'#e0e9e5',value:3,cost:60,interval:3},fire:{name:'Fire',icon:'♨',color:'#d58e59',bg:'#f6e1ce',value:4,cost:80,interval:4},water:{name:'Water',icon:'◕',color:'#719bb1',bg:'#dce8ed',value:4,cost:80,interval:4},lava:{name:'Lava',icon:'◒',color:'#d47b42',bg:'#f2d2b9',value:18,cost:220,interval:5},steam:{name:'Steam',icon:'♧',color:'#9aaba0',bg:'#e2e9df',value:20,cost:250,interval:5},dust:{name:'Dust',icon:'✧',color:'#b8a678',bg:'#eee6d1',value:14,cost:180,interval:4},clay:{name:'Clay',icon:'▰',color:'#b98a77',bg:'#efddd2',value:16,cost:200,interval:5},stone:{name:'Stone',icon:'⬟',color:'#8c9280',bg:'#e0e2d6',value:45,cost:550,interval:7},glass:{name:'Glass',icon:'◇',color:'#7ba6a8',bg:'#dfefea',value:90,cost:1000,interval:9}};
Object.assign(elements, {
  sand: {name:'Sand',icon:'⌁',color:'#c3a161',bg:'#f0e5c9',value:24,cost:300,interval:5},
  mud: {name:'Mud',icon:'●',color:'#94704e',bg:'#e6dccb',value:26,cost:320,interval:5},
  ice: {name:'Ice',icon:'❄',color:'#6aafc5',bg:'#dfedf2',value:22,cost:280,interval:5},
  cloud: {name:'Cloud',icon:'☁',color:'#93aaa0',bg:'#e5ece2',value:40,cost:480,interval:6},
  rain: {name:'Rain',icon:'☂',color:'#659ab5',bg:'#dfeaf0',value:65,cost:780,interval:7},
  plant: {name:'Plant',icon:'♧',color:'#79a357',bg:'#e4ecd5',value:105,cost:1300,interval:8},
  wood: {name:'Wood',icon:'▰',color:'#ac8655',bg:'#ede0c9',value:140,cost:1750,interval:9},
  coal: {name:'Coal',icon:'⬟',color:'#52615a',bg:'#dce2d9',value:190,cost:2400,interval:10},
  metal: {name:'Metal',icon:'▱',color:'#819bac',bg:'#dfe7ed',value:85,cost:1050,interval:8},
  steel: {name:'Steel',icon:'▰',color:'#607f95',bg:'#dae5eb',value:360,cost:4500,interval:12},
  crystal: {name:'Crystal',icon:'◇',color:'#a38bbb',bg:'#e9e0f1',value:210,cost:2650,interval:10},
  energy: {name:'Energy',icon:'ϟ',color:'#d5b34c',bg:'#f4edce',value:28,cost:350,interval:5},
  life: {name:'Life',icon:'♡',color:'#c18b80',bg:'#f1ded7',value:240,cost:3000,interval:11},
  gold: {name:'Gold',icon:'▱',color:'#c3a044',bg:'#f0e6c2',value:180,cost:2250,interval:10},
});
export const recipes={
  lava:['earth','fire'], steam:['water','fire'], dust:['earth','wind'],
  clay:['earth','water'], stone:['lava','water'], glass:['dust','fire'],
  sand:['earth','dust'], mud:['clay','water'], ice:['water','wind'],
  cloud:['steam','wind'], rain:['cloud','water'], plant:['earth','rain'],
  wood:['plant','earth'], coal:['wood','fire'], metal:['stone','fire'],
  steel:['metal','coal'], crystal:['glass','stone'], energy:['fire','wind'],
  life:['plant','energy'], gold:['metal','energy'],
};
export const STARTING_MONEY=500;
export const DISCOVERY_BATCHES=3;
const tiers={};
export function elementTier(el){
  if(tiers[el])return tiers[el];
  return tiers[el]=recipes[el]?1+Math.max(...recipes[el].map(elementTier)):0;
}
export function factoryDuration(el){return 2+.6*Math.max(0,elementTier(el)-1);}
export function missingIngredients(s,el){return (recipes[el]||[]).filter(input=>!s.unlocked.includes(input));}
export function prepareState(s){s.crafted??={};return s;}
export const dirs=[[1,0],[0,1],[-1,0],[0,-1]];
export const key=(x,y)=>`${x},${y}`;
export function fresh(){let s={money:STARTING_MONEY,earned:0,sold:0,crafted:{},unlocked:['earth','wind','fire','water'],blocks:{},particles:[],clock:0};const add=(x,y,type,el,dir=0)=>s.blocks[key(x,y)]={x,y,type,el,dir,timer:0,stock:{},paid:price(type,el)};add(2,3,'producer','earth');add(3,3,'belt');add(4,3,'belt');add(5,3,'factory','lava');add(5,6,'producer','fire',3);add(5,5,'belt',null,3);add(5,4,'belt',null,3);add(6,3,'belt');add(7,3,'belt');add(8,3,'seller');return s;}
export function price(type,el){return type==='producer'?elements[el].cost:type==='factory'?180+60*Math.max(0,elementTier(el)-1):type==='seller'?100:10;}
export function place(s,x,y,type,el,dir=0){if(s.blocks[key(x,y)])return 'This tile is already occupied.';if(type==='producer'&&!s.unlocked.includes(el))return `Craft ${DISCOVERY_BATCHES} batches in a factory to unlock this producer.`;if(type==='factory'&&missingIngredients(s,el).length)return 'Discover the recipe ingredients first.';const cost=price(type,el);if(s.money<cost)return 'Not enough money. Let your factory earn a little more.';s.money-=cost;s.blocks[key(x,y)]={x,y,type,el,dir,timer:0,stock:{},paid:cost};return null;}
export function remove(s,x,y){let b=s.blocks[key(x,y)];if(!b)return false;s.money+=Math.floor((b.paid??(b.type==='factory'?150:price(b.type,b.el)))*.5);delete s.blocks[key(x,y)];return true;}
function output(s,b,el){if(s.particles.filter(p=>p.x===b.x&&p.y===b.y).length>=4)return false;s.particles.push({x:b.x,y:b.y,fromX:b.x,fromY:b.y,el,progress:0,dir:b.dir});return true;}
export function tick(s,dt){prepareState(s);s.clock+=dt;for(const b of Object.values(s.blocks)){b.timer+=dt;if(b.type==='producer'&&b.timer>=elements[b.el].interval){if(output(s,b,b.el))b.timer=0;}if(b.type==='factory'&&b.timer>=factoryDuration(b.el)&&recipes[b.el].every(el=>(b.stock[el]||0)>0)){if(output(s,b,b.el)){recipes[b.el].forEach(el=>b.stock[el]--);b.timer=0;s.crafted[b.el]=(s.crafted[b.el]||0)+1;if(s.crafted[b.el]>=DISCOVERY_BATCHES&&!s.unlocked.includes(b.el))s.unlocked.push(b.el);}}}
const alive=[];for(const p of s.particles){p.progress+=dt*1.7;if(p.progress<1){alive.push(p);continue;}const b=s.blocks[key(p.x,p.y)];const dir=b?.dir??p.dir;const [dx,dy]=dirs[dir];const nx=p.x+dx,ny=p.y+dy;const dest=s.blocks[key(nx,ny)];if(dest?.type==='seller'){s.money+=elements[p.el].value;s.earned+=elements[p.el].value;s.sold++;continue;}if(dest?.type==='factory'&&recipes[dest.el].includes(p.el)&&(dest.stock[p.el]||0)<20){dest.stock[p.el]=(dest.stock[p.el]||0)+1;continue;}if(dest?.type==='belt'&&!s.particles.some(q=>q!==p&&q.x===nx&&q.y===ny)){p.fromX=p.x;p.fromY=p.y;p.x=nx;p.y=ny;p.dir=dest.dir;p.progress=0;}else p.progress=1;alive.push(p);}s.particles=alive;}
