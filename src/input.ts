import type { Direction } from "./types";

type InputHandlers = {
  onMove: (direction: Direction) => void;
  onHeldMoveChange: (direction: Direction | null) => void;
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
  const heldMovementKeys: string[] = [];

  window.addEventListener("keydown", (event) => {
    if (isEditableTarget(event.target)) {
      return;
    }

    const key = event.key.toLowerCase();
    const direction = movementKeys[key];

    if (direction !== undefined) {
      event.preventDefault();
      const wasHeld = heldMovementKeys.includes(key);

      if (!wasHeld) {
        heldMovementKeys.push(key);
        handlers.onHeldMoveChange(getHeldMoveDirection(heldMovementKeys));
        handlers.onMove(direction);
      }

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

  window.addEventListener("keyup", (event) => {
    const key = event.key.toLowerCase();
    const direction = movementKeys[key];

    if (direction === undefined) {
      return;
    }

    const keyIndex = heldMovementKeys.indexOf(key);

    if (keyIndex === -1) {
      return;
    }

    event.preventDefault();
    heldMovementKeys.splice(keyIndex, 1);
    handlers.onHeldMoveChange(getHeldMoveDirection(heldMovementKeys));
  });

  window.addEventListener("blur", () => {
    if (heldMovementKeys.length === 0) {
      return;
    }

    heldMovementKeys.length = 0;
    handlers.onHeldMoveChange(null);
  });
}

function getHeldMoveDirection(heldMovementKeys: readonly string[]): Direction | null {
  const key = heldMovementKeys[heldMovementKeys.length - 1];

  if (key === undefined) {
    return null;
  }

  return movementKeys[key];
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return target.isContentEditable || target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
}
