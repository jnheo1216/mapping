import type { InputAdapter, MoveAxis } from "@/features/world/types";

const KEY_CODES = new Set([
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Space",
  "KeyZ"
]);

export class DesktopInputAdapter implements InputAdapter {
  private keyState = new Set<string>();

  private jumpQueued = false;

  private attached = false;

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (!KEY_CODES.has(event.code)) {
      return;
    }

    event.preventDefault();
    this.keyState.add(event.code);

    if (event.code === "Space") {
      this.jumpQueued = true;
    }
  };

  private readonly onKeyUp = (event: KeyboardEvent): void => {
    if (!KEY_CODES.has(event.code)) {
      return;
    }

    event.preventDefault();
    this.keyState.delete(event.code);
  };

  attach(): void {
    if (this.attached || typeof window === "undefined") {
      return;
    }

    window.addEventListener("keydown", this.onKeyDown, { passive: false });
    window.addEventListener("keyup", this.onKeyUp, { passive: false });
    this.attached = true;
  }

  detach(): void {
    if (!this.attached || typeof window === "undefined") {
      return;
    }

    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    this.attached = false;
    this.keyState.clear();
    this.jumpQueued = false;
  }

  getMoveAxis(): MoveAxis {
    const horizontal =
      (this.keyState.has("ArrowRight") ? 1 : 0) -
      (this.keyState.has("ArrowLeft") ? 1 : 0);
    const vertical =
      (this.keyState.has("ArrowUp") ? 1 : 0) -
      (this.keyState.has("ArrowDown") ? 1 : 0);

    const magnitude = Math.hypot(horizontal, vertical);
    if (magnitude <= 1 || magnitude === 0) {
      return { x: horizontal, y: vertical };
    }

    return {
      x: horizontal / magnitude,
      y: vertical / magnitude
    };
  }

  consumeJumpPressed(): boolean {
    if (!this.jumpQueued) {
      return false;
    }

    this.jumpQueued = false;
    return true;
  }

  isAscendPressed(): boolean {
    return this.keyState.has("KeyZ");
  }
}
