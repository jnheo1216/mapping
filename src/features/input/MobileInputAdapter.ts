import type { InputAdapter, MoveAxis } from "@/features/world/types";

function clampAxis(value: number): number {
  return Math.max(-1, Math.min(1, value));
}

export class MobileInputAdapter implements InputAdapter {
  private moveAxis: MoveAxis = { x: 0, y: 0 };

  private jumpQueued = false;

  setMoveAxis(x: number, y: number): void {
    this.moveAxis = {
      x: clampAxis(x),
      y: clampAxis(y)
    };
  }

  queueJump(): void {
    this.jumpQueued = true;
  }

  reset(): void {
    this.moveAxis = { x: 0, y: 0 };
    this.jumpQueued = false;
  }

  getMoveAxis(): MoveAxis {
    return this.moveAxis;
  }

  consumeJumpPressed(): boolean {
    if (!this.jumpQueued) {
      return false;
    }

    this.jumpQueued = false;
    return true;
  }

  isAscendPressed(): boolean {
    return false;
  }
}
