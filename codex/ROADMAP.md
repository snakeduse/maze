# ROADMAP.md

## Current Game

The game is a small 2D browser maze game.

Tech stack:

- Vite
- TypeScript
- HTML Canvas

Current features:

- tile-based maze
- player movement
- walls
- restart
- move counter
- goal tile `G`
- deadly tiles:
  - `S` spikes
  - `F` fire
  - `A` acid
  - `D` dynamite
- portals:
  - `1`
  - `2`
- key `K`
- locked door `L`
- multiple levels
- game status display
- image rendering with Kenney Tiny Dungeon assets

## Development Principles

- Work step by step.
- Prefer small tasks.
- Keep the game runnable after every task.
- Do not rewrite the whole project.
- Do not change gameplay rules unless the task says so.
- Do not add a game engine.
- Do not add React.
- Keep game logic separate from rendering.

## Possible Next Tasks

### 1. Asset rendering cleanup

Check that image loading and fallback rendering are clean.

### 2. Simple UI buttons

Add HTML buttons:

- Restart
- Next level

Buttons must behave like keyboard controls.

### 3. Level select for development

Add a simple developer-only level selector.

No full menu yet.

### 4. Better level validation

Improve validation errors for wrong maps.

Examples:

- unknown symbol
- missing player
- duplicated player
- uneven row length
- invalid portal pair

### 5. Better game messages

Improve messages for:

- death
- level complete
- game complete
- blocked locked door without key

### 6. Simple player animation

Add small movement animation.

Do not change grid-based game logic.

### 7. More levels

Add more test levels using existing mechanics.

### 8. Level import from text

Allow pasting a text map into code or a dev textarea.

This is for development only, not a full editor.

## Not Planned Yet

Do not add these until explicitly requested:

- enemies
- sound effects
- save system
- full menu system
- mobile controls
- level editor
- multiplayer
- backend
