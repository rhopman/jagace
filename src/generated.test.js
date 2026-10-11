import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,place,tick,key,elements,recipes,prepareState,createCombination} from './engine.js';
const state=()=>({...fresh(),blocks:{},particles:[],money:100000});

test('unknown combinations craft, sell, unlock producers, and reuse the same discovery',()=>{
  const s=state();place(s,2,2,'factory');place(s,3,2,'seller');
  const b=s.blocks[key(2,2)];b.inputCount=2;b.stock={gold:3,ice:3};
  for(let i=0;i<800;i++)tick(s,.05);
  const [id]=Object.keys(s.generated);
  assert.ok(elements[id].generated);assert.equal(s.crafted[id],3);assert.equal(s.sold,3);
  assert.equal(s.earned,3*elements[id].value);assert.ok(s.unlocked.includes(id));
  assert.equal(place(s,0,0,'producer',id),null);
  assert.equal(createCombination(s,['ice','gold']),id);
});
test('unknown triple waits for all inputs and creates a three-ingredient recipe',()=>{
  const s=state();place(s,2,2,'factory');const b=s.blocks[key(2,2)];b.inputCount=3;b.stock={gold:1,ice:1};
  tick(s,20);assert.equal(s.generated,undefined);
  b.stock.coal=1;tick(s,20);
  const [id]=Object.keys(s.generated);assert.deepEqual(recipes[id],['coal','gold','ice']);assert.equal(s.crafted[id],1);
});
test('generated elements support continuing discoveries and restore from a save',()=>{
  const s=state();let last='water';
  for(let i=0;i<60;i++)last=createCombination(s,[last,'gold']);
  assert.equal(Object.keys(s.generated).length,60);
  const saved=JSON.parse(JSON.stringify(s)),entry=s.generated[last];
  delete elements[last];delete recipes[last];prepareState(saved);
  assert.deepEqual(elements[last],entry.element);assert.deepEqual(recipes[last],entry.inputs);
  assert.equal(createCombination(saved,entry.inputs),last);
});
test('existing recipes keep their original output',()=>{
  assert.equal(createCombination(state(),['fire','earth']),'lava');
});
test('generated discoveries use recognizable ingredient-based materials without codes',()=>{
  const s=state();const id=createCombination(s,['wood','water']);
  assert.equal(elements[id].name,'Paper');assert.equal(elements[id].artId,'paper');
  const rust=createCombination(s,['metal','water']);assert.equal(elements[rust].name,'Rust');
});
test('legacy fantasy names are migrated without changing discoveries or balances',()=>{
  const s=state(),id=createCombination(s,['gold','ice']);
  const saved=JSON.parse(JSON.stringify(s)),value=saved.generated[id].element.value;
  saved.generated[id].element.name='Mossy Mist EWR7';delete saved.generated[id].element.namingVersion;
  saved.unlocked.push(id);saved.crafted[id]=3;prepareState(saved);
  assert.equal(elements[id].name,'Gold flakes');assert.equal(saved.generated[id].element.value,value);
  assert.equal(saved.money,100000);assert.equal(saved.crafted[id],3);assert.ok(saved.unlocked.includes(id));
});
