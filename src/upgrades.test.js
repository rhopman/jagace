import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,place,key,tick,remove,upgradeProducer,upgradeCost,producerLevel,productionInterval,MAX_PRODUCER_LEVEL,prepareState} from './engine.js';

function line(){const s=fresh();s.blocks={};s.particles=[];place(s,0,0,'producer','earth');place(s,1,0,'seller');return s;}

test('upgrade deducts its cost, increases speed by 25%, and preserves batch progress',()=>{
  const s=line(),b=s.blocks[key(0,0)];b.timer=1.5;
  const before=s.money,cost=upgradeCost(b),interval=productionInterval(b);
  assert.equal(upgradeProducer(s,0,0),null);assert.equal(s.money,before-cost);
  assert.equal(producerLevel(b),2);assert.equal(productionInterval(b),interval/1.25);
  assert.equal(b.timer/productionInterval(b),.5);assert.equal(b.upgradeSpent,cost);
  assert.ok(upgradeCost(b)>cost);
});

test('upgraded producers deliver more real elements to the seller in the same simulated time',()=>{
  const base=line(),faster=line();upgradeProducer(faster,0,0);
  for(let i=0;i<2400;i++){tick(base,.01);tick(faster,.01);}
  assert.ok(faster.sold>base.sold,`${faster.sold} upgraded vs ${base.sold} base`);
  assert.equal(faster.earned,faster.sold*3);
});

test('failed upgrades leave balance, level, and current progress unchanged',()=>{
  const s=line(),b=s.blocks[key(0,0)];s.money=0;b.timer=1;
  const before=JSON.stringify(s);assert.match(upgradeProducer(s,0,0),/money/);
  assert.equal(JSON.stringify(s),before);assert.match(upgradeProducer(s,1,0),/producer/);
});

test('upgrades cap at level six and removal refunds half of the actual investment',()=>{
  const s=line(),b=s.blocks[key(0,0)];s.money=100000;let spent=0;
  while(producerLevel(b)<MAX_PRODUCER_LEVEL){spent+=upgradeCost(b);assert.equal(upgradeProducer(s,0,0),null);}
  assert.equal(producerLevel(b),6);assert.equal(upgradeCost(b),null);
  const cash=s.money;assert.match(upgradeProducer(s,0,0),/maximum/);assert.equal(s.money,cash);
  remove(s,0,0);assert.equal(s.money,cash+Math.floor((60+spent)/2));
});

test('legacy producers start at level one and upgraded producers survive save restoration',()=>{
  const s=line(),b=s.blocks[key(0,0)];delete b.level;delete b.paid;
  prepareState(s);assert.equal(producerLevel(b),1);assert.equal(productionInterval(b),3);
  upgradeProducer(s,0,0);const restored=prepareState(JSON.parse(JSON.stringify(s)));
  assert.equal(producerLevel(restored.blocks[key(0,0)]),2);
  assert.equal(productionInterval(restored.blocks[key(0,0)]),2.4);
  const cash=restored.money;remove(restored,0,0);assert.equal(restored.money,cash+55);
});
