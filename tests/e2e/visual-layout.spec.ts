import { expect, test } from "@playwright/test";
import { attachFullPageScreenshot, openFreshRosary } from "./helpers";

test("the prayer flow fits the viewport without marketing-style ornament", async ({ page }, testInfo) => {
  await openFreshRosary(page);

  await expect(page.locator(".progress-ring")).toHaveCount(0);
  await expect(page.locator(".progress-track")).toHaveCount(1);
  await expect(page.locator(".medallion-mark")).toHaveCount(1);

  const titleSize = await page.locator(".app-header h1").evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).fontSize),
  );
  expect(titleSize).toBeLessThanOrEqual(32);

  const nextButton = page.getByRole("button", { name: "Next prayer" });
  await expect(nextButton).toBeVisible();

  const nextBounds = await nextButton.boundingBox();
  const viewport = page.viewportSize();
  expect(nextBounds).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(nextBounds!.y + nextBounds!.height).toBeLessThanOrEqual(viewport!.height + 1);

  const pageHeight = await page.evaluate(() => ({
    viewport: window.innerHeight,
    document: document.documentElement.scrollHeight,
  }));
  expect(pageHeight.document).toBeLessThanOrEqual(pageHeight.viewport + 2);

  await attachFullPageScreenshot(page, testInfo, "quiet-devotional-layout");
});
