import { createNoise2D } from "simplex-noise";

import {
  DEFAULT_WORLD_MAX_HEIGHT,
  NOISE_INTENSITY_RANGE,
  clamp
} from "@/lib/constants";
import { createSeededRandom } from "@/lib/seed";

import type { GeneratedWorld, TerrainConfig, WorldGenerator } from "./types";

function normalizeConfig(config: TerrainConfig): TerrainConfig {
  return {
    seed: config.seed.trim() || "default-seed",
    size: config.size,
    noiseIntensity: clamp(
      config.noiseIntensity,
      NOISE_INTENSITY_RANGE.min,
      NOISE_INTENSITY_RANGE.max
    )
  };
}

export class NoiseWorldGenerator implements WorldGenerator {
  private readonly maxHeight: number;

  constructor(maxHeight = DEFAULT_WORLD_MAX_HEIGHT) {
    this.maxHeight = maxHeight;
  }

  generate(config: TerrainConfig): GeneratedWorld {
    const normalizedConfig = normalizeConfig(config);
    const { size, seed, noiseIntensity } = normalizedConfig;

    const intensity01 =
      (noiseIntensity - NOISE_INTENSITY_RANGE.min) /
      (NOISE_INTENSITY_RANGE.max - NOISE_INTENSITY_RANGE.min);

    const random = createSeededRandom(`${seed}:${size}:${noiseIntensity.toFixed(3)}`);
    const noise2D = createNoise2D(random);

    const heightMap = new Uint8Array(size * size);

    const octaves = 4;
    const lacunarity = 2.1;
    const persistence = 0.6;
    const baseFrequency = 0.01 + intensity01 * 0.02;
    const varianceScale = 0.45 + intensity01 * 1.1;
    const seedOffsetX = random() * 10_000;
    const seedOffsetZ = random() * 10_000;

    for (let z = 0; z < size; z += 1) {
      for (let x = 0; x < size; x += 1) {
        let total = 0;
        let amplitude = 1;
        let frequency = baseFrequency;
        let maxAmplitude = 0;

        for (let octave = 0; octave < octaves; octave += 1) {
          const sample = noise2D(
            (x + seedOffsetX) * frequency,
            (z + seedOffsetZ) * frequency
          );

          total += sample * amplitude;
          maxAmplitude += amplitude;

          amplitude *= persistence;
          frequency *= lacunarity;
        }

        const normalizedNoise = (total / maxAmplitude + 1) * 0.5;
        const amplifiedNoise = clamp(
          0.5 + (normalizedNoise - 0.5) * varianceScale,
          0,
          1
        );

        const height = Math.round(amplifiedNoise * this.maxHeight);
        heightMap[z * size + x] = clamp(height, 0, this.maxHeight);
      }
    }

    return {
      size,
      maxHeight: this.maxHeight,
      heightMap,
      config: normalizedConfig
    };
  }
}

export function getHeightAt(world: GeneratedWorld, x: number, z: number): number {
  if (x < 0 || z < 0 || x >= world.size || z >= world.size) {
    return -1;
  }

  return world.heightMap[z * world.size + x] ?? -1;
}
