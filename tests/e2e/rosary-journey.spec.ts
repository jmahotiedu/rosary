import { expect, test } from "@playwright/test";
import {
  attachFullPageScreenshot,
  clickRosaryStep,
  expectNoHorizontalOverflow,
  openFreshRosary,
} from "./helpers";

test("an accidental jump does not complete skipped prayers and remains recoverable", async ({
  page,
}, testInfo) => {
  await openFreshRosary(page);

  await clickRosaryStep(page, "decade-5-hail-10");
  await expect(page.getByRole("heading", { name: "Hail Mary 10 of 10" })).toBeVisible();
  await expect(page.locator(".progress-ring span")).toHaveText("0%");
  await expect(page.locator(".is-complete")).toHaveCount(0);

  await page.getByRole("button", { name: "Previous" }).click();
  await expect(page.getByRole("heading", { name: "Hail Mary 9 of 10" })).toBeVisible();
  await expect(page.locator(".progress-ring span")).toHaveText("0%");

  await clickRosaryStep(page, "decade-5-hail-10");
  await page.getByRole("button", { name: "Next prayer" }).click();
  await expect(page.getByRole("heading", { name: "Complete decade 5" })).toBeVisible();
  await expect(page.locator(".is-complete")).toHaveCount(1);
  await expect(page.locator(".progress-ring span")).not.toHaveText("100%");

  await attachFullPageScreenshot(page, testInfo, "accidental-jump-recovery");
});

test("opening Hail Mary highlights follow the physical strand toward the centerpiece", async ({
  page,
}, testInfo) => {
  await openFreshRosary(page);

  await page.getByRole("button", { name: "Next prayer" }).click();
  await expect(page.getByRole("heading", { name: "Opening Our Father" })).toBeVisible();
  await page.getByRole("button", { name: "Next prayer" }).click();

  const first = page.locator('[data-step-id="opening-hail-1"]');
  const second = page.locator('[data-step-id="opening-hail-2"]');
  const third = page.locator('[data-step-id="opening-hail-3"]');

  await expect(page.getByRole("heading", { name: "Opening Hail Mary 1 of 3" })).toBeVisible();
  await expect(first).toHaveAttribute("aria-current", "step");
  await expect(first).toHaveAttribute("style", /--y:560/);

  await page.getByRole("button", { name: "Next prayer" }).click();
  await expect(page.getByRole("heading", { name: "Opening Hail Mary 2 of 3" })).toBeVisible();
  await expect(second).toHaveAttribute("aria-current", "step");
  await expect(second).toHaveAttribute("style", /--y:522/);

  await page.getByRole("button", { name: "Next prayer" }).click();
  await expect(page.getByRole("heading", { name: "Opening Hail Mary 3 of 3" })).toBeVisible();
  await expect(third).toHaveAttribute("aria-current", "step");
  await expect(third).toHaveAttribute("style", /--y:484/);

  await page.getByRole("button", { name: "Next prayer" }).click();
  await expect(page.getByRole("heading", { name: "Before the five decades" })).toBeVisible();

  await attachFullPageScreenshot(page, testInfo, "opening-strand-sequence");
});

test("the rendered Rosary has no stray center ellipse or bead over the crucifix", async ({
  page,
}, testInfo) => {
  await openFreshRosary(page);

  await expect(page.locator(".rosary-visual ellipse")).toHaveCount(0);
  await expect(page.locator(".cross-visual")).toHaveCount(1);
  await expect(page.locator('circle[cx="195"][cy="675"]')).toHaveCount(0);

  await expectNoHorizontalOverflow(page);
  await attachFullPageScreenshot(page, testInfo, "initial-rosary-render");
});

test("start over clears completed prayers and returns to the crucifix", async ({ page }) => {
  await openFreshRosary(page);

  await page.getByRole("button", { name: "Next prayer" }).click();
  await page.getByRole("button", { name: "Next prayer" }).click();
  await expect(page.locator(".is-complete")).toHaveCount(2);

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Start over" }).click();

  await expect(page.getByRole("heading", { name: "Begin the Rosary" })).toBeVisible();
  await expect(page.locator(".is-complete")).toHaveCount(0);
  await expect(page.locator(".progress-ring span")).toHaveText("0%");
});
