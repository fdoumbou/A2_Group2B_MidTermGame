// Pattern Master vs Social Chaos (Level 1 + Level 2 + Level 3)
// p5.js single-file version for GitHub Pages

let state = "menu"; // menu, play, win, transition
let levelIndex = 0; // 0 = L1, 1 = L2, 2 = L3

let player;
let exitZone;
let noiseSources = [];
let quietZones = [];
let walls = [];

let sensory = 0;
let sensoryMax = 100;
let focusHeld = false;

let levelName = "Level 1";
let levelHint = "";
let sensoryGainMultiplier = 1.0;

// ---------- SETUP ----------
function setup() {
  createCanvas(windowWidth, windowHeight);
  initPlayer();
  loadLevel(0);
}

// ---------- MAIN LOOP ----------
function draw() {
  background(10);

  if (state === "menu") return drawMenu();
  if (state === "transition") return drawTransition();
  if (state === "win") return drawWin();

  // PLAY
  focusHeld = keyIsDown(SHIFT);

  updateMovingNoise(); // Level 3 (safe no-op otherwise)
  updatePlayer();
  updateSensory();

  drawWalls();
  drawQuietZones();
  drawNoiseSources();
  drawExit();
  drawHiddenPatternLayer(); // focus breadcrumbs
  drawPlayer();
  drawUI();

  checkWin();
  drawOverloadFeedback();
}

// ---------- LEVEL LOADER ----------
function loadLevel(idx) {
  levelIndex = idx;
  sensory = 0;

  // Reset arrays
  noiseSources = [];
  quietZones = [];
  walls = [];

  if (levelIndex === 0) {
    levelName = "Level 1";
    levelHint =
      "Learn the loop: manage sensory load, use Focus Mode to reveal patterns.";
    sensoryGainMultiplier = 1.0;

    exitZone = { x: width - 140, y: height - 140, w: 90, h: 90 };

    noiseSources = [
      {
        x: width * 0.35,
        y: height * 0.35,
        r: 70,
        strength: 0.35,
        vx: 0,
        vy: 0,
        moving: false,
      },
      {
        x: width * 0.7,
        y: height * 0.3,
        r: 90,
        strength: 0.28,
        vx: 0,
        vy: 0,
        moving: false,
      },
      {
        x: width * 0.55,
        y: height * 0.7,
        r: 80,
        strength: 0.32,
        vx: 0,
        vy: 0,
        moving: false,
      },
    ];

    quietZones = [
      { x: 80, y: height - 120, w: 160, h: 120, drain: 0.75 },
      { x: width - 220, y: 80, w: 180, h: 120, drain: 0.75 },
    ];
  }

  if (levelIndex === 1) {
    // ✅ Level 2 (restored / preserved)
    levelName = "Level 2";
    levelHint =
      "More stimulation, fewer quiet zones. Plan routes + use Focus carefully.";
    sensoryGainMultiplier = 1.2;

    exitZone = { x: width - 110, y: height * 0.5 - 45, w: 90, h: 90 };

    noiseSources = [
      {
        x: width * 0.25,
        y: height * 0.25,
        r: 85,
        strength: 0.4,
        vx: 0,
        vy: 0,
        moving: false,
      },
      {
        x: width * 0.55,
        y: height * 0.35,
        r: 95,
        strength: 0.36,
        vx: 0,
        vy: 0,
        moving: false,
      },
      {
        x: width * 0.75,
        y: height * 0.55,
        r: 95,
        strength: 0.36,
        vx: 0,
        vy: 0,
        moving: false,
      },
      {
        x: width * 0.4,
        y: height * 0.75,
        r: 85,
        strength: 0.4,
        vx: 0,
        vy: 0,
        moving: false,
      },
    ];

    quietZones = [
      { x: width * 0.05, y: height * 0.6, w: 150, h: 110, drain: 0.7 },
    ];
  }

  if (levelIndex === 2) {
    levelName = "Level 3";
    levelHint =
      "Moving stimulation + tighter space. Use Focus sparingly and route with intention.";
    sensoryGainMultiplier = 1.2;

    exitZone = { x: width - 140, y: 80, w: 90, h: 90 };

    noiseSources = [
      {
        x: width * 0.3,
        y: height * 0.3,
        r: 85,
        strength: 0.38,
        vx: 1.25,
        vy: 0.95,
        moving: true,
      },
      {
        x: width * 0.65,
        y: height * 0.4,
        r: 90,
        strength: 0.36,
        vx: -1.05,
        vy: 1.2,
        moving: true,
      },
      {
        x: width * 0.55,
        y: height * 0.75,
        r: 85,
        strength: 0.38,
        vx: 1.15,
        vy: -1.0,
        moving: true,
      },
    ];

    quietZones = [{ x: 60, y: 70, w: 150, h: 110, drain: 0.7 }];

    walls = [
      { x: width * 0.34, y: height * 0.2, w: width * 0.2, h: height * 0.55 },
      { x: width * 0.18, y: height * 0.15, w: width * 0.06, h: height * 0.7 },
      { x: width * 0.24, y: height * 0.78, w: width * 0.6, h: height * 0.07 },
      { x: width * 0.8, y: height * 0.05, w: width * 0.06, h: height * 0.62 },
    ];
  }

  state = "transition";
}

// ---------- PLAYER ----------
function initPlayer() {
  player = { x: 120, y: 120, r: 18, baseSpd: 3.0 };
}

function resetPlayerToStart() {
  player.x = 120;
  player.y = 120;
}

function updatePlayer() {
  let overloadFactor = map(sensory, 0, sensoryMax, 1.0, 0.55);
  let spd = player.baseSpd * overloadFactor;

  if (focusHeld) spd *= 0.9;

  let nx = player.x;
  let ny = player.y;

  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) nx -= spd;
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) nx += spd;
  if (keyIsDown(UP_ARROW) || keyIsDown(87)) ny -= spd;
  if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) ny += spd;

  nx = constrain(nx, player.r, width - player.r);
  ny = constrain(ny, player.r, height - player.r);

  if (!circleHitsAnyWall(nx, player.y, player.r)) player.x = nx;
  if (!circleHitsAnyWall(player.x, ny, player.r)) player.y = ny;
}

function circleHitsAnyWall(cx, cy, cr) {
  for (let w of walls) {
    if (circleRectCollision(cx, cy, cr, w.x, w.y, w.w, w.h)) return true;
  }
  return false;
}

function circleRectCollision(cx, cy, cr, rx, ry, rw, rh) {
  let closestX = constrain(cx, rx, rx + rw);
  let closestY = constrain(cy, ry, ry + rh);
  let dx = cx - closestX;
  let dy = cy - closestY;
  return dx * dx + dy * dy < cr * cr;
}

// ---------- MOVING NOISE (LEVEL 3) ----------
function updateMovingNoise() {
  for (let n of noiseSources) {
    if (!n.moving) continue;

    n.x += n.vx;
    n.y += n.vy;

    if (n.x < n.r || n.x > width - n.r) n.vx *= -1;
    if (n.y < n.r || n.y > height - n.r) n.vy *= -1;

    n.x = constrain(n.x, n.r, width - n.r);
    n.y = constrain(n.y, n.r, height - n.r);
  }
}

// ---------- SENSORY SYSTEM ----------
function updateSensory() {
  let added = 0;

  for (let n of noiseSources) {
    let d = dist(player.x, player.y, n.x, n.y);
    if (d < n.r) {
      let t = 1 - d / n.r;
      let focusCost = focusHeld ? 1.35 : 1.0;
      added += t * n.strength * focusCost;
    }
  }

  let drained = 0;
  for (let q of quietZones) {
    if (
      player.x > q.x &&
      player.x < q.x + q.w &&
      player.y > q.y &&
      player.y < q.y + q.h
    ) {
      drained += q.drain;
    }
  }

  sensory += added * sensoryGainMultiplier;
  sensory -= drained;
  sensory = constrain(sensory, 0, sensoryMax);

  if (sensory >= sensoryMax) {
    sensory = 55;
    resetPlayerToStart();
  }
}

// ---------- DRAWING ----------
function drawMenu() {
  background(10);
  fill(255);
  textAlign(CENTER, CENTER);

  // Title
  textSize(38);
  text("Pattern Master vs Social Chaos", width / 2, height / 2 - 120);

  // Short premise
  textSize(16);
  text(
    "Navigate a stimulating environment by balancing Focus and Sensory Load.",
    width / 2,
    height / 2 - 75
  );

  // Controls / How to play
  textSize(15);
  text("CONTROLS", width / 2, height / 2 - 30);
  textSize(14);
  text("Move: WASD / Arrow Keys", width / 2, height / 2 - 5);
  text(
    "Hold SHIFT: Focus Mode (reveals the guideline path)",
    width / 2,
    height / 2 + 18
  );
  text("Goal: Reach the green exit zone", width / 2, height / 2 + 41);
  text(
    "Tip: Use quiet zones (blue areas) to reduce sensory load",
    width / 2,
    height / 2 + 64
  );
  text(
    "If sensory load maxes out, you'll be returned to the start",
    width / 2,
    height / 2 + 87
  );

  // Start prompt
  textSize(18);
  text("Press ENTER to Start", width / 2, height / 2 + 140);

  // No logic here on purpose — your existing keyPressed() already starts the game.
}

function drawTransition() {
  background(10);
  fill(255);
  textAlign(CENTER, CENTER);

  textSize(38);
  text(levelName, width / 2, height / 2 - 70);

  textSize(16);
  text(levelHint, width / 2, height / 2 - 25);

  textSize(14);
  text(
    "Controls: WASD/Arrows to move • Hold SHIFT to Focus • Reach the exit",
    width / 2,
    height / 2 + 15
  );

  textSize(16);
  text("Press ENTER to Play", width / 2, height / 2 + 70);
}

function drawWin() {
  background(10);
  fill(255);
  textAlign(CENTER, CENTER);

  textSize(36);
  text("Level Complete", width / 2, height / 2 - 20);

  textSize(16);
  if (levelIndex === 0) {
    text("Press ENTER for Level 2", width / 2, height / 2 + 20);
  } else if (levelIndex === 1) {
    text("Press ENTER for Level 3", width / 2, height / 2 + 20);
  } else {
    text("You finished the current build.", width / 2, height / 2 + 20);
    text("Press R to restart from Level 1", width / 2, height / 2 + 45);
  }
}

function drawPlayer() {
  push();
  noStroke();
  fill(255);
  circle(player.x, player.y, player.r * 2);
  pop();
}

function drawExit() {
  push();
  noStroke();
  fill(80, 200, 120);
  rect(exitZone.x, exitZone.y, exitZone.w, exitZone.h, 10);
  pop();
}

function drawWalls() {
  if (walls.length === 0) return;

  push();
  noStroke();
  fill(255, 22);
  for (let w of walls) rect(w.x, w.y, w.w, w.h, 10);
  pop();
}

function drawNoiseSources() {
  push();
  noFill();
  stroke(255, 70);
  strokeWeight(2);
  for (let n of noiseSources) circle(n.x, n.y, n.r * 2);
  pop();

  push();
  noStroke();
  fill(255, 35);
  for (let n of noiseSources) {
    for (let i = 0; i < 6; i++) {
      let ang = frameCount * 0.02 + i;
      let px = n.x + cos(ang) * (n.r * 0.45);
      let py = n.y + sin(ang * 1.1) * (n.r * 0.35);
      circle(px, py, 4);
    }
  }
  pop();
}

function drawQuietZones() {
  push();
  noStroke();
  fill(80, 140, 220, 60);
  for (let q of quietZones) rect(q.x, q.y, q.w, q.h, 12);
  pop();
}

// ✅ FIX: Level 3 focus path now routes around walls
function drawHiddenPatternLayer() {
  if (!focusHeld) return;

  push();
  noStroke();
  fill(255, 35);

  if (levelIndex === 0) {
    for (let i = 0; i < 12; i++) {
      let t = i / 11;
      let x = lerp(140, exitZone.x + exitZone.w / 2, t);
      let y = lerp(140, exitZone.y + exitZone.h / 2, t);
      circle(x, y, 18);
    }
  } else if (levelIndex === 1) {
    let pts = [
      { x: 140, y: 140 },
      { x: width * 0.22, y: height * 0.5 },
      { x: width * 0.38, y: height * 0.28 },
      { x: width * 0.55, y: height * 0.62 },
      { x: width * 0.72, y: height * 0.4 },
      { x: exitZone.x + exitZone.w / 2, y: exitZone.y + exitZone.h / 2 },
    ];
    drawBreadcrumbPath(pts, 16);
  } else {
    // Corridor-safe route:
    // start -> down left open lane -> across just above bottom wall -> up near right lane -> to exit
    let pts = [
      { x: 140, y: 140 },
      { x: width * 0.1, y: height * 0.7 },
      { x: width * 0.28, y: height * 0.74 },
      { x: width * 0.7, y: height * 0.74 },
      { x: width * 0.76, y: height * 0.3 },
      { x: exitZone.x + exitZone.w / 2, y: exitZone.y + exitZone.h / 2 },
    ];
    drawBreadcrumbPath(pts, 16);
  }

  pop();
}

function drawBreadcrumbPath(pts, dotSize) {
  for (let s = 0; s < pts.length - 1; s++) {
    for (let i = 0; i < 7; i++) {
      let t = i / 6;
      let x = lerp(pts[s].x, pts[s + 1].x, t);
      let y = lerp(pts[s].y, pts[s + 1].y, t);
      circle(x, y, dotSize);
    }
  }
}

function drawUI() {
  push();
  let barW = 260,
    barH = 18;
  let x = 20,
    y = 20;

  noStroke();
  fill(255, 40);
  rect(x, y, barW, barH, 10);

  fill(255);
  rect(x, y, map(sensory, 0, sensoryMax, 0, barW), barH, 10);

  fill(255);
  textSize(12);
  textAlign(LEFT, BOTTOM);
  text("Sensory Load", x, y - 4);

  textAlign(LEFT, TOP);
  text(focusHeld ? "FOCUS: ON (SHIFT)" : "FOCUS: OFF (SHIFT)", x, y + 26);

  textAlign(LEFT, TOP);
  text(levelName, x, y + 46);

  if (walls.length > 0) text("Navigate the corridors", x, y + 66);
  pop();
}

function drawOverloadFeedback() {
  if (sensory <= 75) return;
  let a = map(sensory, 75, sensoryMax, 20, 70);
  push();
  noStroke();
  fill(255, a);
  rect(0, 0, width, height);
  pop();
}

// ---------- WIN CHECK ----------
function checkWin() {
  if (
    player.x > exitZone.x &&
    player.x < exitZone.x + exitZone.w &&
    player.y > exitZone.y &&
    player.y < exitZone.y + exitZone.h
  ) {
    state = "win";
  }
}

// ---------- EVENTS ----------
function keyPressed() {
  // ENTER handles state changes cleanly (no repeating)
  if (keyCode === ENTER) {
    if (state === "menu") {
      resetPlayerToStart();
      loadLevel(0);
      return;
    }
    if (state === "transition") {
      state = "play";
      return;
    }
    if (state === "win") {
      if (levelIndex === 0) {
        resetPlayerToStart();
        loadLevel(1);
        return;
      }
      if (levelIndex === 1) {
        resetPlayerToStart();
        loadLevel(2);
        return;
      }
    }
  }

  // R restarts
  if (key === "r" || key === "R") {
    if (state === "play") {
      sensory = 0;
      resetPlayerToStart();
    } else if (state === "win" && levelIndex === 2) {
      resetPlayerToStart();
      loadLevel(0);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  loadLevel(levelIndex);
}
