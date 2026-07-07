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
const LEVEL_END = 7500;
let gameWon     = false;
let gameLost    = false;

// ── HP & damage ───────────────────────────────────────────
let hp          = 3;
const MAX_HP    = 3;
let invTimer    = 0;       // invincibility frames after hit
const INV_FRAMES = 80;

// ── Timer ─────────────────────────────────────────────────
let levelTimer  = 0;       // counts up in frames
const TIME_LIMIT = 60 * 60; // 60 seconds at 60fps

// ── Intro delay ───────────────────────────────────────────
// Player can't move for a moment at start — reads the scene
let introTimer  = 140; // frames before player can move (~2.3 sec)
let introFading = true;

// ── Flip mechanic ─────────────────────────────────────────
// First flip happens early with NO obstacles nearby — pure learning moment
// Second flip happens mid-level near obstacles
const FLIP_AT       = [600, 3200];
let   flipIndex     = 0;
let   flipped       = false;
let   flipTimer     = 0;
const FLIP_DURATION = 220;

// Countdown before flip triggers
let   countdown     = 0;   // 3,2,1 shown on screen
let   countdownTimer = 0;
const COUNTDOWN_FRAMES = 55; // frames per number

// ── Level data ────────────────────────────────────────────
// Obstacles start at 2000 — clear open space first for learning
// Placed in loose clusters with generous gaps between
const LOGS  = [
  { wx: 2400 },
  { wx: 4000 },
  { wx: 5800 },
  { wx: 7200 },
];
const ROCKS = [
  { wx: 3200 },
  { wx: 4900 },
  { wx: 6600 },
];

let animals = [
  { wx: 2800, type:'rabbit', dir: 1, range:110, speed:2.0, frame:0, ft:0 },
  { wx: 4500, type:'racoon', dir: 1, range: 90, speed:1.5, frame:0, ft:0 },
  { wx: 6200, type:'rabbit', dir:-1, range:120, speed:2.2, frame:0, ft:0 },
];
animals.forEach(a => a.startWx = a.wx);

// ── Helpers ───────────────────────────────────────────────
function groundH() { return height * 0.44; }
function groundY() { return height - groundH() * 0.5; }
function toScreen(worldPos) { return worldPos - worldX + charX - width * 0.25; }

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

  // ── Intro delay ─────────────────────────────────────────
  if (introTimer > 0) { introTimer--; drawBG(); drawStartSign(); drawChar(); drawFG(); drawIntroOverlay(); return; }

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
  if (charY>=gy) { charY=gy; velY=0; onGround=true; } else { onGround=false; }

  // ── Flip + countdown logic ───────────────────────────────
  updateFlip();

  // ── Animals ─────────────────────────────────────────────
  for (let a of animals) {
    a.wx += a.dir * a.speed;
    if (a.wx > a.startWx+a.range || a.wx < a.startWx-a.range) a.dir *= -1;
    a.ft++; if (a.ft>=8) { a.ft=0; a.frame=(a.frame+1)%2; }
  }

  // ── Win ─────────────────────────────────────────────────
  if (worldX >= LEVEL_END) { gameWon=true; return; }

  // ── Timer ───────────────────────────────────────────────
  levelTimer++;
  if (levelTimer >= TIME_LIMIT) { gameLost=true; return; }

  // ── Damage ──────────────────────────────────────────────
  if (invTimer > 0) { invTimer--; }
  else { checkDamage(); }

  // ── Draw ────────────────────────────────────────────────
  drawBG();
  drawStartSign();
  drawObstacles();
  drawAnimals();
  drawFinishSign();
  drawChar();
  drawFG();
  drawHUD();
  drawFlipHUD();
}

// ─────────────────────────────────────────────────────────
//  INTRO OVERLAY — fades out, shows level name
// ─────────────────────────────────────────────────────────
function drawIntroOverlay() {
  // Fade from black
  let alpha = map(introTimer, 140, 60, 0, 220);
  alpha = constrain(alpha, 0, 220);

  noStroke(); fill(15, 22, 14, alpha);
  rect(0, 0, width, height);

  if (introTimer > 55) {
    let textAlpha = map(introTimer, 140, 100, 0, 255);
    textAlpha = constrain(textAlpha, 0, 255);

    textAlign(CENTER, CENTER);
    textFont('Georgia');

    // Shadow
    fill(0, 0, 0, textAlpha * 0.6);
    textStyle(NORMAL); textSize(height * 0.022);
    text('Tutorial', width/2 + 2, height/2 - height*0.06 + 2);
    textStyle(BOLD); textSize(height * 0.058);
    text('Through the Trees', width/2 + 3, height/2 + 3);

    // Text
    fill(175, 210, 155, textAlpha);
    textStyle(NORMAL); textSize(height * 0.022);
    text('Tutorial', width/2, height/2 - height*0.06);
    textStyle(BOLD); textSize(height * 0.058);
    fill(225, 240, 200, textAlpha);
    text('Through the Trees', width/2, height/2);

    // Subtitle
    if (introTimer > 80) {
      fill(150, 185, 130, textAlpha * 0.8);
      textStyle(NORMAL); textSize(height * 0.020);
      text('use A / D to move    SPACE to jump', width/2, height/2 + height*0.08);
    }
    textStyle(NORMAL);
  }
}
function updateFlip() {
  if (flipped) {
    flipTimer--;
    if (flipTimer <= 0) flipped = false;
    return;
  }

  if (flipIndex >= FLIP_AT.length) return;

  let trigger    = FLIP_AT[flipIndex];
  let warnStart  = trigger - WALK_SPEED * COUNTDOWN_FRAMES * 3; // 3 numbers × frames each

  if (worldX >= trigger) {
    // Trigger the flip
    flipped       = true;
    flipTimer     = FLIP_DURATION;
    countdown     = 0;
    countdownTimer = 0;
    flipIndex++;
    return;
  }

  if (worldX >= warnStart) {
    countdownTimer++;
    let elapsed = worldX - warnStart;
    let step    = WALK_SPEED * COUNTDOWN_FRAMES;
    if      (elapsed < step)     countdown = 3;
    else if (elapsed < step * 2) countdown = 2;
    else                         countdown = 1;
  } else {
    countdown = 0;
    countdownTimer = 0;
  }
}

// ─────────────────────────────────────────────────────────
function tileLayer(img, destH, destY, scrollAmt) {
  if (!img) return;
  let scale  = destH / img.height;
  let tileW  = img.width * scale;
  let offset = ((scrollAmt * scale) % tileW + tileW) % tileW;
  let n      = ceil(width / tileW) + 2;
  for (let i=-1; i<n; i++) image(img, i*tileW - offset, destY, tileW, destH);
}

function drawBG() {
  // Freeze background parallax in last 800px so it feels like arrival
  let bgScroll = min(worldX, LEVEL_END - 800);

  image(imgSky, 0, 0, width, height);
  tileLayer(imgBgTrees, height, 0, bgScroll * 0.12);
  let bushH = height * 0.30;
  tileLayer(imgBushes, bushH, height - bushH - groundH()*0.50, bgScroll * 0.04);
  tileLayer(imgGround, groundH(), height - groundH(), worldX * 0.45);
}

function drawFG() {
  tileLayer(imgFgTrees, height, 0, worldX * 1.15);
}

// ─────────────────────────────────────────────────────────
//  START SIGN — tells player to go right
// ─────────────────────────────────────────────────────────
function drawStartSign() {
  let sx = toScreen(120);
  if (sx < -300 || sx > width+300) return;
  let gy = groundY();

  // Post
  noStroke(); fill(75, 50, 22);
  rect(sx + 8, gy - height*0.26, 8, height*0.26);

  // Board — slightly taller for two lines
  fill(210, 178, 118);
  rect(sx - 30, gy - height*0.30, 100, height*0.11, 5);
  stroke(148, 105, 52); strokeWeight(2); noFill();
  rect(sx - 26, gy - height*0.296, 92, height*0.102, 3);

  // Arrow + text
  noStroke(); fill(58, 35, 10);
  textAlign(CENTER, CENTER);
  textFont('Georgia'); textStyle(BOLD);
  textSize(height * 0.022);
  text('this way', sx + 20, gy - height*0.272);
  textSize(height * 0.030);
  text('→', sx + 20, gy - height*0.248);
  textStyle(NORMAL);

  // Small flowers
  noStroke();
  fill(220, 150, 170);
  ellipse(sx - 16, gy - height*0.265, 8, 8);
  fill(255, 215, 70);
  ellipse(sx - 16, gy - height*0.265, 3, 3);
}

// ─────────────────────────────────────────────────────────
//  OBSTACLES
// ─────────────────────────────────────────────────────────
function drawObstacles() {
  let gy = groundY();
  let logH=height*0.10, logW=logH*(139/88);
  let rockH=height*0.08, rockW=rockH*(117/66);
  imageMode(CORNER);
  for (let o of LOGS) {
    let sx = toScreen(o.wx);
    if (sx < -200 || sx > width+200) continue;
    image(imgLog, sx, gy-logH, logW, logH, 258, 46, 139, 88);
  }
  for (let o of ROCKS) {
    let sx = toScreen(o.wx);
    if (sx < -200 || sx > width+200) continue;
    image(imgRock, sx, gy-rockH, rockW, rockH, 115, 56, 117, 66);
  }
}

// ─────────────────────────────────────────────────────────
//  ANIMALS
// ─────────────────────────────────────────────────────────
function drawAnimals() {
  let gy = groundY();
  imageMode(CORNER);
  for (let a of animals) {
    let sx = toScreen(a.wx);
    if (sx < -200 || sx > width+200) continue;
    if (a.type === 'racoon') {
      // Each frame is 74x72px (nearly square)
      let dh=height*0.09, dw=dh*(74/72);
      let srcX = 18 + a.frame*74;
      if (a.dir<0) { push(); translate(sx+dw,gy-dh); scale(-1,1); image(imgRacoon,0,0,dw,dh,srcX,288,74,72); pop(); }
      else         { image(imgRacoon,sx,gy-dh,dw,dh,srcX,288,74,72); }
    } else {
      let dh=height*0.08, dw=dh*(95/80);
      let srcX = a.frame*95;
      if (a.dir<0) { push(); translate(sx+dw,gy-dh); scale(-1,1); image(imgRabbit,0,0,dw,dh,srcX,80,95,80); pop(); }
      else         { image(imgRabbit,sx,gy-dh,dw,dh,srcX,80,95,80); }
    }
  }
}

// ─────────────────────────────────────────────────────────
//  FINISH SIGN
// ─────────────────────────────────────────────────────────
function drawFinishSign() {
  let sx = toScreen(LEVEL_END - 150);
  if (sx < -300 || sx > width+300) return;
  let gy = groundY();

  noStroke(); fill(75, 50, 22);
  rect(sx + 48, gy - height*0.28, 10, height*0.28);

  fill(215, 182, 122);
  rect(sx, gy - height*0.30, 116, height*0.10, 6);
  stroke(148, 105, 52); strokeWeight(2); noFill();
  rect(sx + 4, gy - height*0.296, 108, height*0.092, 4);

  // Flowers
  noStroke();
  for (let [fx,fy] of [[sx+14, gy-height*0.275],[sx+102, gy-height*0.275]]) {
    fill(230, 150, 172); ellipse(fx, fy, 10, 10);
    fill(255, 215, 70);  ellipse(fx, fy,  4,  4);
  }

  noStroke(); fill(58, 35, 10);
  textAlign(CENTER, CENTER);
  textFont('Georgia'); textStyle(BOLD);
  textSize(height * 0.026);
  text('next level', sx + 58, gy - height*0.252);
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
  if (facingLeft) { translate(drawX+dispW, drawY); scale(-1,1); }
  else            { translate(drawX, drawY); }
  image(imgSprites, 0, 0, dispW, dispH, animFrame*119, 0, 119, 135);
  pop();
}

// ─────────────────────────────────────────────────────────
//  FLIP HUD — pixel-forest aesthetic
//  Countdown: big chunky numbers centre screen
//  Active:    centred label with bark-texture style
// ─────────────────────────────────────────────────────────
function drawFlipHUD() {
  // ── Countdown 3, 2, 1 ───────────────────────────────────
  if (!flipped && countdown > 0) {
    // Darken screen slightly
    noStroke(); fill(0, 0, 0, 55);
    rect(0, 0, width, height);

    let cx = width / 2, cy = height / 2;

    // Outer ring pulse
    if (floor(frameCount/6)%2===0) {
      noFill(); stroke(200, 220, 180, 140); strokeWeight(3);
      ellipse(cx, cy, height*0.38, height*0.38);
      noStroke();
    }

    // Circle bg
    noStroke();
    fill(20, 35, 18, 180);
    ellipse(cx, cy, height*0.32, height*0.32);
    stroke(120, 160, 90, 200); strokeWeight(2); noFill();
    ellipse(cx, cy, height*0.32, height*0.32);
    noStroke();

    // Number — chunky with shadow
    let numStr = str(countdown);
    textAlign(CENTER, CENTER);
    textFont('Georgia'); textStyle(BOLD);
    textSize(height * 0.14);
    fill(0, 0, 0, 160);
    text(numStr, cx+3, cy+3);
    fill(210, 230, 185);
    text(numStr, cx, cy);

    // Label below circle
    textSize(height * 0.024);
    textStyle(NORMAL);
    fill(0,0,0,140);
    text('controls changing', cx+2, cy + height*0.21+2);
    fill(190, 215, 165);
    text('controls changing', cx, cy + height*0.21);
  }

  // ── Active flip label ────────────────────────────────────
  if (flipped) {
    let cx = width/2, ty = height*0.38;
    let msg = 'controls flipped';

    textFont('Georgia'); textStyle(BOLD);
    textSize(height * 0.040);
    let tw = textWidth(msg);
    let pw = tw + 60, ph = height*0.072;
    let px = cx - pw/2, py = ty - ph/2;

    // Shadow
    noStroke(); fill(0,0,0,100);
    rect(px+3, py+3, pw, ph, ph/2);

    // Bark-coloured pill
    fill(32, 48, 28, 210);
    rect(px, py, pw, ph, ph/2);

    // Green twig border
    stroke(110, 155, 80, 200); strokeWeight(2); noFill();
    rect(px+3, py+3, pw-6, ph-6, ph/2);
    noStroke();

    // Small leaf decorations on sides
    fill(90, 140, 65, 200);
    ellipse(px + 14, ty, 12, 7);
    ellipse(px + pw - 14, ty, 12, 7);

    // Text — with shadow
    textAlign(CENTER, CENTER);
    fill(0, 0, 0, 160);
    text(msg, cx+2, ty+2);
    fill(210, 235, 175);
    text(msg, cx, ty);

    textStyle(NORMAL);

    // Subtle pulsing border on screen edge
    if (floor(frameCount/12)%2===0) {
      noFill(); stroke(110, 155, 80, 80); strokeWeight(3);
      rect(4, 4, width-8, height-8);
      noStroke();
    }
  }
}

// ─────────────────────────────────────────────────────────
//  DAMAGE CHECK — player vs logs, rocks, animals
// ─────────────────────────────────────────────────────────
function checkDamage() {
  let gy = groundY();

  // Only check collision when player is on or very near the ground
  // This prevents damage when jumping OVER an obstacle
  if (charY < gy - height * 0.05) return;

  // Player hitbox — just a small zone around their feet
  let pw  = width * 0.010;
  let ph  = gy * 0.08;
  let px1 = charX - pw, px2 = charX + pw;
  let py1 = gy - ph,    py2 = gy;

  let logH=height*0.10, logW=logH*(139/88);
  let rockH=height*0.08, rockW=rockH*(117/66);

  for (let o of LOGS) {
    let sx = toScreen(o.wx);
    if (px2 > sx+16 && px1 < sx+logW-16) { takeDamage(); return; }
  }
  for (let o of ROCKS) {
    let sx = toScreen(o.wx);
    if (px2 > sx+16 && px1 < sx+rockW-16) { takeDamage(); return; }
  }
  for (let a of animals) {
    let sx = toScreen(a.wx);
    let dw = a.type==='racoon' ? height*0.09*(74/72) : height*0.08*(95/80);
    if (px2 > sx+12 && px1 < sx+dw-12) { takeDamage(); return; }
  }
}

function takeDamage() {
  hp--;
  invTimer = INV_FRAMES;
  if (hp <= 0) { hp=0; gameLost=true; }
}

// ─────────────────────────────────────────────────────────
//  HUD — pixel hearts + timer bar
// ─────────────────────────────────────────────────────────
function drawHUD() {
  let pad = width * 0.018;
  let gy  = groundY();

  // ── Pixel hearts ──────────────────────────────────────
  let hs  = height * 0.038; // heart size
  for (let i = 0; i < MAX_HP; i++) {
    let hx = pad + i * (hs * 1.4);
    let hy = pad;
    let full = i < hp;
    drawPixelHeart(hx, hy, hs, full);
  }

  // ── Timer bar ─────────────────────────────────────────
  let timeLeft = max(0, TIME_LIMIT - levelTimer);
  let pct      = timeLeft / TIME_LIMIT;
  let barW     = width  * 0.18;
  let barH     = height * 0.018;
  let bx       = width - barW - pad;
  let by       = pad;

  // Bar bg
  noStroke(); fill(20, 30, 18, 180);
  rect(bx-2, by-2, barW+4, barH+4, 3);

  // Bar fill — green→amber→red
  let barCol;
  if      (pct > 0.5) barCol = lerpColor(color(180,210,80), color(220,180,40), map(pct,1,0.5,0,1));
  else if (pct > 0.2) barCol = lerpColor(color(220,180,40), color(210,80,40),  map(pct,0.5,0.2,0,1));
  else                barCol = color(210,60,40);

  fill(barCol);
  rect(bx, by, barW * pct, barH, 2);

  // Tick marks
  stroke(20,30,18,120); strokeWeight(1);
  for (let t = 1; t < 6; t++) {
    let tx = bx + barW * (t/6);
    line(tx, by, tx, by+barH);
  }
  noStroke();

  // Label
  fill(190, 215, 160);
  textFont('monospace'); textStyle(BOLD); textSize(height*0.016);
  textAlign(RIGHT, TOP);
  text('TIME', width - pad, by + barH + 3);
  textStyle(NORMAL);
}

// ── Pixel heart ───────────────────────────────────────────
function drawPixelHeart(x, y, s, full) {
  let p = s / 4;
  // Classic pixel heart shape using small squares
  let grid = [
    [0,1,0,1,0],
    [1,1,1,1,1],
    [1,1,1,1,1],
    [0,1,1,1,0],
    [0,0,1,0,0],
  ];
  noStroke();
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      if (!grid[row][col]) continue;
      if (full) {
        // Full heart: red with bright highlight top-left
        if (row < 2 && col < 2) fill(230, 100, 110);
        else                    fill(195, 48, 58);
      } else {
        // Empty heart: dark outline only
        fill(60, 45, 45);
      }
      rect(x + col*p, y + row*p, p, p);
    }
  }
  // Damage flash
  if (invTimer > 0 && floor(invTimer/5)%2===0) {
    fill(255, 255, 255, 160);
    for (let row=0; row<5; row++)
      for (let col=0; col<5; col++)
        if (grid[row][col]) rect(x+col*p, y+row*p, p, p);
  }
}

// ─────────────────────────────────────────────────────────
//  LOSE SCREEN
// ─────────────────────────────────────────────────────────
function drawLoseScreen() {
  drawBG(); drawFG();

  // Dark overlay
  noStroke(); fill(10, 18, 10, 195); rect(0, 0, width, height);

  // Card
  fill(28, 38, 24);
  stroke(80, 110, 60); strokeWeight(2);
  rectMode(CENTER);
  rect(width/2, height/2, min(width*0.5, 560), 210, 10);
  rectMode(CORNER);

  // Twig border detail
  stroke(60, 90, 45, 140); strokeWeight(1); noFill();
  rectMode(CENTER);
  rect(width/2, height/2, min(width*0.5,560)-12, 198, 8);
  rectMode(CORNER);

  let cx = width/2, cy = height/2;

  // Title
  noStroke(); fill(0,0,0,160);
  textAlign(CENTER,CENTER); textFont('Georgia'); textStyle(BOLD);
  textSize(height*0.052);
  text('lost in the forest', cx+2, cy-50+2);
  fill(195, 215, 165);
  text('lost in the forest', cx, cy-50);

  // Subtitle
  textStyle(NORMAL); textSize(height*0.022); fill(140, 168, 115);
  text('she never made it home.', cx, cy+2);

  // Reason
  textSize(height*0.018); fill(100, 130, 80);
  let reason = (levelTimer >= TIME_LIMIT) ? 'the forest swallowed the last of the light.' : 'the cold crept in.';
  text(reason, cx, cy+30);

  // Blink restart
  if (floor(frameCount/30)%2===0) {
    textSize(height*0.019); fill(160, 190, 130);
    text('press SPACE to try again', cx, cy+68);
  }
  textStyle(NORMAL);
}

// ─────────────────────────────────────────────────────────
//  WIN SCREEN
// ─────────────────────────────────────────────────────────
function drawWinScreen() {
  drawBG(); drawFG();
  noStroke(); fill(245,230,210,200); rect(0,0,width,height);
  fill(255,248,235); stroke(180,140,90); strokeWeight(3);
  rectMode(CENTER);
  rect(width/2, height/2, min(width*0.5,580), 200, 12);
  rectMode(CORNER);
  noStroke();
  let cx=width/2, cy=height/2, cw=min(width*0.5,580)/2;
  for (let [px,py] of [[cx-cw+30,cy-75],[cx+cw-30,cy-75],[cx-cw+30,cy+75],[cx+cw-30,cy+75]]) {
    fill(240,160,180); ellipse(px,py,14,14);
    fill(255,220,80);  ellipse(px,py, 6, 6);
  }
  fill(90,55,20); textAlign(CENTER,CENTER); textFont('Georgia'); textStyle(BOLD);
  textSize(height*0.055); text('You made it home!', width/2, height/2-28);
  textStyle(NORMAL); textSize(height*0.024); fill(120,80,40);
  text('She found her way through the forest.', width/2, height/2+22);
  if (floor(frameCount/30)%2===0) {
    textSize(height*0.020); fill(160,110,60);
    text('press SPACE to play again', width/2, height/2+60);
  }
}

// ─────────────────────────────────────────────────────────
function keyPressed() {
  if (key===' ' && (gameWon || gameLost)) {
    gameWon=false; gameLost=false;
    worldX=0; flipped=false; flipTimer=0; flipIndex=0;
    introTimer=140; countdown=0; countdownTimer=0;
    hp=MAX_HP; invTimer=0; levelTimer=0;
    velY=0; onGround=true;
    charX=width*0.25; charY=groundY();
    animals.forEach(a => { a.wx=a.startWx; a.frame=0; a.ft=0; });
  }
}