/* Fixed-step, seeded, deliberately playful 2D physics. No external engine. */
(function (root) {
  'use strict';
  const TAU = Math.PI * 2;
  const colors = ['#7dd3fc', '#a7f3d0', '#c4b5fd', '#f9c784', '#f8a9be', '#e3edf5'];
  const names = ['Ice', 'Mint', 'Lilac', 'Apricot', 'Rose', 'Cloud'];
  function random(seed) { let n = seed >>> 0; return () => { n += 0x6D2B79F5; let t = n; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const angleDifference = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
  class Simulation {
    constructor(mode, settings = {}, height = 960) {
      this.mode = mode; this.settings = {seed:42, rings:7, gap:55, spin:0.7, growth:8, gravity:260, ...settings};
      this.width = 540; this.height = height; this.time = 0; this.hits = 0; this.done = false; this.result = ''; this.finishedAt = null;
      this.rng = random(this.settings.seed); this.cx = 270; this.cy = height / 2 + (height === 540 ? 16 : 0); this.radius = Math.min(210, (height - 200) / 2);
      this.balls = []; this.rings = []; this.pegs = []; this.finishers = [];
      const theta = this.rng() * TAU;
      if (mode === 'race') {
        this.top = height === 960 ? 212 : 119; this.bottom = height === 960 ? 796 : 461;
        for (let i = 0; i < 6; i++) this.balls.push({id:i, x:120+i*60, y:this.top-24, vx:(this.rng()-.5)*90, vy:0, r:9, color:colors[i], trail:[], finished:false});
        const rows = height === 960 ? 10 : 6;
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < 8; col++) {
            const x = 71 + col * 55 + (row % 2) * 27.5;
            if (x < 482) this.pegs.push({x, y:this.top + 38 + row * (this.bottom-this.top-95)/(rows-1), r:6});
          }
        }
      } else {
        this.balls.push({x:270, y:this.cy-12, vx:Math.cos(theta)*340, vy:Math.sin(theta)*340, r:mode==='grow'?13:8, color:'#7dd3fc', trail:[]});
        if (mode === 'rings') {
          this.balls[0].r=Math.min(8,Math.max(3,(this.radius-52)/(this.settings.rings-1)/2-3));
          for (let i=0; i<this.settings.rings; i++) this.rings.push({r:52+i*(this.radius-52)/(this.settings.rings-1), angle:theta+1.1+i*.48, spin:this.settings.spin*(i%2?-1:1)*(1+i*.06), gone:false});
        }
      }
    }
    finish(message) { this.done=true; this.result=message; this.finishedAt=this.time; }
    step(dt) {
      if (this.done) return;
      this.time += dt;
      if (this.mode === 'race') this.stepRace(dt); else this.stepCircle(dt);
      // Trails sampled in simulation time, independent of display refresh rate.
      if (Math.floor(this.time*60) !== Math.floor((this.time-dt)*60)) for (const b of this.balls) { b.trail.push({x:b.x,y:b.y,r:b.r}); if (b.trail.length>17) b.trail.shift(); }
      if (this.time >= 90 && !this.done) this.finish(this.mode === 'race' ? 'Race time limit' : 'Time’s up. Try another seed.');
    }
    stepCircle(dt) {
      const b=this.balls[0]; b.vy += this.settings.gravity*dt;
      const velocity=Math.hypot(b.vx,b.vy); if (velocity>650) {b.vx*=650/velocity;b.vy*=650/velocity;}
      b.x += b.vx*dt; b.y += b.vy*dt;
      let dx=b.x-this.cx,dy=b.y-this.cy,d=Math.hypot(dx,dy),nx=dx/(d||1),ny=dy/(d||1);
      if (this.mode === 'grow') {
        if (d+b.r >= this.radius) {
          const dot=b.vx*nx+b.vy*ny;
          if (dot>0) {
            b.vx-=2*dot*nx; b.vy-=2*dot*ny; this.hits++;
            b.r=Math.min(this.radius*.83,b.r*(1+this.settings.growth/100));
            if (b.r>=this.radius*.83-.01) this.finish('Now that’s a big bounce.');
          }
          const limit=this.radius-b.r-.3;b.x=this.cx+nx*limit;b.y=this.cy+ny*limit;
        }
      } else {
        const gap=this.settings.gap*Math.PI/180;
        for (const ring of this.rings) {
          ring.angle += ring.spin*dt;
          if (ring.gone) continue;
          dx=b.x-this.cx;dy=b.y-this.cy;d=Math.hypot(dx,dy);nx=dx/(d||1);ny=dy/(d||1);
          const angle=Math.atan2(dy,dx), delta=Math.abs(angleDifference(angle,ring.angle));
          const clearance=Math.asin(Math.min(1,(b.r+2.5)/ring.r));
          const insideGap=delta<gap/2-clearance;
          if (d>ring.r+b.r+3) { ring.gone=true; continue; }
          if (Math.abs(d-ring.r)<b.r+2.5 && !insideGap) {
            const side=d<ring.r?-1:1,dot=b.vx*nx+b.vy*ny;
            if (dot*side<0) {b.vx-=2*dot*nx;b.vy-=2*dot*ny;this.hits++;}
            const corrected=ring.r+side*(b.r+2.7); b.x=this.cx+nx*corrected;b.y=this.cy+ny*corrected;
          }
        }
        if (this.rings.every(r=>r.gone)) this.finish('Every ring. Escaped.');
      }
    }
    stepRace(dt) {
      for (const b of this.balls) {
        if (b.finished) continue;
        b.vy += this.settings.gravity * 2.3 * dt; b.vx *= Math.exp(-.06*dt);
        const v=Math.hypot(b.vx,b.vy);if(v>700){b.vx*=700/v;b.vy*=700/v;}
        b.x+=b.vx*dt;b.y+=b.vy*dt;
        if (b.x<46+b.r) {b.x=46+b.r;b.vx=Math.abs(b.vx)*.9;}
        if (b.x>494-b.r) {b.x=494-b.r;b.vx=-Math.abs(b.vx)*.9;}
        if (b.y<this.top-55) {b.y=this.top-55;b.vy=Math.abs(b.vy);}
        for (const p of this.pegs) {
          const dx=b.x-p.x,dy=b.y-p.y,d=Math.hypot(dx,dy),min=b.r+p.r;
          if (d<min) {
            const nx=dx/(d||1),ny=dy/(d||1),dot=b.vx*nx+b.vy*ny;
            b.x=p.x+nx*(min+.05);b.y=p.y+ny*(min+.05);
            if (dot<0) {b.vx-=1.65*dot*nx;b.vy-=1.65*dot*ny;this.hits++;}
            // Tiny seeded perturbation avoids perfectly balanced peg-top stalls.
            if (Math.abs(b.vx)<3) b.vx+=(this.rng()-.5)*16;
          }
        }
      }
      for(let i=0;i<this.balls.length;i++) for(let j=i+1;j<this.balls.length;j++) {
        const a=this.balls[i],b=this.balls[j];if(a.finished||b.finished)continue;
        const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),min=a.r+b.r;
        if(d<min){const nx=d?dx/d:1,ny=d?dy/d:0,overlap=(min-d+.02)/2;a.x-=nx*overlap;a.y-=ny*overlap;b.x+=nx*overlap;b.y+=ny*overlap;
          const dot=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;if(dot<0){const impulse=-.9*dot;a.vx-=impulse*nx;a.vy-=impulse*ny;b.vx+=impulse*nx;b.vy+=impulse*ny;}}
      }
      // Sort crossings within this step by estimated crossing time, not color index.
      const arrivals=this.balls.filter(b=>!b.finished&&b.y>=this.bottom).sort((a,b)=>(b.y-this.bottom)/(b.vy||1)-(a.y-this.bottom)/(a.vy||1));
      for(const b of arrivals){b.finished=true;b.finishedTime=this.time-(b.y-this.bottom)/Math.max(1,b.vy);b.trail=[];this.finishers.push(b.id);}
      if(this.finishers.length===this.balls.length) this.finish(names[this.finishers[0]]+' takes the win.');
    }
  }
  root.CTPhysics={Simulation,colors,names,random};
})(typeof window !== 'undefined' ? window : globalThis);
