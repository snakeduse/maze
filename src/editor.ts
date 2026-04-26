import {
  exportLevel,
  levelSymbolLabels,
  levelSymbols,
  resizeLevel,
  setLevelSymbol,
  validateLevelFormat,
} from "./levelFormat";
import type { LevelData, LevelSymbol } from "./types";

type MazeEditorElements = {
  widthInput: HTMLInputElement;
  heightInput: HTMLInputElement;
  addRowButton: HTMLButtonElement;
  removeRowButton: HTMLButtonElement;
  addColumnButton: HTMLButtonElement;
  removeColumnButton: HTMLButtonElement;
  toolbar: HTMLDivElement;
  grid: HTMLDivElement;
  exportButton: HTMLButtonElement;
  exportOutput: HTMLTextAreaElement;
  validationOutput: HTMLDivElement;
};

type MazeEditorState = {
  level: LevelData;
  selectedSymbol: LevelSymbol;
  isPainting: boolean;
};

const minEditorSize = 3;

export function setupMazeEditor(elements: MazeEditorElements, initialLevel: LevelData): void {
  const state: MazeEditorState = {
    level: [...initialLevel],
    selectedSymbol: "#",
    isPainting: false,
  };

  setupSizeControls(elements, state);
  renderToolbar(elements, state);
  renderEditor(elements, state);

  elements.exportButton.addEventListener("click", () => {
    elements.exportOutput.value = exportLevel(state.level);
    updateValidation(elements, state);
  });

  window.addEventListener("pointerup", () => {
    state.isPainting = false;
  });
}

function setupSizeControls(elements: MazeEditorElements, state: MazeEditorState): void {
  elements.widthInput.addEventListener("change", () => {
    resizeEditorLevel(elements, state, getInputSize(elements.widthInput), getLevelHeight(state.level));
  });
  elements.heightInput.addEventListener("change", () => {
    resizeEditorLevel(elements, state, getLevelWidth(state.level), getInputSize(elements.heightInput));
  });
  elements.addRowButton.addEventListener("click", () => {
    resizeEditorLevel(elements, state, getLevelWidth(state.level), getLevelHeight(state.level) + 1);
  });
  elements.removeRowButton.addEventListener("click", () => {
    resizeEditorLevel(elements, state, getLevelWidth(state.level), getLevelHeight(state.level) - 1);
  });
  elements.addColumnButton.addEventListener("click", () => {
    resizeEditorLevel(elements, state, getLevelWidth(state.level) + 1, getLevelHeight(state.level));
  });
  elements.removeColumnButton.addEventListener("click", () => {
    resizeEditorLevel(elements, state, getLevelWidth(state.level) - 1, getLevelHeight(state.level));
  });
}

function renderToolbar(elements: MazeEditorElements, state: MazeEditorState): void {
  elements.toolbar.replaceChildren();

  for (const symbol of levelSymbols) {
    const button = document.createElement("button");

    button.type = "button";
    button.className = getToolButtonClassName(symbol, state.selectedSymbol);
    button.textContent = `${symbol} ${levelSymbolLabels[symbol]}`;
    button.addEventListener("click", () => {
      state.selectedSymbol = symbol;
      renderToolbar(elements, state);
    });

    elements.toolbar.append(button);
  }
}

function renderEditor(elements: MazeEditorElements, state: MazeEditorState): void {
  syncSizeInputs(elements, state);
  renderGrid(elements, state);
  updateValidation(elements, state);
}

function renderGrid(elements: MazeEditorElements, state: MazeEditorState): void {
  const width = state.level[0]?.length ?? 0;

  elements.grid.replaceChildren();
  elements.grid.style.gridTemplateColumns = `repeat(${width}, 32px)`;

  for (let y = 0; y < state.level.length; y += 1) {
    const row = state.level[y];

    for (let x = 0; x < row.length; x += 1) {
      const cell = createGridCell(row[x], x, y, elements, state);

      elements.grid.append(cell);
    }
  }
}

function createGridCell(
  symbol: string,
  x: number,
  y: number,
  elements: MazeEditorElements,
  state: MazeEditorState,
): HTMLButtonElement {
  const cell = document.createElement("button");

  cell.type = "button";
  cell.className = `editor-cell editor-cell-${getCellClassSuffix(symbol)}`;
  cell.textContent = symbol;
  cell.dataset.x = String(x);
  cell.dataset.y = String(y);
  cell.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    state.isPainting = true;
    paintCell(elements, state, x, y);
  });
  cell.addEventListener("pointerenter", () => {
    if (state.isPainting) {
      paintCell(elements, state, x, y);
    }
  });

  return cell;
}

function paintCell(
  elements: MazeEditorElements,
  state: MazeEditorState,
  x: number,
  y: number,
): void {
  state.level = setLevelSymbol(state.level, { x, y }, state.selectedSymbol);
  renderEditor(elements, state);
}

function resizeEditorLevel(
  elements: MazeEditorElements,
  state: MazeEditorState,
  width: number,
  height: number,
): void {
  state.level = resizeLevel(state.level, clampEditorSize(width), clampEditorSize(height));
  renderEditor(elements, state);
}

function updateValidation(elements: MazeEditorElements, state: MazeEditorState): void {
  const errors = validateLevelFormat(state.level);

  if (errors.length === 0) {
    elements.validationOutput.textContent = "Validation: OK";
    return;
  }

  elements.validationOutput.textContent = `Validation:\n${errors.join("\n")}`;
}

function getToolButtonClassName(symbol: LevelSymbol, selectedSymbol: LevelSymbol): string {
  return symbol === selectedSymbol ? "editor-tool editor-tool-selected" : "editor-tool";
}

function syncSizeInputs(elements: MazeEditorElements, state: MazeEditorState): void {
  elements.widthInput.value = String(getLevelWidth(state.level));
  elements.heightInput.value = String(getLevelHeight(state.level));
}

function getLevelWidth(level: LevelData): number {
  return level[0]?.length ?? minEditorSize;
}

function getLevelHeight(level: LevelData): number {
  return level.length;
}

function getInputSize(input: HTMLInputElement): number {
  return Number.parseInt(input.value, 10);
}

function clampEditorSize(size: number): number {
  if (!Number.isFinite(size)) {
    return minEditorSize;
  }

  return Math.max(minEditorSize, Math.floor(size));
}

function getCellClassSuffix(symbol: string): string {
  if (symbol === "#") {
    return "wall";
  }

  if (symbol === ".") {
    return "floor";
  }

  return "special";
}
