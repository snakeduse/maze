import { createGame, movePlayer, resetGame } from "./game";
import { setupInput } from "./input";
import { levels } from "./levels";
import { renderGame, resizeCanvas } from "./renderer";
import type { Direction, GameState } from "./types";

const canvas = getRequiredElement<HTMLCanvasElement>("#game");
const hud = getRequiredElement<HTMLDivElement>("#hud");

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
  updateHud(hud, gameState, currentLevelIndex, levels.length);
  renderGame(canvas, gameState);
}

function updateHud(
  element: HTMLDivElement,
  state: GameState,
  levelIndex: number,
  levelCount: number,
): void {
  const statusText = getStatusText(state, levelIndex, levelCount);
  const keyText = state.hasKey ? "yes" : "no";
  const levelText = `Level: ${levelIndex + 1}/${levelCount}`;
  const controlsText = "Move: WASD or Arrow keys | Restart: R | Next: N after complete";

  element.textContent = `${levelText} | Moves: ${state.moveCount} | Key: ${keyText} | ${controlsText}${statusText}`;
}

function getStatusText(state: GameState, levelIndex: number, levelCount: number): string {
  if (state.isDead) {
    return " | You died";
  }

  if (state.isComplete) {
    if (isLastLevel(levelIndex, levelCount)) {
      return " | Game complete";
    }

    return " | Level complete.";
  }

  return "";
}

function canLoadNextLevel(): boolean {
  return gameState.isComplete && !isLastLevel(currentLevelIndex, levels.length);
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
