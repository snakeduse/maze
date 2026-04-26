import type { GameAssetKey, GameAssets } from "./assets";
import type { GameState, TileType } from "./types";

export const TILE_SIZE = 48;

const colors = {
  acid: "#6fbf3d",
  acidDark: "#4d8d2a",
  canvasShadow: "#d8c4a1",
  dynamite: "#7d4b2a",
  dynamiteFuse: "#f0c36a",
  fire: "#e36b2c",
  fireInner: "#ffd16b",
  floor: "#f4ead7",
  floorAccent: "#ead8b7",
  goal: "#8ab65f",
  goalInner: "#f7f1c8",
  grid: "#deceb2",
  key: "#d8b23f",
  lockedDoor: "#6b604d",
  lockedDoorInner: "#8d7d62",
  player: "#d65a31",
  playerOutline: "#fff2db",
  portalOne: "#4f7bc8",
  portalTwo: "#6c58b8",
  spikes: "#9b2f2f",
  symbol: "#f8efe0",
  wall: "#2f3a4a",
  wallHighlight: "#526073",
};

const tileAssetByType: Partial<Record<TileType, GameAssetKey>> = {
  acid: "acid",
  dynamite: "dynamite",
  fire: "fire",
  floor: "floor",
  goal: "goal",
  key: "key",
  lockedDoor: "door",
  portalOne: "portal1",
  portalTwo: "portal2",
  spikes: "spikes",
  wall: "wall",
};

export function resizeCanvas(canvas: HTMLCanvasElement, state: GameState): void {
  canvas.width = state.width * TILE_SIZE;
  canvas.height = state.height * TILE_SIZE;
}

export function renderGame(canvas: HTMLCanvasElement, state: GameState, assets: GameAssets): void {
  const context = canvas.getContext("2d");

  if (context === null) {
    throw new Error("Canvas 2D context is not available.");
  }

  context.imageSmoothingEnabled = false;
  context.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < state.height; y += 1) {
    for (let x = 0; x < state.width; x += 1) {
      drawTile(context, getRenderedTile(state.tiles[y][x], state), x, y, assets);
    }
  }

  drawPlayer(context, state, assets);
}

function drawTile(
  context: CanvasRenderingContext2D,
  tile: TileType,
  x: number,
  y: number,
  assets: GameAssets,
): void {
  const tileX = x * TILE_SIZE;
  const tileY = y * TILE_SIZE;

  if (drawTileWithImage(context, tile, tileX, tileY, assets)) {
    return;
  }

  drawFloorTile(context, tileX, tileY);

  switch (tile) {
    case "wall":
      drawWallTile(context, tileX, tileY);
      break;
    case "goal":
      drawGoalTile(context, tileX, tileY);
      break;
    case "spikes":
      drawSpikesTile(context, tileX, tileY);
      break;
    case "fire":
      drawFireTile(context, tileX, tileY);
      break;
    case "acid":
      drawAcidTile(context, tileX, tileY);
      break;
    case "dynamite":
      drawDynamiteTile(context, tileX, tileY);
      break;
    case "portalOne":
      drawPortalTile(context, tileX, tileY, colors.portalOne, "1");
      break;
    case "portalTwo":
      drawPortalTile(context, tileX, tileY, colors.portalTwo, "2");
      break;
    case "key":
      drawKeyTile(context, tileX, tileY);
      break;
    case "lockedDoor":
      drawLockedDoorTile(context, tileX, tileY);
      break;
    case "floor":
      break;
  }

  drawTileGrid(context, tileX, tileY);
}

function getRenderedTile(tile: TileType, state: GameState): TileType {
  if (tile === "key" && state.hasKey) {
    return "floor";
  }

  return tile;
}

function drawPlayer(context: CanvasRenderingContext2D, state: GameState, assets: GameAssets): void {
  const tileX = state.playerPosition.x * TILE_SIZE;
  const tileY = state.playerPosition.y * TILE_SIZE;

  if (drawImageTile(context, assets.player, tileX, tileY)) {
    return;
  }

  const centerX = tileX + TILE_SIZE / 2;
  const centerY = tileY + TILE_SIZE / 2;
  const radius = TILE_SIZE * 0.32;

  context.fillStyle = colors.player;
  context.beginPath();
  context.arc(centerX, centerY, radius, 0, Math.PI * 2);
  context.fill();
  context.lineWidth = 3;
  context.strokeStyle = colors.playerOutline;
  context.stroke();
}

function drawTileWithImage(
  context: CanvasRenderingContext2D,
  tile: TileType,
  tileX: number,
  tileY: number,
  assets: GameAssets,
): boolean {
  if (tile === "wall") {
    return drawImageTile(context, getTileImage(assets, tile), tileX, tileY);
  }

  const hasFloor = drawImageTile(context, getTileImage(assets, "floor"), tileX, tileY);

  switch (tile) {
    case "floor":
      return hasFloor;
    default:
      return hasFloor && drawImageTile(context, getTileImage(assets, tile), tileX, tileY);
  }
}

function drawImageTile(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement | null,
  tileX: number,
  tileY: number,
): boolean {
  if (image === null) {
    return false;
  }

  context.drawImage(image, tileX, tileY, TILE_SIZE, TILE_SIZE);
  return true;
}

function drawFloorTile(context: CanvasRenderingContext2D, tileX: number, tileY: number): void {
  context.fillStyle = colors.floor;
  context.fillRect(tileX, tileY, TILE_SIZE, TILE_SIZE);

  context.fillStyle = colors.floorAccent;
  context.beginPath();
  context.arc(tileX + TILE_SIZE * 0.28, tileY + TILE_SIZE * 0.28, TILE_SIZE * 0.05, 0, Math.PI * 2);
  context.arc(tileX + TILE_SIZE * 0.72, tileY + TILE_SIZE * 0.68, TILE_SIZE * 0.05, 0, Math.PI * 2);
  context.fill();
}

function drawWallTile(context: CanvasRenderingContext2D, tileX: number, tileY: number): void {
  context.fillStyle = colors.wall;
  context.fillRect(tileX, tileY, TILE_SIZE, TILE_SIZE);
  context.fillStyle = colors.wallHighlight;
  context.fillRect(tileX, tileY, TILE_SIZE, 6);
  context.fillRect(tileX, tileY, 6, TILE_SIZE);
}

function drawGoalTile(context: CanvasRenderingContext2D, tileX: number, tileY: number): void {
  const centerX = tileX + TILE_SIZE / 2;
  const centerY = tileY + TILE_SIZE / 2;

  context.strokeStyle = colors.goal;
  context.lineWidth = 5;
  context.beginPath();
  context.arc(centerX, centerY, TILE_SIZE * 0.28, 0, Math.PI * 2);
  context.stroke();

  context.strokeStyle = colors.goalInner;
  context.lineWidth = 4;
  context.beginPath();
  context.arc(centerX, centerY, TILE_SIZE * 0.14, 0, Math.PI * 2);
  context.stroke();
}

function drawSpikesTile(context: CanvasRenderingContext2D, tileX: number, tileY: number): void {
  context.fillStyle = colors.spikes;

  for (let index = 0; index < 4; index += 1) {
    const spikeX = tileX + 6 + index * 10;

    context.beginPath();
    context.moveTo(spikeX, tileY + TILE_SIZE - 8);
    context.lineTo(spikeX + 5, tileY + 12);
    context.lineTo(spikeX + 10, tileY + TILE_SIZE - 8);
    context.closePath();
    context.fill();
  }
}

function drawFireTile(context: CanvasRenderingContext2D, tileX: number, tileY: number): void {
  context.fillStyle = colors.fire;
  context.beginPath();
  context.moveTo(tileX + TILE_SIZE * 0.5, tileY + 8);
  context.quadraticCurveTo(tileX + TILE_SIZE * 0.78, tileY + 18, tileX + TILE_SIZE * 0.67, tileY + 34);
  context.quadraticCurveTo(tileX + TILE_SIZE * 0.62, tileY + 42, tileX + TILE_SIZE * 0.5, tileY + 42);
  context.quadraticCurveTo(tileX + TILE_SIZE * 0.26, tileY + 38, tileX + TILE_SIZE * 0.31, tileY + 24);
  context.quadraticCurveTo(tileX + TILE_SIZE * 0.36, tileY + 15, tileX + TILE_SIZE * 0.5, tileY + 8);
  context.fill();

  context.fillStyle = colors.fireInner;
  context.beginPath();
  context.moveTo(tileX + TILE_SIZE * 0.5, tileY + 16);
  context.quadraticCurveTo(tileX + TILE_SIZE * 0.62, tileY + 24, tileX + TILE_SIZE * 0.56, tileY + 34);
  context.quadraticCurveTo(tileX + TILE_SIZE * 0.52, tileY + 38, tileX + TILE_SIZE * 0.46, tileY + 34);
  context.quadraticCurveTo(tileX + TILE_SIZE * 0.4, tileY + 27, tileX + TILE_SIZE * 0.5, tileY + 16);
  context.fill();
}

function drawAcidTile(context: CanvasRenderingContext2D, tileX: number, tileY: number): void {
  context.fillStyle = colors.acid;
  context.beginPath();
  context.ellipse(tileX + TILE_SIZE * 0.5, tileY + TILE_SIZE * 0.62, TILE_SIZE * 0.28, TILE_SIZE * 0.16, 0, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = colors.acidDark;
  context.beginPath();
  context.arc(tileX + TILE_SIZE * 0.36, tileY + TILE_SIZE * 0.56, 4, 0, Math.PI * 2);
  context.arc(tileX + TILE_SIZE * 0.58, tileY + TILE_SIZE * 0.66, 3, 0, Math.PI * 2);
  context.arc(tileX + TILE_SIZE * 0.68, tileY + TILE_SIZE * 0.52, 3, 0, Math.PI * 2);
  context.fill();
}

function drawDynamiteTile(context: CanvasRenderingContext2D, tileX: number, tileY: number): void {
  context.fillStyle = colors.dynamite;
  context.fillRect(tileX + 14, tileY + 16, 20, 22);
  context.fillStyle = colors.symbol;
  context.fillRect(tileX + 14, tileY + 20, 20, 4);
  context.fillRect(tileX + 14, tileY + 30, 20, 4);

  context.strokeStyle = colors.dynamiteFuse;
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(tileX + 28, tileY + 16);
  context.quadraticCurveTo(tileX + 34, tileY + 10, tileX + 36, tileY + 6);
  context.stroke();
}

function drawPortalTile(
  context: CanvasRenderingContext2D,
  tileX: number,
  tileY: number,
  color: string,
  label: string,
): void {
  const centerX = tileX + TILE_SIZE / 2;
  const centerY = tileY + TILE_SIZE / 2;

  context.strokeStyle = color;
  context.lineWidth = 5;
  context.beginPath();
  context.arc(centerX, centerY, TILE_SIZE * 0.28, 0, Math.PI * 2);
  context.stroke();

  context.strokeStyle = colors.symbol;
  context.lineWidth = 2;
  context.beginPath();
  context.arc(centerX, centerY, TILE_SIZE * 0.18, 0, Math.PI * 2);
  context.stroke();

  drawTileLabel(context, label, tileX, tileY, 20);
}

function drawKeyTile(context: CanvasRenderingContext2D, tileX: number, tileY: number): void {
  context.strokeStyle = colors.key;
  context.lineWidth = 4;
  context.beginPath();
  context.arc(tileX + 18, tileY + 20, 7, 0, Math.PI * 2);
  context.stroke();

  context.beginPath();
  context.moveTo(tileX + 24, tileY + 24);
  context.lineTo(tileX + 34, tileY + 34);
  context.lineTo(tileX + 30, tileY + 38);
  context.moveTo(tileX + 31, tileY + 31);
  context.lineTo(tileX + 38, tileY + 24);
  context.stroke();
}

function drawLockedDoorTile(context: CanvasRenderingContext2D, tileX: number, tileY: number): void {
  context.fillStyle = colors.lockedDoor;
  context.fillRect(tileX + 10, tileY + 10, TILE_SIZE - 20, TILE_SIZE - 10);
  context.fillStyle = colors.lockedDoorInner;
  context.fillRect(tileX + 16, tileY + 16, TILE_SIZE - 32, TILE_SIZE - 22);
  context.fillStyle = colors.symbol;
  context.beginPath();
  context.arc(tileX + TILE_SIZE / 2, tileY + TILE_SIZE / 2, 4, 0, Math.PI * 2);
  context.fill();
  context.fillRect(tileX + TILE_SIZE / 2 - 2, tileY + TILE_SIZE / 2, 4, 10);
}

function drawTileGrid(context: CanvasRenderingContext2D, tileX: number, tileY: number): void {
  context.strokeStyle = colors.grid;
  context.lineWidth = 1;
  context.strokeRect(tileX + 0.5, tileY + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
}

function drawTileLabel(
  context: CanvasRenderingContext2D,
  label: string,
  tileX: number,
  tileY: number,
  fontSize: number,
): void {
  context.fillStyle = colors.symbol;
  context.font = `bold ${fontSize}px Georgia, serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(label, tileX + TILE_SIZE / 2, tileY + TILE_SIZE / 2);
}

function getTileImage(assets: GameAssets, tile: TileType): HTMLImageElement | null {
  const assetKey = tileAssetByType[tile];

  return assetKey === undefined ? null : assets[assetKey];
}
