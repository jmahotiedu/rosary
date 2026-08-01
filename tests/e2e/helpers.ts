import { expect, type Page, type TestInfo } from "@playwright/test";

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

  const style = await target.getAttribute("style");
  const x = Number(style?.match(/--x:([\d.]+)/)?.[1]);
  const y = Number(style?.match(/--y:([\d.]+)/)?.[1]);
  expect(Number.isFinite(x), `Expected an x coordinate for ${stepId}`).toBeTruthy();
  expect(Number.isFinite(y), `Expected a y coordinate for ${stepId}`).toBeTruthy();

  const stage = page.locator("[data-rosary-stage]");
  const bounds = await stage.boundingBox();
  expect(bounds, "Expected the Rosary stage to have a bounding box").not.toBeNull();

  await page.mouse.click(
    bounds!.x + (x / 390) * bounds!.width,
    bounds!.y + (y / 720) * bounds!.height,
  );
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
