// ============================================================
//  ui.js  –  All HUD and screen UI for Sensory Journey
// ============================================================

class GameUI {
  constructor() {
    this.portraitImg  = null;
    this.noiseIcons   = null;
    this.uiSheet      = null;
    this._titleAlpha  = 0;
    this._titleSlide  = 40;
  }

  setImages(portrait, noiseIcons, uiSheet) {
    this.portraitImg = portrait;
    this.noiseIcons  = noiseIcons;
    this.uiSheet     = uiSheet;
  }

  // ── Sensory Load Bar ──────────────────────────────────────────────────
  drawSensoryBar(sensory, sensoryMax, w) {
    const BAR_W  = 240;
    const BAR_H  = 18;
    const BAR_X  = w / 2 - BAR_W / 2;
    const BAR_Y  = 14;
    const t      = sensory / sensoryMax;

    push();
    noStroke();

    // Label
    fill(220, 225, 255, 200);
    textSize(11);
    textAlign(LEFT, CENTER);
    textFont('monospace');
    text("SENSORY LOAD", BAR_X, BAR_Y + BAR_H / 2);

    const LBL_W = 108;

    // Background
    fill(10, 10, 30, 200);
    rect(BAR_X + LBL_W + 4, BAR_Y, BAR_W - LBL_W, BAR_H, 6);

    // Fill colour: green → yellow → red
    let barCol;
    if (t < 0.5)      barCol = lerpColor(color(80,200,80),   color(240,200,60),  t * 2);
    else if (t < 0.8) barCol = lerpColor(color(240,200,60),  color(240,100,30),  (t-0.5)*3.33);
    else              barCol = lerpColor(color(240,100,30),   color(220,30,30),   (t-0.8)*5);

    // Pulsate at high load
    if (t > 0.8) {
      const pulse = map(sin(frameCount * 0.2), -1, 1, 0.85, 1.0);
      barCol = lerpColor(barCol, color(255, 0, 0), (t - 0.8) * 3 * pulse);
    }

    const fillW = (BAR_W - LBL_W) * t;
    fill(barCol);
    rect(BAR_X + LBL_W + 4, BAR_Y, fillW, BAR_H, 6);

    // Shine on bar
    fill(255, 255, 255, 50);
    rect(BAR_X + LBL_W + 4, BAR_Y, fillW, BAR_H / 2, 6);

    // Border
    stroke(180, 200, 255, 160);
    strokeWeight(1.5);
    noFill();
    rect(BAR_X + LBL_W + 4, BAR_Y, BAR_W - LBL_W, BAR_H, 6);

    pop();
  }

  // ── Level name + hint ─────────────────────────────────────────────────
  drawLevelLabel(name, w) {
    push();
    noStroke();
    fill(10, 10, 30, 170);
    rect(10, 10, 170, 46, 6);
    fill(200, 220, 255);
    textFont('monospace');
    textSize(13);
    textAlign(LEFT, TOP);
    text(name, 18, 18);
    fill(160, 180, 220, 180);
    textSize(10);
    text("SHIFT = Focus Mode", 18, 36);
    pop();
  }

  // ── Noise source indicators (world-space circles) ─────────────────────
  drawNoiseSources(noiseSources, tileMap, noiseIconImg) {
    push();
    for (const n of noiseSources) {
      const rPx = n.radius * TILE_PX;
      const nc  = tileMap.tileCentre(n.tx, n.ty);
      const sc  = tileMap.worldToScreen(nc.x, nc.y);

      // Pulsing aura
      const pulse = map(sin(frameCount * 0.07 + n.tx), -1, 1, 0.85, 1.0);
      const aR    = rPx * pulse;

      noFill();
      strokeWeight(1.5);
      for (let i = 0; i < 3; i++) {
        const a  = map(i, 0, 3, 60, 10);
        const sr = rPx * (0.7 + i * 0.15) * pulse;
        stroke(255, 140 - i * 30, 60, a);
        ellipse(sc.x, sc.y, sr * 2, sr * 2);
      }

      // Icon
      if (noiseIconImg && n.type >= 0 && n.type <= 4) {
        const ICON_W = 32, ICON_H = 32;
        imageMode(CENTER);
        image(noiseIconImg,
          sc.x, sc.y - rPx * 0.7,
          ICON_W, ICON_H,
          n.type * ICON_W, 0,
          ICON_W, ICON_H
        );
        imageMode(CORNER);
      }

      // Label
      fill(255, 200, 100, 160);
      noStroke();
      textSize(9);
      textAlign(CENTER, TOP);
      textFont('monospace');
      text(n.label, sc.x, sc.y - rPx * 0.7 + 18);
    }
    pop();
  }

  // ── Quiet zones ───────────────────────────────────────────────────────
  drawQuietZones(quietZones, tileMap) {
    push();
    for (const q of quietZones) {
      const sx = q.tx * TILE_PX - tileMap.camX;
      const sy = q.ty * TILE_PX - tileMap.camY;
      const sw = q.tw * TILE_PX;
      const sh = q.th * TILE_PX;
      const pulse = map(sin(frameCount * 0.04), -1, 1, 0.4, 0.7);
      noStroke();
      fill(80, 160, 240, pulse * 80);
      rect(sx, sy, sw, sh, 6);
      stroke(120, 200, 255, pulse * 160);
      strokeWeight(1.5);
      noFill();
      rect(sx, sy, sw, sh, 6);
      // Label
      fill(160, 220, 255, 200);
      noStroke();
      textSize(9);
      textAlign(CENTER, CENTER);
      textFont('monospace');
      text(q.label, sx + sw/2, sy + sh/2);
    }
    pop();
  }

  // ── Checkpoint indicators ─────────────────────────────────────────────
  drawCheckpoints(checkpoints, activeIdx, tileMap) {
    push();
    for (let i = 0; i < checkpoints.length; i++) {
      if (i < activeIdx) continue; // already collected
      const cp = checkpoints[i];
      const nc = tileMap.tileCentre(cp.tx, cp.ty);
      const sc = tileMap.worldToScreen(nc.x, nc.y);
      const isNext = i === activeIdx;
      const pulse  = map(sin(frameCount * 0.08), -1, 1, 0.7, 1.0);

      noStroke();
      if (isNext) {
        fill(255, 220, 60, 60 * pulse);
        ellipse(sc.x, sc.y, TILE_PX * 2.5, TILE_PX * 2.5);
        fill(255, 220, 60, 200);
        textSize(22);
        textAlign(CENTER, CENTER);
        text('★', sc.x, sc.y);
        fill(255, 220, 60, 180);
        textSize(9);
        textAlign(CENTER, TOP);
        textFont('monospace');
        text(cp.label, sc.x, sc.y + 16);
      } else {
        fill(180, 180, 180, 80);
        textSize(18);
        textAlign(CENTER, CENTER);
        text('☆', sc.x, sc.y);
      }
    }
    pop();
  }

  // ── Exit zone ─────────────────────────────────────────────────────────
  drawExit(exitDef, tileMap, unlocked) {
    if (!unlocked) return;
    const sx = exitDef.tx * TILE_PX - tileMap.camX;
    const sy = exitDef.ty * TILE_PX - tileMap.camY;
    const sw = (exitDef.tw || 1) * TILE_PX;
    const sh = (exitDef.th || 1) * TILE_PX;
    push();
    const pulse = map(sin(frameCount * 0.1), -1, 1, 0.5, 1.0);
    noStroke();
    fill(60, 220, 100, 80 * pulse);
    rect(sx, sy, sw, sh, 4);
    stroke(80, 255, 120, 200 * pulse);
    strokeWeight(2.5);
    noFill();
    rect(sx, sy, sw, sh, 4);
    // Arrow
    fill(80, 255, 120, 200 * pulse);
    noStroke();
    textSize(20);
    textAlign(CENTER, CENTER);
    text('▶', sx + sw/2, sy + sh/2);
    pop();
  }

  // ── Focus path (SHIFT held) ───────────────────────────────────────────
  drawFocusPath(player, exitDef, checkpoints, activeCheckpointIdx, tileMap) {
    if (!player.focus) return;
    push();
    const alpha = map(sin(frameCount * 0.08), -1, 1, 120, 220);
    noFill();
    strokeWeight(2);
    stroke(255, 255, 100, alpha);
    // Draw dotted line to next target
    let target;
    if (activeCheckpointIdx < checkpoints.length) {
      const cp = checkpoints[activeCheckpointIdx];
      target = tileMap.tileCentre(cp.tx, cp.ty);
    } else {
      target = tileMap.tileCentre(exitDef.tx, exitDef.ty);
    }
    const ps = tileMap.worldToScreen(player.wx, player.wy);
    const ts = tileMap.worldToScreen(target.x, target.y);
    const steps = 12;
    for (let i = 0; i < steps; i++) {
      if (i % 2 === 0) {
        const t0 = i / steps;
        const t1 = (i + 1) / steps;
        line(lerp(ps.x,ts.x,t0), lerp(ps.y,ts.y,t0), lerp(ps.x,ts.x,t1), lerp(ps.y,ts.y,t1));
      }
    }
    // Animate dots along path
    for (let i = 0; i < 4; i++) {
      const t = ((frameCount * 0.02 + i * 0.25) % 1);
      const dx = lerp(ps.x, ts.x, t);
      const dy = lerp(ps.y, ts.y, t);
      noStroke();
      fill(255, 255, 100, alpha * 0.6);
      ellipse(dx, dy, 6, 6);
    }
    pop();
  }

  // ── NPCs ──────────────────────────────────────────────────────────────
  drawNPCs(npcs, tileMap, npcSheet) {
    if (!npcSheet) return;
    push();
    for (const npc of npcs) {
      const sc = tileMap.worldToScreen(npc.wx, npc.wy);
      const NW = 32, NH = 48;
      const frame = Math.floor(frameCount / 24) % 2;
      imageMode(CENTER);
      image(npcSheet,
        sc.x, sc.y,
        NW, NH,
        (npc.type * 2 + frame) * NW, 0,
        NW, NH
      );
      imageMode(CORNER);
    }
    pop();
  }

  // ── Menu Screen ───────────────────────────────────────────────────────
  drawMenu(w, h, portraitImg) {
    push();
    // Background gradient
    const grad = drawingContext.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#0a0a1e');
    grad.addColorStop(1, '#1a0a2e');
    drawingContext.fillStyle = grad;
    rect(0, 0, w, h);

    // Animated stars
    noStroke();
    for (let i = 0; i < 60; i++) {
      const sx = (i * 137 + frameCount * 0.1) % w;
      const sy = (i * 97 + frameCount * 0.05) % h;
      const sa = map(sin(frameCount * 0.03 + i), -1, 1, 80, 200);
      fill(200, 220, 255, sa);
      ellipse(sx, sy, 1.5, 1.5);
    }

    // Title box
    const TBX = w/2 - 260, TBY = h * 0.08;
    fill(10, 10, 40, 210);
    rect(TBX, TBY, 520, 90, 10);
    stroke(100, 140, 220, 200);
    strokeWeight(2);
    noFill();
    rect(TBX, TBY, 520, 90, 10);
    noStroke();

    // Title text
    fill(220, 235, 255);
    textSize(46);
    textAlign(CENTER, TOP);
    textFont('monospace');
    text("SENSORY JOURNEY", w/2, TBY + 10);

    fill(160, 200, 255, 200);
    textSize(14);
    text("An experience of sensory overload", w/2, TBY + 64);

    // Portrait
    if (portraitImg) {
      const PS = 96;
      const PX = w/2 - PS/2, PY = h * 0.26;
      fill(20, 20, 50);
      rect(PX - 6, PY - 6, PS + 12, PS + 12, 6);
      stroke(120, 160, 220, 180);
      strokeWeight(2);
      noFill();
      rect(PX - 4, PY - 4, PS + 8, PS + 8, 5);
      noStroke();
      image(portraitImg, PX, PY, PS, PS);
    }

    // How to play
    const HBOX_Y = h * 0.52;
    fill(10, 10, 40, 200);
    rect(w/2 - 290, HBOX_Y, 580, 200, 8);
    stroke(80, 110, 180, 140);
    strokeWeight(1);
    noFill();
    rect(w/2 - 289, HBOX_Y, 580, 200, 8);
    noStroke();

    fill(200, 220, 255);
    textSize(14);
    textAlign(CENTER, TOP);
    textFont('monospace');
    text("HOW TO PLAY", w/2, HBOX_Y + 14);

    fill(160, 185, 220);
    textSize(12);
    const LH = 22, TX = HBOX_Y + 40;
    text("WASD / Arrow keys  —  Move", w/2, TX);
    text("Hold SHIFT  —  Focus mode (reveals guide path, slows movement)", w/2, TX + LH);
    text("★ Gold stars  —  Checkpoints to visit before exit", w/2, TX + LH*2);
    text("Blue zones  —  Quiet areas that lower your sensory load", w/2, TX + LH*3);
    text("Orange rings  —  Noise sources that raise your load", w/2, TX + LH*4);
    fill(255, 180, 80, 200);
    textSize(11);
    text("⚠  If your sensory load maxes out, you restart the level", w/2, TX + LH*5 + 4);

    // Pulse enter prompt
    const alpha = map(sin(frameCount * 0.06), -1, 1, 140, 255);
    fill(255, 255, 255, alpha);
    textSize(18);
    text("▶  Press ENTER to Begin  ◀", w/2, h * 0.91);
    pop();
  }

  // ── Transition Screen ─────────────────────────────────────────────────
  drawTransition(level, w, h, timer, duration) {
    const t = constrain(timer / duration, 0, 1);
    // Fade in
    const fadeA = t < 0.3 ? map(t, 0, 0.3, 255, 0) : 0;

    push();
    background(10, 10, 30);

    // Level number badge
    fill(40, 60, 140, 200);
    rect(w/2 - 200, h * 0.12, 400, 60, 10);
    stroke(100, 140, 240, 200);
    strokeWeight(2);
    noFill();
    rect(w/2 - 199, h * 0.12, 400, 60, 10);
    noStroke();

    fill(160, 200, 255);
    textSize(13);
    textAlign(CENTER, CENTER);
    textFont('monospace');
    text(`LEVEL ${level.id + 1}`, w/2, h * 0.12 + 18);
    fill(230, 240, 255);
    textSize(28);
    text(level.name.toUpperCase(), w/2, h * 0.12 + 44);

    // Subtitle
    fill(180, 200, 240, 200);
    textSize(16);
    text(`"${level.subtitle}"`, w/2, h * 0.32);

    // Hint box
    fill(20, 20, 50, 200);
    rect(w/2 - 260, h * 0.42, 520, 64, 8);
    fill(220, 230, 255);
    textSize(13);
    text(level.levelHint, w/2, h * 0.42 + 32);

    // Controls reminder
    fill(140, 160, 200, 180);
    textSize(11);
    text("WASD/Arrows — Move    SHIFT — Focus    ENTER — Confirm", w/2, h * 0.60);

    // Sensory bar info
    fill(60, 220, 100, 200);
    textSize(12);
    text("Find the ★ checkpoint(s) then reach the green exit zone.", w/2, h * 0.68);

    fill(255, 180, 80, 200);
    textSize(12);
    text("Avoid orange noise zones. Use blue quiet zones to recover.", w/2, h * 0.74);

    // Enter prompt
    const pa = map(sin(frameCount * 0.06), -1, 1, 140, 255);
    fill(255, 255, 255, pa);
    textSize(17);
    text("Press ENTER to play", w/2, h * 0.88);

    // Fade overlay
    if (fadeA > 0) {
      fill(10, 10, 30, fadeA);
      rect(0, 0, w, h);
    }
    pop();
  }

  // ── Win / End Screen ──────────────────────────────────────────────────
  drawWin(level, w, h, isLastLevel) {
    push();
    background(10, 10, 30);

    // Stars rain effect
    noStroke();
    for (let i = 0; i < 30; i++) {
      const sy = ((frameCount * (1 + i % 3) * 0.5 + i * 40) % h);
      const sx = (i * 173) % w;
      const sa = random(100, 220);
      fill(255, 220, 80, sa);
      textSize(12 + i % 8);
      textAlign(CENTER, CENTER);
      text('★', sx, sy);
    }

    if (isLastLevel) {
      // Final ending
      fill(20, 20, 50, 220);
      rect(w/2 - 300, h * 0.15, 600, h * 0.65, 12);
      stroke(120, 160, 240, 180);
      strokeWeight(2);
      noFill();
      rect(w/2 - 299, h * 0.15, 600, h * 0.65, 12);
      noStroke();

      fill(220, 235, 255);
      textSize(32);
      textAlign(CENTER, TOP);
      textFont('monospace');
      text("You made it home.", w/2, h * 0.20);

      fill(180, 200, 240);
      textSize(15);
      textLeading(28);
      text("What looked simple from the outside\nrequired constant effort.\n\nFiltering. Adapting. Pushing through.\n\nNot everyone can see that work.\nBut it's real.", w/2, h * 0.33);

      fill(255, 220, 80, 220);
      textSize(12);
      text("1 in 36 people are autistic. Sensory processing differences are real.\nThank you for experiencing a glimpse of that journey.", w/2, h * 0.67);

      const pa = map(sin(frameCount * 0.05), -1, 1, 120, 255);
      fill(255, 255, 255, pa);
      textSize(16);
      text("Press R to play again", w/2, h * 0.84);
    } else {
      fill(230, 240, 255);
      textSize(38);
      textAlign(CENTER, CENTER);
      textFont('monospace');
      text("Level Complete!", w/2, h * 0.3);

      fill(180, 200, 255);
      textSize(15);
      text(`You navigated ${level.name}.`, w/2, h * 0.44);
      text("The sensory world is relentless. Rest a moment.", w/2, h * 0.52);

      const pa = map(sin(frameCount * 0.07), -1, 1, 120, 255);
      fill(255, 255, 255, pa);
      textSize(17);
      text("Press ENTER to continue", w/2, h * 0.70);
    }
    pop();
  }

  // ── Overload overlay ──────────────────────────────────────────────────
  drawOverloadRestart(w, h, alpha) {
    if (alpha <= 0) return;
    push();
    fill(255, 60, 60, alpha);
    rect(0, 0, w, h);
    if (alpha > 100) {
      fill(255, 255, 255, alpha);
      textSize(24);
      textAlign(CENTER, CENTER);
      textFont('monospace');
      text("Sensory overload!", w/2, h/2 - 20);
      textSize(14);
      text("You've been sent back to the start.", w/2, h/2 + 16);
    }
    pop();
  }
}
