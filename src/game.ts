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
  portalOnePosition: Position | null;
  portalTwoPosition: Position | null;
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
  K: "key",
  L: "lockedDoor",
  S: "spikes",
};

const initialHealthPercent = 100;

const damageByDeadlyTile: Partial<Record<TileType, number>> = {
  acid: 50,
  dynamite: 90,
  fire: 70,
  spikes: 10,
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
  let portalOnePosition: Position | null = null;
  let portalTwoPosition: Position | null = null;
  let keyPosition: Position | null = null;
  let lockedDoorPosition: Position | null = null;

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
            throw new Error(
              `Level must contain at most one portal 1; found another at ${position.x},${position.y}.`,
            );
          }

          portalOnePosition = position;
        },
        onPortalTwo(position: Position): void {
          if (portalTwoPosition !== null) {
            throw new Error(
              `Level must contain at most one portal 2; found another at ${position.x},${position.y}.`,
            );
          }

          portalTwoPosition = position;
        },
        onKey(position: Position): void {
          if (keyPosition !== null) {
            throw new Error(`Level must contain at most one key; found another at ${position.x},${position.y}.`);
          }

          keyPosition = position;
        },
        onLockedDoor(position: Position): void {
          if (lockedDoorPosition !== null) {
            throw new Error(
              `Level must contain at most one locked door; found another at ${position.x},${position.y}.`,
            );
          }

          lockedDoorPosition = position;
        },
      }),
    );
  }

  if (playerStartPosition === null) {
    throw new Error("Level must contain exactly one player start position, but none was found.");
  }

  validatePortalPair(portalOnePosition, portalTwoPosition);

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
  onKey: (position: Position) => void;
  onLockedDoor: (position: Position) => void;
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

    if (tile === "key") {
      markers.onKey(position);
    }

    if (tile === "lockedDoor") {
      markers.onLockedDoor(position);
    }

    return tile;
  }

  throw new Error(`Unsupported level symbol "${symbol}" at ${position.x},${position.y}.`);
}

function isTileSymbol(symbol: string): symbol is TileSymbol {
  return Object.prototype.hasOwnProperty.call(tileTypeBySymbol, symbol);
}

export function createGame(level: LevelData): GameState {
  const parsedLevel = parseLevel(level);

  return {
    tiles: parsedLevel.tiles,
    width: parsedLevel.width,
    height: parsedLevel.height,
    playerPosition: { ...parsedLevel.playerStartPosition },
    playerStartPosition: { ...parsedLevel.playerStartPosition },
    portalOnePosition: copyPosition(parsedLevel.portalOnePosition),
    portalTwoPosition: copyPosition(parsedLevel.portalTwoPosition),
    moveCount: 0,
    healthPercent: initialHealthPercent,
    hasKey: false,
    isComplete: false,
    isDead: false,
  };
}

export function resetGame(state: GameState): GameState {
  return {
    ...state,
    playerPosition: { ...state.playerStartPosition },
    moveCount: 0,
    healthPercent: initialHealthPercent,
    hasKey: false,
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
  const hasKey = state.hasKey || isKeyTile(nextTile);
  const healthPercent = getHealthAfterEnteringTile(state.healthPercent, nextTile);
  const isDead = healthPercent === 0;

  return {
    ...state,
    playerPosition,
    moveCount: state.moveCount + 1,
    healthPercent,
    hasKey,
    isComplete: !isDead && isCompletionTile(nextTile, hasKey),
    isDead,
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

  return canEnterTile(state.tiles[position.y][position.x], state);
}

function canEnterTile(tile: TileType, state: GameState): boolean {
  if (tile === "lockedDoor") {
    return state.hasKey;
  }

  return (
    tile === "floor" ||
    tile === "goal" ||
    tile === "key" ||
    isPortalTile(tile) ||
    isDeadlyTile(tile)
  );
}

function isCompletionTile(tile: TileType, hasKey: boolean): boolean {
  return tile === "goal" || (tile === "lockedDoor" && hasKey);
}

function isDeadlyTile(tile: TileType): boolean {
  return getDeadlyTileDamage(tile) > 0;
}

function isPortalTile(tile: TileType): boolean {
  return tile === "portalOne" || tile === "portalTwo";
}

function isKeyTile(tile: TileType): boolean {
  return tile === "key";
}

function getHealthAfterEnteringTile(healthPercent: number, tile: TileType): number {
  return Math.max(0, healthPercent - getDeadlyTileDamage(tile));
}

function getDeadlyTileDamage(tile: TileType): number {
  return damageByDeadlyTile[tile] ?? 0;
}

function getFinalPositionAfterMove(
  state: GameState,
  enteredPosition: Position,
  tile: TileType,
): Position {
  const portalExitPosition = getPortalExitPosition(state, tile);

  if (portalExitPosition !== null) {
    return { ...portalExitPosition };
  }

  return enteredPosition;
}

function getPortalExitPosition(state: GameState, tile: TileType): Position | null {
  if (tile === "portalOne") {
    return getRequiredPortalPosition(state.portalTwoPosition, "portal 2");
  }

  if (tile === "portalTwo") {
    return getRequiredPortalPosition(state.portalOnePosition, "portal 1");
  }

  return null;
}

function getRequiredPortalPosition(position: Position | null, name: string): Position {
  if (position === null) {
    throw new Error(`Cannot use ${name} because the portal pair is incomplete.`);
  }

  return position;
}

function validatePortalPair(
  portalOnePosition: Position | null,
  portalTwoPosition: Position | null,
): void {
  if (portalOnePosition !== null && portalTwoPosition === null) {
    throw new Error("Level has portal 1 but is missing portal 2.");
  }

  if (portalOnePosition === null && portalTwoPosition !== null) {
    throw new Error("Level has portal 2 but is missing portal 1.");
  }
}

function copyPosition(position: Position | null): Position | null {
  return position === null ? null : { ...position };
}
