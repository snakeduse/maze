import type { Direction } from "./types";

type InputHandlers = {
  onMove: (direction: Direction) => void;
  onNextLevel: () => void;
  onRestart: () => void;
};

const movementKeys: Record<string, Direction> = {
  arrowup: "up",
  arrowdown: "down",
  arrowleft: "left",
  arrowright: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
};

export function setupInput(handlers: InputHandlers): void {
  window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    const direction = movementKeys[key];

    if (direction !== undefined) {
      event.preventDefault();
      handlers.onMove(direction);
      return;
    }

    if (key === "r") {
      event.preventDefault();
      handlers.onRestart();
      return;
    }

    if (key === "n") {
      event.preventDefault();
      handlers.onNextLevel();
    }
  });
}
