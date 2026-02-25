"use client";

import { useEffect, useRef } from "react";

import { LOOK_SENSITIVITY_MOBILE } from "@/lib/constants";
import { useLookStore } from "@/store/useLookStore";

import type { MobileInputAdapter } from "@/features/input/MobileInputAdapter";

interface MobileControlPadProps {
  input: MobileInputAdapter;
}

interface LookPointerState {
  pointerId: number | null;
  lastX: number;
  lastY: number;
}

export function MobileControlPad({ input }: MobileControlPadProps) {
  const joystickZoneRef = useRef<HTMLDivElement>(null);
  const lookZoneRef = useRef<HTMLDivElement>(null);
  const lookStateRef = useRef<LookPointerState>({
    pointerId: null,
    lastX: 0,
    lastY: 0
  });

  const addDelta = useLookStore((state) => state.addDelta);

  useEffect(() => {
    const zone = joystickZoneRef.current;

    if (!zone) {
      return;
    }

    let disposed = false;
    let manager: import("nipplejs").JoystickManager | undefined;

    void import("nipplejs").then((module) => {
      if (disposed || !zone) {
        return;
      }

      manager = module.default.create({
        zone,
        mode: "static",
        color: "#d9f0ff",
        size: 120,
        position: {
          left: "50%",
          top: "50%"
        }
      });

      manager.on("move", (_event, data) => {
        const vector = data.vector;
        if (!vector) {
          return;
        }

        input.setMoveAxis(vector.x, vector.y);
      });

      manager.on("end", () => {
        input.setMoveAxis(0, 0);
      });
    });

    return () => {
      disposed = true;
      manager?.destroy();
      input.setMoveAxis(0, 0);
    };
  }, [input]);

  useEffect(
    () => () => {
      input.reset();
    },
    [input]
  );

  return (
    <div className="mobile-controls" data-testid="mobile-controls">
      <div className="mobile-left-zone">
        <div ref={joystickZoneRef} className="joystick-zone" data-testid="mobile-joystick" />
      </div>

      <div className="mobile-right-zone">
        <div
          ref={lookZoneRef}
          className="look-zone"
          data-testid="mobile-look-zone"
          onPointerDown={(event) => {
            const element = lookZoneRef.current;
            if (!element) {
              return;
            }

            lookStateRef.current = {
              pointerId: event.pointerId,
              lastX: event.clientX,
              lastY: event.clientY
            };

            element.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            const lookState = lookStateRef.current;
            if (lookState.pointerId !== event.pointerId) {
              return;
            }

            const deltaX = event.clientX - lookState.lastX;
            const deltaY = event.clientY - lookState.lastY;

            lookStateRef.current.lastX = event.clientX;
            lookStateRef.current.lastY = event.clientY;

            addDelta(deltaX, deltaY, LOOK_SENSITIVITY_MOBILE);
          }}
          onPointerUp={(event) => {
            const element = lookZoneRef.current;
            if (lookStateRef.current.pointerId === event.pointerId) {
              lookStateRef.current.pointerId = null;
            }
            if (element?.hasPointerCapture(event.pointerId)) {
              element.releasePointerCapture(event.pointerId);
            }
          }}
          onPointerCancel={(event) => {
            const element = lookZoneRef.current;
            if (lookStateRef.current.pointerId === event.pointerId) {
              lookStateRef.current.pointerId = null;
            }
            if (element?.hasPointerCapture(event.pointerId)) {
              element.releasePointerCapture(event.pointerId);
            }
          }}
        />

        <button
          className="jump-button"
          data-testid="mobile-jump"
          type="button"
          onPointerDown={() => input.queueJump()}
        >
          JUMP
        </button>
      </div>
    </div>
  );
}
