import { create } from "zustand";

import { LOOK_PITCH_LIMIT } from "@/lib/constants";

interface LookState {
  yaw: number;
  pitch: number;
  addDelta: (deltaX: number, deltaY: number, sensitivity: number) => void;
  reset: () => void;
}

export const useLookStore = create<LookState>((set) => ({
  yaw: 0,
  pitch: 0,
  addDelta: (deltaX, deltaY, sensitivity) =>
    set((state) => {
      const nextYaw = state.yaw - deltaX * sensitivity;
      const nextPitch = Math.max(
        -LOOK_PITCH_LIMIT,
        Math.min(LOOK_PITCH_LIMIT, state.pitch + deltaY * sensitivity)
      );

      return {
        yaw: nextYaw,
        pitch: nextPitch
      };
    }),
  reset: () => set({ yaw: 0, pitch: 0 })
}));
