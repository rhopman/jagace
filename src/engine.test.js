import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,tick,place,remove,key,price,elements,recipes,STARTING_MONEY,DISCOVERY_BATCHES,factoryDuration,prepareState,factoryRecipe} from './engine.js';

test('starter line earns money and discovers lava without requiring another purchase',()=>{
  const s=fresh();assert.equal(s.money,500);assert.ok(!s.unlocked.includes('lava'));
  for(let i=0;i<1200;i++)tick(s,.05);
  assert.ok(s.sold>=8,`Only ${s.sold} sold`);
  assert.equal(s.earned,s.sold*elements.lava.value);assert.equal(s.money,STARTING_MONEY+s.earned);
  assert.ok(s.unlocked.includes('lava'));assert.ok(s.crafted.lava>=DISCOVERY_BATCHES);
});

test('generic factories discover combinations from stock and unlock producers after three batches',()=>{
  const s=fresh();s.blocks={};s.money=2000;
  assert.equal(place(s,1,1,'factory'),null);
  assert.equal(s.blocks[key(1,1)].el,null);
  assert.ok(!s.unlocked.includes('glass'));
  assert.match(place(s,2,1,'producer','glass'),/Craft 3/);
  const b=s.blocks[key(1,1)];b.stock={dust:2,fire:2};
  tick(s,factoryDuration('glass'));tick(s,factoryDuration('glass'));
  assert.equal(s.crafted.glass,2);assert.ok(!s.unlocked.includes('glass'));
  tick(s,10);assert.equal(s.crafted.glass,2); // Empty inventories cannot discover anything.
  b.stock={dust:1,fire:1};tick(s,factoryDuration('glass'));
  assert.equal(s.crafted.glass,3);assert.ok(s.unlocked.includes('glass'));
  s.money=1500;assert.equal(place(s,2,1,'producer','glass'),null);assert.equal(s.money,500);
  assert.match(place(s,2,1,'belt'),/occupied/);
});

test('generic factories have a fixed price while advanced combinations take longer',()=>{
  assert.equal(price('factory','lava'),180);
  assert.equal(price('factory','steel'),price('factory','glass'));
  assert.ok(factoryDuration('steel')>factoryDuration('lava'));
});

test('one factory can discover different combinations and retain unmatched ingredients',()=>{
  const s=fresh();s.blocks={};s.particles=[];s.money=1000;
  place(s,0,0,'factory');place(s,1,0,'seller');
  const b=s.blocks[key(0,0)];b.stock={earth:1,fire:1,gold:1};
  tick(s,2);assert.equal(s.crafted.lava,1);assert.equal(b.stock.gold,1);
  b.stock.water=1;b.stock.wind=1;
  tick(s,2);assert.equal(s.crafted.ice,1);assert.equal(b.stock.gold,1);
  tick(s,10);assert.equal(s.crafted.lava,1);assert.equal(s.crafted.ice,1);
});

test('generic factories accept arbitrary inputs up to their storage limit',()=>{
  const s=fresh();s.blocks={};s.particles=[];
  place(s,0,0,'factory');
  s.particles=[{x:-1,y:0,el:'gold',dir:0,progress:0}];
  tick(s,1);assert.equal(s.blocks[key(0,0)].stock.gold,1);assert.equal(s.particles.length,0);
  s.blocks[key(0,0)].stock.gold=20;
  s.particles=[{x:-1,y:0,el:'gold',dir:0,progress:0}];
  tick(s,1);assert.equal(s.blocks[key(0,0)].stock.gold,20);assert.equal(s.particles.length,1);
});

test('generic seller accepts basic elements and removal refunds the actual purchase price',()=>{
  const s=fresh();s.blocks={};s.particles=[];
  place(s,0,0,'producer','water');place(s,1,0,'seller');
  for(let i=0;i<200;i++)tick(s,.05);
  assert.ok(s.sold>=2);assert.equal(s.earned,s.sold*4);
  const cash=s.money;assert.ok(remove(s,0,0));assert.equal(s.money,cash+price('producer','water')/2);
  s.unlocked.push('metal','coal');s.money=5000;
  const before=s.money;place(s,3,3,'factory','steel');remove(s,3,3);
  assert.equal(s.money,before-Math.ceil(price('factory','steel')*.5));
});

test('legacy saves keep existing unlocks and balances without gaining inflated factory refunds',()=>{
  const s={...fresh(),money:1234,unlocked:['earth','wind','fire','water','glass'],blocks:{'0,0':{x:0,y:0,type:'factory',el:'glass',dir:0,timer:0,stock:{}}}};
  delete s.crafted;prepareState(s);assert.deepEqual(s.crafted,{});
  assert.equal(s.money,1234);assert.ok(s.unlocked.includes('glass'));
  remove(s,0,0);assert.equal(s.money,1234+75);
});

test('blocked conveyors retain elements and resume after connection',()=>{
  const s=fresh();s.blocks={};s.particles=[];
  place(s,0,0,'producer','earth');place(s,1,0,'belt');
  for(let i=0;i<200;i++)tick(s,.05);
  assert.equal(s.sold,0);assert.ok(s.particles.length>0);
  place(s,2,0,'seller');for(let i=0;i<200;i++)tick(s,.05);assert.ok(s.sold>0);
});

test('every advanced element remains reachable from the four starting elements',()=>{
  const reachable=new Set(['earth','wind','fire','water']);let changed=true;
  while(changed){changed=false;for(const [output,inputs] of Object.entries(recipes))if(!reachable.has(output)&&inputs.every(input=>reachable.has(input))){reachable.add(output);changed=true;}}
  assert.deepEqual([...reachable].sort(),Object.keys(elements).sort());
});

for(const [output,inputs] of Object.entries(recipes)){
  if(inputs.length===3)test(`${output}: waits for the third ingredient and consumes exactly one of each`,()=>{
    const s=fresh();s.blocks={};s.particles=[];
    place(s,0,0,'factory');const b=s.blocks[key(0,0)];
    b.stock={[inputs[0]]:2,[inputs[1]]:2};
    tick(s,20);assert.equal(s.particles.length,0);assert.deepEqual(s.crafted,{});
    b.stock[inputs[2]]=1;
    tick(s,.05);assert.equal(s.particles.length,1);assert.equal(s.particles[0].el,output);
    assert.equal(b.stock[inputs[0]],1);assert.equal(b.stock[inputs[1]],1);assert.equal(b.stock[inputs[2]],0);
    tick(s,20);assert.equal(s.crafted[output],1);
  });
  test(`${output}: process ingredients, discover after batches, sell output, and buy its producer`,()=>{
    const s=fresh();s.money=100000;s.blocks={};s.particles=[];
    s.unlocked=[...new Set(['earth','wind','fire','water',...inputs])];
    assert.equal(place(s,5,3,'factory',output),null);assert.ok(!s.unlocked.includes(output));
    assert.match(place(s,0,0,'producer',output),/Craft/);
    place(s,3,3,'producer',inputs[0],0);place(s,4,3,'belt',null,0);
    place(s,5,5,'producer',inputs[1],3);place(s,5,4,'belt',null,3);place(s,6,3,'seller');
    if(inputs.length===3){place(s,5,1,'producer',inputs[2],1);place(s,5,2,'belt',null,1);}
    for(let i=0;i<1600;i++)tick(s,.05);
    assert.ok(s.sold>=3,`Expected sales of ${output}, got ${s.sold}`);
    assert.equal(s.earned,s.sold*elements[output].value);
    assert.ok(s.crafted[output]>=DISCOVERY_BATCHES);assert.ok(s.unlocked.includes(output));
    assert.equal(place(s,0,0,'producer',output),null);
    assert.ok(elements[output].value>Math.max(...inputs.map(id=>elements[id].value)));
    assert.ok(elements[output].cost>Math.max(...inputs.map(id=>elements[id].cost)));
  });
}

test('completed three-ingredient combinations take priority over available pairs',()=>{
  assert.equal(factoryRecipe({stock:{earth:1,clay:1,sand:1,fire:1}}),'brick');
});
