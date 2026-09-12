import land from "./land-points.json";
import type { COBEOptions, Globe } from "cobe";
// Natural Earth 1:110m land, public domain. Sampled at ~2 degree spacing.
// Source: https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_land.geojson
export function createCanvasGlobe(canvas: HTMLCanvasElement, initial: COBEOptions): Globe {
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");
  let state = { ...initial };
  const draw = () => {
    const { width, height, phi, theta } = state;
    const dpr = state.devicePixelRatio;
    if (canvas.width !== width * dpr) canvas.width = width * dpr;
    if (canvas.height !== height * dpr) canvas.height = height * dpr;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, width, height);
    const cx = width / 2, cy = height / 2, radius = width * .43;
    const center = Math.PI * 1.5 - phi;
    function project(lat: number, lon: number) {
      const a = lat * Math.PI / 180, b = lon * Math.PI / 180 - center;
      const z = Math.sin(theta) * Math.sin(a) + Math.cos(theta) * Math.cos(a) * Math.cos(b);
      return { x: cx + radius * Math.cos(a) * Math.sin(b), y: cy - radius * (Math.cos(theta) * Math.sin(a) - Math.sin(theta) * Math.cos(a) * Math.cos(b)), z };
    }
    const shade = context.createRadialGradient(cx-radius*.3, cy-radius*.3, 0, cx, cy, radius);
    shade.addColorStop(0, '#272622'); shade.addColorStop(.8, '#141413'); shade.addColorStop(1, '#0d0d0c');
    context.beginPath(); context.arc(cx,cy,radius,0,Math.PI*2); context.fillStyle=shade; context.fill();
    context.strokeStyle='#33332d'; context.lineWidth=.7; context.stroke();
    for(const [lat,lon] of land) {
      const p=project(lat,lon); if(p.z<=0) continue;
      context.globalAlpha=.2+p.z*.65; context.fillStyle='#b7b7a5';
      context.beginPath(); context.arc(p.x,p.y,Math.max(.55,width/470),0,Math.PI*2); context.fill();
    }
    context.globalAlpha=1;
    for(const arc of state.arcs ?? []) {
      // Great-circle interpolation keeps the path attached to the globe.
      const vector=([lat,lon]:[number,number])=>{const a=lat*Math.PI/180,b=lon*Math.PI/180;return [Math.cos(a)*Math.cos(b),Math.cos(a)*Math.sin(b),Math.sin(a)];};
      const a=vector(arc.from),b=vector(arc.to),angle=Math.acos(Math.max(-1,Math.min(1,a.reduce((sum,v,i)=>sum+v*b[i],0))));
      if(angle<.001) continue;
      context.beginPath(); let active=false;
      for(let i=0;i<=48;i++) {
        const t=i/48,u=Math.sin((1-t)*angle)/Math.sin(angle),v=Math.sin(t*angle)/Math.sin(angle);
        const q=a.map((n,j)=>n*u+b[j]*v);const p=project(Math.atan2(q[2],Math.hypot(q[0],q[1]))*180/Math.PI,Math.atan2(q[1],q[0])*180/Math.PI);
        if(p.z<=0){active=false;continue;} if(active)context.lineTo(p.x,p.y);else context.moveTo(p.x,p.y);active=true;
      }
      context.strokeStyle='rgba(239,166,194,.5)';context.lineWidth=.8;context.stroke();
    }
    for(const marker of state.markers ?? []) {
      const p=project(...marker.location);if(p.z<=0)continue;
      const color=marker.color??[1,.55,.76];const rgb=color.map(c=>Math.round(c*255)).join(',');
      const size=Math.max(2,marker.size*radius*.45);
      context.beginPath();context.arc(p.x,p.y,size*2.5,0,Math.PI*2);context.fillStyle=`rgba(${rgb},.13)`;context.fill();
      context.beginPath();context.arc(p.x,p.y,size,0,Math.PI*2);context.fillStyle=`rgb(${rgb})`;context.fill();
    }
  };
  draw();
  return { update(next) {state={...state,...next};draw();}, destroy(){context.clearRect(0,0,canvas.width,canvas.height);} };
}
