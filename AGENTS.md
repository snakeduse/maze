# AGENTS.md

## Project

This is a small 2D browser maze game.

The game is developed step by step with Codex.

## Tech Stack

Use only:

- Vite
- TypeScript
- HTML Canvas

Do not use:

- React
- Vue
- Phaser
- PixiJS
- Unity
- Godot
- server-side frameworks

## Current Goal

Create the first playable prototype.

The first prototype must have only:

- a tile-based maze;
- a player;
- grid-based movement;
- wall collisions;
- restart;
- move counter.

Do not add:

- obstacles;
- spikes;
- fire;
- acid;
- portals;
- enemies;
- animations;
- level editor;
- save system;
- menu screens.

## Project Structure

Use this structure:

    src/
      main.ts
      game.ts
      renderer.ts
      input.ts
      levels.ts
      types.ts

## File Responsibilities

### main.ts

Starts the application.

### game.ts

Stores game state and game rules.

### renderer.ts

Draws the game on Canvas.

### input.ts

Handles keyboard input.

### levels.ts

Stores level data.

### types.ts

Stores shared TypeScript types.

## Architecture Rules

Do not put game rules into `renderer.ts`.

Do not put rendering code into `game.ts`.

Do not put game rules into `input.ts`.

Keep files small and simple.

Use simple functions and plain TypeScript types.

Do not make the code too abstract too early.

## Level Format

Levels are stored as arrays of strings in `src/levels.ts`.

Supported symbols for the first prototype:

    # - wall
    . - floor
    P - player start position

Example:

    export const level1 = [
      "##########",
      "#P.......#",
      "#.######.#",
      "#.#....#.#",
      "#.#.##.#.#",
      "#...##...#",
      "##########",
    ];

Parsing rules:

- `#` is a wall tile.
- `.` is a floor tile.
- `P` is the player start position.
- The tile under `P` is treated as floor.
- A level must have exactly one `P`.
- All rows should have the same length.

## Game Rules

The player moves one tile per key press.

Supported controls:

- Arrow keys
- WASD

The player cannot move through walls.

The player cannot move outside the map.

Pressing `R` restarts the level.

The move counter increases only after a successful move.

The Canvas is redrawn after state changes.

## Rendering Rules

Use simple Canvas rendering.

For the first prototype:

    wall   - rectangle
    floor  - rectangle
    player - circle or rectangle

Do not add sprites yet.

Do not add animations yet.

Canvas size must be based on:

    map width  * TILE_SIZE
    map height * TILE_SIZE

`TILE_SIZE` must be a named constant.

## TypeScript Rules

Use strict TypeScript where practical.

Avoid `any`.

Define shared types in `src/types.ts`.

Use explicit return types for exported functions.

Keep these parts separate:

- level parsing;
- game logic;
- input handling;
- rendering.

## Development Workflow

For each task:

1. Make the smallest useful change.
2. Keep the game runnable.
3. Do not add unrelated features.
4. Run TypeScript or build checks if possible.
5. Update `README.md` if commands or behavior change.

## Commands

Expected commands:

    npm install
    npm run dev
    npm run build

If you add more scripts, document them in `README.md`.

## Future Features

The code should be easy to extend later with:

- goals;
- spikes;
- fire;
- acid;
- portals;
- keys;
- doors;
- multiple levels.

Do not implement these future features until the user asks for them.

## Language

Speak with me on russian.
