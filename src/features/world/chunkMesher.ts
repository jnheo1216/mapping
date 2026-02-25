import { DEFAULT_CHUNK_SIZE, resolveHeightBand } from "@/lib/constants";

import { getHeightAt } from "./generator";
import { HEIGHT_BANDS } from "./types";

import type {
  GeneratedWorld,
  HeightBand,
  InstanceData,
  VoxelChunk
} from "./types";

function createBandMap(): Record<HeightBand, InstanceData[]> {
  return {
    water: [],
    grass: [],
    dirt: [],
    rock: [],
    snow: []
  };
}

function hasBlock(world: GeneratedWorld, x: number, y: number, z: number): boolean {
  if (y < 0) {
    return false;
  }

  const height = getHeightAt(world, x, z);
  if (height < 0) {
    return false;
  }

  return y <= height;
}

function toWorldCoord(index: number, size: number): number {
  return index - size / 2 + 0.5;
}

function isExposed(world: GeneratedWorld, x: number, y: number, z: number): boolean {
  const east = hasBlock(world, x + 1, y, z);
  const west = hasBlock(world, x - 1, y, z);
  const south = hasBlock(world, x, y, z + 1);
  const north = hasBlock(world, x, y, z - 1);
  const up = hasBlock(world, x, y + 1, z);

  // Treat y=0 as a solid foundation so the bottom layer doesn't count as exposed.
  const down = y === 0 ? true : hasBlock(world, x, y - 1, z);

  return !(east && west && south && north && up && down);
}

export function buildVoxelChunks(
  world: GeneratedWorld,
  chunkSize = DEFAULT_CHUNK_SIZE
): VoxelChunk[] {
  const chunkCount = Math.ceil(world.size / chunkSize);
  const chunks: VoxelChunk[] = [];

  for (let chunkZ = 0; chunkZ < chunkCount; chunkZ += 1) {
    for (let chunkX = 0; chunkX < chunkCount; chunkX += 1) {
      const instancesByBand = createBandMap();

      const startX = chunkX * chunkSize;
      const startZ = chunkZ * chunkSize;
      const endX = Math.min(startX + chunkSize, world.size);
      const endZ = Math.min(startZ + chunkSize, world.size);

      for (let z = startZ; z < endZ; z += 1) {
        for (let x = startX; x < endX; x += 1) {
          const height = getHeightAt(world, x, z);

          if (height < 0) {
            continue;
          }

          for (let y = 0; y <= height; y += 1) {
            if (!isExposed(world, x, y, z)) {
              continue;
            }

            const band = resolveHeightBand(y, world.maxHeight);
            instancesByBand[band].push({
              x: toWorldCoord(x, world.size),
              y: y + 0.5,
              z: toWorldCoord(z, world.size)
            });
          }
        }
      }

      const hasInstances = HEIGHT_BANDS.some(
        (band) => instancesByBand[band].length > 0
      );

      if (hasInstances) {
        chunks.push({
          chunkX,
          chunkZ,
          instancesByBand
        });
      }
    }
  }

  return chunks;
}
