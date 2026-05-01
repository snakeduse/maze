# Maze

A small 2D browser maze game built with Vite, TypeScript, and HTML Canvas.

The game has multiple levels. Complete the current level, then press `N` to load the next one.
Graphics use Kenney Tiny Dungeon assets, including looping fire, key, and player idle sprite sheets.

## Install

```sh
npm install
```

## Run

```sh
npm run dev
```

## Build

```sh
npm run build
```

## Assets

- Asset pack: Kenney Tiny Dungeon
- License: Creative Commons CC0
- Location: `public/assets/tiny-dungeon/`
- Fire tiles use `fire_idle.png` as a horizontal 16x16 sprite sheet.
- Key tiles use `key_idle.png` as a horizontal 16x16 sprite sheet.
- The player uses `player_idle.png` as a horizontal 16x16 sprite sheet.

## Controls

- Move: WASD or Arrow keys
- Restart current level: R
- Next level after completion: N
- Reach the goal to complete the level.
- Collect the key to unlock the locked door.
- The player starts each level with 100% health.
- Spikes deal 10% damage, fire deals 70%, acid deals 50%, and dynamite deals 90%.
- Avoid losing all health.
- Portals `1` and `2` teleport to each other.

## Maze Editor

- Open the editor with the `Editor` button or by visiting `#editor`.
- Choose a tile type in the toolbar.
- Change the maze size with the `Width` and `Height` fields.
- Add or remove one row or column with `+ row`, `- row`, `+ column`, and `- column`.
- Click a cell to place the selected tile.
- Hold the mouse button and drag across cells to paint.
- Press `Export` to generate level text in the same array-of-strings format used by the game.
- The editor validates one `P`, equal row lengths, portal pairing, and `#` walls on the outer border.

## Status Messages

- Death: `You died. Press R to restart.`
- Level complete: `Level complete. Press N for next level or R to restart.`
- Game complete: `Game complete. Press R to restart current level.`

## Map Symbols

- `#` wall
- `.` floor
- `P` player start position
- `G` goal
- `S` spikes
- `F` fire
- `A` acid
- `D` dynamite
- `K` key
- `L` locked door
- `1` portal one
- `2` portal two
