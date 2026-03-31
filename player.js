// ============================================================
//  player.js  –  Player movement, animation and sensory load
// ============================================================

const FRAME_ORDER  = [0, 1, 0, 2]; // idle, stepL, idle, stepR
const DIR_ROW      = { down: 0, up: 1, left: 2, right: 3 };
const PLAYER_R     = 10;            // collision radius (px)

class Player {
  constructor() {
    this.wx      = 0;           // world x (pixels)
    this.wy      = 0;           // world y (pixels)
    this.dir     = 'down';
    this.moving  = false;
    this.frameTimer  = 0;
    this.animFrame   = 0;        // 0-3 within FRAME_ORDER
    this.animSpeed   = 8;        // frames between sprite steps

    // Sensory state
    this.sensory     = 0;
    this.sensoryMax  = 100;
    this.overloaded  = false;    // true for one frame on maxout

    // Focus mode (hold SHIFT)
    this.focus       = false;

    this.spriteSheet = null;     // p5.Image
    this.SPRITE_W    = 32;       // px per frame in sheet (2x scaled)
    this.SPRITE_H    = 48;

    // Speed
    this.baseSpeed   = 2.8;
    this.speed       = this.baseSpeed;
  }

  setSprite(img) { this.spriteSheet = img; }

  // Place player at tile coords
  setTile(col, row) {
    this.wx = col * TILE_PX + TILE_PX / 2;
    this.wy = row * TILE_PX + TILE_PX / 2;
  }

  getTileCol() { return Math.floor(this.wx / TILE_PX); }
  getTileRow() { return Math.floor(this.wy / TILE_PX); }

  update(tileMap) {
    this.focus = keyIsDown(SHIFT);

    // Speed slows as sensory rises
    const t   = this.sensory / this.sensoryMax;
    this.speed = this.baseSpeed * lerp(1.0, 0.45, t);
    if (this.focus) this.speed *= 0.85;

    // Movement
    let dx = 0, dy = 0;
    if (keyIsDown(LEFT_ARROW)  || keyIsDown(65)) { dx = -1; this.dir = 'left';  }
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) { dx =  1; this.dir = 'right'; }
    if (keyIsDown(UP_ARROW)    || keyIsDown(87)) { dy = -1; this.dir = 'up';    }
    if (keyIsDown(DOWN_ARROW)  || keyIsDown(83)) { dy =  1; this.dir = 'down';  }

    // Diagonal normalise
    if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }

    this.moving = (dx !== 0 || dy !== 0);

    // Collision-aware movement
    if (dx !== 0) {
      const nx = this.wx + dx * this.speed;
      if (tileMap.circleCanMove(nx, this.wy, PLAYER_R)) this.wx = nx;
    }
    if (dy !== 0) {
      const ny = this.wy + dy * this.speed;
      if (tileMap.circleCanMove(this.wx, ny, PLAYER_R)) this.wy = ny;
    }

    // Animation
    if (this.moving) {
      this.frameTimer++;
      if (this.frameTimer >= this.animSpeed) {
        this.frameTimer = 0;
        this.animFrame  = (this.animFrame + 1) % 4;
      }
    } else {
      this.animFrame  = 0;
      this.frameTimer = 0;
    }
  }

  // Call from game loop with sensory modifiers
  updateSensory(levelGain, noiseSources, quietZones, tileMap) {
    const prevS = this.sensory;

    // Passive rise
    let gain = levelGain;

    // Noise sources contribute
    for (const n of noiseSources) {
      const nc  = tileMap.tileCentre(n.tx, n.ty);
      const d   = dist(this.wx, this.wy, nc.x, nc.y);
      const rPx = n.radius * TILE_PX;
      if (d < rPx) {
        const t = 1 - d / rPx;
        gain += t * t * n.strength * 0.18;
      }
    }

    // Quiet zones drain
    let drain = 0;
    for (const q of quietZones) {
      const qx = q.tx * TILE_PX;
      const qy = q.ty * TILE_PX;
      const qw = q.tw * TILE_PX;
      const qh = q.th * TILE_PX;
      if (this.wx > qx && this.wx < qx + qw && this.wy > qy && this.wy < qy + qh) {
        drain += q.drain * 0.08;
      }
    }

    this.sensory += gain - drain;
    this.sensory  = constrain(this.sensory, 0, this.sensoryMax);

    this.overloaded = false;
    if (this.sensory >= this.sensoryMax && prevS < this.sensoryMax) {
      this.overloaded = true;
    }
  }

  reset(col, row) {
    this.setTile(col, row);
    this.sensory = 0;
    this.dir     = 'down';
    this.moving  = false;
  }

  draw(tileMap) {
    const sc = tileMap.worldToScreen(this.wx, this.wy);
    const sx = sc.x;
    const sy = sc.y;

    push();
    // Shadow
    noStroke();
    fill(0, 60);
    ellipse(sx, sy + this.SPRITE_H / 2 - 4, this.SPRITE_W * 0.7, 8);

    if (this.spriteSheet) {
      const col = FRAME_ORDER[this.animFrame];   // 0,1,2
      const row = DIR_ROW[this.dir];              // 0-3
      const srcX = col * this.SPRITE_W;
      const srcY = row * this.SPRITE_H;
      imageMode(CENTER);
      image(this.spriteSheet,
        sx, sy,
        this.SPRITE_W, this.SPRITE_H,
        srcX, srcY,
        this.SPRITE_W, this.SPRITE_H
      );
      imageMode(CORNER);
    } else {
      // Fallback
      fill(255);
      ellipse(sx, sy, 20, 20);
      fill(0);
      ellipse(sx + 3, sy - 3, 4, 4);
    }

    // Focus indicator
    if (this.focus) {
      noFill();
      stroke(255, 255, 100, map(sin(frameCount * 0.15), -1, 1, 80, 180));
      strokeWeight(2);
      ellipse(sx, sy, 32, 32);
    }

    pop();
  }
}
