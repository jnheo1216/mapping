"use client";

import { useThree } from "@react-three/fiber";
import { useEffect } from "react";

import { LOOK_SENSITIVITY_DESKTOP } from "@/lib/constants";
import { useLookStore } from "@/store/useLookStore";

interface LookControlsBridgeProps {
  enabled: boolean;
}

export function LookControlsBridge({ enabled }: LookControlsBridgeProps): null {
  const gl = useThree((state) => state.gl);
  const addDelta = useLookStore((state) => state.addDelta);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const canvas = gl.domElement;

    const onClick = (): void => {
      if (typeof canvas.requestPointerLock === "function") {
        canvas.requestPointerLock();
      }
    };

    const onMouseMove = (event: MouseEvent): void => {
      if (document.pointerLockElement !== canvas) {
        return;
      }

      addDelta(event.movementX, event.movementY, LOOK_SENSITIVITY_DESKTOP);
    };

    canvas.addEventListener("click", onClick);
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    return () => {
      canvas.removeEventListener("click", onClick);
      window.removeEventListener("mousemove", onMouseMove);

      if (document.pointerLockElement === canvas) {
        document.exitPointerLock();
      }
    };
  }, [addDelta, enabled, gl]);

  return null;
}
