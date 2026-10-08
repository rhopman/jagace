import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,tick,place,remove,key,price,elements,recipes} from './engine.js';
test('starter line transports both ingredients, produces lava and sells it',()=>{let s=fresh();for(let i=0;i<1200;i++)tick(s,.05);assert.ok(s.sold>=8,`Only ${s.sold} sold`);assert.equal(s.earned,s.sold*elements.lava.value);assert.equal(s.money,850+s.earned);assert.ok(s.blocks[key(5,3)].stock.earth>=0)});
test('advanced producers require their factory and purchase deducts exact cost',()=>{let s=fresh();assert.match(place(s,1,1,'producer','glass'),/factory/);assert.equal(place(s,1,1,'factory','glass'),null);assert.ok(s.unlocked.includes('glass'));s.money=1500;assert.equal(place(s,2,1,'producer','glass'),null);assert.equal(s.money,500);assert.match(place(s,2,1,'belt'),/occupied/)});
test('generic seller accepts a basic element and block removal refunds half',()=>{let s=fresh();s.blocks={};s.particles=[];place(s,0,0,'producer','water');place(s,1,0,'seller');for(let i=0;i<200;i++)tick(s,.05);assert.ok(s.sold>=2);assert.equal(s.earned,s.sold*4);let cash=s.money;assert.ok(remove(s,0,0));assert.equal(s.money,cash+price('producer','water')/2)});
test('blocked conveyor retains elements and can resume after connection',()=>{let s=fresh();s.blocks={};s.particles=[];place(s,0,0,'producer','earth');place(s,1,0,'belt');for(let i=0;i<200;i++)tick(s,.05);assert.equal(s.sold,0);assert.ok(s.particles.length>0);place(s,2,0,'seller');for(let i=0;i<200;i++)tick(s,.05);assert.ok(s.sold>0)});


test('all advanced elements are reachable from the four starting elements',()=>{
  const reachable=new Set(['earth','wind','fire','water']);
  let changed=true;
  while(changed){
    changed=false;
    for(const [output,inputs] of Object.entries(recipes)){
      if(!reachable.has(output)&&inputs.every(input=>reachable.has(input))){reachable.add(output);changed=true;}
    }
  }
  assert.deepEqual([...reachable].sort(),Object.keys(elements).sort());
});

for(const [output,inputs] of Object.entries(recipes)){
  test(`${output}: combine both ingredients, sell output, and unlock its producer`,()=>{
    const s=fresh();s.money=100000;s.blocks={};s.particles=[];s.unlocked=['earth','wind','fire','water'];
    assert.equal(place(s,5,3,'factory',output),null);
    assert.ok(s.unlocked.includes(output));
    assert.equal(place(s,0,0,'producer',output),null);
    remove(s,0,0);
    for(const [i,input] of inputs.entries()){
      if(!s.unlocked.includes(input))assert.equal(place(s,10,i,'factory',input),null);
    }
    assert.equal(place(s,3,3,'producer',inputs[0],0),null);
    assert.equal(place(s,4,3,'belt',null,0),null);
    assert.equal(place(s,5,5,'producer',inputs[1],3),null);
    assert.equal(place(s,5,4,'belt',null,3),null);
    assert.equal(place(s,6,3,'seller'),null);
    for(let i=0;i<1600;i++)tick(s,.05);
    assert.ok(s.sold>=3,`Expected sales of ${output}, got ${s.sold}`);
    assert.equal(s.earned,s.sold*elements[output].value);
    assert.ok(elements[output].value>Math.max(...inputs.map(id=>elements[id].value)));
    assert.ok(elements[output].cost>Math.max(...inputs.map(id=>elements[id].cost)));
  });
}
