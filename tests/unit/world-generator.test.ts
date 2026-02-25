import { describe, expect, it } from "vitest";

import { NOISE_INTENSITY_RANGE, resolveHeightBand } from "@/lib/constants";
import { NoiseWorldGenerator } from "@/features/world/generator";

function variance(values: Uint8Array): number {
  const mean = values.reduce((acc, value) => acc + value, 0) / values.length;

  return (
    values.reduce((acc, value) => acc + (value - mean) ** 2, 0) / values.length
  );
}

describe("NoiseWorldGenerator", () => {
  const generator = new NoiseWorldGenerator();

  it("creates deterministic terrain for identical seed/config", () => {
    const config = {
      seed: "repeatable-seed",
      size: 64 as const,
      noiseIntensity: 1
    };

    const first = generator.generate(config);
    const second = generator.generate(config);

    expect(Array.from(first.heightMap)).toEqual(Array.from(second.heightMap));
  });

  it("increases overall terrain variance as noiseIntensity grows", () => {
    const low = generator.generate({
      seed: "variance-seed",
      size: 64,
      noiseIntensity: NOISE_INTENSITY_RANGE.min
    });

    const high = generator.generate({
      seed: "variance-seed",
      size: 64,
      noiseIntensity: NOISE_INTENSITY_RANGE.max
    });

    expect(variance(high.heightMap)).toBeGreaterThan(variance(low.heightMap));
  });

  it("maps height boundaries to the expected color bands", () => {
    expect(resolveHeightBand(0, 48)).toBe("water");
    expect(resolveHeightBand(7, 48)).toBe("water");
    expect(resolveHeightBand(8, 48)).toBe("grass");
    expect(resolveHeightBand(16, 48)).toBe("grass");
    expect(resolveHeightBand(17, 48)).toBe("dirt");
    expect(resolveHeightBand(26, 48)).toBe("dirt");
    expect(resolveHeightBand(27, 48)).toBe("rock");
    expect(resolveHeightBand(38, 48)).toBe("rock");
    expect(resolveHeightBand(48, 48)).toBe("snow");
  });
});
