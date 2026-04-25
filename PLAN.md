# PLAN.md

## Goal

Create the first version of a small 2D maze game.

The game must run in a browser.

Use:

- Vite
- TypeScript
- HTML Canvas

Follow the rules from `AGENTS.md`.

## Important Rule

Work step by step.

Do not add all features at once.

After each step, the game must still run.

Do not add obstacles, portals, enemies, menus, animations, or sprites in the first version.

## Version 1 Scope

Version 1 must include only:

- maze map;
- player;
- grid movement;
- wall collision;
- restart;
- move counter;
- simple Canvas rendering.

## Step 1. Create the project

Create a Vite + TypeScript project.

Expected structure:

    src/
      main.ts
      game.ts
      renderer.ts
      input.ts
      levels.ts
      types.ts

Also create:

    README.md

The game must start with:

    npm install
    npm run dev

The project must build with:

    npm run build

## Step 2. Add basic types

Create shared types in `src/types.ts`.

Add types for:

- position;
- tile type;
- level data;
- game state;
- movement direction.

For the first version, tile types are only:

- wall;
- floor.

Do not add other tile types yet.

## Step 3. Add the first level

Create `src/levels.ts`.

Store the first level as an array of strings.

Use this map first:

    export const level1 = [
      "##########",
      "#P.......#",
      "#.######.#",
      "#.#....#.#",
      "#.#.##.#.#",
      "#...##...#",
      "##########",
    ];

Symbols:

    # - wall
    . - floor
    P - player start position

Rules:

- The level must have exactly one `P`.
- All rows must have the same length.
- `P` is only the start position.
- The tile under `P` is floor.

## Step 4. Parse the level

In `src/game.ts`, add level parsing.

The parser must:

- read the string map;
- create a tile grid;
- find the player start position;
- validate that all rows have the same length;
- validate that there is exactly one player start position.

If the level is invalid, throw a clear error.

## Step 5. Create game state

In `src/game.ts`, create the initial game state.

The game state must contain:

- tile grid;
- map width;
- map height;
- player position;
- player start position;
- move counter.

Add a function to create a new game from a level.

Example function names:

    createGame(level)
    resetGame(state)

Use clear names.

## Step 6. Add Canvas rendering

In `src/renderer.ts`, render the game state to Canvas.

Rendering rules:

- draw floor tiles;
- draw wall tiles;
- draw the player;
- use simple rectangles or a circle;
- use a named `TILE_SIZE` constant;
- Canvas size must be based on map size.

Canvas size:

    width  = map width  * TILE_SIZE
    height = map height * TILE_SIZE

Do not put game rules into `renderer.ts`.

## Step 7. Add application bootstrap

In `src/main.ts`:

- find the Canvas element;
- create the game state from `level1`;
- create the renderer;
- render the first frame.

The browser must show the maze and the player.

No movement is needed in this step.

## Step 8. Add keyboard input

In `src/input.ts`, handle keyboard input.

Supported keys:

- ArrowUp
- ArrowDown
- ArrowLeft
- ArrowRight
- W
- A
- S
- D
- R

Input must not change the game state directly.

Input should call callbacks like:

    onMove(direction)
    onRestart()

Do not put game rules into `input.ts`.

## Step 9. Add player movement

In `src/game.ts`, add movement logic.

Rules:

- The player moves one tile per key press.
- The player cannot move outside the map.
- The player cannot move into a wall.
- The move counter increases only after a successful move.
- If movement is blocked, the move counter does not change.

Example function:

    movePlayer(state, direction)

After each successful or blocked move, the Canvas can be redrawn.

## Step 10. Add restart

Add restart logic.

Rules:

- Pressing `R` returns the player to the start position.
- Pressing `R` resets the move counter to zero.
- Do not reload the browser page.

## Step 11. Add simple HUD

Add a small HTML HUD above or below the Canvas.

The HUD must show:

- move counter;
- controls help.

Example text:

    Moves: 0
    Move: WASD or Arrow keys
    Restart: R

The HUD must update when the move counter changes.

## Step 12. Update README

Update `README.md`.

README must include:

- project description;
- how to install dependencies;
- how to run the game;
- how to build the game;
- controls;
- map symbols.

Use simple English.

## Step 13. Check the project

Run checks:

    npm run build

If there is a TypeScript check script, run it too.

Fix all TypeScript and build errors.

Do not add new features during this step.

## Step 14. Final review

Review the code.

Check that:

- `renderer.ts` only renders;
- `input.ts` only handles input;
- `game.ts` contains game state and rules;
- `levels.ts` contains level data;
- `types.ts` contains shared types;
- there is no `any` unless it is really needed;
- the game is easy to extend later.

Do not add future features yet.

## Done Criteria

The first version is done when:

- `npm install` works;
- `npm run dev` starts the game;
- `npm run build` works;
- the maze is visible;
- the player is visible;
- the player moves with WASD and Arrow keys;
- the player cannot pass through walls;
- the player cannot leave the map;
- `R` restarts the level;
- the move counter works;
- README explains how to run the game.
-
