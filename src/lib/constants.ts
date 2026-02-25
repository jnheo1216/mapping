import type { HeightBand, TerrainConfig, TerrainSize } from "@/features/world/types";

export const TERRAIN_SIZE_OPTIONS: TerrainSize[] = [64, 128, 256];
export const DEFAULT_WORLD_MAX_HEIGHT = 48;
export const DEFAULT_CHUNK_SIZE = 16;

export const NOISE_INTENSITY_RANGE = {
  min: 0.1,
  max: 2,
  step: 0.1
} as const;

export const DEFAULT_TERRAIN_CONFIG: TerrainConfig = {
  seed: "",
  size: 128,
  noiseIntensity: 1
};

export const HEIGHT_BAND_COLORS: Record<HeightBand, string> = {
  water: "#2f6db0",
  grass: "#5e9f52",
  dirt: "#8a6848",
  rock: "#70757d",
  snow: "#d7e6f3"
};

export const PLAYER_MOVE_SPEED = 8;
export const PLAYER_JUMP_FORCE = 20;
export const PLAYER_ASCEND_SPEED = 14;
export const PLAYER_EYE_OFFSET = 0.55;
export const PLAYER_SPAWN_OFFSET = 4;
export const PLAYER_CAPSULE_HALF_HEIGHT = 0.45;
export const PLAYER_CAPSULE_RADIUS = 0.35;
export const INPUT_MOVE_DEADZONE = 0.08;
export const LOOK_SENSITIVITY_DESKTOP = 0.002;
export const LOOK_SENSITIVITY_MOBILE = 0.0032;
export const LOOK_PITCH_LIMIT = Math.PI / 2 - 0.05;

const HEIGHT_BAND_THRESHOLDS: Array<{ band: HeightBand; maxRatio: number }> = [
  { band: "water", maxRatio: 0.15 },
  { band: "grass", maxRatio: 0.35 },
  { band: "dirt", maxRatio: 0.55 },
  { band: "rock", maxRatio: 0.8 },
  { band: "snow", maxRatio: 1 }
];

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function resolveHeightBand(height: number, maxHeight: number): HeightBand {
  const safeMax = Math.max(1, maxHeight);
  const ratio = clamp(height / safeMax, 0, 1);

  return (
    HEIGHT_BAND_THRESHOLDS.find((entry) => ratio <= entry.maxRatio)?.band ?? "snow"
  );
}
