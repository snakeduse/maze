import { loadAssets } from "./assets";
import { setupMazeEditor } from "./editor";
import { createGame, movePlayer, resetGame } from "./game";
import { setupInput } from "./input";
import { levels } from "./levels";
import { renderGame, resizeCanvas } from "./renderer";
import type { Direction, GameState, GameStatus } from "./types";

const canvas = getRequiredElement<HTMLCanvasElement>("#game");
const gameScreen = getRequiredElement<HTMLElement>("#game-screen");
const editorScreen = getRequiredElement<HTMLElement>("#editor-screen");
const showGameButton = getRequiredElement<HTMLButtonElement>("#show-game");
const showEditorButton = getRequiredElement<HTMLButtonElement>("#show-editor");
const hud = getRequiredElement<HTMLDivElement>("#hud");
const healthTrack = getRequiredElement<HTMLDivElement>(".health-track");
const healthFill = getRequiredElement<HTMLDivElement>("#health-fill");
const healthValue = getRequiredElement<HTMLDivElement>("#health-value");
const statusPanel = getRequiredElement<HTMLDivElement>("#status");
const editorWidthInput = getRequiredElement<HTMLInputElement>("#editor-width");
const editorHeightInput = getRequiredElement<HTMLInputElement>("#editor-height");
const editorAddRowButton = getRequiredElement<HTMLButtonElement>("#editor-add-row");
const editorRemoveRowButton = getRequiredElement<HTMLButtonElement>("#editor-remove-row");
const editorAddColumnButton = getRequiredElement<HTMLButtonElement>("#editor-add-column");
const editorRemoveColumnButton = getRequiredElement<HTMLButtonElement>("#editor-remove-column");
const editorToolbar = getRequiredElement<HTMLDivElement>("#editor-toolbar");
const editorGrid = getRequiredElement<HTMLDivElement>("#editor-grid");
const editorExportButton = getRequiredElement<HTMLButtonElement>("#editor-export-button");
const editorExportOutput = getRequiredElement<HTMLTextAreaElement>("#editor-export");
const editorValidationOutput = getRequiredElement<HTMLDivElement>("#editor-validation");

type AppScreen = "game" | "editor";

let currentLevelIndex = 0;
let gameState = createGame(getCurrentLevel());
let activeScreen: AppScreen = getScreenFromHash();

void init();

async function init(): Promise<void> {
  const assets = await loadAssets();

  setupMazeEditor(
    {
      widthInput: editorWidthInput,
      heightInput: editorHeightInput,
      addRowButton: editorAddRowButton,
      removeRowButton: editorRemoveRowButton,
      addColumnButton: editorAddColumnButton,
      removeColumnButton: editorRemoveColumnButton,
      toolbar: editorToolbar,
      grid: editorGrid,
      exportButton: editorExportButton,
      exportOutput: editorExportOutput,
      validationOutput: editorValidationOutput,
    },
    levels[0],
  );
  setupScreenNavigation();
  updateActiveScreen(activeScreen);

  resizeCanvas(canvas, gameState);
  render();

  setupInput({
    onMove(direction: Direction): void {
      if (activeScreen !== "game") {
        return;
      }

      gameState = movePlayer(gameState, direction);
      render();
    },
    onNextLevel(): void {
      if (activeScreen !== "game") {
        return;
      }

      if (!canLoadNextLevel()) {
        return;
      }

      currentLevelIndex += 1;
      gameState = createGame(getCurrentLevel());
      resizeCanvas(canvas, gameState);
      render();
    },
    onRestart(): void {
      if (activeScreen !== "game") {
        return;
      }

      gameState = resetGame(gameState);
      render();
    },
  });

  function render(): void {
    const status = getGameStatus(gameState, currentLevelIndex, levels.length);

    updateHud(hud, gameState, currentLevelIndex, levels.length);
    updateHealthBar(healthTrack, healthFill, healthValue, gameState);
    updateStatusPanel(statusPanel, status);
    renderGame(canvas, gameState, assets);
  }
}

function setupScreenNavigation(): void {
  showGameButton.addEventListener("click", () => {
    window.location.hash = "";
  });
  showEditorButton.addEventListener("click", () => {
    window.location.hash = "editor";
  });
  window.addEventListener("hashchange", () => {
    activeScreen = getScreenFromHash();
    updateActiveScreen(activeScreen);
  });
}

function updateActiveScreen(screen: AppScreen): void {
  gameScreen.hidden = screen !== "game";
  editorScreen.hidden = screen !== "editor";
  showGameButton.classList.toggle("nav-button-active", screen === "game");
  showEditorButton.classList.toggle("nav-button-active", screen === "editor");
}

function updateHud(
  element: HTMLDivElement,
  state: GameState,
  levelIndex: number,
  levelCount: number,
): void {
  const keyText = state.hasKey ? "yes" : "no";
  const levelText = `Level: ${levelIndex + 1}/${levelCount}`;
  const controlsText = "Move: WASD or Arrow keys | Restart: R | Next: N after complete";

  element.textContent = `${levelText} | Moves: ${state.moveCount} | Key: ${keyText} | ${controlsText}`;
}

function updateHealthBar(
  trackElement: HTMLDivElement,
  fillElement: HTMLDivElement,
  valueElement: HTMLDivElement,
  state: GameState,
): void {
  const healthText = `${state.healthPercent}%`;

  trackElement.setAttribute("aria-valuenow", String(state.healthPercent));
  fillElement.style.width = healthText;
  valueElement.textContent = `Health: ${healthText}`;
}

function updateStatusPanel(element: HTMLDivElement, status: GameStatus): void {
  element.textContent = getStatusMessage(status);
}

function getStatusMessage(status: GameStatus): string {
  if (status === "dead") {
    return "You died. Press R to restart.";
  }

  if (status === "levelComplete") {
    return "Level complete. Press N for next level or R to restart.";
  }

  if (status === "gameComplete") {
    return "Game complete. Press R to restart current level.";
  }

  return "";
}

function getGameStatus(state: GameState, levelIndex: number, levelCount: number): GameStatus {
  if (state.isDead) {
    return "dead";
  }

  if (state.isComplete) {
    if (isLastLevel(levelIndex, levelCount)) {
      return "gameComplete";
    }

    return "levelComplete";
  }

  return "playing";
}

function canLoadNextLevel(): boolean {
  return getGameStatus(gameState, currentLevelIndex, levels.length) === "levelComplete";
}

function getScreenFromHash(): AppScreen {
  return window.location.hash === "#editor" ? "editor" : "game";
}

function getCurrentLevel(): (typeof levels)[number] {
  return levels[currentLevelIndex];
}

function isLastLevel(levelIndex: number, levelCount: number): boolean {
  return levelIndex === levelCount - 1;
}

function getRequiredElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);

  if (element === null) {
    throw new Error(`Required element "${selector}" was not found.`);
  }

  return element;
}
