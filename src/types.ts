export type Position = {
  x: number;
  y: number;
};

export type TileType = "wall" | "floor" | "goal" | "spikes" | "fire" | "acid" | "dynamite";

export type TileSymbol = "#" | "." | "G" | "S" | "F" | "A" | "D";

export type TileGrid = readonly (readonly TileType[])[];

export type LevelData = readonly string[];

export type Direction = "up" | "down" | "left" | "right";

export type GameState = {
  tiles: TileGrid;
  width: number;
  height: number;
  playerPosition: Position;
  playerStartPosition: Position;
  moveCount: number;
  isComplete: boolean;
  isDead: boolean;
};
