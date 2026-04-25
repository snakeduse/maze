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
  F: "fire",
  G: "goal",
  S: "spikes",
};

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

  for (let y = 0; y < level.length; y += 1) {
    const row = level[y];

    if (row.length !== width) {
      throw new Error(`Level row ${y + 1} has length ${row.length}, expected ${width}.`);
    }

    tiles.push(
      parseLevelRow(row, y, (position) => {
        if (playerStartPosition !== null) {
          throw new Error(
            `Level must contain exactly one player start position; found another at ${position.x},${position.y}.`,
          );
        }

        playerStartPosition = position;
      }),
    );
  }

  if (playerStartPosition === null) {
    throw new Error("Level must contain exactly one player start position, but none was found.");
  }

  return {
    tiles,
    width,
    height: level.length,
    playerStartPosition,
  };
}

function parseLevelRow(
  row: string,
  y: number,
  onPlayerStart: (position: Position) => void,
): TileType[] {
  const tiles: TileType[] = [];

  for (let x = 0; x < row.length; x += 1) {
    tiles.push(parseLevelTile(row[x], { x, y }, onPlayerStart));
  }

  return tiles;
}

function parseLevelTile(
  symbol: string,
  position: Position,
  onPlayerStart: (position: Position) => void,
): TileType {
  if (isTileSymbol(symbol)) {
    return tileTypeBySymbol[symbol];
  }

  if (symbol === "P") {
    onPlayerStart(position);
    return "floor";
  }

  throw new Error(`Unsupported level symbol "${symbol}" at ${position.x},${position.y}.`);
}

function isTileSymbol(symbol: string): symbol is TileSymbol {
  return symbol === "#" || symbol === "." || symbol === "F" || symbol === "G" || symbol === "S";
}

export function createGame(level: LevelData): GameState {
  const parsedLevel = parseLevel(level);

  return {
    tiles: parsedLevel.tiles,
    width: parsedLevel.width,
    height: parsedLevel.height,
    playerPosition: { ...parsedLevel.playerStartPosition },
    playerStartPosition: { ...parsedLevel.playerStartPosition },
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

  return {
    ...state,
    playerPosition: nextPosition,
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
  return tile === "floor" || tile === "goal" || isDeadlyTile(tile);
}

function isGoalTile(tile: TileType): boolean {
  return tile === "goal";
}

function isDeadlyTile(tile: TileType): boolean {
  return tile === "spikes" || tile === "fire";
}
