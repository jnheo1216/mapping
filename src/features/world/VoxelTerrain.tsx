"use client";

import { useEffect, useMemo, useRef } from "react";
import { InstancedMesh, Object3D } from "three";

import { HEIGHT_BAND_COLORS } from "@/lib/constants";

import type { HeightBand, InstanceData, VoxelChunk } from "./types";

type InstancedBandProps = {
  instances: InstanceData[];
  color: string;
};

function InstancedBand({ instances, color }: InstancedBandProps) {
  const meshRef = useRef<InstancedMesh>(null);
  const tempObject = useMemo(() => new Object3D(), []);

  useEffect(() => {
    const mesh = meshRef.current;

    if (!mesh || instances.length === 0) {
      return;
    }

    for (let index = 0; index < instances.length; index += 1) {
      const instance = instances[index];
      tempObject.position.set(instance.x, instance.y, instance.z);
      tempObject.updateMatrix();
      mesh.setMatrixAt(index, tempObject.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  }, [instances, tempObject]);

  if (instances.length === 0) {
    return null;
  }

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, instances.length]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} roughness={0.95} metalness={0.02} />
    </instancedMesh>
  );
}

interface VoxelTerrainProps {
  chunks: VoxelChunk[];
}

const BAND_ORDER: HeightBand[] = ["water", "grass", "dirt", "rock", "snow"];

export function VoxelTerrain({ chunks }: VoxelTerrainProps) {
  return (
    <group>
      {chunks.map((chunk) => (
        <group key={`chunk-${chunk.chunkX}-${chunk.chunkZ}`}>
          {BAND_ORDER.map((band) => (
            <InstancedBand
              key={`${chunk.chunkX}-${chunk.chunkZ}-${band}`}
              instances={chunk.instancesByBand[band]}
              color={HEIGHT_BAND_COLORS[band]}
            />
          ))}
        </group>
      ))}
    </group>
  );
}
