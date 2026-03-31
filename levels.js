// ============================================================
//  levels.js  –  All level data for Sensory Journey
// ============================================================

// Tile IDs (match tileset.png column order, each tile = 32px wide)
const TILES = {
  GRASS:       0,
  GRASS_D:     1,
  ROAD_H:      2,
  ROAD_V:      3,
  SIDEWALK:    4,
  PATH:        5,
  FLOOR_A:     6,
  FLOOR_B:     7,
  WALL_H:      8,
  WALL_CORNER: 9,
  TREE_TOP:    10,
  TREE_BOT:    11,
  WATER:       12,
  PARK_GRASS:  13,
  FLOWERS:     14,
  BLDG_WALL:   15,
  WINDOW:      16,
  FENCE:       17,
  DOOR:        18,
  SOLID:       19,
};

// Which tiles block movement
const BLOCKED_TILES = new Set([8, 9, 10, 11, 12, 15, 16, 17, 19]);

// ─── Level 1: Home ─────────────────────────────────────────────────────────
// 20 × 15 tiles.  Player starts in bedroom (col 1–5, row 1–5).
// Fridge trigger at col 17-18, row 7-8.  Exit door col 18, row 11.
//  S = SOLID(19)  F = FLOOR_A(6)  f = FLOOR_B(7)  D = DOOR(18)
const L = 19; // solid wall shorthand
const FA = 6;
const FB = 7;

const LEVEL1_MAP = [
  [L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L],
  [L,FA,FA,FA,FA,FA, L,FB,FB,FB,FB,FB,FB,FB,FB,FB,FB,FB,FB, L],
  [L,FA,FA,FA,FA,FA, L,FB,FB,FB,FB,FB,FB,FB,FB,FB,FB,FB,FB, L],
  [L,FA,FA,FA,FA,FA,FA,FB,FB,FB,FB,FB,FB,FB,FB,FB,FB,FB,FB, L],
  [L,FA,FA,FA,FA,FA, L,FB,FB,FB,FB,FB,FB,FB,FB,FB,FB,FB,FB, L],
  [L,FA,FA,FA,FA,FA, L,FB,FB,FB,FB,FB,FB,FB,FB,FB,FB,FB,FB, L],
  [L, L, L,FA, L, L, L, L, L,FB,FB, L, L, L, L, L, L, L, L, L],
  [L,FB,FB,FA,FB,FB, L,FB,FB,FB,FB,FB,FB,FB,FB,FB,FB,FB,FB, L],
  [L,FB,FB,FA,FB,FB, L, L, L,FB,FB, L, L, L, L, L, L, L, L, L],
  [L,FB,FB,FA,FB,FB,FB,FB,FB,FB,FB,FB,FB,FB,FB,FB,FB,FB,FB, L],
  [L,FB,FB,FA,FB,FB, L,FB,FB,FB,FB,FB,FB,FB,FB,FB,FB,FB,FB, L],
  [L,FB,FB,FA,FB,FB, L,FB,FB,FB,FB,FB,FB,FB,FB,FB,FB,FB, 18, L],
  [L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L],
  [L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L],
  [L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L],
];

// ─── Level 2: The Streets ──────────────────────────────────────────────────
// 20 × 15 tiles.  Player starts left side near apartment.
// Navigate busy road to reach grocery store (right side).
const G = 0;
const R = 2;
const S = 4;
const BW = 15;
const WN = 16;

const LEVEL2_MAP = [
  [G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G],
  [BW,BW,BW, WN,BW, WN,BW, G,  R,  R,  R,  R,  R,  G,  BW,BW,BW,BW,BW,BW],
  [BW,BW,BW, WN,BW, WN,BW, S,  R,  R,  R,  R,  R,  S,  BW,BW,BW,BW,BW,BW],
  [18, S,  S,  S,  S,  S,  S,  S,  R,  R,  R,  R,  R,  S,  S,  S,  S,  S,  S, 18],
  [BW, S,  S,  S,  S,  S,  S,  S,  R,  R,  R,  R,  R,  S,  S,  S,  S,  S,  S,BW],
  [BW,BW,BW,BW, S,  S,  S,  S,  R,  R,  R,  R,  R,  S,  S,  S,  S,BW,BW,BW],
  [G,  G,  G,BW, S,  S,  S,  S,  R,  R,  R,  R,  R,  S,  S,  S,BW, G,  G,  G],
  [G,  G,  G,  S,  S,  S,  S,  S,  R,  R,  R,  R,  R,  S,  S,  S,  S,  G,  G,  G],
  [G,  G,  G,  S,  S,  S,  S,  S,  R,  R,  R,  R,  R,  S,  S,  S,  S,  G,  G,  G],
  [G,  G,  G,BW, S,  S,  S,  S,  R,  R,  R,  R,  R,  S,  S,  S,BW, G,  G,  G],
  [BW,BW,BW,BW, S,  S,  S,  S,  R,  R,  R,  R,  R,  S,  S,  S,  S,BW,BW,BW],
  [BW, S,  S,  S,  S,  S,  S,  S,  R,  R,  R,  R,  R,  S,  S,  S,  S,  S,  S,BW],
  [18, S,  S,  S,  S,  S,  S,  S,  R,  R,  R,  R,  R,  S,  S,  S,  S,  S,  S, 18],
  [BW,BW,BW,BW,BW,BW,BW,  S,  R,  R,  R,  R,  R,  S,BW,BW,BW,BW,BW,BW],
  [G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G],
];

// ─── Level 3: Park Route Home ──────────────────────────────────────────────
// Road home is blocked – must cut through the park.
const PG = 13; // park grass
const FL = 14; // flowers
const FN = 17; // fence
const PA = 5;  // path
const TT = 10; // tree top
const TB = 11; // tree bottom
const WA = 12; // water

const LEVEL3_MAP = [
  [TT,TT,TT,TT,TT,TT, G,  G,  G,  G,  G,  G,  G,  G,  G,  G, TT,TT,TT,TT],
  [TB,TB,TB,TB,TB,TB, G,  G,  G,  G,  G,  G,  G,  G,  G,  G, TB,TB,TB,TB],
  [PG,PG,PG,PG, PA, PA,PA, PA,PG, PG, PG,PG, PA, PA, PA, PA, PA, PG, PG, PG],
  [PG,PG,FL,PG, PA,PG,PG, PA,PG, PG, PG,PG, PA,PG, PG, PG, PA, FL, PG, PG],
  [PG,PG,PG,PG, PA,PG,PG, PA,PG, PG,FL,PG, PA,PG, PG, PG, PA,PG, PG, PG],
  [FN,FN,FN, PA,PA,PG,PG, PA, PA, PA, PA, PA, PA,PG, PG, PA,PA,FN,FN,FN],
  [WA,WA,WA, PA,PG,PG,PG, PG,PG, PG, PG,PG, PA,PG, PG,PG, PA,WA,WA,WA],
  [WA,WA,WA, PA,PG,FL,PG, PG,PG, PG, PG,PG, PA,PG,FL, PG, PA,WA,WA,WA],
  [WA,WA,WA, PA,PG,PG,TT, TT,PG, PG, PG,TT, PA,TT,PG, PG, PA,WA,WA,WA],
  [WA,WA,WA, PA,PG,PG,TB, TB,PG, PG, PG,TB, PA,TB,PG, PG, PA,WA,WA,WA],
  [PG,PG,PG, PA,PA,PA,PA, PA,PA, PA, PA,PA, PA,PA, PA, PA, PA,PG,PG,PG],
  [PG,FL,PG, PA,PG,PG,PG, PG,PG, PG,FL,PG, PA,PG, PG, PG, PA,PG,FL,PG],
  [PG,PG,PG, PA,PG,PG,PG, PG,PG, PG, PG,PG, PA,PG, PG, PG, PA,PG,PG,PG],
  [BW,BW, 18, PA,PA,PA,PA, PA,PA, PA, PA,PA, PA,PA, PA, PA, PA, 18,BW,BW],
  [G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G],
];

// ─── Level definitions ─────────────────────────────────────────────────────
const LEVELS = [
  // ── LEVEL 1 ────────────────────────────────────────────────────────────
  {
    id: 0,
    name: "Home",
    subtitle: "Just another ordinary morning.",
    map: LEVEL1_MAP,
    bgColor: [220, 200, 160],
    ambientDark: false,
    sensoryGain: 0.06,    // per frame baseline
    playerStart: { tx: 2, ty: 2 }, // tile coords

    // Things that make noise (circles of influence)
    noiseSources: [
      { tx: 8,  ty: 2, radius: 3, strength: 0.9, type: 0, label: "TV",     moving: false },
      { tx: 17, ty: 8, radius: 2, strength: 0.6, type: 1, label: "Fridge", moving: false },
    ],

    // Blue quiet zones (tile rects)
    quietZones: [
      { tx: 1, ty: 1, tw: 5, th: 5, drain: 3.0, label: "Bedroom" },
    ],

    // Collectible checkpoints (must visit in order)
    checkpoints: [
      {
        tx: 17, ty: 8, label: "Check the fridge",
        dialog: [
          { speaker: "Alex", text: "The fridge is completely empty... I need to go to the grocery store." },
          { speaker: "Alex", text: "I'll have to go outside. I hope it's not too busy today." },
        ]
      },
    ],

    // Exit zone (tile coords)
    exit: { tx: 18, ty: 11, tw: 1, th: 1 },

    // Intro dialogue
    intro: [
      { speaker: "Alex", text: "Morning. My head's already buzzing..." },
      { speaker: "Alex", text: "Better grab something to eat. Let me check the kitchen." },
    ],

    // NPC definitions (static or patrolling)
    npcs: [],

    // Story events keyed by checkpoint index
    exitDialog: [
      { speaker: "Alex", text: "Okay. The store it is. I can do this." },
    ],

    levelHint: "Check the fridge in the kitchen, then head to the front door.",
  },

  // ── LEVEL 2 ────────────────────────────────────────────────────────────
  {
    id: 1,
    name: "The Street",
    subtitle: "Outside is a whole other world.",
    map: LEVEL2_MAP,
    bgColor: [120, 130, 110],
    ambientDark: false,
    sensoryGain: 0.11,
    playerStart: { tx: 1, ty: 3 },

    noiseSources: [
      { tx: 10, ty: 7,  radius: 5, strength: 1.2, type: 2, label: "Traffic",     moving: false },
      { tx: 4,  ty: 10, radius: 3, strength: 1.0, type: 3, label: "Crowd",       moving: false },
      { tx: 16, ty: 4,  radius: 3, strength: 0.9, type: 3, label: "Crowd",       moving: false },
      { tx: 10, ty: 3,  radius: 4, strength: 0.8, type: 2, label: "Bus",         moving: false },
    ],

    quietZones: [
      { tx: 4, ty: 5, tw: 3, th: 2, drain: 2.5, label: "Alley" },
      { tx: 14, ty: 9, tw: 2, th: 3, drain: 2.0, label: "Quiet Spot" },
    ],

    checkpoints: [
      {
        tx: 17, ty: 3, label: "Grocery Store Entrance",
        dialog: [
          { speaker: "Alex", text: "Made it... The store is right here." },
          { speaker: "Alex", text: "Okay. Get in, get what I need, get out." },
        ]
      },
    ],

    exit: { tx: 19, ty: 3, tw: 1, th: 2 },

    intro: [
      { speaker: "Alex", text: "So many sounds. Cars, people, construction..." },
      { speaker: "Alex", text: "Just focus. One step at a time. The store is to the right." },
    ],

    exitDialog: [
      { speaker: "Alex", text: "Got everything. Now to get home... wait." },
      { speaker: "Alex", text: "The main road is blocked. There must be an accident." },
      { speaker: "Alex", text: "I'll have to go around... through the park." },
    ],

    npcs: [
      { tx: 5, ty: 7, type: 1, facing: 'down', patrol: null },
      { tx: 15, ty: 6, type: 0, facing: 'right', patrol: null },
    ],

    levelHint: "Cross the street and reach the grocery store on the right.",
  },

  // ── LEVEL 3 ────────────────────────────────────────────────────────────
  {
    id: 2,
    name: "The Park",
    subtitle: "The long way home.",
    map: LEVEL3_MAP,
    bgColor: [80, 120, 60],
    ambientDark: false,
    sensoryGain: 0.14,
    playerStart: { tx: 17, ty: 13 },

    noiseSources: [
      { tx: 6,  ty: 5, radius: 4, strength: 1.1, type: 3, label: "Kids Playing",  moving: false },
      { tx: 14, ty: 6, radius: 3, strength: 1.3, type: 4, label: "Dog Barking",   moving: true,  patrolPath: [{tx:14,ty:6},{tx:16,ty:8},{tx:14,ty:10},{tx:12,ty:8}] },
      { tx: 3,  ty: 11, radius: 3, strength: 0.8, type: 3, label: "Music",        moving: false },
      { tx: 10, ty: 3,  radius: 3, strength: 0.7, type: 2, label: "Lawnmower",   moving: false },
    ],

    quietZones: [
      { tx: 7, ty: 9, tw: 3, th: 2, drain: 2.5, label: "Shaded Bench" },
      { tx: 1, ty: 11, tw: 2, th: 2, drain: 2.0, label: "Corner" },
    ],

    checkpoints: [],

    exit: { tx: 2, ty: 13, tw: 1, th: 1 },

    intro: [
      { speaker: "Alex", text: "The park... it's usually a shortcut on good days." },
      { speaker: "Alex", text: "Today does not feel like a good day. My brain is exhausted." },
      { speaker: "Alex", text: "Just get home. Just get home." },
    ],

    exitDialog: [
      { speaker: "Alex", text: "Home. Finally." },
      { speaker: "Alex", text: "I need to sit down and not think for a while." },
      { speaker: "", text: "What seemed like a simple errand required constant effort." },
      { speaker: "", text: "Filtering out noise, managing overwhelm, finding the energy to keep going." },
      { speaker: "", text: "Not everyone sees the work that goes into ordinary things." },
    ],

    npcs: [
      { tx: 6, ty: 4, type: 2, facing: 'down', patrol: [{tx:6,ty:4},{tx:6,ty:7},{tx:9,ty:7},{tx:9,ty:4}] },
      { tx: 12, ty: 10, type: 2, facing: 'right', patrol: null },
    ],

    levelHint: "Navigate the park and find your way home. Watch out for the dog.",
  },
];

// ─── Helpers used by sketch.js ─────────────────────────────────────────────
function isTileBlocked(tileId) {
  return BLOCKED_TILES.has(tileId);
}

function getTileAt(map, col, row) {
  if (row < 0 || row >= map.length) return 19;
  if (col < 0 || col >= map[0].length) return 19;
  return map[row][col];
}
