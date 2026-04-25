import type {
  Direction,
  GameState,
  LevelData,
  Position,
  TileGrid,
  TileSymbol,
  TileType,
} from "./types";

type ParsedLevel = {
  tiles: TileGrid;
  width: number;
  height: number;
  playerStartPosition: Position;
  portalOnePosition: Position;
  portalTwoPosition: Position;
};

const directionOffsets: Record<Direction, Position> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const tileTypeBySymbol: Record<TileSymbol, TileType> = {
  "#": "wall",
  ".": "floor",
  "1": "portalOne",
  "2": "portalTwo",
  A: "acid",
  D: "dynamite",
  F: "fire",
  G: "goal",
  S: "spikes",
};

const deadlyTiles: readonly TileType[] = ["spikes", "fire", "acid", "dynamite"];

export function parseLevel(level: LevelData): ParsedLevel {
  if (level.length === 0) {
    throw new Error("Level must contain at least one row.");
  }

  const width = level[0]?.length ?? 0;

  if (width === 0) {
    throw new Error("Level rows must not be empty.");
  }

  const tiles: TileType[][] = [];
  let playerStartPosition: Position | null = null;
  let portalOnePosition: Position | null = null;
  let portalTwoPosition: Position | null = null;

  for (let y = 0; y < level.length; y += 1) {
    const row = level[y];

    if (row.length !== width) {
      throw new Error(`Level row ${y + 1} has length ${row.length}, expected ${width}.`);
    }

    tiles.push(
      parseLevelRow(row, y, {
        onPlayerStart(position: Position): void {
          if (playerStartPosition !== null) {
            throw new Error(
              `Level must contain exactly one player start position; found another at ${position.x},${position.y}.`,
            );
          }

          playerStartPosition = position;
        },
        onPortalOne(position: Position): void {
          if (portalOnePosition !== null) {
            throw new Error(`Level must contain exactly one portal 1; found another at ${position.x},${position.y}.`);
          }

          portalOnePosition = position;
        },
        onPortalTwo(position: Position): void {
          if (portalTwoPosition !== null) {
            throw new Error(`Level must contain exactly one portal 2; found another at ${position.x},${position.y}.`);
          }

          portalTwoPosition = position;
        },
      }),
    );
  }

  if (playerStartPosition === null) {
    throw new Error("Level must contain exactly one player start position, but none was found.");
  }

  if (portalOnePosition === null) {
    throw new Error("Level must contain exactly one portal 1, but none was found.");
  }

  if (portalTwoPosition === null) {
    throw new Error("Level must contain exactly one portal 2, but none was found.");
  }

  return {
    tiles,
    width,
    height: level.length,
    playerStartPosition,
    portalOnePosition,
    portalTwoPosition,
  };
}

type LevelMarkers = {
  onPlayerStart: (position: Position) => void;
  onPortalOne: (position: Position) => void;
  onPortalTwo: (position: Position) => void;
};

function parseLevelRow(
  row: string,
  y: number,
  markers: LevelMarkers,
): TileType[] {
  const tiles: TileType[] = [];

  for (let x = 0; x < row.length; x += 1) {
    tiles.push(parseLevelTile(row[x], { x, y }, markers));
  }

  return tiles;
}

function parseLevelTile(
  symbol: string,
  position: Position,
  markers: LevelMarkers,
): TileType {
  if (symbol === "P") {
    markers.onPlayerStart(position);
    return "floor";
  }

  if (isTileSymbol(symbol)) {
    const tile = tileTypeBySymbol[symbol];

    if (tile === "portalOne") {
      markers.onPortalOne(position);
    }

    if (tile === "portalTwo") {
      markers.onPortalTwo(position);
    }

    return tile;
  }

  throw new Error(`Unsupported level symbol "${symbol}" at ${position.x},${position.y}.`);
}

function isTileSymbol(symbol: string): symbol is TileSymbol {
  return (
    symbol === "#" ||
    symbol === "." ||
    symbol === "1" ||
    symbol === "2" ||
    symbol === "A" ||
    symbol === "D" ||
    symbol === "F" ||
    symbol === "G" ||
    symbol === "S"
  );
}

export function createGame(level: LevelData): GameState {
  const parsedLevel = parseLevel(level);

  return {
    tiles: parsedLevel.tiles,
    width: parsedLevel.width,
    height: parsedLevel.height,
    playerPosition: { ...parsedLevel.playerStartPosition },
    playerStartPosition: { ...parsedLevel.playerStartPosition },
    portalOnePosition: { ...parsedLevel.portalOnePosition },
    portalTwoPosition: { ...parsedLevel.portalTwoPosition },
    moveCount: 0,
    isComplete: false,
    isDead: false,
  };
}

export function resetGame(state: GameState): GameState {
  return {
    ...state,
    playerPosition: { ...state.playerStartPosition },
    moveCount: 0,
    isComplete: false,
    isDead: false,
  };
}

export function movePlayer(state: GameState, direction: Direction): GameState {
  if (state.isComplete || state.isDead) {
    return state;
  }

  const offset = directionOffsets[direction];
  const nextPosition = {
    x: state.playerPosition.x + offset.x,
    y: state.playerPosition.y + offset.y,
  };

  if (!canMoveTo(state, nextPosition)) {
    return state;
  }

  const nextTile = state.tiles[nextPosition.y][nextPosition.x];
  const playerPosition = getFinalPositionAfterMove(state, nextPosition, nextTile);

  return {
    ...state,
    playerPosition,
    moveCount: state.moveCount + 1,
    isComplete: isGoalTile(nextTile),
    isDead: isDeadlyTile(nextTile),
  };
}

function canMoveTo(state: GameState, position: Position): boolean {
  if (
    position.x < 0 ||
    position.y < 0 ||
    position.x >= state.width ||
    position.y >= state.height
  ) {
    return false;
  }

  return canEnterTile(state.tiles[position.y][position.x]);
}

function canEnterTile(tile: TileType): boolean {
  return tile === "floor" || tile === "goal" || isPortalTile(tile) || isDeadlyTile(tile);
}

function isGoalTile(tile: TileType): boolean {
  return tile === "goal";
}

function isDeadlyTile(tile: TileType): boolean {
  return deadlyTiles.includes(tile);
}

function isPortalTile(tile: TileType): boolean {
  return tile === "portalOne" || tile === "portalTwo";
}

function getFinalPositionAfterMove(state: GameState, enteredPosition: Position, tile: TileType): Position {
  if (tile === "portalOne") {
    return { ...state.portalTwoPosition };
  }

  if (tile === "portalTwo") {
    return { ...state.portalOnePosition };
  }

  return enteredPosition;
}
