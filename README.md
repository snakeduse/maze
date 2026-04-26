# Maze

A small 2D browser maze game built with Vite, TypeScript, and HTML Canvas.

The game has multiple levels. Complete the current level, then press `N` to load the next one.
Graphics use Kenney Tiny Dungeon assets.

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

## Controls

- Move: WASD or Arrow keys
- Restart current level: R
- Next level after completion: N
- Reach the goal to complete the level.
- Collect the key to unlock the locked door.
- Avoid spikes, fire, acid, and dynamite.
- Portals `1` and `2` teleport to each other.

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
