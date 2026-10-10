import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,place,key,tick,prepareState} from './engine.js';
const empty=()=>({...fresh(),blocks:{},particles:[],money:1000});
const run=s=>{for(let i=0;i<600;i++)tick(s,.05);};

test('elements fall through open space onto a seller without vertical belts',()=>{
  const s=empty();place(s,2,0,'producer','earth',1);place(s,2,5,'seller');
  run(s);assert.ok(s.sold>=6);assert.equal(s.earned,s.sold*3);
});
test('fan blows elements upward through an empty column to a seller',()=>{
  const s=empty();place(s,1,6,'producer','earth');place(s,2,6,'fan');place(s,2,1,'seller');
  run(s);assert.ok(s.sold>=6);assert.equal(s.blocks[key(2,6)].dir,3);
});
test('falling elements land on a horizontal belt and continue to its seller',()=>{
  const s=empty();place(s,2,0,'producer','earth',1);place(s,2,4,'belt');place(s,3,4,'seller');
  run(s);assert.ok(s.sold>=6);
});
test('elements leaving a belt fall instead of hovering at its end',()=>{
  const s=empty();place(s,0,0,'producer','earth');place(s,1,0,'belt');place(s,2,4,'seller');
  run(s);assert.ok(s.sold>=6);
});
test('old upward lifts become fans and downward shafts become open air with a refund',()=>{
  const s=empty();delete s.transportVersion;s.blocks={'2,2':{x:2,y:2,type:'belt',dir:3,paid:10},'2,3':{x:2,y:3,type:'belt',dir:1,paid:10}};
  prepareState(s);assert.equal(s.blocks[key(2,2)].type,'fan');assert.equal(s.blocks[key(2,3)],undefined);assert.equal(s.money,1010);
  prepareState(s);assert.equal(s.money,1010);
});
