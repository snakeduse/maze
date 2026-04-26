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
  | "portalTwo"
  | "key"
  | "lockedDoor";

export type TileSymbol = "#" | "." | "G" | "S" | "F" | "A" | "D" | "1" | "2" | "K" | "L";

export type LevelSymbol = TileSymbol | "P";

export type TileGrid = readonly (readonly TileType[])[];

export type LevelData = readonly string[];

export type Direction = "up" | "down" | "left" | "right";

export type GameStatus = "playing" | "dead" | "levelComplete" | "gameComplete";

export type GameState = {
  tiles: TileGrid;
  width: number;
  height: number;
  playerPosition: Position;
  playerStartPosition: Position;
  portalOnePosition: Position | null;
  portalTwoPosition: Position | null;
  moveCount: number;
  healthPercent: number;
  hasKey: boolean;
  isComplete: boolean;
  isDead: boolean;
};
