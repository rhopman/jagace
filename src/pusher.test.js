import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,place,tick,key,remove,prepareState,transportStep} from './engine.js';
const empty=()=>({...fresh(),blocks:{},particles:[],money:1000});
test('pusher shares a belt tile and only selected elements fall',()=>{
  const s=empty();place(s,2,2,'belt');place(s,2,2,'pusher');const b=s.blocks[key(2,2)];b.pusher.drop=['earth'];
  assert.equal(Object.keys(s.blocks).length,1);assert.equal(b.type,'belt');
  assert.equal(transportStep(s,{x:2,y:2,el:'earth'}).dir,1);
  assert.equal(transportStep(s,{x:2,y:2,el:'water'}).dir,0);
  place(s,3,2,'seller');place(s,2,6,'seller');
  s.particles=[{x:2,y:2,el:'earth',progress:0,dir:0},{x:2,y:2,el:'water',progress:0,dir:0}];
  for(let i=0;i<100;i++)tick(s,.05);
  assert.equal(s.sold,2);assert.equal(s.earned,7);
});
test('pusher needs a belt and funds; duplicate placement does not charge',()=>{
  const s=empty();assert.match(place(s,1,1,'pusher'),/existing conveyor/);
  place(s,1,1,'belt');s.money=0;assert.match(place(s,1,1,'pusher'),/money/);assert.equal(s.blocks[key(1,1)].pusher,undefined);
  s.money=200;assert.equal(place(s,1,1,'pusher'),null);const before=s.money;
  assert.match(place(s,1,1,'pusher'),/already/);assert.equal(s.money,before);
});
test('saved filters survive reload and removing a pusher preserves its belt',()=>{
  const s=empty();place(s,1,1,'belt');place(s,1,1,'pusher');s.blocks[key(1,1)].pusher.drop=['water'];
  const restored=prepareState(JSON.parse(JSON.stringify(s)));assert.deepEqual(restored.blocks[key(1,1)].pusher.drop,['water']);
  const before=restored.money;remove(restored,1,1);assert.equal(restored.money,before+37);assert.equal(restored.blocks[key(1,1)].type,'belt');
});
