import { create } from "zustand";

import { buildVoxelChunks } from "@/features/world/chunkMesher";
import { NoiseWorldGenerator } from "@/features/world/generator";
import { DEFAULT_TERRAIN_CONFIG } from "@/lib/constants";
import { generateRandomSeed } from "@/lib/seed";

import type {
  GeneratedWorld,
  TerrainConfig,
  TerrainSize,
  VoxelChunk
} from "@/features/world/types";

interface WorldState {
  hasWorld: boolean;
  isGenerating: boolean;
  draftConfig: TerrainConfig;
  world: GeneratedWorld | null;
  chunks: VoxelChunk[];
  updateDraft: (partial: Partial<TerrainConfig>) => void;
  regenerateSeed: () => void;
  generateWorld: (config: TerrainConfig) => void;
}

const generator = new NoiseWorldGenerator();

function createInitialConfig(): TerrainConfig {
  return {
    ...DEFAULT_TERRAIN_CONFIG,
    seed: generateRandomSeed()
  };
}

function normalizeSize(size: number): TerrainSize {
  if (size === 64 || size === 128 || size === 256) {
    return size;
  }

  return 128;
}

export const useWorldStore = create<WorldState>((set) => ({
  hasWorld: false,
  isGenerating: false,
  draftConfig: createInitialConfig(),
  world: null,
  chunks: [],
  updateDraft: (partial) =>
    set((state) => ({
      draftConfig: {
        ...state.draftConfig,
        ...partial,
        size:
          partial.size !== undefined
            ? normalizeSize(Number(partial.size))
            : state.draftConfig.size
      }
    })),
  regenerateSeed: () =>
    set((state) => ({
      draftConfig: {
        ...state.draftConfig,
        seed: generateRandomSeed()
      }
    })),
  generateWorld: (config) => {
    set({ isGenerating: true });

    const normalizedConfig: TerrainConfig = {
      ...config,
      size: normalizeSize(config.size)
    };

    const world = generator.generate(normalizedConfig);
    const chunks = buildVoxelChunks(world);

    set({
      hasWorld: true,
      isGenerating: false,
      draftConfig: world.config,
      world,
      chunks
    });
  }
}));
