import { loadAssets } from "./assets";
import { setupMazeEditor } from "./editor";
import { createGame, movePlayer, resetGame } from "./game";
import { setupInput } from "./input";
import { levels } from "./levels";
import { renderGame, resizeCanvas } from "./renderer";
import type { Direction, GameState, GameStatus, Position } from "./types";

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

type PlayerMovementAnimation = {
  from: Position;
  to: Position;
  startedAtMs: number;
  durationMs: number;
};

const playerMovementDurationMs = 140;

let currentLevelIndex = 0;
let gameState = createGame(getCurrentLevel());
let activeScreen: AppScreen = getScreenFromHash();
let playerMovementAnimation: PlayerMovementAnimation | null = null;

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
  window.requestAnimationFrame(renderFrame);

  setupInput({
    onMove(direction: Direction): void {
      if (activeScreen !== "game") {
        return;
      }

      const now = performance.now();

      if (getActivePlayerMovementAnimation(now) !== null) {
        return;
      }

      const previousPlayerPosition = { ...gameState.playerPosition };
      gameState = movePlayer(gameState, direction);
      startPlayerMovementAnimation(previousPlayerPosition, gameState.playerPosition, now);
      render();
    },
    onNextLevel(): void {
      if (activeScreen !== "game") {
        return;
      }

      if (!canLoadNextLevel()) {
        return;
      }

      clearPlayerMovementAnimation();
      currentLevelIndex += 1;
      gameState = createGame(getCurrentLevel());
      resizeCanvas(canvas, gameState);
      render();
    },
    onRestart(): void {
      if (activeScreen !== "game") {
        return;
      }

      clearPlayerMovementAnimation();
      gameState = resetGame(gameState);
      render();
    },
  });

  function renderFrame(elapsedMs: number): void {
    render(elapsedMs);
    window.requestAnimationFrame(renderFrame);
  }

  function render(elapsedMs = performance.now()): void {
    const status = getGameStatus(gameState, currentLevelIndex, levels.length);
    const playerRenderPosition = getPlayerRenderPosition(elapsedMs);

    updateHud(hud, gameState, currentLevelIndex, levels.length);
    updateHealthBar(healthTrack, healthFill, healthValue, gameState);
    updateStatusPanel(statusPanel, status);
    renderGame(canvas, gameState, assets, elapsedMs, playerRenderPosition);
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

function getPlayerRenderPosition(elapsedMs: number): Position {
  const animation = getActivePlayerMovementAnimation(elapsedMs);

  if (animation === null) {
    return gameState.playerPosition;
  }

  const progress = smoothstep(
    clamp(
      (elapsedMs - animation.startedAtMs) / animation.durationMs,
      0,
      1,
    ),
  );

  return {
    x: animation.from.x + (animation.to.x - animation.from.x) * progress,
    y: animation.from.y + (animation.to.y - animation.from.y) * progress,
  };
}

function getActivePlayerMovementAnimation(elapsedMs: number): PlayerMovementAnimation | null {
  if (playerMovementAnimation === null) {
    return null;
  }

  const progress = clamp(
    (elapsedMs - playerMovementAnimation.startedAtMs) / playerMovementAnimation.durationMs,
    0,
    1,
  );

  if (progress >= 1) {
    playerMovementAnimation = null;
    return null;
  }

  return playerMovementAnimation;
}

function startPlayerMovementAnimation(
  from: Position,
  to: Position,
  startedAtMs: number,
): void {
  if (!positionsDiffer(from, to) || !areAdjacentPositions(from, to)) {
    playerMovementAnimation = null;
    return;
  }

  playerMovementAnimation = {
    from: { ...from },
    to: { ...to },
    startedAtMs,
    durationMs: playerMovementDurationMs,
  };
}

function clearPlayerMovementAnimation(): void {
  playerMovementAnimation = null;
}

function positionsDiffer(left: Position, right: Position): boolean {
  return left.x !== right.x || left.y !== right.y;
}

function areAdjacentPositions(left: Position, right: Position): boolean {
  return Math.abs(left.x - right.x) + Math.abs(left.y - right.y) === 1;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function smoothstep(value: number): number {
  return value * value * (3 - 2 * value);
}

function getRequiredElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);

  if (element === null) {
    throw new Error(`Required element "${selector}" was not found.`);
  }

  return element;
}
