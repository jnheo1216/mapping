"use client";

import Image from "next/image";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { useEffect, useMemo, useState } from "react";

import { DesktopInputAdapter } from "@/features/input/DesktopInputAdapter";
import { LookControlsBridge } from "@/features/input/LookControlsBridge";
import { MobileInputAdapter } from "@/features/input/MobileInputAdapter";
import { PlayerController } from "@/features/player/PlayerController";
import { MobileControlPad } from "@/features/ui/MobileControlPad";
import { StartConfigModal } from "@/features/ui/StartConfigModal";
import { TerrainPhysics } from "@/features/world/TerrainPhysics";
import { VoxelTerrain } from "@/features/world/VoxelTerrain";
import { PLAYER_SPAWN_OFFSET } from "@/lib/constants";
import { useLookStore } from "@/store/useLookStore";
import { useWorldStore } from "@/store/useWorldStore";

import type { TerrainConfig } from "@/features/world/types";

function useMobileLayout(): boolean {
  const [isMobileLayout, setIsMobileLayout] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(max-width: 900px), (pointer: coarse)");

    const update = (): void => {
      setIsMobileLayout(mediaQuery.matches);
    };

    update();
    mediaQuery.addEventListener("change", update);

    return () => {
      mediaQuery.removeEventListener("change", update);
    };
  }, []);

  return isMobileLayout;
}

export default function HomePage() {
  const world = useWorldStore((state) => state.world);
  const chunks = useWorldStore((state) => state.chunks);
  const hasWorld = useWorldStore((state) => state.hasWorld);
  const isGenerating = useWorldStore((state) => state.isGenerating);
  const draftConfig = useWorldStore((state) => state.draftConfig);
  const generateWorld = useWorldStore((state) => state.generateWorld);
  const regenerateSeed = useWorldStore((state) => state.regenerateSeed);

  const resetLook = useLookStore((state) => state.reset);

  const isMobileLayout = useMobileLayout();

  const [showConfigPanel, setShowConfigPanel] = useState(true);
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0, z: 0 });

  const desktopInput = useMemo(() => new DesktopInputAdapter(), []);
  const mobileInput = useMemo(() => new MobileInputAdapter(), []);

  useEffect(() => {
    desktopInput.attach();

    return () => {
      desktopInput.detach();
    };
  }, [desktopInput]);

  const configModalOpen = !hasWorld || showConfigPanel;

  const spawnPoint = useMemo<[number, number, number]>(() => {
    if (!world) {
      return [0, PLAYER_SPAWN_OFFSET + 8, 0];
    }

    const center = Math.floor(world.size / 2);
    const centerHeight = world.heightMap[center * world.size + center] ?? 0;

    return [0, centerHeight + PLAYER_SPAWN_OFFSET, 0];
  }, [world]);

  const handleGenerate = (config: TerrainConfig): void => {
    resetLook();
    generateWorld(config);
    setShowConfigPanel(false);
  };

  return (
    <main>
      <div className="canvas-root">
        {hasWorld && world ? (
          <div className="hud">
            <div className="hud-title-row">
              <Image
                src="/favicon.svg"
                alt=""
                aria-hidden="true"
                width={22}
                height={22}
                className="hud-mark"
              />
              <h2>Current World</h2>
            </div>
            <div className="hud-grid">
              <span>seed: {world.config.seed}</span>
              <span>
                size: {world.config.size} x {world.config.size}
              </span>
              <span>noise: {world.config.noiseIntensity.toFixed(1)}</span>
              <span data-testid="player-pos">
                pos: {playerPosition.x.toFixed(2)}, {playerPosition.y.toFixed(2)}, {" "}
                {playerPosition.z.toFixed(2)}
              </span>
            </div>
            <p>
              Desktop: 방향키 이동, Space 점프, Z 상승, 캔버스 클릭 후 마우스로 시야 조작
            </p>
            <div className="hud-actions">
              <button
                type="button"
                className="ghost-btn"
                onClick={() => setShowConfigPanel(true)}
              >
                Regenerate
              </button>
              <button type="button" className="ghost-btn" onClick={regenerateSeed}>
                New Seed
              </button>
            </div>
          </div>
        ) : null}

        {!isMobileLayout ? (
          <div className="pointer-tip">Click canvas to lock pointer</div>
        ) : null}

        {hasWorld ? <span className="sr-only" data-testid="world-ready" /> : null}

        <Canvas
          shadows
          dpr={[1, 1.5]}
          camera={{ fov: 72, near: 0.1, far: 350, position: [0, 14, 14] }}
        >
          <color attach="background" args={["#8ec7f0"]} />
          <fog attach="fog" args={["#8ec7f0", 36, 210]} />
          <ambientLight intensity={0.65} />
          <directionalLight
            castShadow
            intensity={1.2}
            position={[26, 42, 20]}
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />

          <LookControlsBridge enabled={!isMobileLayout} />

          <Physics gravity={[0, -24, 0]}>
            {world ? (
              <>
                <TerrainPhysics
                  key={`${world.config.seed}-${world.config.size}-${world.config.noiseIntensity}`}
                  world={world}
                />
                <VoxelTerrain chunks={chunks} />
                <PlayerController
                  desktopInput={desktopInput}
                  mobileInput={mobileInput}
                  spawnPoint={spawnPoint}
                  onPositionChange={(position) => setPlayerPosition(position)}
                />
              </>
            ) : null}
          </Physics>
        </Canvas>

        <StartConfigModal
          key={`config-modal-${draftConfig.seed}-${draftConfig.size}-${draftConfig.noiseIntensity}`}
          open={configModalOpen}
          initialConfig={draftConfig}
          isGenerating={isGenerating}
          onGenerate={handleGenerate}
        />

        {hasWorld && !configModalOpen && isMobileLayout ? (
          <MobileControlPad input={mobileInput} />
        ) : null}
      </div>
    </main>
  );
}
