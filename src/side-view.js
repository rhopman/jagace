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
  function platform(x,y,c) {
    box(x+c*.04,y+c*.89,c*.92,c*.07,'#899781');
    for(const px of [.17,.82])line(x+c*px,y+c*.96,x+c*px,y+c,'#899781',Math.max(1,c*.04));
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
      box(x+c*railLeft,y+c*top,c*(railRight-railLeft),c*(bottom-top),'#f2f6ee',null,0);
      for(const px of [railLeft,railRight]){
        if(transfer){
          // Open the guide rails at belt height so items have a clear doorway.
          if(top<.59)line(x+c*px,y+c*top,x+c*px,y+c*.59,'#819574',Math.max(1,c*.045));
          if(bottom>.8)line(x+c*px,y+c*.8,x+c*px,y+c*bottom,'#819574',Math.max(1,c*.045));
        }else line(x+c*px,y+c*top,x+c*px,y+c*bottom,'#819574',Math.max(1,c*.045));
      }
      const verticalDirection=output%2?output:inputs.includes(3)?1:3;
      const direction=verticalDirection===1?1:-1;
      const phase=(state.clock*.5)%1;
      ctx.save();ctx.beginPath();ctx.rect(x+c*.38,y+c*top,c*.24,c*(bottom-top));ctx.clip();
      for(let i=-1;i<5;i++){
        const level=top+(i+(direction===1?phase:1-phase))*.22;
        box(x+c*.4,y+c*level,c*.2,c*.035,'#a1b488',null,0);
      }
      ctx.restore();
      const arrowY=transfer?(ports.has(3)?Math.max(top+.1,.43):Math.min(bottom-.08,.88)):(top+bottom)/2;
      arrow(x+c*.5,y+c*arrowY,verticalDirection,c*.07,'#718a5c');
    }
    if(hasHorizontal){
      const length=(right-left)*c;
      // The narrow deck and exposed circular rollers read as a side-on belt.
      box(x+c*left,y+c*.61,length,c*.18,'#788a6c','#5f7554',transfer?1:c*.035);
      box(x+c*left,y+c*.6,length,c*.045,'#b6c89d',null,1);
      const count=Math.max(2,Math.round(length/(c*.16)));
      for(let i=0;i<count;i++){
        const rx=x+c*left+(i+.5)*length/count,ry=y+c*.71;
        ctx.beginPath();ctx.arc(rx,ry,c*.045,0,Math.PI*2);ctx.fillStyle='#d6dfc6';ctx.fill();
        const a=state.clock*3*(output===2?-1:1);
        line(rx,ry,rx+Math.cos(a)*c*.026,ry+Math.sin(a)*c*.026,'#6c835b');
      }
      const travel=output===2?-1:1,phase=(state.clock*.6)%1;
      ctx.save();ctx.beginPath();ctx.rect(x+c*left,y+c*.6,length,c*.05);ctx.clip();
      for(let i=-1;i<8;i++){
        const tx=x+c*left+(i+(travel===1?phase:1-phase))*c*.15;
        line(tx,y+c*.6,tx,y+c*.645,'#7e9667',1);
      }
      ctx.restore();
      const legX=x+c*(left+right)/2;
      line(legX,y+c*.8,legX,y+c*.96,'#9ca98f',Math.max(1,c*.04));
      line(legX-c*.08,y+c*.96,legX+c*.08,y+c*.96,'#9ca98f',1);
      if(output%2===0)arrow(x+c*.5,y+c*.85,output,c*.07,'#7e926c');
    }
    if(transfer){
      // Flush loading deck with inset rollers and a small protective canopy.
      line(x+c*.33,y+c*.6,x+c*.67,y+c*.6,'#c8d8b4',Math.max(1,c*.03));
      for(const px of [.39,.5,.61]){
        ctx.beginPath();ctx.arc(x+c*px,y+c*.71,c*.038,0,Math.PI*2);
        ctx.fillStyle='#e1e9d4';ctx.fill();
        const angle=state.clock*3*(output===2?-1:1);
        line(x+c*px,y+c*.71,x+c*px+Math.cos(angle)*c*.022,y+c*.71+Math.sin(angle)*c*.022,'#7f946d');
      }
      line(x+c*.3,y+c*.35,x+c*.7,y+c*.35,'#9caf89',Math.max(1,c*.035));
      // Side brackets make the shaft and conveyor read as a single assembly.
      for(const px of [.32,.64])box(x+c*px,y+c*.79,c*.04,c*.06,'#9caf89',null,0);
    }
  }
  function drawMachine(state,b,v) {
    const c=v.cell,x=v.ox+b.x*c,y=v.oy+b.y*c,e=elements[b.el];
    platform(x,y,c);
    if(b.type==='producer'){
      // Hopper, element display, motor and output chute on a raised footing.
      box(x+c*.15,y+c*.16,c*.65,c*.13,e.color,'#738565',2);
      box(x+c*.21,y+c*.27,c*.54,c*.53,e.bg,e.color,3);
      box(x+c*.27,y+c*.33,c*.42,c*.34,'#fffff5',e.color+'77',2);
      sprite(b.el,x+c*.3,y+c*.33,c*.36);
      box(x+c*.26,y+c*.72,c*.17,c*.1,'#809172',null,1);
      for(let i=0;i<3;i++)line(x+c*(.29+i*.045),y+c*.735,x+c*(.29+i*.045),y+c*.79,'#d5dfc8');
      const fraction=Math.min(b.timer/e.interval,1);
      box(x+c*.48,y+c*.745,c*.21,c*.035,'#ffffffaa',null,1);
      if(fraction>0)box(x+c*.48,y+c*.745,c*.21*fraction,c*.035,e.color,null,1);
      const [dx,dy]=dirs[b.dir];
      line(x+c*.5+dx*c*.28,y+c*.5+dy*c*.28,x+c*.5+dx*c*.46,y+c*.5+dy*c*.46,'#829574',c*.09);
      arrow(x+c*.5+dx*c*.39,y+c*.5+dy*c*.39,b.dir,c*.045,'#f6f8ed');
    }else if(b.type==='factory'){
      // Sawtooth roof, smokestack, machinery windows, and the recipe sign.
      box(x+c*.66,y+c*.13,c*.13,c*.48,'#94a985','#6f865f',1);
      box(x+c*.64,y+c*.11,c*.17,c*.05,'#748b65',null,0);
      const pulse=(state.clock*.25)%1;
      for(let i=0;i<2;i++){
        ctx.beginPath();ctx.ellipse(x+c*(.72+.03*i),y+c*(.06-i*.07-pulse*.04),c*(.05+i*.012),c*.023,0,0,Math.PI*2);ctx.fillStyle='#d9e1d1';ctx.fill();
      }
      ctx.beginPath();ctx.moveTo(x+c*.08,y+c*.42);ctx.lineTo(x+c*.32,y+c*.27);ctx.lineTo(x+c*.32,y+c*.42);ctx.lineTo(x+c*.55,y+c*.27);ctx.lineTo(x+c*.55,y+c*.42);ctx.lineTo(x+c*.9,y+c*.42);ctx.lineTo(x+c*.9,y+c*.88);ctx.lineTo(x+c*.08,y+c*.88);ctx.closePath();ctx.fillStyle='#c7d6b5';ctx.fill();ctx.strokeStyle='#81966d';ctx.lineWidth=1;ctx.stroke();
      for(const px of [.17,.4]){
        box(x+c*px,y+c*.49,c*.16,c*.15,'#fff0b9','#94a57d',1);
        line(x+c*(px+.08),y+c*.49,x+c*(px+.08),y+c*.64,'#94a57d');
      }
      box(x+c*.66,y+c*.61,c*.16,c*.27,'#829875','#657e54',1);
      box(x+c*.38,y+c*.68,c*.19,c*.18,'#fafbf2','#9bae87',2);sprite(b.el,x+c*.385,y+c*.68,c*.18);
      arrow(x+c*.74,y+c*.75,b.dir,c*.045,'#f3f7e8');
    }else{
      // Front-facing market stall with a striped awning and sales counter.
      for(const px of [.12,.84])line(x+c*px,y+c*.3,x+c*px,y+c*.87,'#a99265',Math.max(1,c*.04));
      for(let i=0;i<6;i++)box(x+c*(.07+i*.145),y+c*.22,c*.145,c*.17,i%2?'#fff3d7':'#bea071',null,1);
      box(x+c*.06,y+c*.19,c*.88,c*.05,'#987e50',null,1);
      box(x+c*.09,y+c*.66,c*.79,c*.19,'#e1c997','#ac925d',2);
      line(x+c*.07,y+c*.65,x+c*.91,y+c*.65,'#a98b53',c*.045);
      ctx.beginPath();ctx.arc(x+c*.5,y+c*.5,c*.12,0,Math.PI*2);ctx.fillStyle='#f3d777';ctx.fill();ctx.strokeStyle='#b3974f';ctx.stroke();
      ctx.font=`600 ${c*.19}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#9e8038';ctx.fillText('$',x+c*.5,y+c*.51);
    }
    if(c>=34){
      ctx.font=`600 ${Math.max(6,c*.11)}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#f8faf3';
      ctx.fillText(b.type==='seller'?'MARKET':e.name.toUpperCase(),x+c*.5,y+c*.925,c*.84);
    }
  }
  return {
    drawBlock(state,b,v,ghost=false){ctx.save();ctx.globalAlpha=ghost?.45:1;if(b.type==='belt')drawConveyor(state,b,v);else drawMachine(state,b,v);ctx.restore();},
    drawBackdrop(v,showGrid){
      const {ox,oy,cell:c,cols,rows}=v;
      ctx.save();
      // White workshop wall, subtle level marks, and a side elevation floor.
      const floor=oy+rows*c;
      line(ox-12,floor,ox+cols*c+12,floor,'#b8c4ac',1.5);
      box(ox-12,floor+2,cols*c+24,6,'#f0f3ec',null,0);
      ctx.font='7px sans-serif';ctx.textAlign='right';ctx.fillStyle='#a7b39c';
      for(let row=0;row<rows;row++){
        const y=oy+(row+.9)*c;
        line(ox-9,y,ox-4,y,'#ced6c7');
        if(c>=32)ctx.fillText(String(rows-row).padStart(2,'0'),ox-14,y+2);
        if(showGrid){line(ox,y,ox+cols*c,y,'#eef1eb');}
      }
      if(showGrid){
        ctx.strokeStyle='#e8ede3';ctx.setLineDash([2,5]);
        for(let col=0;col<=cols;col++)line(ox+col*c,oy,ox+col*c,floor,'#e8ede3');
        ctx.setLineDash([]);
      }
      ctx.restore();
    },
    drawCargo(p,v){
      const t=Math.min(1,p.progress),c=v.cell;
      const x=v.ox+(p.fromX+(p.x-p.fromX)*t+.5)*c;
      const y=v.oy+(p.fromY+(p.y-p.fromY)*t+.48)*c;
      const size=Math.max(11,c*.28);
      sprite(p.el,x-size/2,y-size/2,size);
    },
  };
}
