import { conveyorConnections, machineConnections, cargoPosition } from './conveyors.js';
import { elements, dirs,productionInterval,producerLevel } from './engine.js';

// Side elevation renderer: tile positions remain the logical transport grid.
export function createSideViewRenderer(ctx, sprites) {
  function box(x,y,w,h,fill,stroke,r=2) {
    ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();
    if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();}
  }
  function line(x1,y1,x2,y2,color,width=1) {
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();
  }
  function sprite(id,x,y,size) {
    const img=sprites[id];if(img?.complete&&img.naturalWidth)ctx.drawImage(img,x,y,size,size);
  }
  function arrow(x,y,dir,size,color) {
    ctx.save();ctx.translate(x,y);ctx.rotate(dir*Math.PI/2);
    line(-size,0,size,0,color,1.2);line(size-3,-3,size,0,color,1.2);line(size-3,3,size,0,color,1.2);ctx.restore();
  }
  const alloy='#626b68',edge='#a2aba3',cyan='#93aa76';
  function glowLine(x1,y1,x2,y2,width=1){
    ctx.save();
    line(x1,y1,x2,y2,cyan,width);ctx.restore();
  }
  function repulsor(cx,y,c,time,spread=.14){
    box(cx-c*.07,y-c*.035,c*.14,c*.055,'#737c75','#aab4aa',1);
    line(cx-c*.045,y+c*.035,cx+c*.045,y+c*.035,'#a6bd9988',1);
    ctx.beginPath();ctx.ellipse(cx,y+c*.09,c*spread*.7,c*.015,0,0,Math.PI*2);
    ctx.fillStyle='#84928022';ctx.fill();
  }
  function platform(x,y,c,time){
    box(x+c*.04,y+c*.86,c*.92,c*.095,alloy,'#8199ac',3);
    glowLine(x+c*.12,y+c*.87,x+c*.88,y+c*.87,Math.max(1,c*.008));
    for(const px of [.25,.75]){
      box(x+c*(px-.075),y+c*.925,c*.15,c*.055,'#3d5369',null,1);
      repulsor(x+c*px,y+c*.98,c,time);
    }
  }
  function drawConveyor(state,b,v) {
    const c=v.cell,x=v.ox+b.x*c,y=v.oy+b.y*c;
    const {inputs,output,outputConnected}=conveyorConnections(state,b);
    const ports=new Set([...inputs,output]);
    if(!inputs.length)ports.add((output+2)%4);
    const reach=side=>inputs.includes(side)||(side===output&&outputConnected)? .5:.32;
    let left=ports.has(2)? .5-reach(2):.5;
    let right=ports.has(0)? .5+reach(0):.5;
    const hasHorizontal=true;
    if(left===right){left=.18;right=.82;}
    const hasVertical=ports.has(1)||ports.has(3);
    const transfer=hasVertical&&hasHorizontal;
    if(transfer){
      // The belt runs through the full lift bay, not just to its center.
      left=Math.min(left,.33);right=Math.max(right,.67);
    }
    if(hasHorizontal){
      const length=(right-left)*c;
      // The narrow deck and exposed circular rollers read as a side-on belt.
      box(x+c*left,y+c*.61,length,c*.18,'#626b68','#a0aaa2',transfer?1:c*.035);
      box(x+c*left,y+c*.6,length,c*.045,'#bcc4b5',null,1);
      const count=Math.max(2,Math.round(length/(c*.16)));
      for(let i=0;i<count;i++){
        const rx=x+c*left+(i+.5)*length/count,ry=y+c*.71;
        ctx.beginPath();ctx.arc(rx,ry,c*.045,0,Math.PI*2);ctx.fillStyle='#d5dad0';ctx.fill();
        const a=state.clock*3*(output===2?-1:1);
        line(rx,ry,rx+Math.cos(a)*c*.026,ry+Math.sin(a)*c*.026,'#648397');
      }
      const travel=output===2?-1:1,phase=(state.clock*.6)%1;
      ctx.save();ctx.beginPath();ctx.rect(x+c*left,y+c*.6,length,c*.05);ctx.clip();
      for(let i=-1;i<8;i++){
        const tx=x+c*left+(i+(travel===1?phase:1-phase))*c*.15;
        line(tx,y+c*.6,tx,y+c*.645,'#8b9780',1);
      }
      ctx.restore();
      const hoverX=x+c*(left+right)/2;
      repulsor(hoverX,y+c*.82,c,state.clock,.13);
      glowLine(x+c*left,y+c*.795,x+c*right,y+c*.795,Math.max(1,c*.018));
      if(output%2===0)arrow(x+c*.5,y+c*.72,output,c*.06,'#e9eddf');
    }
  }

  function drawFan(state,b,v){
    const c=v.cell,x=v.ox+b.x*c,y=v.oy+b.y*c;
    box(x+c*.14,y+c*.58,c*.72,c*.24,alloy,edge,3);
    ctx.save();ctx.translate(x+c*.5,y+c*.66);ctx.rotate(state.clock*5);
    for(let i=0;i<4;i++){ctx.rotate(Math.PI/2);box(c*.02,-c*.04,c*.23,c*.08,'#c8d1c0',null,2);}
    ctx.restore();
    ctx.beginPath();ctx.arc(x+c*.5,y+c*.66,c*.045,0,Math.PI*2);ctx.fillStyle='#e2e7da';ctx.fill();
    for(let i=0;i<3;i++){
      const px=x+c*(.32+i*.18),rise=(state.clock*.9+i*.23)%1;
      line(px,y+c*(.48-rise*.45),px,y+c*(.37-rise*.45),'#a9bd9988',1.5);
    }
    arrow(x+c*.5,y+c*.32,3,c*.07,'#849b6b');
    repulsor(x+c*.5,y+c*.86,c,state.clock);
  }
  function drawMachine(state,b,v){
    const c=v.cell,x=v.ox+b.x*c,y=v.oy+b.y*c,e=elements[b.el];
    platform(x,y,c,state.clock);
    for(const {side,incoming} of machineConnections(state,b)){
      if(side%2===0){
        const left=side===2?0:.74,right=side===2?.26:1;
        box(x+c*left,y+c*.61,c*(right-left),c*.18,alloy,edge,1);
        box(x+c*left,y+c*.6,c*(right-left),c*.045,'#bcc4b5',null,1);
        for(let i=0;i<3;i++){
          const rx=x+c*(left+(i+.5)*(right-left)/3);
          ctx.beginPath();ctx.arc(rx,y+c*.71,c*.035,0,Math.PI*2);ctx.fillStyle='#d5dad0';ctx.fill();
        }
        glowLine(x+c*left,y+c*.795,x+c*right,y+c*.795);
        arrow(x+c*(left+right)/2,y+c*.71,incoming?(side+2)%4:side,c*.035,'#e9eddf');
      }
    }

    if(b.type==='producer'){
      // A glazed machine housing keeps the produced material visible.
      box(x+c*.17,y+c*.18,c*.66,c*.65,'#eff1eb',edge,4);
      box(x+c*.21,y+c*.13,c*.58,c*.09,alloy,null,2);
      glowLine(x+c*.3,y+c*.22,x+c*.7,y+c*.22);
      box(x+c*.25,y+c*.29,c*.5,c*.38,e.bg,e.color+'88',3);
      sprite(b.el,x+c*.32,y+c*.3,c*.36);
      ctx.beginPath();ctx.ellipse(x+c*.5,y+c*.63,c*.18,c*.028,0,0,Math.PI*2);ctx.strokeStyle=cyan;ctx.stroke();
      const fraction=Math.min(b.timer/productionInterval(b),1);
      box(x+c*.3,y+c*.735,c*.4,c*.035,'#d1d7c8',null,1);
      if(fraction>0)box(x+c*.3,y+c*.735,c*.4*fraction,c*.035,cyan,null,1);
      if(producerLevel(b)>1){
        box(x+c*.6,y+c*.1,c*.24,c*.15,'#758461',null,2);
        ctx.font=`600 ${Math.max(6,c*.11)}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#f0f4df';
        ctx.fillText('L'+producerLevel(b),x+c*.72,y+c*.175);
      }
      const [dx,dy]=dirs[b.dir];
      const portY=b.dir%2? .5:.69;
      line(x+c*.5+dx*c*.29,y+c*portY+dy*c*.29,x+c*.5+dx*c*.46,y+c*portY+dy*c*.46,alloy,c*.075);
      arrow(x+c*.5+dx*c*.39,y+c*portY+dy*c*.39,b.dir,c*.04,'#e3eacb');
    }else if(b.type==='factory'){
      // A mixing gear and warning lamp mark the combination machine.
      box(x+c*.08,y+c*.3,c*.84,c*.53,'#e3e8dc',edge,4);
      box(x+c*.17,y+c*.2,c*.66,c*.12,alloy,null,2);
      box(x+c*.2,y+c*.12,c*.14,c*.08,'#a3a995',edge,1);
      ctx.save();ctx.shadowColor=cyan;ctx.shadowBlur=5;ctx.beginPath();ctx.arc(x+c*.5,y+c*.08,c*.025,0,Math.PI*2);ctx.fillStyle=cyan;ctx.fill();ctx.restore();
      box(x+c*.15,y+c*.39,c*.18,c*.25,'#697362',null,2);
      for(let i=0;i<3;i++)glowLine(x+c*.18,y+c*(.44+i*.065),x+c*.29,y+c*(.44+i*.065));
      box(x+c*.4,y+c*.38,c*.4,c*.33,'#f3f5ed','#a4b29a',3);
      ctx.save();ctx.translate(x+c*.6,y+c*.535);ctx.rotate(state.clock*.7);
      ctx.beginPath();ctx.arc(0,0,c*.085,0,Math.PI*2);ctx.fillStyle='#9aa88b';ctx.fill();
      for(let i=0;i<6;i++){ctx.rotate(Math.PI/3);box(c*.07,-c*.025,c*.045,c*.05,'#7c8b70',null,0);}
      ctx.beginPath();ctx.arc(0,0,c*.03,0,Math.PI*2);ctx.fillStyle='#e8eddc';ctx.fill();ctx.restore();
      ctx.beginPath();ctx.ellipse(x+c*.6,y+c*.68,c*.16,c*.018,0,0,Math.PI*2);ctx.strokeStyle=cyan;ctx.stroke();
      arrow(x+c*.8,y+c*.77,b.dir,c*.045,'#5a859a');
    }else{
      // A compact cash terminal shares the same support base.
      box(x+c*.14,y+c*.64,c*.72,c*.18,'#d5dccc',edge,3);
      box(x+c*.4,y+c*.5,c*.2,c*.15,alloy,null,1);
      box(x+c*.18,y+c*.22,c*.64,c*.35,'#e9efdd','#a1b38b',3);
      glowLine(x+c*.25,y+c*.57,x+c*.75,y+c*.57);
      ctx.font=`600 ${c*.25}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#678053';ctx.fillText('$',x+c*.5,y+c*.39);
      for(const px of [.24,.76])glowLine(x+c*px,y+c*.72,x+c*(px+.04),y+c*.72,2);
    }
    if(c>=34){
      ctx.font=`600 ${Math.max(6,c*.105)}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#edf1e5';
      ctx.fillText(b.type==='seller'?'TRADE':b.type==='factory'?'MIXER':e.name.toUpperCase(),x+c*.5,y+c*.91,c*.78);
    }
  }
  return {
    drawBlock(state,b,v,ghost=false){ctx.save();ctx.translate(0,v.reducedMotion?0:Math.sin(state.clock*1.4)*Math.min(1.2,v.cell*.008));ctx.globalAlpha=ghost?.45:1;if(b.type==='belt')drawConveyor(state,b,v);else if(b.type==='fan')drawFan(state,b,v);else drawMachine(state,b,v);ctx.restore();},
    drawBackdrop(v,showGrid){
      const {ox,oy,cell:c,cols,rows}=v;
      ctx.save();
      // White workshop wall, subtle level marks, and a side elevation floor.
      const floor=oy+rows*c;
      line(ox-12,floor,ox+cols*c+12,floor,'#c3dce4',1.5);
      box(ox-12,floor+2,cols*c+24,6,'#f2fafb',null,0);
      ctx.font='7px sans-serif';ctx.textAlign='right';ctx.fillStyle='#92aebb';
      for(let row=0;row<rows;row++){
        const y=oy+(row+.9)*c;
        line(ox-9,y,ox-4,y,'#cde1e6');
        if(c>=32)ctx.fillText(String(rows-row).padStart(2,'0'),ox-14,y+2);
        if(showGrid){line(ox,y,ox+cols*c,y,'#eef6f8');}
      }
      if(showGrid){
        ctx.strokeStyle='#e5f1f5';ctx.setLineDash([2,5]);
        for(let col=0;col<=cols;col++)line(ox+col*c,oy,ox+col*c,floor,'#e5f1f5');
        ctx.setLineDash([]);
      }
      ctx.restore();
    },
    drawCargo(state,p,v,time=0){
      const c=v.cell,position=cargoPosition(state,p);
      const size=Math.max(11,c*.28);
      const x=v.ox+position.x*c;
      const y=v.oy+position.y*c-size/2+(v.reducedMotion?0:Math.sin(time*1.4)*Math.min(1.2,c*.008));
      sprite(p.el,x-size/2,y-size/2,size);
    },
  };
}
