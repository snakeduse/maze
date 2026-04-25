import { createGame, movePlayer, resetGame } from "./game";
import { setupInput } from "./input";
import { levels } from "./levels";
import { renderGame, resizeCanvas } from "./renderer";
import type { Direction, GameState, GameStatus } from "./types";

const canvas = getRequiredElement<HTMLCanvasElement>("#game");
const hud = getRequiredElement<HTMLDivElement>("#hud");
const statusPanel = getRequiredElement<HTMLDivElement>("#status");

let currentLevelIndex = 0;
let gameState = createGame(getCurrentLevel());

resizeCanvas(canvas, gameState);
render();

setupInput({
  onMove(direction: Direction): void {
    gameState = movePlayer(gameState, direction);
    render();
  },
  onNextLevel(): void {
    if (!canLoadNextLevel()) {
      return;
    }

    currentLevelIndex += 1;
    gameState = createGame(getCurrentLevel());
    resizeCanvas(canvas, gameState);
    render();
  },
  onRestart(): void {
    gameState = resetGame(gameState);
    render();
  },
});

function render(): void {
  const status = getGameStatus(gameState, currentLevelIndex, levels.length);

  updateHud(hud, gameState, currentLevelIndex, levels.length);
  updateStatusPanel(statusPanel, status);
  renderGame(canvas, gameState);
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
