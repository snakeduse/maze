import type {
  LevelData,
  LevelSymbol,
  Position,
  TileSymbol,
  TileType,
} from "./types";

export const levelSymbols: readonly LevelSymbol[] = [
  "#",
  ".",
  "P",
  "K",
  "L",
  "S",
  "F",
  "A",
  "D",
  "1",
  "2",
  "G",
];

export const tileTypeBySymbol: Record<TileSymbol, TileType> = {
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

export const levelSymbolLabels: Record<LevelSymbol, string> = {
  "#": "Стена",
  ".": "Пол",
  "1": "Портал 1",
  "2": "Портал 2",
  A: "Кислота",
  D: "Динамит",
  F: "Огонь",
  G: "Цель",
  K: "Ключ",
  L: "Закрытая дверь",
  P: "Игрок",
  S: "Шипы",
};

export function isTileSymbol(symbol: string): symbol is TileSymbol {
  return Object.prototype.hasOwnProperty.call(tileTypeBySymbol, symbol);
}

export function isLevelSymbol(symbol: string): symbol is LevelSymbol {
  return symbol === "P" || isTileSymbol(symbol);
}

export function exportLevel(level: LevelData): string {
  return level.map((row) => `  "${row}",`).join("\n");
}

export function setLevelSymbol(
  level: LevelData,
  position: Position,
  symbol: LevelSymbol,
): LevelData {
  return level.map((row, y) => {
    if (y !== position.y) {
      return row;
    }

    return `${row.slice(0, position.x)}${symbol}${row.slice(position.x + 1)}`;
  });
}

export function resizeLevel(
  level: LevelData,
  width: number,
  height: number,
): LevelData {
  const nextLevel: string[] = [];

  for (let y = 0; y < height; y += 1) {
    let row = "";

    for (let x = 0; x < width; x += 1) {
      row += getResizedLevelSymbol(level, x, y, width, height);
    }

    nextLevel.push(row);
  }

  return nextLevel;
}

export function validateLevelFormat(level: LevelData): string[] {
  const errors: string[] = [];

  if (level.length === 0) {
    return ["Level must contain at least one row."];
  }

  const width = level[0]?.length ?? 0;

  if (width === 0) {
    errors.push("Level rows must not be empty.");
  }

  let playerCount = 0;
  let portalOneCount = 0;
  let portalTwoCount = 0;

  for (let y = 0; y < level.length; y += 1) {
    const row = level[y];

    if (row.length !== width) {
      errors.push(`Row ${y + 1} has length ${row.length}, expected ${width}.`);
    }

    for (let x = 0; x < row.length; x += 1) {
      const symbol = row[x];

      if (!isLevelSymbol(symbol)) {
        errors.push(`Unsupported symbol "${symbol}" at ${x},${y}.`);
        continue;
      }

      if (symbol === "P") {
        playerCount += 1;
      }

      if (symbol === "1") {
        portalOneCount += 1;
      }

      if (symbol === "2") {
        portalTwoCount += 1;
      }
    }
  }

  if (playerCount !== 1) {
    errors.push(`Level must contain exactly one P; found ${playerCount}.`);
  }

  if (!hasValidPortalPair(portalOneCount, portalTwoCount)) {
    errors.push(
      "Portals 1 and 2 must be either both absent or exactly one of each.",
    );
  }

  if (!hasWallBorder(level)) {
    errors.push("Outer border must contain only # walls.");
  }

  return errors;
}

function hasValidPortalPair(
  portalOneCount: number,
  portalTwoCount: number,
): boolean {
  return (
    (portalOneCount === 0 && portalTwoCount === 0) ||
    (portalOneCount === 1 && portalTwoCount === 1)
  );
}

function hasWallBorder(level: LevelData): boolean {
  const width = level[0]?.length ?? 0;
  const height = level.length;

  if (width === 0 || height === 0) {
    return false;
  }

  for (let y = 0; y < height; y += 1) {
    const row = level[y];

    for (let x = 0; x < width; x += 1) {
      const isBorder =
        x === 0 || y === 0 || x === width - 1 || y === height - 1;

      if (isBorder && row[x] !== "#") {
        return false;
      }
    }
  }

  return true;
}

function getResizedLevelSymbol(
  level: LevelData,
  x: number,
  y: number,
  width: number,
  height: number,
): LevelSymbol {
  const isBorder = x === 0 || y === 0 || x === width - 1 || y === height - 1;

  if (isBorder) {
    return "#";
  }

  const existingSymbol = level[y]?.[x];

  return existingSymbol !== undefined && isLevelSymbol(existingSymbol)
    ? existingSymbol
    : ".";
}
