export type GameAssets = {
  acid: HTMLImageElement | null;
  door: HTMLImageElement | null;
  dynamite: HTMLImageElement | null;
  fire: HTMLImageElement | null;
  floor: HTMLImageElement | null;
  goal: HTMLImageElement | null;
  key: HTMLImageElement | null;
  player: HTMLImageElement | null;
  portal1: HTMLImageElement | null;
  portal2: HTMLImageElement | null;
  spikes: HTMLImageElement | null;
  wall: HTMLImageElement | null;
};

const assetPaths: Record<keyof GameAssets, string> = {
  acid: "/assets/tiny-dungeon/acid.png",
  door: "/assets/tiny-dungeon/door.png",
  dynamite: "/assets/tiny-dungeon/dynamite.png",
  fire: "/assets/tiny-dungeon/fire.png",
  floor: "/assets/tiny-dungeon/floor.png",
  goal: "/assets/tiny-dungeon/goal.png",
  key: "/assets/tiny-dungeon/key.png",
  player: "/assets/tiny-dungeon/player.png",
  portal1: "/assets/tiny-dungeon/portal1.png",
  portal2: "/assets/tiny-dungeon/portal2.png",
  spikes: "/assets/tiny-dungeon/spikes.png",
  wall: "/assets/tiny-dungeon/wall.png",
};

export async function loadAssets(): Promise<GameAssets> {
  const entries = await Promise.all(
    Object.entries(assetPaths).map(async ([assetName, assetPath]) => {
      const image = await loadImage(assetPath);

      return [assetName, image] as const;
    }),
  );

  return Object.fromEntries(entries) as GameAssets;
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
