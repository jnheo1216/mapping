import { afterEach, describe, expect, it } from "vitest";

import { DesktopInputAdapter } from "@/features/input/DesktopInputAdapter";
import { MobileInputAdapter } from "@/features/input/MobileInputAdapter";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("DesktopInputAdapter", () => {
  it("returns normalized movement vector from arrow keys", () => {
    const input = new DesktopInputAdapter();
    input.attach();

    window.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowUp" }));
    window.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowRight" }));

    const axis = input.getMoveAxis();

    expect(axis.x).toBeGreaterThan(0);
    expect(axis.y).toBeGreaterThan(0);
    expect(Math.hypot(axis.x, axis.y)).toBeCloseTo(1, 4);

    input.detach();
  });

  it("queues and consumes jump input on Space key", () => {
    const input = new DesktopInputAdapter();
    input.attach();

    window.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));

    expect(input.consumeJumpPressed()).toBe(true);
    expect(input.consumeJumpPressed()).toBe(false);

    input.detach();
  });

  it("tracks ascend state while Z key is held", () => {
    const input = new DesktopInputAdapter();
    input.attach();

    window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyZ" }));
    expect(input.isAscendPressed()).toBe(true);

    window.dispatchEvent(new KeyboardEvent("keyup", { code: "KeyZ" }));
    expect(input.isAscendPressed()).toBe(false);

    input.detach();
  });
});

describe("MobileInputAdapter", () => {
  it("stores movement axis and jump state", () => {
    const input = new MobileInputAdapter();

    input.setMoveAxis(0.4, -0.8);
    input.queueJump();

    expect(input.getMoveAxis()).toEqual({ x: 0.4, y: -0.8 });
    expect(input.consumeJumpPressed()).toBe(true);
    expect(input.consumeJumpPressed()).toBe(false);
    expect(input.isAscendPressed()).toBe(false);

    input.reset();
    expect(input.getMoveAxis()).toEqual({ x: 0, y: 0 });
  });
});
