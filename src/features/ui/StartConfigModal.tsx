"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";

import {
  NOISE_INTENSITY_RANGE,
  TERRAIN_SIZE_OPTIONS,
  clamp
} from "@/lib/constants";
import { generateRandomSeed } from "@/lib/seed";

import type { TerrainConfig, TerrainSize } from "@/features/world/types";

interface StartConfigModalProps {
  open: boolean;
  initialConfig: TerrainConfig;
  isGenerating: boolean;
  onGenerate: (config: TerrainConfig) => void;
}

function parseTerrainSize(value: string): TerrainSize {
  const parsed = Number(value);
  if (parsed === 64 || parsed === 128 || parsed === 256) {
    return parsed;
  }

  return 128;
}

export function StartConfigModal({
  open,
  initialConfig,
  isGenerating,
  onGenerate
}: StartConfigModalProps) {
  const [seed, setSeed] = useState(initialConfig.seed);
  const [size, setSize] = useState<TerrainSize>(initialConfig.size);
  const [noiseIntensity, setNoiseIntensity] = useState(initialConfig.noiseIntensity);

  if (!open) {
    return null;
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    onGenerate({
      seed: seed.trim() || generateRandomSeed(),
      size,
      noiseIntensity: clamp(
        noiseIntensity,
        NOISE_INTENSITY_RANGE.min,
        NOISE_INTENSITY_RANGE.max
      )
    });
  };

  return (
    <div className="modal-backdrop">
      <form className="start-modal" onSubmit={onSubmit} data-testid="start-config-modal">
        <h1 className="sr-only">Voxel Terrain Explorer</h1>
        <div className="brand-header">
          <Image
            src="/logo.svg"
            alt="Voxel Terrain Explorer logo"
            width={360}
            height={96}
            className="brand-logo"
            priority
          />
        </div>
        <p className="intro-copy">Seed, noise, size를 설정하고 월드를 생성하세요.</p>

        <label htmlFor="seed-input">Seed</label>
        <div className="seed-row">
          <input
            id="seed-input"
            data-testid="seed-input"
            type="text"
            value={seed}
            onChange={(event) => setSeed(event.target.value)}
          />
          <button
            type="button"
            className="ghost-btn"
            onClick={() => setSeed(generateRandomSeed())}
          >
            Random
          </button>
        </div>

        <label htmlFor="size-select">Terrain Size</label>
        <select
          id="size-select"
          data-testid="size-select"
          value={size}
          onChange={(event) => setSize(parseTerrainSize(event.target.value))}
        >
          {TERRAIN_SIZE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option} x {option}
            </option>
          ))}
        </select>

        <label htmlFor="noise-intensity">Noise Intensity ({noiseIntensity.toFixed(1)})</label>
        <input
          id="noise-intensity"
          data-testid="noise-intensity"
          type="range"
          min={NOISE_INTENSITY_RANGE.min}
          max={NOISE_INTENSITY_RANGE.max}
          step={NOISE_INTENSITY_RANGE.step}
          value={noiseIntensity}
          onChange={(event) => setNoiseIntensity(Number(event.target.value))}
        />

        <button className="primary-btn" type="submit" disabled={isGenerating}>
          {isGenerating ? "Generating..." : "Generate World"}
        </button>
      </form>
    </div>
  );
}
