export type GameAssets = {
  acid: HTMLImageElement | null;
  door: HTMLImageElement | null;
  dynamite: HTMLImageElement | null;
  fire: HTMLImageElement | null;
  fireIdle: HTMLImageElement | null;
  floor: HTMLImageElement | null;
  goal: HTMLImageElement | null;
  key: HTMLImageElement | null;
  keyIdle: HTMLImageElement | null;
  player: HTMLImageElement | null;
  playerWalkIdle: HTMLImageElement | null;
  portal1: HTMLImageElement | null;
  portal2: HTMLImageElement | null;
  spikes: HTMLImageElement | null;
  wall: HTMLImageElement | null;
};

export type GameAssetKey = keyof GameAssets;

const assetPaths: Record<GameAssetKey, string> = {
  acid: "/assets/tiny-dungeon/acid.png",
  door: "/assets/tiny-dungeon/door.png",
  dynamite: "/assets/tiny-dungeon/dynamite.png",
  fire: "/assets/tiny-dungeon/fire.png",
  fireIdle: "/assets/tiny-dungeon/fire_idle.png",
  floor: "/assets/tiny-dungeon/floor.png",
  goal: "/assets/tiny-dungeon/goal.png",
  key: "/assets/tiny-dungeon/key.png",
  keyIdle: "/assets/tiny-dungeon/key_idle.png",
  player: "/assets/tiny-dungeon/player.png",
  playerWalkIdle: "/assets/tiny-dungeon/player_walk_idle.png",
  portal1: "/assets/tiny-dungeon/portal1.png",
  portal2: "/assets/tiny-dungeon/portal2.png",
  spikes: "/assets/tiny-dungeon/spikes.png",
  wall: "/assets/tiny-dungeon/wall.png",
};

export async function loadAssets(): Promise<GameAssets> {
  const assets: GameAssets = {
    acid: null,
    door: null,
    dynamite: null,
    fire: null,
    fireIdle: null,
    floor: null,
    goal: null,
    key: null,
    keyIdle: null,
    player: null,
    playerWalkIdle: null,
    portal1: null,
    portal2: null,
    spikes: null,
    wall: null,
  };

  for (const assetKey of getAssetKeys()) {
    assets[assetKey] = await loadImage(assetPaths[assetKey]);
  }

  return assets;
}

function loadImage(path: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image();

    image.addEventListener("load", () => {
      resolve(image);
    });

    image.addEventListener("error", () => {
      resolve(null);
    });

    image.src = path;
  });
}

function getAssetKeys(): GameAssetKey[] {
  return Object.keys(assetPaths) as GameAssetKey[];
}
