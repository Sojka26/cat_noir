/* Laser Cat with Sprites v2 */
"use strict";

const W = innerWidth, H = innerHeight;
const canvas = document.getElementById("game");
const g = canvas.getContext("2d");
canvas.width = W; canvas.height = H;
g.imageSmoothingEnabled = false;

const SPR = {};
const names = ["cat","dog","nail","hand","bowl"];
let loaded = 0;
for (const n of names){
  const img = new Image();
  img.onload = ()=>{ loaded++; };
  img.src = "assets/"+n+".png";
  SPR[n]=img;
}

const keys = {}; let mouseDown = false;
onkeydown = e => keys[e.key] = true;
onkeyup   = e => keys[e.key] = false;
onmousedown = () => mouseDown = true;
onmouseup   = () => mouseDown = false;

let t = 0, gameOver = false, score = 0, best = 0;
const cat = { x:96, y:H/2, vy:0, cooldown:0, eye:10, shield:0 };
const lasers = [], dogs = [], nails = [];

function reset(){
  t=0; score=0; gameOver=false;
  lasers.length = dogs.length = nails.length = 0;
  cat.x=96; cat.y=H/2; cat.vy=0; cat.cooldown=0; cat.eye=10; cat.shield=0;
}

function spawnDog(){
  dogs.push({
    x: W+40,
    y: 40 + Math.random()*(H-80),
    v: 3 + Math.random()*2,
    hp: 3,
    barkDelay: 60,
    wiggle: Math.random()*Math.PI*2
  });
}

function fire(){
  lasers.push({x:cat.x+22,y:cat.y-cat.eye,dx:10,dy:0,power:cat.shield>0?2:1});
  lasers.push({x:cat.x+22,y:cat.y+cat.eye,dx:10,dy:0,power:cat.shield>0?2:1});
}

reset();

function drawCentered(img,x,y,w,h){
  g.drawImage(img, Math.floor(x-w/2), Math.floor(y-h/2), Math.floor(w), Math.floor(h));
}

function loop(){
  requestAnimationFrame(loop);
  if(loaded < names.length){
    g.fillStyle="#000"; g.fillRect(0,0,W,H);
    g.fillStyle="#fff"; g.font="16px system-ui,Arial"; g.textAlign="center";
    g.fillText("Načítám sprity… ("+loaded+"/"+names.length+")", W/2, H/2);
    return;
  }
  if(gameOver){
    g.fillStyle="#0008"; g.fillRect(0,0,W,H);
    g.fillStyle="#fff"; g.textAlign="center";
    g.font="bold 48px system-ui,Arial"; g.fillText("GAME OVER", W/2, H/2-10);
    g.font="24px system-ui,Arial"; g.fillText("Press [R] to restart", W/2, H/2+30);
    if(keys.r || keys.R) reset();
    return;
  }

  t++;
  if(t%50===0 && dogs.length<8) spawnDog();

  cat.vy += (keys.ArrowDown||keys.s?1:0) - (keys.ArrowUp||keys.w?1:0);
  cat.y  += cat.vy*6;
  cat.vy *= 0.85;
  cat.y   = Math.max(34, Math.min(H-34, cat.y));

  if(keys[" "] && cat.cooldown<=0){ fire(); cat.cooldown = 6 - (cat.shield>0?3:0); }
  cat.cooldown--;

  if(mouseDown || keys.e || keys.E){ cat.shield = Math.min(cat.shield+2, 180); }
  if(cat.shield>0) cat.shield--;

  g.fillStyle="#000"; g.fillRect(0,0,W,H);

  // Sidebar with hint + sprites
  g.fillStyle="#111"; g.fillRect(0,0,140,H);
  g.fillStyle="#222"; for(let i=0;i<H;i+=24) g.fillRect(0,i,140,12);
  g.fillStyle="#fff"; g.font="14px system-ui,Arial"; g.textAlign="left";
  g.fillText("Hlaď mě: klik/E",8,18);
  // Hand moves left-right when petting
  let handX = 12;
  if(mouseDown || keys.e || keys.E){
    handX = 12 + Math.sin(t*0.2) * 20;
  }
  if(SPR.hand.width) g.drawImage(SPR.hand, handX, 28, 48, 64);
  if(SPR.bowl.width) g.drawImage(SPR.bowl, 12, H-84, 96, 64);

  // Cat
  drawCentered(SPR.cat, cat.x, cat.y, 64, 64);

  // Shield aura
  if(cat.shield>0){
    g.save();
    g.translate(cat.x,cat.y);
    g.strokeStyle = cat.shield%10<5? "#6ff":"#cff";
    g.lineWidth = 3; g.beginPath();
    for(let i=0;i<18;i++){
      const a = i/18*6.283 + Math.sin((t+i)*0.3)*0.15;
      const r = 44 + Math.sin((t+i*3)*0.7)*6;
      g.lineTo(Math.cos(a)*r, Math.sin(a)*r);
    }
    g.closePath(); g.stroke();
    g.restore();
  }

  // Lasers
  g.fillStyle="#9cf";
  for(let i=lasers.length;i--;){
    const p=lasers[i]; p.x+=p.dx; p.y+=p.dy; if(p.x>W) lasers.splice(i,1);
    g.fillRect(p.x, p.y-1, 16, 2);
  }

  // Dogs
  for(let i=dogs.length;i--;){
    const e=dogs[i];
    e.x -= e.v;
    e.y += Math.sin((t+e.wiggle)*0.1)*1.5;
    if(--e.barkDelay<=0){
      nails.push({x:e.x-28,y:e.y+(Math.random()*.6-.3)*20,dx:-8,dy:(Math.random()-.5)*1.5});
      e.barkDelay=60;
    }
    for(let j=lasers.length;j--;){
      const p=lasers[j], dx=e.x-p.x, dy=e.y-p.y;
      if(dx*dx+dy*dy<28*28){ e.hp -= p.power; lasers.splice(j,1); }
    }
    if(e.hp<=0){ dogs.splice(i,1); score+=5; continue; }
    if(e.x<-60){ dogs.splice(i,1); continue; }
    drawCentered(SPR.dog, e.x, e.y, 64, 48);
  }

  // Nails
  for(let i=nails.length;i--;){
    const n=nails[i]; n.x+=n.dx; n.y+=n.dy;
    if(n.x<0) { nails.splice(i,1); continue; }
    const dx=n.x-cat.x, dy=n.y-cat.y;
    if(dx*dx+dy*dy < (cat.shield>0?46*46:28*28)){
      if(cat.shield>0){ nails.splice(i,1); score++; }
      else { gameOver=true; best=Math.max(best,score); }
    }
  }
  // Draw nails rotated to face right
  nails.forEach(n=>{
    g.save();
    g.translate(n.x, n.y);
    g.rotate(0); // facing right
    g.drawImage(SPR.nail, -10, -10, 20, 20);
    g.restore();
  });

  // HUD
  g.fillStyle="#fff"; g.font="16px system-ui,Arial"; g.textAlign="left";
  g.fillText("Score: "+score,152,22); g.fillText("Best: "+best,152,42);
  g.globalAlpha=.6;
  g.fillText("↑/↓ pohyb • Space střelba • Klik/E: hladit (štít)",152,H-16);
  g.globalAlpha=1;
}

requestAnimationFrame(loop);
