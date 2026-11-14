(() => {
  'use strict';
  const $=id=>document.getElementById(id), canvas=$('stage'), ctx=canvas.getContext('2d');
  const {Simulation}=CTPhysics;
  const colors=['#385e50','#536b84','#98664e','#897534','#77766d','#292e2a'];
  const names=['Fern','Slate','Clay','Ochre','Stone','Ink'];
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  const modes={rings:{number:'01',description:'A ball searches for an opening in seven rotating rings. Adjust the gaps and see what gets through.',title:'Can it escape every ring?'},grow:{number:'02',description:'Each wall hit increases the ball’s radius. Change the growth rate and watch the space disappear.',title:'Every bounce makes it bigger.'},race:{number:'03',description:'Six equal marbles take different paths through a pegboard. Choose one and follow its finish.',title:'Pick a color. Who gets there first?'}};
  let mode='rings', height=540, settings={seed:42,rings:7,gap:55,spin:.7,growth:8,gravity:260};
  let sim, playing=!matchMedia('(prefers-reduced-motion: reduce)').matches, speed=1, trails=true, color=colors[0], pick=0;
  let accumulator=0,last=0,recorder=null,recordTimer=null,recordStarted=0,recordLength=0,recordDoneAt=null,downloadURL=null,recordStream=null,recording=false,toastTimer;
  let indicatorAnimation;
  const FIXED=1/240;
  function toast(message){$('toast').textContent=message;if(window.Motion&&!reducedMotion.matches)Motion.animate($('toast'),{opacity:1},{duration:.15});else $('toast').style.opacity=1;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{$('toast').style.opacity=0;},3000);}
  function reset(){sim=new Simulation(mode,settings,height);sim.balls.forEach(b=>{if(mode==='race')b.color=colors[b.id];});accumulator=0;last=performance.now();updatePlay();draw();}
  function updatePlay(){$('play').textContent=sim?.done?'Replay':playing?'Pause':'Play';$('play').setAttribute('aria-label',sim?.done?'Replay simulation':playing?'Pause simulation':'Play simulation');$('run-status').textContent=recording?'RECORDING':sim?.done?'RUN COMPLETE':playing?'LIVE PREVIEW':'PAUSED';}
  function slider(id,label,min,max,step,value,suffix){return `<label class="range-label" for="${id}">${label}<output id="${id}-value">${value}${suffix}</output></label><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}">`;}
  function showControls(){
    const info=modes[mode];$('mode-tag').textContent='EXPERIMENT '+info.number;$('mode-description').textContent=info.description;$('caption').value=info.title;canvas.setAttribute('aria-label','Animated '+mode+' simulation');
    let html='';
    if(mode==='rings')html=slider('rings','Ring count',3,12,1,settings.rings,'')+slider('gap','Opening size',30,100,5,settings.gap,'°')+slider('spin','Ring rotation',.1,1.5,.1,settings.spin,' rad/s');
    if(mode==='grow')html=slider('growth','Growth per bounce',3,16,1,settings.growth,'%')+slider('gravity','Gravity',100,500,20,settings.gravity,'');
    if(mode==='race')html='<span style="font-size:12px;color:#49616f">Your pick</span><div class="pickers">'+names.map((n,i)=>`<button data-pick="${i}" aria-pressed="${i===pick}"><i style="background:${colors[i]}"></i>${n}</button>`).join('')+'</div><p class="race-note">Every marble has the same size and weight. The seed changes the starting motion.</p>'+slider('gravity','Gravity',100,500,20,settings.gravity,'');
    $('mode-controls').innerHTML=html;
    $('mode-controls').querySelectorAll('input').forEach(input=>input.addEventListener('input',()=>{settings[input.id]=Number(input.value);const suffix=input.id==='gap'?'°':input.id==='spin'?' rad/s':input.id==='growth'?'%':'';$(input.id+'-value').value=input.value+suffix;reset();}));
    $('mode-controls').querySelectorAll('[data-pick]').forEach(button=>button.addEventListener('click',()=>{pick=Number(button.dataset.pick);$('mode-controls').querySelectorAll('[data-pick]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.pick)===pick)));draw();}));
    document.querySelector('.palette-row').hidden=mode==='race';
  }
  function circle(x,y,r,fill){ctx.beginPath();ctx.arc(x,y,Math.max(.1,r),0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();}
  function text(str,x,y,size=16,fill='#292e2a',align='center',weight=400){ctx.font=`${weight} ${size}px "Segoe UI", Arial, sans-serif`;ctx.fillStyle=fill;ctx.textAlign=align;ctx.fillText(str,x,y);}
  function wrapTitle(title,y){ctx.font='600 25px "Segoe UI", Arial, sans-serif';let words=title.split(/\s+/),lines=[],line='';for(const word of words){const test=line?line+' '+word:word;if(ctx.measureText(test).width>440&&line){lines.push(line);line=word;}else line=test;}if(line)lines.push(line);lines.slice(0,3).forEach((s,i)=>text(s,270,y+i*31,25,'#292e2a','center',600));}
  function draw(){
    ctx.setTransform(2,0,0,2,0,0);ctx.fillStyle='#eaece5';ctx.fillRect(0,0,540,height);
    const vertical=height>540;
    text('EXPERIMENT '+modes[mode].number,270,vertical?102:35,10,'#5e665f','center',600);
    wrapTitle($('caption').value,vertical?143:67);
    if(mode==='race')drawRace();else drawCircle();
    const baseY=vertical?855:502;
    if(mode==='rings'){
      const escaped=sim.rings.filter(r=>r.gone).length;
      text(`${escaped} / ${settings.rings} RINGS`,179,baseY,12,'#48564e','center',600);text(`${sim.hits} BOUNCES`,363,baseY,12,'#48564e','center',600);
    }else if(mode==='grow'){
      text(`${sim.hits} BOUNCES`,179,baseY,12,'#48564e','center',600);text(`+${settings.growth}% PER HIT`,363,baseY,12,'#48564e','center',600);
    }
    if(mode!=='race'){text(sim.done?sim.result:`${sim.time.toFixed(1)} s`,270,vertical?811:470,sim.done?16:13,sim.done?color:'#5e665f','center',sim.done?600:400);}
    if($('branding').value==='yes') text('CODETROOPER',270,vertical?902:529,10,'#5e665f','center',600);
  }
  function drawCircle(){
    ctx.lineWidth=3;
    if(mode==='rings'){
      sim.rings.forEach((ring,i)=>{if(ring.gone)return;ctx.strokeStyle=i%2===0?'#385e50':'#87968a';const gap=settings.gap*Math.PI/180;ctx.beginPath();ctx.arc(sim.cx,sim.cy,ring.r,ring.angle+gap/2,ring.angle+Math.PI*2-gap/2);ctx.stroke();});
    }else{ctx.strokeStyle='#385e50';ctx.beginPath();ctx.arc(sim.cx,sim.cy,sim.radius,0,Math.PI*2);ctx.stroke();}
    paintBall(sim.balls[0],color);
  }
  function paintBall(b,fill){if(trails) b.trail.forEach((p,i)=>{ctx.globalAlpha=(i/b.trail.length)*.17;circle(p.x,p.y,p.r,fill);});ctx.globalAlpha=1;circle(b.x,b.y,b.r,fill);}
  function drawRace(){
    ctx.strokeStyle='#8c988f';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(46,sim.top-45);ctx.lineTo(46,sim.bottom);ctx.moveTo(494,sim.top-45);ctx.lineTo(494,sim.bottom);ctx.stroke();
    sim.pegs.forEach(p=>circle(p.x,p.y,p.r,'#96a093'));
    for(let i=0;i<32;i++){ctx.fillStyle=i%2?'#969f94':'#385e50';ctx.fillRect(46+i*14,sim.bottom,14,5);}
    sim.balls.forEach(b=>{if(!b.finished){paintBall(b,b.color);text(String(b.id+1),b.x,b.y+3,9,'#f5f4ef','center',600);if(b.id===pick){ctx.strokeStyle=b.color;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(b.x,b.y,b.r+4,0,Math.PI*2);ctx.stroke();}}});
    const vertical=height>540;
    if(sim.finishers.length){const winner=sim.finishers[0];text(names[winner]+' wins!',270,vertical?847:105,16,colors[winner],'center',600);
      sim.finishers.forEach((id,i)=>{const x=160+i*44;circle(x,vertical?879:493,10,colors[id]);text(String(i+1),x,vertical?883:497,10,'#eaece5','center',650);});
    }else{text('YOUR PICK: '+names[pick].toUpperCase()+'  ·  '+sim.time.toFixed(1)+' s',270,vertical?850:493,12,colors[pick],'center',600);}
  }
  function frame(now){
    const elapsed=Math.max(0,Math.min((now-last)/1000,.1));last=now;
    if(playing&&!sim.done){accumulator+=elapsed*speed;while(accumulator>=FIXED){sim.step(FIXED);accumulator-=FIXED;}if(sim.done)updatePlay();}
    draw();
    if(recording){const remaining=Math.max(0,recordLength-(performance.now()-recordStarted)/1000);$('record').textContent='Stop recording · '+Math.ceil(remaining)+'s';$('record-note').textContent='Recording… keep this tab visible. '+Math.floor((performance.now()-recordStarted)/1000)+' / '+recordLength+' seconds';if(sim.done){if(recordDoneAt===null)recordDoneAt=now;if(now-recordDoneAt>1500)stopRecording();}}
    requestAnimationFrame(frame);
  }
  function lockSettings(locked){document.querySelectorAll('.experiments button,.controls input,.controls select,.controls button:not(#record),#play,#restart,#shuffle').forEach(e=>e.disabled=locked);}
  function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);}
  function filename(ext){return `codetrooper-${mode}-seed-${settings.seed}.${ext}`;}
  function stopRecording(){if(recorder&&recorder.state==='recording'){clearTimeout(recordTimer);recorder.stop();}}
  async function startRecording(){
    if(recording){stopRecording();return;}
    if(!canvas.captureStream||!window.MediaRecorder){toast('Video recording is unavailable here. Try Chrome or Edge.');return;}
    const supported=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm','video/mp4'].find(type=>MediaRecorder.isTypeSupported(type));
    if(!supported){toast('This browser cannot encode canvas video. Try Chrome or Edge.');return;}
    let chunks=[];
    try {
      recordStream=canvas.captureStream(60);recorder=new MediaRecorder(recordStream,{mimeType:supported,videoBitsPerSecond:8000000});
      recorder.ondataavailable=event=>{if(event.data.size)chunks.push(event.data);};
      const clipName=filename(supported.includes('mp4')?'mp4':'webm');
      recorder.onstop=()=>{
        const clip=new Blob(chunks,{type:recorder.mimeType});recordStream?.getTracks().forEach(t=>t.stop());recordStream=null;recording=false;clearTimeout(recordTimer);lockSettings(false);playing=false;
        $('record').classList.remove('recording-active');$('record').innerHTML='<span class="record-dot"></span> Record from start';
        if(clip.size){if(downloadURL)URL.revokeObjectURL(downloadURL);downloadURL=URL.createObjectURL(clip);$('download').href=downloadURL;$('download').download=clipName;$('download').hidden=false;$('record-note').textContent='Clip ready. Download it above. '+(supported.includes('webm')?'WebM video; convert to MP4 in your editor if needed.':'MP4 video.');toast('Clip ready to download.');}else{$('record-note').textContent='No video was captured. Try Chrome or Edge.';}
        updatePlay();
      };
      recorder.onerror=()=>{toast('Recording failed. Try Chrome or Edge.');stopRecording();};
      playing=true;reset();recording=true;recordDoneAt=null;recordLength=Number($('duration').value);recordStarted=performance.now();lockSettings(true);$('download').hidden=true;$('record').classList.add('recording-active');recorder.start(1000);recordTimer=setTimeout(stopRecording,recordLength*1000);updatePlay();
    }catch(error){recordStream?.getTracks().forEach(t=>t.stop());recordStream=null;recording=false;lockSettings(false);$('record').classList.remove('recording-active');$('record').innerHTML='<span class="record-dot"></span> Record from start';updatePlay();toast('Could not start recording. Try Chrome or Edge.');console.error(error);}
  }
  document.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>{mode=button.dataset.mode;document.querySelectorAll('[data-mode]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});showControls();reset();moveIndicator();if(window.Motion&&!reducedMotion.matches) Motion.animate('#mode-controls',{opacity:[0,1],y:[6,0]},{duration:.22,ease:'easeOut'});}));
  $('play').addEventListener('click',()=>{if(sim.done){playing=true;reset();}else{playing=!playing;updatePlay();}});
  $('restart').addEventListener('click',()=>reset());
  $('shuffle').addEventListener('click',()=>{settings.seed=crypto.getRandomValues(new Uint32Array(1))[0]%999999+1;$('seed').value=settings.seed;reset();});
  $('seed').addEventListener('change',()=>{settings.seed=Math.max(1,Math.min(999999,Math.round(Number($('seed').value)||42)));$('seed').value=settings.seed;reset();});
  $('speed').addEventListener('input',()=>{speed=Number($('speed').value);$('speed-value').value=speed+'×';});
  $('trails').addEventListener('change',()=>{trails=$('trails').checked;});
  $('aspect').addEventListener('change',()=>{height=$('aspect').value==='square'?540:960;canvas.height=height*2;$('resolution').textContent='1080 × '+height*2;reset();});
  document.querySelectorAll('[data-color]').forEach(button=>button.addEventListener('click',()=>{color=button.dataset.color;document.querySelectorAll('[data-color]').forEach(b=>{b.classList.toggle('selected',b===button);b.setAttribute('aria-pressed',String(b===button));});}));
  $('snapshot').addEventListener('click',()=>{draw();canvas.toBlob(blob=>{if(blob)download(blob,filename('png'));},'image/png');});
  $('record').addEventListener('click',startRecording);
  $('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if($('canvas-well').requestFullscreen)await $('canvas-well').requestFullscreen();else toast('Fullscreen is unavailable in this browser.');}catch{toast('Fullscreen is unavailable in this browser.');}});
  document.addEventListener('keydown',event=>{if(['INPUT','SELECT','TEXTAREA','BUTTON','A'].includes(document.activeElement.tagName)||recording||event.ctrlKey||event.metaKey||event.altKey)return;if(event.code==='Space'){event.preventDefault();$('play').click();}if(event.key.toLowerCase()==='r')reset();});
  document.addEventListener('visibilitychange',()=>{last=performance.now();if(document.hidden){if(recording){stopRecording();$('record-note').textContent='Recording stopped because the tab was hidden.';}playing=false;updatePlay();}});
  showControls();reset();requestAnimationFrame(frame);moveIndicator(true);
  new ResizeObserver(()=>moveIndicator(true)).observe(document.querySelector('.experiments'));
  if(window.Motion&&!reducedMotion.matches){
    Motion.animate('.intro h1',{opacity:[0,1],y:[16,0]},{duration:.65,ease:[.22,1,.36,1]});
    Motion.inView('.notes',element=>{Motion.animate(element,{opacity:[.3,1],y:[16,0]},{duration:.5});},{amount:.15});
  }

  function moveIndicator(immediate=false){
    const active=document.querySelector('.experiment.active'), indicator=$('tab-indicator');
    const target={x:active.offsetLeft,width:active.offsetWidth};
    if(window.Motion&&!reducedMotion.matches&&!immediate){indicatorAnimation?.stop();indicatorAnimation=Motion.animate(indicator,target,{type:'spring',stiffness:380,damping:36});}
    else{indicator.style.transform=`translateX(${target.x}px)`;indicator.style.width=target.width+'px';}
  }
})();
