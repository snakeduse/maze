export type Position = {
  x: number;
  y: number;
};

export type TileType =
  | "wall"
  | "floor"
  | "goal"
  | "spikes"
  | "fire"
  | "acid"
  | "dynamite"
  | "portalOne"
  | "portalTwo";

export type TileSymbol = "#" | "." | "G" | "S" | "F" | "A" | "D" | "1" | "2";

export type TileGrid = readonly (readonly TileType[])[];

export type LevelData = readonly string[];

export type Direction = "up" | "down" | "left" | "right";

export type GameState = {
  tiles: TileGrid;
  width: number;
  height: number;
  playerPosition: Position;
  playerStartPosition: Position;
  portalOnePosition: Position;
  portalTwoPosition: Position;
  moveCount: number;
  isComplete: boolean;
  isDead: boolean;
};
