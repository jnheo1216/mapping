"use client";

import { CuboidCollider, RigidBody, TrimeshCollider } from "@react-three/rapier";
import { useMemo } from "react";

import type { GeneratedWorld } from "./types";

interface TerrainPhysicsProps {
  world: GeneratedWorld;
}

function toWorldCoord(index: number, size: number): number {
  return index - size / 2 + 0.5;
}

export function TerrainPhysics({ world }: TerrainPhysicsProps) {
  const terrainMesh = useMemo(() => {
    const { size, heightMap } = world;

    const vertices = new Float32Array(size * size * 3);
    const indices = new Uint32Array((size - 1) * (size - 1) * 6);

    for (let z = 0; z < size; z += 1) {
      for (let x = 0; x < size; x += 1) {
        const vertexIndex = z * size + x;
        const target = vertexIndex * 3;

        vertices[target] = toWorldCoord(x, size);
        vertices[target + 1] = (heightMap[vertexIndex] ?? 0) + 1;
        vertices[target + 2] = toWorldCoord(z, size);
      }
    }

    let pointer = 0;
    for (let z = 0; z < size - 1; z += 1) {
      for (let x = 0; x < size - 1; x += 1) {
        const a = z * size + x;
        const b = a + 1;
        const c = (z + 1) * size + x;
        const d = c + 1;

        indices[pointer] = a;
        indices[pointer + 1] = c;
        indices[pointer + 2] = b;
        indices[pointer + 3] = b;
        indices[pointer + 4] = c;
        indices[pointer + 5] = d;
        pointer += 6;
      }
    }

    return { vertices, indices };
  }, [world]);

  return (
    <RigidBody type="fixed" colliders={false}>
      <TrimeshCollider
        args={[terrainMesh.vertices, terrainMesh.indices]}
        friction={3}
        restitution={0}
      />
      <CuboidCollider
        position={[0, -2, 0]}
        args={[world.size * 0.75, 2, world.size * 0.75]}
        friction={3}
      />
    </RigidBody>
  );
}
