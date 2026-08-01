import { expect, type Page, type TestInfo } from "@playwright/test";
import { viewBoxPointToClient } from "../../src/components/rosary-geometry";

/**
 * Playwright creates an isolated browser context for every test, so a new page already has
 * empty local/session storage and an isolated service-worker/cache partition. Avoid clearing
 * storage after navigation: the PWA can legitimately activate a worker and navigate while the
 * page is loading, which made the old helper race Chromium and WebKit.
 */
export async function openFreshRosary(page: Page): Promise<void> {
  await page.goto("./", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Begin the Rosary" })).toBeVisible();
}

/** Reopen the app without clearing persisted progress. */
export async function reopenRosary(page: Page): Promise<void> {
  await page.goto("./", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".prayer-sheet h2")).toBeVisible();
}

export async function clickRosaryStep(page: Page, stepId: string): Promise<void> {
  const target = page.locator(`[data-step-id="${stepId}"]`);
  await expect(target).toHaveCount(1);
  await expect(target).toBeAttached();

  const style = await target.getAttribute("style");
  const x = Number(style?.match(/--x:([\d.]+)/)?.[1]);
  const y = Number(style?.match(/--y:([\d.]+)/)?.[1]);
  expect(Number.isFinite(x), `Expected an x coordinate for ${stepId}`).toBeTruthy();
  expect(Number.isFinite(y), `Expected a y coordinate for ${stepId}`).toBeTruthy();

  // A tall Rosary can extend beyond an iPhone viewport. Scroll the actual bead target into view,
  // then recompute the SVG bounds before issuing the real pointer/touch action.
  await target.scrollIntoViewIfNeeded();

  const visual = page.locator(".rosary-visual");
  const visualBounds = await visual.boundingBox();
  expect(visualBounds, "Expected the Rosary SVG to have a bounding box").not.toBeNull();

  const point = viewBoxPointToClient(x, y, {
    left: visualBounds!.x,
    top: visualBounds!.y,
    width: visualBounds!.width,
    height: visualBounds!.height,
  });
  expect(point, `Expected ${stepId} to map into the rendered SVG`).not.toBeNull();

  const hasTouch = await page.evaluate(() => navigator.maxTouchPoints > 0);

  // Exercise the same stage-level coordinate hit path used by real users. A mouse action is used
  // for desktop Chromium and a genuine touchscreen tap for the iPhone WebKit project.
  if (hasTouch) {
    await page.touchscreen.tap(point!.clientX, point!.clientY);
  } else {
    await page.mouse.click(point!.clientX, point!.clientY);
  }
}

export async function waitForSavedStep(page: Page, stepId: string): Promise<void> {
  await expect
    .poll(async () =>
      page.evaluate(() => window.localStorage.getItem("rosary:pwa:v1")),
    )
    .toContain(`"currentStepId":"${stepId}"`);
}

export async function attachFullPageScreenshot(
  page: Page,
  testInfo: TestInfo,
  name: string,
): Promise<void> {
  await testInfo.attach(name, {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });
}

export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));

  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1);
}
