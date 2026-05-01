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

const playerMovementDurationMs = 160;

let currentLevelIndex = 0;
let gameState = createGame(getCurrentLevel());
let activeScreen: AppScreen = getScreenFromHash();
let playerMovementAnimation: PlayerMovementAnimation | null = null;
let heldMoveDirection: Direction | null = null;
let heldMoveResumeAtMs = 0;

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

      tryStartMove(direction, performance.now());
      render();
    },
    onHeldMoveChange(direction: Direction | null): void {
      heldMoveDirection = direction;
    },
    onNextLevel(): void {
      if (activeScreen !== "game") {
        return;
      }

      if (!canLoadNextLevel()) {
        return;
      }

      resetMovementState();
      currentLevelIndex += 1;
      gameState = createGame(getCurrentLevel());
      resizeCanvas(canvas, gameState);
      render();
    },
    onRestart(): void {
      if (activeScreen !== "game") {
        return;
      }

      resetMovementState();
      gameState = resetGame(gameState);
      render();
    },
  });

  function renderFrame(elapsedMs: number): void {
    updateMovementAnimation(elapsedMs);
    render(elapsedMs);
    window.requestAnimationFrame(renderFrame);
  }

  function render(elapsedMs = performance.now()): void {
    const status = getGameStatus(gameState, currentLevelIndex, levels.length);
    const playerRenderPosition = getPlayerVisualPosition(elapsedMs);

    updateHud(hud, gameState, currentLevelIndex, levels.length);
    updateHealthBar(healthTrack, healthFill, healthValue, gameState);
    updateStatusPanel(statusPanel, status);
    renderGame(canvas, gameState, assets, elapsedMs, {
      playerVisualPosition: playerRenderPosition,
      isPlayerMoving: playerMovementAnimation !== null,
    });
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
  if (screen !== "game") {
    resetMovementState();
  }

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

function updateMovementAnimation(elapsedMs: number): void {
  if (playerMovementAnimation !== null) {
    if (getMovementAnimationProgress(playerMovementAnimation, elapsedMs) < 1) {
      return;
    }

    playerMovementAnimation = null;

    if (heldMoveDirection !== null && isGameActive(gameState)) {
      tryStartMove(heldMoveDirection, elapsedMs);
    }

    return;
  }

  if (
    heldMoveDirection !== null &&
    heldMoveResumeAtMs > 0 &&
    elapsedMs >= heldMoveResumeAtMs &&
    isGameActive(gameState)
  ) {
    heldMoveResumeAtMs = 0;
    tryStartMove(heldMoveDirection, elapsedMs);
  }
}

function tryStartMove(direction: Direction, startedAtMs: number): boolean {
  if (playerMovementAnimation !== null || !isGameActive(gameState)) {
    return false;
  }

  const previousPlayerPosition = { ...gameState.playerPosition };
  const previousMoveCount = gameState.moveCount;

  gameState = movePlayer(gameState, direction);

  if (gameState.moveCount === previousMoveCount) {
    return false;
  }

  const nextPlayerPosition = gameState.playerPosition;

  if (!areAdjacentPositions(previousPlayerPosition, nextPlayerPosition)) {
    heldMoveResumeAtMs = startedAtMs + playerMovementDurationMs;
    return true;
  }

  playerMovementAnimation = {
    from: previousPlayerPosition,
    to: { ...nextPlayerPosition },
    startedAtMs,
    durationMs: playerMovementDurationMs,
  };
  heldMoveResumeAtMs = 0;

  return true;
}

function getPlayerVisualPosition(elapsedMs: number): Position {
  if (playerMovementAnimation === null) {
    return gameState.playerPosition;
  }

  const progress = getMovementAnimationProgress(playerMovementAnimation, elapsedMs);

  return {
    x:
      playerMovementAnimation.from.x +
      (playerMovementAnimation.to.x - playerMovementAnimation.from.x) * progress,
    y:
      playerMovementAnimation.from.y +
      (playerMovementAnimation.to.y - playerMovementAnimation.from.y) * progress,
  };
}

function getMovementAnimationProgress(
  animation: PlayerMovementAnimation,
  elapsedMs: number,
): number {
  return clamp(
    (elapsedMs - animation.startedAtMs) / animation.durationMs,
    0,
    1,
  );
}

function resetMovementState(): void {
  playerMovementAnimation = null;
  heldMoveDirection = null;
  heldMoveResumeAtMs = 0;
}

function areAdjacentPositions(left: Position, right: Position): boolean {
  return Math.abs(left.x - right.x) + Math.abs(left.y - right.y) === 1;
}

function isGameActive(state: GameState): boolean {
  return !state.isDead && !state.isComplete;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getRequiredElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);

  if (element === null) {
    throw new Error(`Required element "${selector}" was not found.`);
  }

  return element;
}
