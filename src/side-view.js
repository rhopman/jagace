import { conveyorConnections } from './conveyors.js';
import { elements, dirs } from './engine.js';

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
  const alloy='#536b80',edge='#8ca4b6',cyan='#48c7d5';
  function glowLine(x1,y1,x2,y2,width=1){
    ctx.save();ctx.shadowColor=cyan;ctx.shadowBlur=5;
    line(x1,y1,x2,y2,cyan,width);ctx.restore();
  }
  function repulsor(cx,y,c,time,spread=.14){
    const pulse=.85+Math.sin(time*2)*.15;
    const field=ctx.createLinearGradient(cx,y,cx,y+c*.25);
    field.addColorStop(0,'#58d5df66');field.addColorStop(1,'#58d5df00');
    ctx.beginPath();ctx.moveTo(cx-c*spread*.45,y);ctx.lineTo(cx+c*spread*.45,y);
    ctx.lineTo(cx+c*spread,y+c*.25);ctx.lineTo(cx-c*spread,y+c*.25);ctx.closePath();ctx.fillStyle=field;ctx.fill();
    ctx.save();ctx.shadowColor=cyan;ctx.shadowBlur=4;
    for(let i=0;i<2;i++){
      ctx.beginPath();ctx.ellipse(cx,y+c*(.085+i*.09),c*spread*(.6+i*.25)*pulse,c*.018,0,0,Math.PI*2);
      ctx.strokeStyle=i?'#79d8df66':'#43c5d5aa';ctx.lineWidth=1;ctx.stroke();
    }
    box(cx-c*.055,y-c*.035,c*.11,c*.035,'#b8f6f5',null,1);ctx.restore();
  }
  function platform(x,y,c,time){
    box(x+c*.04,y+c*.86,c*.92,c*.095,alloy,'#8199ac',3);
    glowLine(x+c*.12,y+c*.87,x+c*.88,y+c*.87,Math.max(1,c*.025));
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
    const hasHorizontal=ports.has(0)||ports.has(2);
    const hasVertical=ports.has(1)||ports.has(3);
    const transfer=hasVertical&&hasHorizontal;
    if(transfer){
      // The belt runs through the full lift bay, not just to its center.
      left=Math.min(left,.33);right=Math.max(right,.67);
    }
    if(hasVertical){
      const top=ports.has(3)? .5-reach(3):transfer?.36:.5;
      const bottom=ports.has(1)? .5+reach(1):transfer?.81:.69;
      // Transparent lift shaft, guide rails, and moving carrier shelves.
      const railLeft=.37,railRight=.63;
      box(x+c*railLeft,y+c*top,c*(railRight-railLeft),c*(bottom-top),'#e9f8fa',null,0);
      for(const px of [railLeft,railRight]){
        if(transfer){
          // Open the guide rails at belt height so items have a clear doorway.
          if(top<.59)line(x+c*px,y+c*top,x+c*px,y+c*.59,'#7e9cab',Math.max(1,c*.045));
          if(bottom>.8)line(x+c*px,y+c*.8,x+c*px,y+c*bottom,'#7e9cab',Math.max(1,c*.045));
        }else line(x+c*px,y+c*top,x+c*px,y+c*bottom,'#7e9cab',Math.max(1,c*.045));
      }
      const verticalDirection=output%2?output:inputs.includes(3)?1:3;
      const direction=verticalDirection===1?1:-1;
      const phase=(state.clock*.5)%1;
      ctx.save();ctx.beginPath();ctx.rect(x+c*.38,y+c*top,c*.24,c*(bottom-top));ctx.clip();
      for(let i=-1;i<5;i++){
        const level=top+(i+(direction===1?phase:1-phase))*.22;
        box(x+c*.4,y+c*level,c*.2,c*.035,'#69cbd5',null,0);
      }
      ctx.restore();
      glowLine(x+c*.385,y+c*top,x+c*.385,y+c*bottom,Math.max(1,c*.016));
      glowLine(x+c*.615,y+c*top,x+c*.615,y+c*bottom,Math.max(1,c*.016));
      const arrowY=transfer?(ports.has(3)?Math.max(top+.1,.43):Math.min(bottom-.08,.88)):(top+bottom)/2;
      arrow(x+c*.5,y+c*arrowY,verticalDirection,c*.07,'#52a6b7');
    }
    if(hasHorizontal){
      const length=(right-left)*c;
      // The narrow deck and exposed circular rollers read as a side-on belt.
      box(x+c*left,y+c*.61,length,c*.18,'#526b80','#819cae',transfer?1:c*.035);
      box(x+c*left,y+c*.6,length,c*.045,'#a9e5eb',null,1);
      const count=Math.max(2,Math.round(length/(c*.16)));
      for(let i=0;i<count;i++){
        const rx=x+c*left+(i+.5)*length/count,ry=y+c*.71;
        ctx.beginPath();ctx.arc(rx,ry,c*.045,0,Math.PI*2);ctx.fillStyle='#d2e5ee';ctx.fill();
        const a=state.clock*3*(output===2?-1:1);
        line(rx,ry,rx+Math.cos(a)*c*.026,ry+Math.sin(a)*c*.026,'#648397');
      }
      const travel=output===2?-1:1,phase=(state.clock*.6)%1;
      ctx.save();ctx.beginPath();ctx.rect(x+c*left,y+c*.6,length,c*.05);ctx.clip();
      for(let i=-1;i<8;i++){
        const tx=x+c*left+(i+(travel===1?phase:1-phase))*c*.15;
        line(tx,y+c*.6,tx,y+c*.645,'#54aebc',1);
      }
      ctx.restore();
      const hoverX=x+c*(left+right)/2;
      repulsor(hoverX,y+c*.82,c,state.clock,.13);
      glowLine(x+c*left,y+c*.795,x+c*right,y+c*.795,Math.max(1,c*.018));
      if(output%2===0)arrow(x+c*.5,y+c*.72,output,c*.06,'#c4f4f4');
    }
    if(transfer){
      // Flush loading deck with inset rollers and a small protective canopy.
      line(x+c*.33,y+c*.6,x+c*.67,y+c*.6,'#b7f3f3',Math.max(1,c*.03));
      for(const px of [.39,.5,.61]){
        ctx.beginPath();ctx.arc(x+c*px,y+c*.71,c*.038,0,Math.PI*2);
        ctx.fillStyle='#dcf3f6';ctx.fill();
        const angle=state.clock*3*(output===2?-1:1);
        line(x+c*px,y+c*.71,x+c*px+Math.cos(angle)*c*.022,y+c*.71+Math.sin(angle)*c*.022,'#64889e');
      }
      line(x+c*.3,y+c*.35,x+c*.7,y+c*.35,'#8fbac9',Math.max(1,c*.035));
      // Side brackets make the shaft and conveyor read as a single assembly.
      for(const px of [.32,.64])box(x+c*px,y+c*.79,c*.04,c*.06,'#8fbac9',null,0);
    }
  }
  function drawMachine(state,b,v){
    const c=v.cell,x=v.ox+b.x*c,y=v.oy+b.y*c,e=elements[b.el];
    platform(x,y,c,state.clock);
    if(b.type==='producer'){
      // A materializer chamber holds the recognizable element in a stasis field.
      box(x+c*.17,y+c*.18,c*.66,c*.65,'#eaf0f5',edge,4);
      box(x+c*.21,y+c*.13,c*.58,c*.09,alloy,null,2);
      glowLine(x+c*.3,y+c*.22,x+c*.7,y+c*.22);
      box(x+c*.25,y+c*.29,c*.5,c*.38,e.bg,e.color+'88',3);
      sprite(b.el,x+c*.32,y+c*.3,c*.36);
      ctx.beginPath();ctx.ellipse(x+c*.5,y+c*.63,c*.18,c*.028,0,0,Math.PI*2);ctx.strokeStyle=cyan;ctx.stroke();
      const fraction=Math.min(b.timer/e.interval,1);
      box(x+c*.3,y+c*.735,c*.4,c*.035,'#bfd2df',null,1);
      if(fraction>0)box(x+c*.3,y+c*.735,c*.4*fraction,c*.035,cyan,null,1);
      const [dx,dy]=dirs[b.dir];
      line(x+c*.5+dx*c*.29,y+c*.5+dy*c*.29,x+c*.5+dx*c*.46,y+c*.5+dy*c*.46,alloy,c*.075);
      arrow(x+c*.5+dx*c*.39,y+c*.5+dy*c*.39,b.dir,c*.04,'#aaf0f3');
    }else if(b.type==='factory'){
      // A fusion reactor replaces the smokestack: energy goes into combining elements.
      box(x+c*.08,y+c*.3,c*.84,c*.53,'#dce8ef',edge,4);
      box(x+c*.17,y+c*.2,c*.66,c*.12,alloy,null,2);
      line(x+c*.5,y+c*.2,x+c*.5,y+c*.08,edge,1);
      ctx.save();ctx.shadowColor=cyan;ctx.shadowBlur=5;ctx.beginPath();ctx.arc(x+c*.5,y+c*.08,c*.025,0,Math.PI*2);ctx.fillStyle=cyan;ctx.fill();ctx.restore();
      box(x+c*.15,y+c*.39,c*.18,c*.25,'#49647a',null,2);
      for(let i=0;i<3;i++)glowLine(x+c*.18,y+c*(.44+i*.065),x+c*.29,y+c*(.44+i*.065));
      box(x+c*.4,y+c*.38,c*.4,c*.33,'#f5fcfc','#8cbdca',3);
      sprite(b.el,x+c*.46,y+c*.39,c*.27);
      ctx.beginPath();ctx.ellipse(x+c*.6,y+c*.68,c*.16,c*.018,0,0,Math.PI*2);ctx.strokeStyle=cyan;ctx.stroke();
      arrow(x+c*.8,y+c*.77,b.dir,c*.045,'#5a859a');
    }else{
      // A holographic trading terminal explains its suspension with the same hover base.
      box(x+c*.14,y+c*.64,c*.72,c*.18,'#c8d7e3',edge,3);
      box(x+c*.4,y+c*.5,c*.2,c*.15,alloy,null,1);
      box(x+c*.18,y+c*.22,c*.64,c*.35,'#e5f8fa','#76bfcc',3);
      glowLine(x+c*.25,y+c*.57,x+c*.75,y+c*.57);
      ctx.font=`600 ${c*.25}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#409aa9';ctx.fillText('$',x+c*.5,y+c*.39);
      for(const px of [.24,.76])glowLine(x+c*px,y+c*.72,x+c*(px+.04),y+c*.72,2);
    }
    if(c>=34){
      ctx.font=`600 ${Math.max(6,c*.105)}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#d6f5fa';
      ctx.fillText(b.type==='seller'?'TRADE':e.name.toUpperCase(),x+c*.5,y+c*.91,c*.78);
    }
  }
  return {
    drawBlock(state,b,v,ghost=false){ctx.save();ctx.translate(0,v.reducedMotion?0:Math.sin(state.clock*1.4)*Math.min(1.2,v.cell*.025));ctx.globalAlpha=ghost?.45:1;if(b.type==='belt')drawConveyor(state,b,v);else drawMachine(state,b,v);ctx.restore();},
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
    drawCargo(p,v,time=0){
      const t=Math.min(1,p.progress),c=v.cell;
      const x=v.ox+(p.fromX+(p.x-p.fromX)*t+.5)*c;
      const y=v.oy+(p.fromY+(p.y-p.fromY)*t+.48)*c+(v.reducedMotion?0:Math.sin(time*1.4)*Math.min(1.2,c*.025));
      const size=Math.max(11,c*.28);
      sprite(p.el,x-size/2,y-size/2,size);
    },
  };
}
