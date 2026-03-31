// ============================================================
//  tilemap.js  –  Tile renderer with Pokemon-style camera
// ============================================================

const TILE_PX = 32; // display size per tile (px)

class TileMap {
  constructor() {
    this.tileImg   = null;   // tileset spritesheet
    this.tileCount = 20;     // number of tiles in sheet
    this.tileSheet = null;   // reference to loaded p5.Image
    this.map       = [];
    this.cols      = 0;
    this.rows      = 0;
    this.camX      = 0;      // camera offset in pixels
    this.camY      = 0;
  }

  load(tileSheet) {
    this.tileSheet = tileSheet;
    this.tileCount = Math.floor(tileSheet.width / (TILE_PX));
  }

  setMap(mapData) {
    this.map  = mapData;
    this.rows = mapData.length;
    this.cols = mapData[0].length;
  }

  // Tile at pixel position (world space)
  tileAtPixel(wx, wy) {
    const col = Math.floor(wx / TILE_PX);
    const row = Math.floor(wy / TILE_PX);
    return getTileAt(this.map, col, row);
  }

  // Tile at tile coords
  tileAt(col, row) {
    return getTileAt(this.map, col, row);
  }

  // World-space x/y of tile centre
  tileCentre(col, row) {
    return { x: col * TILE_PX + TILE_PX / 2, y: row * TILE_PX + TILE_PX / 2 };
  }

  // Update camera to follow a world-space point
  updateCamera(wx, wy, screenW, screenH) {
    const targetX = wx - screenW / 2;
    const targetY = wy - screenH / 2;
    const maxX     = this.cols * TILE_PX - screenW;
    const maxY     = this.rows * TILE_PX - screenH;
    this.camX      = constrain(targetX, 0, max(0, maxX));
    this.camY      = constrain(targetY, 0, max(0, maxY));
  }

  // Draw visible tiles
  draw(screenW, screenH) {
    const firstCol = Math.max(0, Math.floor(this.camX / TILE_PX));
    const firstRow = Math.max(0, Math.floor(this.camY / TILE_PX));
    const lastCol  = Math.min(this.cols - 1, Math.ceil((this.camX + screenW) / TILE_PX));
    const lastRow  = Math.min(this.rows - 1, Math.ceil((this.camY + screenH) / TILE_PX));

    for (let row = firstRow; row <= lastRow; row++) {
      for (let col = firstCol; col <= lastCol; col++) {
        const tileId = this.map[row][col];
        const sx     = col * TILE_PX - this.camX;
        const sy     = row * TILE_PX - this.camY;
        this._drawTile(tileId, sx, sy);
      }
    }
  }

  _drawTile(id, sx, sy) {
    if (!this.tileSheet) {
      // Fallback: solid colour
      fill(TILE_COLORS[id] || [80,80,80]);
      noStroke();
      rect(sx, sy, TILE_PX, TILE_PX);
      return;
    }
    // Source rectangle in tilesheet
    const srcX = id * TILE_PX;
    const srcY = 0;
    image(this.tileSheet, sx, sy, TILE_PX, TILE_PX, srcX, srcY, TILE_PX, TILE_PX);
  }

  // Collision helper: can a circle (world x,y,r) fit without hitting blocked tiles?
  circleCanMove(wx, wy, radius) {
    // Check the four cardinal extent points + centre
    const checks = [
      [wx,          wy         ],
      [wx - radius, wy         ],
      [wx + radius, wy         ],
      [wx,          wy - radius],
      [wx,          wy + radius],
      [wx - radius, wy - radius],
      [wx + radius, wy - radius],
      [wx - radius, wy + radius],
      [wx + radius, wy + radius],
    ];
    for (const [cx, cy] of checks) {
      const col = Math.floor(cx / TILE_PX);
      const row = Math.floor(cy / TILE_PX);
      if (isTileBlocked(getTileAt(this.map, col, row))) return false;
    }
    return true;
  }

  // World → screen
  worldToScreen(wx, wy) {
    return { x: wx - this.camX, y: wy - this.camY };
  }

  // Screen → world
  screenToWorld(sx, sy) {
    return { x: sx + this.camX, y: sy + this.camY };
  }
}

// Fallback colours if image fails to load
const TILE_COLORS = {
  0:  [104, 184, 56],
  1:  [80,  152, 40],
  2:  [96,   96,104],
  3:  [96,   96,104],
  4:  [184, 168,144],
  5:  [184, 152,104],
  6:  [200, 184,152],
  7:  [184, 168,136],
  8:  [168, 144,120],
  9:  [168, 144,120],
  10: [48,  120, 32],
  11: [56,   40, 24],
  12: [56,  120,176],
  13: [80,  160, 64],
  14: [80,  160, 64],
  15: [200, 192,184],
  16: [168, 200,216],
  17: [136,  96, 56],
  18: [152, 104, 48],
  19: [48,   40, 32],
};
