// ============================================================
//  sketch.js  –  Sensory Journey  |  Main Game Loop
//  A game about navigating the world with sensory overload.
//  Visual style: Pokémon Ruby (GBA top-down pixel art)
// ============================================================

// ─── Assets ─────────────────────────────────────────────────────────────────
let imgTileset, imgPlayer, imgNPCs, imgPortrait, imgNoiseIcons, imgQuietZone;

// ─── Core objects ───────────────────────────────────────────────────────────
let tileMap, player, dialogue, overloadFX, ui;

// ─── Game state ─────────────────────────────────────────────────────────────
const STATE = { MENU:'menu', TRANS:'transition', PLAY:'play', DIALOG:'dialog', WIN:'win' };
let state       = STATE.MENU;
let levelIndex  = 0;
let levelData   = null;   // current LEVELS[] entry
let activeCheckpointIdx = 0;
let exitUnlocked        = false;

// ─── NPCs (runtime) ─────────────────────────────────────────────────────────
let npcInstances = [];

// ─── Overload restart flash ──────────────────────────────────────────────────
let overloadFlashAlpha = 0;

// ─── Transition timer ────────────────────────────────────────────────────────
let transitionTimer = 0;
const TRANSITION_DURATION = 180; // frames before auto-skip allowed

// ─── Game canvas size ────────────────────────────────────────────────────────
const CANVAS_W = 640;
const CANVAS_H = 480;

// ─── p5 preload ──────────────────────────────────────────────────────────────
function preload() {
  imgTileset    = loadImage('assets/images/tileset.png');
  imgPlayer     = loadImage('assets/images/player.png');
  imgNPCs       = loadImage('assets/images/npcs.png');
  imgPortrait   = loadImage('assets/images/portrait.png');
  imgNoiseIcons = loadImage('assets/images/noise_icons.png');
  imgQuietZone  = loadImage('assets/images/quiet_zone.png');
}

// ─── p5 setup ────────────────────────────────────────────────────────────────
function setup() {
  const cnv = createCanvas(CANVAS_W, CANVAS_H);
  cnv.parent('game-container');
  pixelDensity(1);
  imageMode(CORNER);
  textFont('monospace');

  // Init systems
  tileMap   = new TileMap();
  tileMap.load(imgTileset);

  player    = new Player();
  player.setSprite(imgPlayer);

  dialogue  = new DialogueSystem();
  overloadFX = new OverloadEffect();
  ui        = new GameUI();
  ui.setImages(imgPortrait, imgNoiseIcons, null);
}

// ─── p5 draw ─────────────────────────────────────────────────────────────────
function draw() {
  background(20, 20, 40);

  if      (state === STATE.MENU)  { drawMenu();       return; }
  if      (state === STATE.TRANS) { drawTransition(); return; }
  if      (state === STATE.WIN)   { drawWin();        return; }

  // ── PLAY / DIALOG ─────────────────────────────────────────────────────────
  const playing = (state === STATE.PLAY);

  // Camera shake offset
  const shakeX = overloadFX.getShakeX();
  const shakeY = overloadFX.getShakeY();

  push();
  translate(shakeX, shakeY);

  // World
  tileMap.draw(CANVAS_W, CANVAS_H);
  ui.drawQuietZones(levelData.quietZones, tileMap);
  ui.drawNoiseSources(levelData.noiseSources, tileMap, imgNoiseIcons);
  ui.drawCheckpoints(levelData.checkpoints, activeCheckpointIdx, tileMap);
  ui.drawExit(levelData.exit, tileMap, exitUnlocked);
  ui.drawFocusPath(player, levelData.exit, levelData.checkpoints, activeCheckpointIdx, tileMap);
  ui.drawNPCs(npcInstances, tileMap, imgNPCs);
  player.draw(tileMap);

  pop();

  // Overload visual effects (no shake on these)
  overloadFX.drawVignette(CANVAS_W, CANVAS_H);
  overloadFX.drawDistortion(player.sensory / player.sensoryMax);
  overloadFX.drawDistortion(player.sensory / player.sensoryMax);

  // HUD
  ui.drawLevelLabel(levelData.name, CANVAS_W);
  ui.drawSensoryBar(player.sensory, player.sensoryMax, CANVAS_W);

  // Dialogue
  dialogue.update();
  dialogue.draw(CANVAS_W, CANVAS_H);

  // Overload restart flash
  if (overloadFlashAlpha > 0) {
    ui.drawOverloadRestart(CANVAS_W, CANVAS_H, overloadFlashAlpha);
    overloadFlashAlpha -= 4;
  }

  if (!playing) return; // dialog paused – skip game logic

  // ── Game Logic ────────────────────────────────────────────────────────────
  // Update NPC movement (simple patrol)
  updateNPCs();

  // Player update
  player.update(tileMap);
  tileMap.updateCamera(player.wx, player.wy, CANVAS_W, CANVAS_H);

  // Sensory update
  const prevS = player.sensory;
  player.updateSensory(
    levelData.sensoryGain,
    levelData.noiseSources,
    levelData.quietZones,
    tileMap
  );
  overloadFX.update(player.sensory, player.sensoryMax);

  // Check overload
  if (player.overloaded) {
    overloadFlashAlpha = 255;
    player.reset(levelData.playerStart.tx, levelData.playerStart.ty);
    activeCheckpointIdx = 0;
    exitUnlocked        = false;
    return;
  }

  // Check checkpoint
  if (activeCheckpointIdx < levelData.checkpoints.length) {
    const cp = levelData.checkpoints[activeCheckpointIdx];
    const nc = tileMap.tileCentre(cp.tx, cp.ty);
    if (dist(player.wx, player.wy, nc.x, nc.y) < TILE_PX * 1.0) {
      state = STATE.DIALOG;
      dialogue.start(cp.dialog, () => {
        activeCheckpointIdx++;
        if (activeCheckpointIdx >= levelData.checkpoints.length) {
          exitUnlocked = true;
        }
        state = STATE.PLAY;
      }, imgPortrait);
    }
  }

  // Check exit
  if (exitUnlocked) {
    const ex  = levelData.exit;
    const exc = tileMap.tileCentre(ex.tx, ex.ty);
    if (dist(player.wx, player.wy, exc.x, exc.y) < TILE_PX * 1.2) {
      state = STATE.DIALOG;
      dialogue.start(levelData.exitDialog, () => {
        state = STATE.WIN;
      }, imgPortrait);
    }
  }
}

// ─── Screens ─────────────────────────────────────────────────────────────────
function drawMenu() {
  ui.drawMenu(CANVAS_W, CANVAS_H, imgPortrait);
}

function drawTransition() {
  transitionTimer++;
  ui.drawTransition(levelData, CANVAS_W, CANVAS_H, transitionTimer, TRANSITION_DURATION);
}

function drawWin() {
  const isLast = levelIndex >= LEVELS.length - 1;
  ui.drawWin(levelData, CANVAS_W, CANVAS_H, isLast);
}

// ─── Level Loading ───────────────────────────────────────────────────────────
function loadLevel(idx) {
  levelIndex  = idx;
  levelData   = LEVELS[idx];
  activeCheckpointIdx = 0;
  exitUnlocked = levelData.checkpoints.length === 0; // unlock exit if no checkpoints

  tileMap.setMap(levelData.map);
  player.reset(levelData.playerStart.tx, levelData.playerStart.ty);
  tileMap.updateCamera(player.wx, player.wy, CANVAS_W, CANVAS_H);

  // Init NPC runtime instances
  npcInstances = [];
  for (const npcDef of levelData.npcs) {
    npcInstances.push({
      wx: npcDef.tx * TILE_PX + TILE_PX/2,
      wy: npcDef.ty * TILE_PX + TILE_PX/2,
      type: npcDef.type,
      facing: npcDef.facing || 'down',
      patrol: npcDef.patrol || null,
      patrolIdx: 0,
      timer: 0,
    });
  }

  // Moving noise sources – set initial wx/wy
  for (const n of levelData.noiseSources) {
    if (n.moving && n.patrolPath) {
      n._patrolIdx = 0;
      n._tx = n.tx;
      n._ty = n.ty;
    }
  }

  state = STATE.TRANS;
  transitionTimer = 0;
}

function updateNPCs() {
  for (const npc of npcInstances) {
    if (!npc.patrol || npc.patrol.length < 2) continue;
    npc.timer++;
    if (npc.timer < 90) continue; // wait at each point
    npc.timer = 0;
    npc.patrolIdx = (npc.patrolIdx + 1) % npc.patrol.length;
    const pt = npc.patrol[npc.patrolIdx];
    npc.wx = pt.tx * TILE_PX + TILE_PX/2;
    npc.wy = pt.ty * TILE_PX + TILE_PX/2;
  }
}

// ─── Input ────────────────────────────────────────────────────────────────────
function keyPressed() {
  // Advance dialogue
  if (state === STATE.DIALOG) {
    if (keyCode === ENTER || key === 'z' || key === 'Z' || key === ' ') {
      dialogue.pressAdvance();
    }
    return;
  }

  if (keyCode === ENTER) {
    if (state === STATE.MENU) {
      loadLevel(0);
      // Show intro dialogue after transition
      return;
    }
    if (state === STATE.TRANS) {
      startPlayWithIntro();
      return;
    }
    if (state === STATE.WIN) {
      const isLast = levelIndex >= LEVELS.length - 1;
      if (!isLast) {
        loadLevel(levelIndex + 1);
      }
      return;
    }
  }

  if (key === 'r' || key === 'R') {
    if (state === STATE.WIN && levelIndex >= LEVELS.length - 1) {
      // Restart from beginning
      loadLevel(0);
    } else if (state === STATE.PLAY || state === STATE.DIALOG) {
      // Quick restart current level
      loadLevel(levelIndex);
    }
  }
}

function startPlayWithIntro() {
  state = STATE.DIALOG;
  dialogue.start(levelData.intro, () => {
    state = STATE.PLAY;
  }, imgPortrait);
  // If no intro, just play
  if (!levelData.intro || levelData.intro.length === 0) {
    state = STATE.PLAY;
  }
}

// ─── Auto-advance transition ──────────────────────────────────────────────────
// (pressing Enter in transition goes to intro dialog → play)
// Auto-skip after TRANSITION_DURATION frames is disabled; player must press Enter.
