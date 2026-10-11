// Game alchemy uses recognizable substances rather than random fantasy names.
export function materialIdentity(inputs,elements,seed){
  const ids=new Set(inputs),has=(...names)=>names.every(name=>ids.has(name));
  const direct=[
    [['wood','water'],'Paper','paper'],[['plant','water'],'Algae','plant'],
    [['metal','water'],'Rust','clay'],[['sand','fire'],'Silica','glass'],
    [['water','energy'],'Hydrogen','steam'],[['coal','water'],'Oil','water'],
    [['gold','ice'],'Gold flakes','gold'],[['gold','coal','ice'],'Gold ore','metal'],
    [['clay','fire'],'Pottery','clay'],[['wood','wind'],'Sawdust','dust'],
    [['sand','water'],'Wet sand','sand'],[['plant','fire'],'Ash','dust'],
    [['stone','wind'],'Gravel','stone'],[['glass','water'],'Sea glass','glass'],
  ];
  for(const [recipe,name,artId]of direct)if(recipe.length===inputs.length&&has(...recipe))return {name,artId,families:inputs.flatMap(id=>elements[id].families||[id])};
  const family=[...new Set(inputs.flatMap(id=>elements[id].families||[id]))];
  const contains=(...names)=>names.some(name=>family.includes(name));
  let names,artId;
  if(contains('metal','steel','gold','alloy','battery','magnet','robot')){
    names=['Copper','Bronze','Brass','Iron','Tin','Aluminium','Nickel','Zinc','Silver','Platinum','Titanium','Chromium'];artId='metal';
  }else if(contains('plant','wood','life','moss','fertilizer')){
    names=['Resin','Rubber','Cork','Cotton','Linen','Cellulose','Starch','Sugar','Wax','Compost','Peat','Sap'];artId='plant';
  }else if(contains('water','ice','steam','cloud','rain','smoke','storm')){
    names=['Salt','Brine','Foam','Oxygen','Nitrogen','Carbon dioxide','Sulfur','Chalk','Limestone','Gypsum','Soap','Alcohol'];artId='water';
  }else{
    names=['Quartz','Granite','Marble','Slate','Flint','Basalt','Porcelain','Ceramic','Terracotta','Sandstone','Mica','Pumice'];artId='stone';
  }
  const used=new Set(Object.values(elements).map(e=>e.name));
  for(let i=0;i<names.length;i++){const name=names[(seed+i)%names.length];if(!used.has(name))return {name,artId,families:family};}
  const ingredient=elements[inputs.find(id=>!elements[id].generated)||inputs[0]].name;
  return {name:ingredient+' '+(artId==='metal'?'composite':artId==='plant'?'fiber':artId==='water'?'solution':'aggregate'),artId,families:family};
}
