import { expect, test } from "@playwright/test";
import {
  attachFullPageScreenshot,
  clickRosaryStep,
  expectNoHorizontalOverflow,
  openFreshRosary,
} from "./helpers";

const STORAGE_KEY = "rosary:pwa:v1";

test("an accidental jump returns to the exact pre-jump prayer", async ({ page }, testInfo) => {
  await openFreshRosary(page);

  await clickRosaryStep(page, "decade-5-hail-10");
  await expect(page.getByRole("heading", { name: "Hail Mary 10 of 10" })).toBeVisible();
  await expect(page.locator(".progress-ring span")).toHaveText("0%");
  await expect(page.locator(".is-complete")).toHaveCount(0);

  await page.getByRole("button", { name: "Previous" }).click();
  await expect(page.getByRole("heading", { name: "Begin the Rosary" })).toBeVisible();
  await expect(page.locator(".progress-ring span")).toHaveText("0%");

  await clickRosaryStep(page, "decade-5-hail-10");
  await page.getByRole("button", { name: "Next prayer" }).click();
  await expect(page.getByRole("heading", { name: "Complete decade 5" })).toBeVisible();
  await expect(page.locator(".is-complete")).toHaveCount(1);
  await expect(page.locator(".progress-ring span")).not.toHaveText("100%");

  await attachFullPageScreenshot(page, testInfo, "accidental-jump-recovery");
});

test("direct selection of an early bead is non-destructive and recoverable", async ({ page }) => {
  await openFreshRosary(page);

  await clickRosaryStep(page, "opening-hail-2");
  await expect(page.getByRole("heading", { name: "Opening Hail Mary 2 of 3" })).toBeVisible();
  await expect(page.locator(".is-complete")).toHaveCount(0);

  await page.getByRole("button", { name: "Previous" }).click();
  await expect(page.getByRole("heading", { name: "Begin the Rosary" })).toBeVisible();
});

test("Previous follows sequence order during normal prayer progression", async ({ page }) => {
  await openFreshRosary(page);

  for (let index = 0; index < 4; index += 1) {
    await page.getByRole("button", { name: "Next prayer" }).click();
  }
  await expect(page.getByRole("heading", { name: "Opening Hail Mary 3 of 3" })).toBeVisible();

  await page.getByRole("button", { name: "Previous" }).click();
  await expect(page.getByRole("heading", { name: "Opening Hail Mary 2 of 3" })).toBeVisible();
  await page.getByRole("button", { name: "Previous" }).click();
  await expect(page.getByRole("heading", { name: "Opening Hail Mary 1 of 3" })).toBeVisible();
});

test("opening Hail Mary highlights follow the physical strand toward the centerpiece", async ({ page }, testInfo) => {
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

test("reload restores explicitly completed progress and the selected prayer", async ({ page }) => {
  await openFreshRosary(page);

  await page.getByRole("button", { name: "Next prayer" }).click();
  await page.getByRole("button", { name: "Next prayer" }).click();
  await expect(page.getByRole("heading", { name: "Opening Hail Mary 1 of 3" })).toBeVisible();
  await expect(page.locator(".is-complete")).toHaveCount(2);

  await page.reload();
  await expect(page.getByRole("heading", { name: "Opening Hail Mary 1 of 3" })).toBeVisible();
  await expect(page.locator(".is-complete")).toHaveCount(2);
});

test("manual Mystery selection survives reload", async ({ page }) => {
  await openFreshRosary(page);

  await page.getByLabel("Mysteries").selectOption("sorrowful");
  await expect(page.getByLabel("Mysteries")).toHaveValue("sorrowful");
  await page.reload();
  await expect(page.getByLabel("Mysteries")).toHaveValue("sorrowful");

  await clickRosaryStep(page, "decade-1-our-father");
  await expect(page.getByText("The Agony in the Garden", { exact: true })).toBeVisible();
});

test("final prayers render completely and can be finished", async ({ page }, testInfo) => {
  await openFreshRosary(page);

  await page.evaluate((storageKey) => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        currentStepId: "final-prayers",
        mysterySet: "joyful",
        mysterySelectionMode: "manual",
        completedStepIds: [],
        returnStepId: null,
      }),
    );
  }, STORAGE_KEY);
  await page.reload();

  await expect(page.getByRole("heading", { name: "Conclude the Rosary" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Hail, Holy Queen" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Versicle and Response" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Concluding Prayer" })).toBeVisible();
  await page.getByRole("button", { name: "Finish Rosary" }).click();
  await expect(page.getByRole("button", { name: "Rosary complete" })).toBeDisabled();

  await attachFullPageScreenshot(page, testInfo, "final-prayers");
});

test("the rendered Rosary has no known stray center decoration or bead over the crucifix", async ({ page }, testInfo) => {
  await openFreshRosary(page);

  await expect(page.locator(".rosary-center-decoration")).toHaveCount(0);
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
