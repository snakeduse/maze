import type { Direction } from "./types";

type InputHandlers = {
  onMove: (direction: Direction) => void;
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
    const direction = movementKeys[event.key.toLowerCase()];

    if (direction !== undefined) {
      event.preventDefault();
      handlers.onMove(direction);
      return;
    }

    if (event.key === "r" || event.key === "R") {
      event.preventDefault();
      handlers.onRestart();
    }
  });
}
