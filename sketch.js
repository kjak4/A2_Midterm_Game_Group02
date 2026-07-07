// ─────────────────────────────────────────────────────────
//  THROUGH THE TREES — Tutorial Level
// ─────────────────────────────────────────────────────────

let imgSky, imgBgTrees, imgBushes, imgGround, imgFgTrees;
let imgSprites, imgLog, imgRock, imgRacoon, imgRabbit;

const NUM_FRAMES = 5;
const ANIM_SPEED = 7;

let charX, charY;
let velY       = 0;
let onGround   = false;
let animFrame  = 0;
let animTimer  = 0;
let facingLeft = false;
let isMoving   = false;

const GRAVITY    = 0.65;
const JUMP_FORCE = -18;
const WALK_SPEED = 4;

let worldX      = 0;
const LEVEL_END = 8500;
let gameWon     = false;
let gameLost    = false;

// ── HP & damage ───────────────────────────────────────────
let hp           = 3;
const MAX_HP     = 3;
let invTimer     = 0;
const INV_FRAMES = 80;

// ── Timer ─────────────────────────────────────────────────
let levelTimer      = 0;
const TIME_LIMIT    = 90 * 60; // 90 seconds

// ── Intro ─────────────────────────────────────────────────
let introTimer = 140;

// ── Flip mechanic ─────────────────────────────────────────
// Flip 1 (700): open space — safe learning
// Flip 2 (5200): fires just before the log platforms — required to navigate them
const FLIP_AT       = [700, 5200];
let   flipIndex     = 0;
let   flipped       = false;
let   flipTimer     = 0;
const FLIP_DURATION = 320; // long enough to cover the whole platform section
let   countdown     = 0;
let   countdownTimer = 0;
const COUNTDOWN_FRAMES = 55;

// ── Ground obstacles (jump over) ──────────────────────────
const LOGS  = [{ wx:2200 }, { wx:3600 }, { wx:4800 }];
const ROCKS = [{ wx:1500 }, { wx:2900 }, { wx:4200 }];

// ── Animals ───────────────────────────────────────────────
let animals = [
  { wx:2600, type:'rabbit', dir: 1, range:110, speed:2.0, frame:0, ft:0 },
  { wx:4000, type:'racoon', dir: 1, range: 90, speed:1.5, frame:0, ft:0 },
];
animals.forEach(a => a.startWx = a.wx);

// ── Log platforms (near end, over the pit) ────────────────
// The pit runs from PIT_START to PIT_END.
// Three log platforms float above it at staggered heights.
// Flip 2 fires just before the pit — when flipped, the player
// must press the key that FEELS wrong to keep moving forward.
// Without the flip mechanic the player could just walk straight through.
const PIT_START  = 5600;
const PIT_END    = 6400; // ends well before last platform (wx 6550)

// Platforms: { wx, wy_offset } — wy_offset above groundY
// Player jumps up to first, across second, down to third, then exits
const PLATFORMS = [
  { wx: 5650, wyOff: 0.20 },  // first platform — low, easy jump up
  { wx: 5950, wyOff: 0.28 },  // second — higher, one more jump
  { wx: 6250, wyOff: 0.20 },  // third — back down
  { wx: 6550, wyOff: 0.12 },  // fourth — almost ground level, exit
];
const PLAT_W = 160; // platform display width
const PLAT_H = 28;  // platform display height

// ── Helpers ───────────────────────────────────────────────
function groundH() { return height * 0.44; }
function groundY() { return height - groundH() * 0.5; }
function toScreen(worldPos) { return worldPos - worldX + charX - width * 0.25; }
function platY(p) { return groundY() - groundY() * p.wyOff; }

// ─────────────────────────────────────────────────────────
function preload() {
  imgSky     = loadImage('assets/images/Asset 12.png');
  imgBgTrees = loadImage('assets/images/Asset 11.png');
  imgBushes  = loadImage('assets/images/Asset 9.png');
  imgGround  = loadImage('assets/images/Asset 10.png');
  imgFgTrees = loadImage('assets/images/Asset 8.png');
  imgSprites = loadImage('assets/images/sprites2.png');
  imgLog     = loadImage('assets/images/log.png');
  imgRock    = loadImage('assets/images/rock.png');
  imgRacoon  = loadImage('assets/images/racoon.png');
  imgRabbit  = loadImage('assets/images/rabbit.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CORNER);
  charX = width * 0.25;
  charY = groundY();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (onGround) charY = groundY();
}

// ─────────────────────────────────────────────────────────
function draw() {
  if (gameWon)  { drawWinScreen();  return; }
  if (gameLost) { drawLoseScreen(); return; }

  if (introTimer > 0) {
    introTimer--;
    drawBG(); drawStartSign(); drawChar(); drawFG(); drawIntroOverlay();
    return;
  }

  // ── Input ───────────────────────────────────────────────
  isMoving = false;
  let goLeft  = flipped ? (keyIsDown(68)||keyIsDown(39)) : (keyIsDown(65)||keyIsDown(37));
  let goRight = flipped ? (keyIsDown(65)||keyIsDown(37)) : (keyIsDown(68)||keyIsDown(39));
  if (goLeft)  { worldX -= WALK_SPEED; if (worldX<0) worldX=0; facingLeft=true;  isMoving=true; }
  if (goRight) { worldX += WALK_SPEED; facingLeft=false; isMoving=true; }
  if ((keyIsDown(32)||keyIsDown(87)||keyIsDown(38)) && onGround) { velY=JUMP_FORCE; onGround=false; }

  // ── Animate ─────────────────────────────────────────────
  if (isMoving) {
    animTimer++;
    if (animTimer>=ANIM_SPEED) { animTimer=0; animFrame=(animFrame+1)%NUM_FRAMES; }
  } else { animFrame=0; animTimer=0; }

  // ── Physics ─────────────────────────────────────────────
  velY  += GRAVITY;
  charY += velY;
  let gy = groundY();

  // Platform landing
  onGround = false;
  for (let p of PLATFORMS) {
    let psx = toScreen(p.wx);
    let py  = platY(p);
    let prevFeet = charY - velY;
    // Land on top of platform if falling and feet cross the top
    if (charX > psx - 10 && charX < psx + PLAT_W + 10) {
      if (prevFeet <= py && charY >= py && velY > 0) {
        charY = py; velY = 0; onGround = true;
      }
    }
  }
  // Ground landing
  if (charY >= gy) { charY=gy; velY=0; onGround=true; }

  // ── Flip ────────────────────────────────────────────────
  updateFlip();

  // ── Animals ─────────────────────────────────────────────
  for (let a of animals) {
    a.wx += a.dir * a.speed;
    if (a.wx > a.startWx+a.range || a.wx < a.startWx-a.range) a.dir *= -1;
    a.ft++; if (a.ft>=8) { a.ft=0; a.frame=(a.frame+1)%2; }
  }

  // ── Win / timer / damage ─────────────────────────────────
  if (worldX >= LEVEL_END) { gameWon=true; return; }
  levelTimer++;
  if (levelTimer >= TIME_LIMIT) { gameLost=true; return; }
  if (invTimer > 0) invTimer--;
  else checkDamage();

  // ── Draw ────────────────────────────────────────────────
  drawBG();
  drawStartSign();
  drawPit();
  drawPlatforms();
  drawObstacles();
  drawAnimals();
  drawFinishSign();
  drawChar();
  drawFG();
  drawHUD();
  drawFlipHUD();
}

// ─────────────────────────────────────────────────────────
//  FLIP UPDATE
// ─────────────────────────────────────────────────────────
function updateFlip() {
  if (flipped) { flipTimer--; if (flipTimer<=0) flipped=false; return; }
  if (flipIndex >= FLIP_AT.length) return;
  let trigger   = FLIP_AT[flipIndex];
  let warnStart = trigger - WALK_SPEED * COUNTDOWN_FRAMES * 3;
  if (worldX >= trigger) { flipped=true; flipTimer=FLIP_DURATION; countdown=0; flipIndex++; return; }
  if (worldX >= warnStart) {
    let elapsed = worldX - warnStart;
    let step    = WALK_SPEED * COUNTDOWN_FRAMES;
    countdown = elapsed < step ? 3 : elapsed < step*2 ? 2 : 1;
  } else { countdown=0; }
}

// ─────────────────────────────────────────────────────────
function tileLayer(img, destH, destY, scrollAmt) {
  if (!img) return;
  let scale=destH/img.height, tileW=img.width*scale;
  let offset=((scrollAmt*scale)%tileW+tileW)%tileW;
  let n=ceil(width/tileW)+2;
  for (let i=-1;i<n;i++) image(img,i*tileW-offset,destY,tileW,destH);
}

function drawBG() {
  let bgScroll = min(worldX, LEVEL_END - 800);
  image(imgSky, 0, 0, width, height);
  tileLayer(imgBgTrees, height, 0, bgScroll * 0.12);
  let bushH = height*0.30;
  tileLayer(imgBushes, bushH, height-bushH-groundH()*0.50, bgScroll*0.04);
  tileLayer(imgGround, groundH(), height-groundH(), worldX*0.45);
}

function drawFG() { tileLayer(imgFgTrees, height, 0, worldX*1.15); }

// ─────────────────────────────────────────────────────────
//  PIT OF SHARP STICKS
// ─────────────────────────────────────────────────────────
function drawPit() {
  let gy   = groundY();
  let psx  = toScreen(PIT_START);
  let pex  = toScreen(PIT_END);
  let pitW = pex - psx;
  if (pex < -10 || psx > width+10) return;

  // Dark void
  noStroke(); fill(14, 9, 6);
  rect(psx, gy, pitW, height - gy);

  // Dirt edge shadows
  fill(38, 22, 10);
  rect(psx-6, gy, 10, height*0.14);
  rect(pex-4, gy, 10, height*0.14);

  // Sharp sticks — pointy triangles in the pit
  let stickCount = floor(pitW / 28);
  for (let i = 0; i < stickCount; i++) {
    let sx   = psx + 14 + i * 28;
    let sh   = height * (0.06 + (i%3)*0.025);
    let stickTop = gy + height*0.015;

    // Stick shaft
    fill(72, 48, 22);
    rect(sx - 3, stickTop + sh*0.3, 6, sh*0.7);

    // Sharp tip — triangle
    fill(95, 65, 28);
    triangle(sx, stickTop, sx-6, stickTop+sh*0.35, sx+6, stickTop+sh*0.35);

    // Highlight on tip
    fill(120, 85, 38, 180);
    triangle(sx, stickTop+2, sx-2, stickTop+sh*0.18, sx+2, stickTop+sh*0.18);
  }

  // Danger marks before the pit
  noStroke(); fill(155, 115, 45, 180);
  textAlign(CENTER, CENTER); textFont('monospace'); textStyle(BOLD);
  textSize(height*0.020);
  text('!', psx - 25, gy - height*0.06);
  text('!', psx - 48, gy - height*0.06);
  textStyle(NORMAL);
}

// ─────────────────────────────────────────────────────────
//  LOG PLATFORMS
//  Uses the log image as platform surface.
//  Flip 2 fires just before these — controls are reversed
//  when the player arrives. They must consciously adapt
//  or they walk AWAY from each platform instead of onto it.
// ─────────────────────────────────────────────────────────
function drawPlatforms() {
  imageMode(CORNER);
  for (let p of PLATFORMS) {
    let sx = toScreen(p.wx);
    let py = platY(p);
    if (sx < -PLAT_W-20 || sx > width+20) continue;

    // Support post down to ground
    noStroke(); fill(52, 35, 14);
    rect(sx + PLAT_W*0.2, py, 10, groundY() - py);
    rect(sx + PLAT_W*0.7, py, 10, groundY() - py);

    // Log surface — use log image, taller crop so it doesn't look cut off
    image(imgLog, sx, py - PLAT_H, PLAT_W, PLAT_H, 258, 46, 139, 88);

    // Moss on top
    noStroke(); fill(55, 95, 42, 160);
    rect(sx+4, py - PLAT_H - 4, PLAT_W-8, 7, 3);
  }
  imageMode(CENTER);
}

// ─────────────────────────────────────────────────────────
//  GROUND OBSTACLES
// ─────────────────────────────────────────────────────────
function drawObstacles() {
  let gy=groundY();
  let logH=height*0.10, logW=logH*(139/88);
  let rockH=height*0.08, rockW=rockH*(117/66);
  imageMode(CORNER);
  for (let o of LOGS) {
    let sx=toScreen(o.wx);
    if (sx<-200||sx>width+200) continue;
    image(imgLog,sx,gy-logH,logW,logH,258,46,139,88);
  }
  for (let o of ROCKS) {
    let sx=toScreen(o.wx);
    if (sx<-200||sx>width+200) continue;
    image(imgRock,sx,gy-rockH,rockW,rockH,115,56,117,66);
  }
}

// ─────────────────────────────────────────────────────────
//  ANIMALS
// ─────────────────────────────────────────────────────────
function drawAnimals() {
  let gy=groundY();
  imageMode(CORNER);
  for (let a of animals) {
    let sx=toScreen(a.wx);
    if (sx<-200||sx>width+200) continue;
    if (a.type==='racoon') {
      let dh=height*0.09, dw=dh*(74/72), srcX=18+a.frame*74;
      if (a.dir<0) { push(); translate(sx+dw,gy-dh); scale(-1,1); image(imgRacoon,0,0,dw,dh,srcX,288,74,72); pop(); }
      else         { image(imgRacoon,sx,gy-dh,dw,dh,srcX,288,74,72); }
    } else {
      let dh=height*0.08, dw=dh*(95/80), srcX=a.frame*95;
      if (a.dir<0) { push(); translate(sx+dw,gy-dh); scale(-1,1); image(imgRabbit,0,0,dw,dh,srcX,80,95,80); pop(); }
      else         { image(imgRabbit,sx,gy-dh,dw,dh,srcX,80,95,80); }
    }
  }
}

// ─────────────────────────────────────────────────────────
//  START SIGN
// ─────────────────────────────────────────────────────────
function drawStartSign() {
  let sx=toScreen(120), gy=groundY();
  if (sx<-300||sx>width+300) return;
  noStroke(); fill(75,50,22);
  rect(sx+8, gy-height*0.26, 8, height*0.26);
  fill(210,178,118);
  rect(sx-30, gy-height*0.30, 100, height*0.11, 5);
  stroke(148,105,52); strokeWeight(2); noFill();
  rect(sx-26, gy-height*0.296, 92, height*0.102, 3);
  noStroke(); fill(58,35,10);
  textAlign(CENTER,CENTER); textFont('Georgia'); textStyle(BOLD);
  textSize(height*0.022); text('this way', sx+20, gy-height*0.272);
  textSize(height*0.030); text('→', sx+20, gy-height*0.248);
  textStyle(NORMAL);
  noStroke(); fill(220,150,170); ellipse(sx-16, gy-height*0.265, 8, 8);
  fill(255,215,70); ellipse(sx-16, gy-height*0.265, 3, 3);
}

// ─────────────────────────────────────────────────────────
//  FINISH SIGN
// ─────────────────────────────────────────────────────────
function drawFinishSign() {
  let sx=toScreen(LEVEL_END-150), gy=groundY();
  if (sx<-300||sx>width+300) return;
  noStroke(); fill(75,50,22);
  rect(sx+48, gy-height*0.28, 10, height*0.28);
  fill(215,182,122); rect(sx, gy-height*0.30, 116, height*0.10, 6);
  stroke(148,105,52); strokeWeight(2); noFill();
  rect(sx+4, gy-height*0.296, 108, height*0.092, 4);
  noStroke();
  for (let [fx,fy] of [[sx+14,gy-height*0.275],[sx+102,gy-height*0.275]]) {
    fill(230,150,172); ellipse(fx,fy,10,10);
    fill(255,215,70);  ellipse(fx,fy, 4, 4);
  }
  noStroke(); fill(58,35,10);
  textAlign(CENTER,CENTER); textFont('Georgia'); textStyle(BOLD);
  textSize(height*0.026); text('next level', sx+58, gy-height*0.252);
  textStyle(NORMAL);
}

// ─────────────────────────────────────────────────────────
//  PLAYER
// ─────────────────────────────────────────────────────────
function drawChar() {
  let dispH=height*0.20, dispW=dispH*(119/135);
  let drawX=charX-dispW/2, drawY=charY-dispH;
  imageMode(CORNER);
  push();
  if (facingLeft) { translate(drawX+dispW,drawY); scale(-1,1); }
  else            { translate(drawX,drawY); }
  image(imgSprites,0,0,dispW,dispH,animFrame*119,0,119,135);
  pop();
}

// ─────────────────────────────────────────────────────────
//  DAMAGE CHECK
// ─────────────────────────────────────────────────────────
function checkDamage() {
  let gy = groundY();

  // Pit death — player falls into pit zone
  // worldX = how far camera has scrolled. Player world position = worldX + charX - (width*0.25)
  // charX is fixed at ~width*0.25 so worldPlayerX ≈ worldX
  let worldPlayerX = worldX;
  let inPitX = worldPlayerX + width*0.25 > PIT_START + 60 && worldPlayerX + width*0.25 < PIT_END - 60;
  let fallingIn = !onGround && charY > gy - height * 0.10 && velY > 2;
  if (inPitX && fallingIn) { gameLost = true; return; }

  // Only check ground obstacles when near ground
  if (charY < gy - height * 0.05) return;

  let pw=width*0.010, px1=charX-pw, px2=charX+pw;
  let logH=height*0.10, logW=logH*(139/88);
  let rockH=height*0.08, rockW=rockH*(117/66);

  for (let o of LOGS) {
    let sx=toScreen(o.wx);
    if (px2>sx+16&&px1<sx+logW-16) { takeDamage(); return; }
  }
  for (let o of ROCKS) {
    let sx=toScreen(o.wx);
    if (px2>sx+16&&px1<sx+rockW-16) { takeDamage(); return; }
  }
  for (let a of animals) {
    let sx=toScreen(a.wx);
    let dw=a.type==='racoon'?height*0.09*(74/72):height*0.08*(95/80);
    if (px2>sx+12&&px1<sx+dw-12) { takeDamage(); return; }
  }
}

function takeDamage() { hp--; invTimer=INV_FRAMES; if (hp<=0) { hp=0; gameLost=true; } }

// ─────────────────────────────────────────────────────────
//  HUD
// ─────────────────────────────────────────────────────────
function drawHUD() {
  let pad=width*0.018, hs=height*0.038;
  for (let i=0;i<MAX_HP;i++) drawPixelHeart(pad+i*(hs*1.4), pad, hs, i<hp);

  let timeLeft=max(0,TIME_LIMIT-levelTimer), pct=timeLeft/TIME_LIMIT;
  let barW=width*0.18, barH=height*0.018;
  let bx=width-barW-pad, by=pad;
  noStroke(); fill(20,30,18,180); rect(bx-2,by-2,barW+4,barH+4,3);
  let bc = pct>0.5 ? lerpColor(color(180,210,80),color(220,180,40),map(pct,1,0.5,0,1))
         : pct>0.2 ? lerpColor(color(220,180,40),color(210,80,40),map(pct,0.5,0.2,0,1))
         : color(210,60,40);
  fill(bc); rect(bx,by,barW*pct,barH,2);
  stroke(20,30,18,120); strokeWeight(1);
  for (let t=1;t<6;t++) { let tx=bx+barW*(t/6); line(tx,by,tx,by+barH); }
  noStroke();
  fill(190,215,160); textFont('monospace'); textStyle(BOLD); textSize(height*0.016);
  textAlign(RIGHT,TOP); text('TIME',width-pad,by+barH+3); textStyle(NORMAL);
}

function drawPixelHeart(x,y,s,full) {
  let p=s/4;
  let g=[[0,1,0,1,0],[1,1,1,1,1],[1,1,1,1,1],[0,1,1,1,0],[0,0,1,0,0]];
  noStroke();
  for (let r=0;r<5;r++) for (let c=0;c<5;c++) {
    if (!g[r][c]) continue;
    if (full) fill(r<2&&c<2?color(230,100,110):color(195,48,58));
    else fill(60,45,45);
    rect(x+c*p,y+r*p,p,p);
  }
  if (invTimer>0&&floor(invTimer/5)%2===0) {
    fill(255,255,255,160);
    for (let r=0;r<5;r++) for (let c=0;c<5;c++) if (g[r][c]) rect(x+c*p,y+r*p,p,p);
  }
}

// ─────────────────────────────────────────────────────────
//  FLIP HUD
// ─────────────────────────────────────────────────────────
function drawFlipHUD() {
  if (!flipped && countdown > 0) {
    noStroke(); fill(0,0,0,55); rect(0,0,width,height);
    let cx=width/2, cy=height/2;
    if (floor(frameCount/6)%2===0) { noFill(); stroke(200,220,180,140); strokeWeight(3); ellipse(cx,cy,height*0.38,height*0.38); noStroke(); }
    fill(20,35,18,180); ellipse(cx,cy,height*0.32,height*0.32);
    stroke(120,160,90,200); strokeWeight(2); noFill(); ellipse(cx,cy,height*0.32,height*0.32); noStroke();
    textAlign(CENTER,CENTER); textFont('Georgia'); textStyle(BOLD); textSize(height*0.14);
    fill(0,0,0,160); text(str(countdown),cx+3,cy+3);
    fill(210,230,185); text(str(countdown),cx,cy);
    textSize(height*0.024); textStyle(NORMAL);
    fill(0,0,0,140); text('controls changing',cx+2,cy+height*0.21+2);
    fill(190,215,165); text('controls changing',cx,cy+height*0.21);
  }

  if (flipped) {
    let cx=width/2, ty=height*0.38, msg='controls flipped';
    textFont('Georgia'); textStyle(BOLD); textSize(height*0.040);
    let tw=textWidth(msg), pw=tw+60, ph=height*0.072;
    let px=cx-pw/2, py=ty-ph/2;
    noStroke(); fill(0,0,0,100); rect(px+3,py+3,pw,ph,ph/2);
    fill(32,48,28,210); rect(px,py,pw,ph,ph/2);
    stroke(110,155,80,200); strokeWeight(2); noFill(); rect(px+3,py+3,pw-6,ph-6,ph/2); noStroke();
    fill(90,140,65,200); ellipse(px+14,ty,12,7); ellipse(px+pw-14,ty,12,7);
    textAlign(CENTER,CENTER);
    fill(0,0,0,160); text(msg,cx+2,ty+2);
    fill(210,235,175); text(msg,cx,ty);
    textStyle(NORMAL);

    // ── Flip ending soon warning ──────────────────────────
    // When 3 seconds left, show a small countdown pill below the label
    let timeLeft = flipTimer;
    if (timeLeft <= 180) {
      let endMsg   = timeLeft <= 60 ? '1' : timeLeft <= 120 ? '2' : '3';
      let warningAlpha = timeLeft <= 60 ? 255 : map(timeLeft, 180, 120, 100, 220);

      // Small pill below main label
      textFont('Georgia'); textStyle(BOLD); textSize(height*0.022);
      let ww=textWidth('controls returning')+ 40, wh=height*0.042;
      let wx2=cx-ww/2, wy=ty+ph/2+12;
      noStroke(); fill(0,0,0,80); rect(wx2+2,wy+2,ww,wh,wh/2);
      fill(80,55,28,warningAlpha); rect(wx2,wy,ww,wh,wh/2);
      stroke(180,140,60,warningAlpha); strokeWeight(1); noFill();
      rect(wx2+2,wy+2,ww-4,wh-4,wh/2); noStroke();
      textAlign(CENTER,CENTER); fill(235,200,130,warningAlpha);
      text('controls returning in ' + endMsg, cx, wy+wh/2);

      // Pulsing amber border when very close
      if (timeLeft <= 60 && floor(frameCount/6)%2===0) {
        noFill(); stroke(210,165,40,180); strokeWeight(5);
        rect(4,4,width-8,height-8); noStroke();
      }
      textStyle(NORMAL);
    }

    if (floor(frameCount/12)%2===0) { noFill(); stroke(110,155,80,80); strokeWeight(3); rect(4,4,width-8,height-8); noStroke(); }
  }
}

// ─────────────────────────────────────────────────────────
//  INTRO OVERLAY
// ─────────────────────────────────────────────────────────
function drawIntroOverlay() {
  let alpha=constrain(map(introTimer,140,60,0,220),0,220);
  noStroke(); fill(15,22,14,alpha); rect(0,0,width,height);
  if (introTimer>55) {
    let ta=constrain(map(introTimer,140,100,0,255),0,255);
    textAlign(CENTER,CENTER); textFont('Georgia');
    fill(0,0,0,ta*0.6); textStyle(NORMAL); textSize(height*0.022);
    text('Tutorial',width/2+2,height/2-height*0.06+2);
    textStyle(BOLD); textSize(height*0.058);
    text('Through the Trees',width/2+3,height/2+3);
    fill(175,210,155,ta); textStyle(NORMAL); textSize(height*0.022);
    text('Tutorial',width/2,height/2-height*0.06);
    textStyle(BOLD); textSize(height*0.058); fill(225,240,200,ta);
    text('Through the Trees',width/2,height/2);
    if (introTimer>80) {
      fill(150,185,130,ta*0.8); textStyle(NORMAL); textSize(height*0.020);
      text('use A / D to move    SPACE to jump',width/2,height/2+height*0.08);
    }
    textStyle(NORMAL);
  }
}

// ─────────────────────────────────────────────────────────
//  LOSE SCREEN
// ─────────────────────────────────────────────────────────
function drawLoseScreen() {
  drawBG(); drawFG();
  noStroke(); fill(10,18,10,195); rect(0,0,width,height);
  fill(28,38,24); stroke(80,110,60); strokeWeight(2);
  rectMode(CENTER); rect(width/2,height/2,min(width*0.5,560),210,10); rectMode(CORNER);
  stroke(60,90,45,140); strokeWeight(1); noFill();
  rectMode(CENTER); rect(width/2,height/2,min(width*0.5,560)-12,198,8); rectMode(CORNER);
  let cx=width/2, cy=height/2;
  noStroke(); fill(0,0,0,160);
  textAlign(CENTER,CENTER); textFont('Georgia'); textStyle(BOLD); textSize(height*0.052);
  text('lost in the forest',cx+2,cy-50+2);
  fill(195,215,165); text('lost in the forest',cx,cy-50);
  textStyle(NORMAL); textSize(height*0.022); fill(140,168,115);
  text('she never made it home.',cx,cy+2);
  textSize(height*0.018); fill(100,130,80);
  let reason = levelTimer>=TIME_LIMIT ? 'the forest swallowed the last of the light.' : 'the cold crept in.';
  text(reason,cx,cy+30);
  if (floor(frameCount/30)%2===0) { textSize(height*0.019); fill(160,190,130); text('press SPACE to try again',cx,cy+68); }
  textStyle(NORMAL);
}

// ─────────────────────────────────────────────────────────
//  WIN SCREEN
// ─────────────────────────────────────────────────────────
function drawWinScreen() {
  drawBG(); drawFG();
  noStroke(); fill(245,230,210,200); rect(0,0,width,height);
  fill(255,248,235); stroke(180,140,90); strokeWeight(3);
  rectMode(CENTER); rect(width/2,height/2,min(width*0.5,580),200,12); rectMode(CORNER);
  noStroke();
  let cx=width/2,cy=height/2,cw=min(width*0.5,580)/2;
  for (let [px,py] of [[cx-cw+30,cy-75],[cx+cw-30,cy-75],[cx-cw+30,cy+75],[cx+cw-30,cy+75]]) {
    fill(240,160,180); ellipse(px,py,14,14); fill(255,220,80); ellipse(px,py,6,6);
  }
  fill(90,55,20); textAlign(CENTER,CENTER); textFont('Georgia'); textStyle(BOLD);
  textSize(height*0.055); text('You made it home!',width/2,height/2-28);
  textStyle(NORMAL); textSize(height*0.024); fill(120,80,40);
  text('She found her way through the forest.',width/2,height/2+22);
  if (floor(frameCount/30)%2===0) { textSize(height*0.020); fill(160,110,60); text('press SPACE to play again',width/2,height/2+60); }
}

// ─────────────────────────────────────────────────────────
function keyPressed() {
  if (key===' ' && (gameWon||gameLost)) {
    gameWon=false; gameLost=false;
    worldX=0; flipped=false; flipTimer=0; flipIndex=0;
    introTimer=140; countdown=0; countdownTimer=0;
    hp=MAX_HP; invTimer=0; levelTimer=0;
    velY=0; onGround=true;
    charX=width*0.25; charY=groundY();
    animals.forEach(a=>{a.wx=a.startWx;a.frame=0;a.ft=0;});
  }
}