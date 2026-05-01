export type SpriteSheetAnimation = {
  id: string;
  image: HTMLImageElement;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  frameDurationMs: number;
  loop: boolean;
};

export type SpriteSheetFrame = {
  index: number;
  sourceX: number;
  sourceY: number;
  sourceWidth: number;
  sourceHeight: number;
};

export function getHorizontalFrameCount(image: HTMLImageElement, frameWidth: number): number {
  if (frameWidth <= 0) {
    return 1;
  }

  return Math.max(1, Math.floor(image.naturalWidth / frameWidth));
}

export function getAnimationFrame(animation: SpriteSheetAnimation, elapsedMs: number): SpriteSheetFrame {
  const frameIndex = getAnimationFrameIndex(animation, elapsedMs);

  return {
    index: frameIndex,
    sourceX: frameIndex * animation.frameWidth,
    sourceY: 0,
    sourceWidth: animation.frameWidth,
    sourceHeight: animation.frameHeight,
  };
}

export function getAnimationFrameIndex(animation: SpriteSheetAnimation, elapsedMs: number): number {
  if (animation.frameCount <= 1 || animation.frameDurationMs <= 0) {
    return 0;
  }

  const currentFrame = Math.floor(elapsedMs / animation.frameDurationMs);

  if (animation.loop) {
    return currentFrame % animation.frameCount;
  }

  return Math.min(currentFrame, animation.frameCount - 1);
}
