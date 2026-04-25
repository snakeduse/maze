import type { GameState, TileType } from "./types";

export const TILE_SIZE = 48;

const colors: Record<TileType | "player", string> = {
  acid: "#6fbf3d",
  fire: "#e36b2c",
  floor: "#f4ead7",
  goal: "#8ab65f",
  spikes: "#9b2f2f",
  wall: "#2f3a4a",
  player: "#d65a31",
};

export function resizeCanvas(canvas: HTMLCanvasElement, state: GameState): void {
  canvas.width = state.width * TILE_SIZE;
  canvas.height = state.height * TILE_SIZE;
}

export function renderGame(canvas: HTMLCanvasElement, state: GameState): void {
  const context = canvas.getContext("2d");

  if (context === null) {
    throw new Error("Canvas 2D context is not available.");
  }

  context.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < state.height; y += 1) {
    for (let x = 0; x < state.width; x += 1) {
      drawTile(context, state.tiles[y][x], x, y);
    }
  }

  drawPlayer(context, state);
}

function drawTile(context: CanvasRenderingContext2D, tile: TileType, x: number, y: number): void {
  const tileX = x * TILE_SIZE;
  const tileY = y * TILE_SIZE;

  context.fillStyle = colors[tile];
  context.fillRect(tileX, tileY, TILE_SIZE, TILE_SIZE);

  if (tile !== "wall") {
    context.strokeStyle = "#e2d2b8";
    context.strokeRect(tileX, tileY, TILE_SIZE, TILE_SIZE);
  }
}

function drawPlayer(context: CanvasRenderingContext2D, state: GameState): void {
  const centerX = state.playerPosition.x * TILE_SIZE + TILE_SIZE / 2;
  const centerY = state.playerPosition.y * TILE_SIZE + TILE_SIZE / 2;
  const radius = TILE_SIZE * 0.32;

  context.fillStyle = colors.player;
  context.beginPath();
  context.arc(centerX, centerY, radius, 0, Math.PI * 2);
  context.fill();
}
