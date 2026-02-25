export const HEIGHT_BANDS = ["water", "grass", "dirt", "rock", "snow"] as const;

export type HeightBand = (typeof HEIGHT_BANDS)[number];
export type TerrainSize = 64 | 128 | 256;

export interface TerrainConfig {
  seed: string;
  size: TerrainSize;
  noiseIntensity: number;
}

export interface GeneratedWorld {
  size: number;
  maxHeight: number;
  heightMap: Uint8Array;
  config: TerrainConfig;
}

export interface WorldGenerator {
  generate(config: TerrainConfig): GeneratedWorld;
}

export interface InstanceData {
  x: number;
  y: number;
  z: number;
}

export interface VoxelChunk {
  chunkX: number;
  chunkZ: number;
  instancesByBand: Record<HeightBand, InstanceData[]>;
}

export interface MoveAxis {
  x: number;
  y: number;
}

export interface InputAdapter {
  getMoveAxis(): MoveAxis;
  consumeJumpPressed(): boolean;
  isAscendPressed(): boolean;
}
