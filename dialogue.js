// ============================================================
//  dialogue.js  –  Pokemon-style dialog / narrative system
// ============================================================

class DialogueSystem {
  constructor() {
    this.active      = false;
    this.lines       = [];     // array of { speaker, text }
    this.lineIndex   = 0;
    this.charIndex   = 0;      // typewriter progress
    this.fullText    = "";
    this.displayText = "";
    this.speed       = 2;      // chars per frame
    this.onComplete  = null;   // callback when all lines done
    this.blinkTimer  = 0;
    this.portraitImg = null;
    this.advance     = false;  // flag set by input
    this._waitFrame  = false;  // skip one frame on advance
  }

  // Start a new conversation
  start(lines, onComplete = null, portrait = null) {
    if (!lines || lines.length === 0) {
      if (onComplete) onComplete();
      return;
    }
    this.active      = true;
    this.lines       = lines;
    this.lineIndex   = 0;
    this.charIndex   = 0;
    this.onComplete  = onComplete;
    this.portraitImg = portrait;
    this.advance     = false;
    this._waitFrame  = false;
    this._loadLine();
  }

  _loadLine() {
    const line    = this.lines[this.lineIndex];
    this.fullText    = line.text;
    this.speaker     = line.speaker || "";
    this.displayText = "";
    this.charIndex   = 0;
  }

  // Call once per frame from draw()
  update() {
    if (!this.active) return;

    if (this._waitFrame) { this._waitFrame = false; return; }

    const done = this.charIndex >= this.fullText.length;

    if (this.advance) {
      this.advance = false;
      if (!done) {
        // Snap to full text
        this.charIndex   = this.fullText.length;
        this.displayText = this.fullText;
      } else {
        // Move to next line
        this.lineIndex++;
        if (this.lineIndex >= this.lines.length) {
          this.active = false;
          if (this.onComplete) this.onComplete();
        } else {
          this._loadLine();
          this._waitFrame = true;
        }
      }
      return;
    }

    // Typewriter
    if (!done) {
      this.charIndex = min(this.charIndex + this.speed, this.fullText.length);
      this.displayText = this.fullText.substring(0, this.charIndex);
    }

    this.blinkTimer++;
  }

  // Press Enter / Z / Space to advance
  pressAdvance() {
    if (!this.active) return;
    this.advance = true;
  }

  // Draw the dialog box at bottom of screen
  draw(w, h) {
    if (!this.active) return;

    const PAD   = 16;
    const BOX_H = 110;
    const BOX_W = w - PAD * 2;
    const BOX_Y = h - BOX_H - PAD;

    // Frosted glass box
    push();
    noStroke();
    fill(10, 10, 30, 210);
    rect(PAD, BOX_Y, BOX_W, BOX_H, 8);

    // Border
    stroke(180, 200, 255, 180);
    strokeWeight(2);
    noFill();
    rect(PAD + 1, BOX_Y + 1, BOX_W - 2, BOX_H - 2, 7);
    noStroke();

    // Inner highlight
    stroke(255, 255, 255, 40);
    strokeWeight(1);
    line(PAD + 6, BOX_Y + 3, PAD + BOX_W - 6, BOX_Y + 3);
    noStroke();

    // Portrait area
    const PORTRAIT_SIZE = 64;
    const PX = PAD + 12;
    const PY = BOX_Y + (BOX_H - PORTRAIT_SIZE) / 2;

    // Portrait border
    fill(0, 0, 0, 120);
    rect(PX - 3, PY - 3, PORTRAIT_SIZE + 6, PORTRAIT_SIZE + 6, 4);
    stroke(160, 180, 220, 200);
    strokeWeight(2);
    noFill();
    rect(PX - 2, PY - 2, PORTRAIT_SIZE + 4, PORTRAIT_SIZE + 4, 3);
    noStroke();

    if (this.portraitImg) {
      image(this.portraitImg, PX, PY, PORTRAIT_SIZE, PORTRAIT_SIZE);
    } else {
      // Default silhouette
      fill(40, 60, 100);
      rect(PX, PY, PORTRAIT_SIZE, PORTRAIT_SIZE, 2);
      fill(100, 130, 180);
      ellipse(PX + 32, PY + 22, 28, 28);
      rect(PX + 16, PY + 36, 32, 24, 4);
    }

    // Speaker name
    const TEXT_X = PX + PORTRAIT_SIZE + 16;
    if (this.speaker) {
      // Name tag
      fill(40, 60, 140, 230);
      rect(TEXT_X - 4, BOX_Y + 8, textWidth(this.speaker) + 18, 22, 4);
      fill(220, 230, 255);
      textFont('monospace');
      textSize(14);
      textAlign(LEFT, TOP);
      noStroke();
      text(this.speaker, TEXT_X + 5, BOX_Y + 12);
    }

    // Dialog text
    fill(230, 240, 255);
    textSize(15);
    textFont('monospace');
    textAlign(LEFT, TOP);
    textLeading(22);
    noStroke();
    text(this.displayText, TEXT_X, BOX_Y + 36, BOX_W - TEXT_X - PAD, BOX_H - 50);

    // Advance indicator (blinking arrow)
    if (this.charIndex >= this.fullText.length) {
      let alpha = sin(this.blinkTimer * 0.1) > 0 ? 255 : 0;
      fill(200, 220, 255, alpha);
      textSize(14);
      textAlign(RIGHT, BOTTOM);
      text("▼  ENTER", PAD + BOX_W - 8, BOX_Y + BOX_H - 8);
    }

    pop();
  }
}

// ─── Screen flash for sensory overload ─────────────────────────────────────
class OverloadEffect {
  constructor() {
    this.flashTimer  = 0;
    this.shakeAmount = 0;
    this.flashAmt    = 0;
    this.vignetteAmt = 0;
    this.prevSensory = 0;
  }

  update(sensory, sensoryMax) {
    const t = sensory / sensoryMax;

    // Vignette grows with sensory
    this.vignetteAmt = t * t * 0.85;

    // Shake when above 70%
    this.shakeAmount = t > 0.7 ? (t - 0.7) * 25 : 0;

    // Flash on crossing 100%
    if (sensory >= sensoryMax && this.prevSensory < sensoryMax) {
      this.flashTimer = 20;
    }
    if (this.flashTimer > 0) {
      this.flashAmt = this.flashTimer / 20;
      this.flashTimer--;
    } else {
      this.flashAmt = 0;
    }
    this.prevSensory = sensory;
  }

  getShakeX() { return this.shakeAmount > 0 ? random(-this.shakeAmount, this.shakeAmount) : 0; }
  getShakeY() { return this.shakeAmount > 0 ? random(-this.shakeAmount, this.shakeAmount) : 0; }

  drawVignette(w, h) {
    if (this.vignetteAmt <= 0.01) return;
    push();
    noStroke();
    // Dark pulsing vignette (red tinge at high overload)
    const r = this.vignetteAmt > 0.6 ? lerpColor(color(0,0,0,0), color(120,0,0,0), (this.vignetteAmt-0.6)/0.4) : null;
    for (let i = 0; i < 12; i++) {
      const a  = map(i, 0, 12, 0, this.vignetteAmt * 180);
      const rx = map(i, 0, 12, w/2, w * 0.1);
      const ry = map(i, 0, 12, h/2, h * 0.1);
      if (this.vignetteAmt > 0.6) {
        fill(100, 0, 0, a * 0.8);
      } else {
        fill(0, 0, 0, a);
      }
      rect(0, 0, w, h);
      // ellipse-shaped cutout
      // (we approximate vignette with radial gradient rects)
    }
    // Simpler approach: draw corner shadows
    for (let i = 0; i < 8; i++) {
      const ext = map(i, 0, 8, 0, this.vignetteAmt * Math.min(w, h) * 0.55);
      const a   = map(i, 0, 8, 0, this.vignetteAmt * 200);
      fill(this.vignetteAmt > 0.6 ? color(80,0,0,a) : color(0,0,0,a));
      // top edge
      rect(0, 0, w, ext);
      // bottom edge
      rect(0, h - ext, w, ext);
      // left edge
      rect(0, 0, ext, h);
      // right edge
      rect(w - ext, 0, ext, h);
    }

    // Flash
    if (this.flashAmt > 0) {
      fill(255, 255, 255, this.flashAmt * 255);
      rect(0, 0, w, h);
    }
    pop();
  }

  drawDistortion(t) {
    // Visual noise at high sensory (drawn as scanlines)
    if (t < 0.75) return;
    const intensity = (t - 0.75) / 0.25;
    push();
    noStroke();
    for (let i = 0; i < 5; i++) {
      const y = random(height);
      const h = random(1, 4);
      fill(255, random(50, 120) * intensity);
      rect(0, y, width, h);
    }
    pop();
  }
}
