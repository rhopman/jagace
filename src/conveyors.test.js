import test from 'node:test';
import assert from 'node:assert/strict';
import { fresh, place, key, tick, remove } from './engine.js';
import { conveyorConnections, extendConveyor } from './conveyors.js';

function empty(){const s=fresh();s.blocks={};s.money=1000;return s;}

test('straight belts connect to the producer, each other, and seller',()=>{
  const s=empty();place(s,0,0,'producer','earth');place(s,1,0,'belt');place(s,2,0,'belt');place(s,3,0,'seller');
  assert.deepEqual(conveyorConnections(s,s.blocks[key(1,0)]),{inputs:[2],output:0,outputConnected:true});
  assert.deepEqual(conveyorConnections(s,s.blocks[key(2,0)]),{inputs:[2],output:0,outputConnected:true});
  remove(s,2,0);
  assert.equal(conveyorConnections(s,s.blocks[key(1,0)]).outputConnected,false);
});

test('dragged path turns corners and transports elements all the way to the seller',()=>{
  const s=empty();place(s,0,0,'producer','earth');place(s,1,0,'belt');
  const path=[{x:1,y:0},{x:2,y:0},{x:2,y:1},{x:2,y:2},{x:3,y:2}];
  for(let i=1;i<path.length;i++)assert.equal(extendConveyor(s,path[i-1],path[i]).error,undefined);
  place(s,4,2,'seller');
  assert.equal(s.blocks[key(2,0)].dir,1);
  assert.deepEqual(conveyorConnections(s,s.blocks[key(2,0)]).inputs,[2]);
  assert.deepEqual(conveyorConnections(s,s.blocks[key(2,2)]).inputs,[3]);
  for(let i=0;i<1000;i++)tick(s,.05);
  assert.ok(s.sold>=8);assert.equal(s.earned,s.sold*3);
});

test('merges accept incoming belts on two sides and route both elements to one output',()=>{
  const s=empty();place(s,0,1,'producer','earth');place(s,1,1,'belt');place(s,2,3,'producer','water',3);place(s,2,2,'belt',null,3);place(s,2,1,'belt');place(s,3,1,'seller');
  assert.deepEqual(conveyorConnections(s,s.blocks[key(2,1)]).inputs,[1,2]);
  for(let i=0;i<1000;i++)tick(s,.05);
  assert.ok(s.sold>12);assert.ok(s.earned>s.sold*3);
});

test('drag connects an existing seller without purchasing or overwriting it',()=>{
  const s=empty();place(s,0,0,'belt',null,1);place(s,1,0,'seller');const before=s.money;
  assert.equal(extendConveyor(s,{x:0,y:0},{x:1,y:0}).joinedExisting,true);
  assert.equal(s.money,before);assert.equal(s.blocks[key(1,0)].type,'seller');assert.equal(s.blocks[key(0,0)].dir,0);
});

test('failed purchases and obstacles leave the preceding belt direction intact',()=>{
  const s=empty();place(s,1,1,'belt',null,3);s.money=0;
  assert.match(extendConveyor(s,{x:1,y:1},{x:2,y:1}).error,/money/);
  assert.equal(s.blocks[key(1,1)].dir,3);assert.equal(s.blocks[key(2,1)],undefined);
  s.money=100;place(s,2,1,'producer','earth');
  assert.match(extendConveyor(s,{x:1,y:1},{x:2,y:1}).error,/producer/);
  assert.equal(s.blocks[key(1,1)].dir,3);
});
