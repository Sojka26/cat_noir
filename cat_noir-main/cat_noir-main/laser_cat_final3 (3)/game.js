/* Laser Cat with Sprites v2 */
"use strict";

// Game initialization
const canvas = document.getElementById("game");
const g = canvas.getContext("2d", { alpha: false });
const loadingElement = document.getElementById("loading");
const gameOverElement = document.getElementById("game-over");

// Set initial canvas size
let W = innerWidth, H = innerHeight;
function resizeCanvas() {
    W = innerWidth;
    H = innerHeight;
    canvas.width = W;
    canvas.height = H;
    g.imageSmoothingEnabled = false;
    g.webkitImageSmoothingEnabled = false;
    g.mozImageSmoothingEnabled = false;
    g.msImageSmoothingEnabled = false;
}
resizeCanvas();

window.onresize = () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  g.imageSmoothingEnabled = false;
  g.webkitImageSmoothingEnabled = false;
  g.mozImageSmoothingEnabled = false;
  g.msImageSmoothingEnabled = false;
};

const SPR = {};
const names = ["cat","dog","nail","hand","bowl"];
let loaded = 0;

function loadImage(name) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Create an offscreen canvas for high-quality scaling
      const offscreen = document.createElement('canvas');
      const ctx = offscreen.getContext('2d', { alpha: true });
      
      // Set canvas to image dimensions
      offscreen.width = img.width;
      offscreen.height = img.height;
      
      // Configure for best pixel art rendering
      ctx.imageSmoothingEnabled = false;
      ctx.webkitImageSmoothingEnabled = false;
      ctx.mozImageSmoothingEnabled = false;
      ctx.msImageSmoothingEnabled = false;
      
      // Draw the image to offscreen canvas
      ctx.drawImage(img, 0, 0);
      
      // Store the optimized canvas
      SPR[name] = { 
        img: img,
        canvas: offscreen,
        width: img.width,
        height: img.height
      };
      loaded++;
      resolve();
    };
    img.onerror = (err) => {
      console.error('Error loading sprite:', name, err);
      reject(err);
    };
    // Disable browser's image smoothing
    img.style.imageRendering = 'pixelated';
    img.src = "assets/"+name+".png";
  });
}

// Load all images in parallel
Promise.all(names.map(loadImage)).catch(err => {
  console.error('Failed to load some sprites:', err);
});

// Event handlers
const keys = {}; let mouseDown = false;
window.onkeydown = e => keys[e.key] = true;
window.onkeyup   = e => keys[e.key] = false;
window.onmousedown = () => mouseDown = true;
window.onmouseup   = () => mouseDown = false;
window.onresize = () => {
    resizeCanvas();
    // Adjust cat position if needed
    cat.y = Math.max(34, Math.min(H-34, cat.y));
};

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

function drawCentered(sprite,x,y,w,h){
  const scale = 2;  // Increased scale for better visibility
  x = Math.floor(x - (w * scale) / 2);
  y = Math.floor(y - (h * scale) / 2);
  w = Math.floor(w * scale);
  h = Math.floor(h * scale);
  
  // Use the optimized canvas if available
  if (sprite.canvas) {
    g.drawImage(sprite.canvas, x, y, w, h);
  } else {
    g.drawImage(sprite.img || sprite, x, y, w, h);
  }
}

function loop(){
  requestAnimationFrame(loop);
  if(loaded < names.length){
    loadingElement.textContent = `Loading... ${loaded}/${names.length}`;
    return;
  } else {
    loadingElement.classList.add('hidden');
  }
  
  if(gameOver){
    gameOverElement.classList.remove('hidden');
    if(keys.r || keys.R) {
      reset();
      gameOverElement.classList.add('hidden');
    }
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
  g.fillText("Pet me: click/E",8,18);
  // Hand moves left-right when petting
  let handX = 12;
  if(mouseDown || keys.e || keys.E){
    handX = 12 + Math.sin(t*0.2) * 20;
  }
  if(SPR.hand && SPR.hand.width) drawCentered(SPR.hand, handX + 24, 60, 48, 64);
  if(SPR.bowl && SPR.bowl.width) drawCentered(SPR.bowl, 60, H-52, 96, 64);

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
    g.rotate(Math.atan2(n.dy, n.dx)); // rotate based on movement direction
    drawCentered(SPR.nail, 0, 0, 20, 20);
    g.restore();
  });

  // HUD
  g.fillStyle="#fff"; g.font="16px system-ui,Arial"; g.textAlign="left";
  g.fillText("Score: "+score,152,22); g.fillText("Best: "+best,152,42);
  g.globalAlpha=.6;
  g.fillText("↑/↓ move • Space shoot • Click/E: pet (shield)",152,H-16);
  g.globalAlpha=1;
}

requestAnimationFrame(loop);
