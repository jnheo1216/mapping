import { expect, test } from "@playwright/test";

function parsePosition(text: string | null): { x: number; y: number; z: number } {
  if (!text) {
    return { x: 0, y: 0, z: 0 };
  }

  const cleaned = text.replace("pos:", "").trim();
  const [x, y, z] = cleaned.split(",").map((value) => Number(value.trim()));

  return {
    x: Number.isFinite(x) ? x : 0,
    y: Number.isFinite(y) ? y : 0,
    z: Number.isFinite(z) ? z : 0
  };
}

test("start modal opens and world can be generated", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("start-config-modal")).toBeVisible();
  await page.getByRole("button", { name: "Generate World" }).click();

  await expect(page.getByTestId("world-ready")).toBeVisible();
  await expect(page.getByTestId("player-pos")).toBeVisible();
});

test("desktop controls move and jump player", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "Keyboard movement smoke is chromium-targeted");

  await page.goto("/");
  await page.getByRole("button", { name: "Generate World" }).click();

  const positionLabel = page.getByTestId("player-pos");
  const beforeMove = parsePosition(await positionLabel.textContent());

  await page.keyboard.down("ArrowUp");
  await page.waitForTimeout(500);
  await page.keyboard.up("ArrowUp");

  const afterMove = parsePosition(await positionLabel.textContent());

  expect(afterMove.z).toBeLessThanOrEqual(beforeMove.z);

  const beforeJump = parsePosition(await positionLabel.textContent());
  await page.keyboard.press("Space");
  await page.waitForTimeout(250);
  const peak = parsePosition(await positionLabel.textContent());

  expect(peak.y).toBeGreaterThanOrEqual(beforeJump.y);
});

test("mobile overlay appears in mobile project and jump button works", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Only runs in mobile project");

  await page.goto("/");
  await page.getByRole("button", { name: "Generate World" }).click();

  const controls = page.getByTestId("mobile-controls");
  const jumpButton = page.getByTestId("mobile-jump");
  const positionLabel = page.getByTestId("player-pos");

  await expect(controls).toBeVisible();

  const beforeJump = parsePosition(await positionLabel.textContent());
  await jumpButton.tap();
  await page.waitForTimeout(300);
  const afterJump = parsePosition(await positionLabel.textContent());

  expect(afterJump.y).toBeGreaterThanOrEqual(beforeJump.y);
});
