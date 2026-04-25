import { createGame, movePlayer, resetGame } from "./game";
import { setupInput } from "./input";
import { level1 } from "./levels";
import { renderGame, resizeCanvas } from "./renderer";
import type { Direction, GameState } from "./types";

const canvas = getRequiredElement<HTMLCanvasElement>("#game");
const hud = getRequiredElement<HTMLDivElement>("#hud");

let gameState = createGame(level1);

resizeCanvas(canvas, gameState);
render();

setupInput({
  onMove(direction: Direction): void {
    gameState = movePlayer(gameState, direction);
    render();
  },
  onRestart(): void {
    gameState = resetGame(gameState);
    render();
  },
});

function render(): void {
  updateHud(hud, gameState);
  renderGame(canvas, gameState);
}

function updateHud(element: HTMLDivElement, state: GameState): void {
  const statusText = getStatusText(state);

  element.textContent = `Moves: ${state.moveCount} | Move: WASD or Arrow keys | Restart: R${statusText}`;
}

function getStatusText(state: GameState): string {
  if (state.isDead) {
    return " | You died";
  }

  if (state.isComplete) {
    return " | Level complete.";
  }

  return "";
}

function getRequiredElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);

  if (element === null) {
    throw new Error(`Required element "${selector}" was not found.`);
  }

  return element;
}
