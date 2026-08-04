import { expect, test } from "@playwright/test";
import { ROSARY_SEQUENCE } from "../../src/data/rosary-sequence";
import { getMysterySetForDate } from "../../src/domain/weekday-mysteries";
import {
  attachFullPageScreenshot,
  clickRosaryStep,
  expectNoHorizontalOverflow,
  openFreshRosary,
  reopenRosary,
} from "./helpers";

test("an accidental jump returns to the exact pre-jump prayer", async ({ page }, testInfo) => {
  await openFreshRosary(page);

  await page.getByRole("button", { name: "Next prayer" }).click();
  await page.getByRole("button", { name: "Next prayer" }).click();
  await expect(page.getByRole("heading", { name: "Opening Hail Mary 1 of 3" })).toBeVisible();

  await clickRosaryStep(page, "decade-5-hail-10");
  await expect(page.getByRole("heading", { name: "Hail Mary 10 of 10" })).toBeVisible();
  await expect(page.locator("[data-progress-count]")).not.toHaveText(
    `${ROSARY_SEQUENCE.length} of ${ROSARY_SEQUENCE.length} prayers`,
  );

  await page.getByRole("button", { name: "Previous" }).click();
  await expect(page.getByRole("heading", { name: "Opening Hail Mary 1 of 3" })).toBeVisible();
  await expect(page.locator(".is-complete")).toHaveCount(2);

  await attachFullPageScreenshot(page, testInfo, "accidental-jump-exact-recovery");
});

test("tapping the return bead exits inspection mode immediately", async ({ page }) => {
  await openFreshRosary(page);

  await clickRosaryStep(page, "decade-4-hail-7");
  await expect(page.getByRole("heading", { name: "Hail Mary 7 of 10" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Previous" })).toBeEnabled();

  await clickRosaryStep(page, "crucifix");
  await expect(page.getByRole("heading", { name: "Begin the Rosary" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Previous" })).toBeDisabled();
  await expect(page.locator(".is-complete")).toHaveCount(0);
});

test("reopening the app resets inspection and progress to the crucifix", async ({ page }) => {
  await openFreshRosary(page);
  await page.getByRole("button", { name: "Next prayer" }).click();
  await expect(page.getByRole("heading", { name: "Opening Our Father" })).toBeVisible();

  await clickRosaryStep(page, "decade-4-hail-7");
  await expect(page.getByRole("heading", { name: "Hail Mary 7 of 10" })).toBeVisible();

  await reopenRosary(page);
  await expect(page.getByRole("heading", { name: "Begin the Rosary" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Previous" })).toBeDisabled();
  await expect(page.locator(".is-complete")).toHaveCount(0);
  await expect(page.locator("[data-progress-count]")).toHaveText(
    `0 of ${ROSARY_SEQUENCE.length} prayers`,
  );
});

test("normal Previous works at multiple sequence positions", async ({ page }) => {
  await openFreshRosary(page);

  await page.getByRole("button", { name: "Next prayer" }).click();
  await page.getByRole("button", { name: "Previous" }).click();
  await expect(page.getByRole("heading", { name: "Begin the Rosary" })).toBeVisible();

  for (let index = 0; index < 5; index += 1) {
    await page.getByRole("button", { name: "Next prayer" }).click();
  }
  await expect(page.getByRole("heading", { name: "Before the five decades" })).toBeVisible();
  await page.getByRole("button", { name: "Previous" }).click();
  await expect(page.getByRole("heading", { name: "Opening Hail Mary 3 of 3" })).toBeVisible();
});

test("manual Mystery selection applies immediately and resets after reopening", async ({
  page,
}) => {
  await openFreshRosary(page);

  const selector = page.getByRole("combobox");
  await selector.selectOption("sorrowful");
  await expect(selector).toHaveValue("sorrowful");

  for (let index = 0; index < 5; index += 1) {
    await page.getByRole("button", { name: "Next prayer" }).click();
  }
  await expect(page.getByText("First Sorrowful Mystery")).toBeVisible();
  await expect(page.getByText("The Agony in the Garden")).toBeVisible();
  await expect(page.getByText("Matthew 26:36–46", { exact: true })).toBeVisible();

  await reopenRosary(page);
  await expect(page.getByRole("combobox")).toHaveValue(getMysterySetForDate(new Date()));
  await expect(page.getByRole("heading", { name: "Begin the Rosary" })).toBeVisible();
});

test("direct selection of an early bead is non-destructive", async ({ page }) => {
  await openFreshRosary(page);
  await page.getByRole("button", { name: "Next prayer" }).click();
  await page.getByRole("button", { name: "Next prayer" }).click();

  await clickRosaryStep(page, "opening-hail-3");
  await expect(page.getByRole("heading", { name: "Opening Hail Mary 3 of 3" })).toBeVisible();
  await expect(page.locator(".is-complete")).toHaveCount(2);

  await page.getByRole("button", { name: "Previous" }).click();
  await expect(page.getByRole("heading", { name: "Opening Hail Mary 1 of 3" })).toBeVisible();
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
  await expect(first).toHaveAttribute("style", /--y:568/);

  await page.getByRole("button", { name: "Next prayer" }).click();
  await expect(page.getByRole("heading", { name: "Opening Hail Mary 2 of 3" })).toBeVisible();
  await expect(second).toHaveAttribute("aria-current", "step");
  await expect(second).toHaveAttribute("style", /--y:530/);

  await page.getByRole("button", { name: "Next prayer" }).click();
  await expect(page.getByRole("heading", { name: "Opening Hail Mary 3 of 3" })).toBeVisible();
  await expect(third).toHaveAttribute("aria-current", "step");
  await expect(third).toHaveAttribute("style", /--y:492/);

  await page.getByRole("button", { name: "Next prayer" }).click();
  await expect(page.getByRole("heading", { name: "Before the five decades" })).toBeVisible();

  await attachFullPageScreenshot(page, testInfo, "opening-strand-sequence");
});

test("the rendered Rosary has no unexplained center ellipse or crucifix bead", async ({
  page,
}, testInfo) => {
  await openFreshRosary(page);

  await expect(page.locator('[data-domain-part="centerpiece"]')).toHaveCount(1);
  await expect(page.locator('[data-domain-part="crucifix"]')).toHaveCount(1);
  await expect(page.locator(".cross-visual")).toHaveCount(1);

  const unexplainedCenterEllipses = await page
    .locator('.rosary-visual ellipse:not([data-domain-part])')
    .evaluateAll((ellipses) =>
      ellipses.filter((ellipse) => {
        const cx = Number(ellipse.getAttribute("cx"));
        const cy = Number(ellipse.getAttribute("cy"));
        return cx >= 170 && cx <= 220 && cy >= 390 && cy <= 470;
      }).length,
    );
  expect(unexplainedCenterEllipses).toBe(0);
  await expect(page.locator('circle[cx="195"][cy="675"]')).toHaveCount(0);

  await expectNoHorizontalOverflow(page);
  await attachFullPageScreenshot(page, testInfo, "initial-rosary-render");
});

test("sequential progress is discarded after reopening", async ({ page }) => {
  await openFreshRosary(page);
  for (let index = 0; index < 4; index += 1) {
    await page.getByRole("button", { name: "Next prayer" }).click();
  }
  await expect(page.getByRole("heading", { name: "Opening Hail Mary 3 of 3" })).toBeVisible();
  expect(await page.locator(".is-complete").count()).toBeGreaterThan(0);

  await reopenRosary(page);

  await expect(page.getByRole("heading", { name: "Begin the Rosary" })).toBeVisible();
  await expect(page.locator(".is-complete")).toHaveCount(0);
  await expect(page.locator("[data-progress-count]")).toHaveText(
    `0 of ${ROSARY_SEQUENCE.length} prayers`,
  );
});

test("the complete journey reaches final prayers and a true completed state", async ({
  page,
}, testInfo) => {
  test.setTimeout(90_000);
  await openFreshRosary(page);

  for (let step = 1; step < ROSARY_SEQUENCE.length; step += 1) {
    await page.getByRole("button", { name: "Next prayer" }).click();
  }

  await expect(page.getByRole("heading", { name: "Conclude the Rosary" })).toBeVisible();
  await expect(page.getByText("V. Pray for us, O holy Mother of God.")).toBeVisible();
  await expect(
    page.getByText("R. That we may be made worthy of the promises of Christ."),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Finish Rosary" })).toBeEnabled();
  await page.getByRole("button", { name: "Finish Rosary" }).click();

  await expect(page.getByRole("button", { name: "Rosary complete" })).toBeDisabled();
  await expect(page.locator("[data-progress-count]")).toHaveText(
    `${ROSARY_SEQUENCE.length} of ${ROSARY_SEQUENCE.length} prayers`,
  );
  await attachFullPageScreenshot(page, testInfo, "completed-rosary");

  await page.getByRole("button", { name: "Previous" }).click();
  await expect(page.getByRole("heading", { name: "Complete decade 5" })).toBeVisible();
  await attachFullPageScreenshot(page, testInfo, "completed-rosary-previous-recovery");
});

test("the active crucifix keeps a warm treatment and reserves focus blue for keyboards", async ({
  page,
}) => {
  await openFreshRosary(page);

  const tones = await page.evaluate(() => {
    const rootStyle = getComputedStyle(document.documentElement);
    const probe = document.createElement("div");
    document.body.appendChild(probe);
    const normalize = (token: string): string => {
      probe.style.color = rootStyle.getPropertyValue(token);
      return getComputedStyle(probe).color;
    };
    const focusBlue = normalize("--focus");
    const gold = normalize("--gold");
    probe.remove();

    const cross = document.querySelector(".cross-visual");
    return { focusBlue, gold, activeStroke: getComputedStyle(cross!).stroke };
  });

  expect(tones.activeStroke).not.toBe(tones.focusBlue);
  expect(tones.activeStroke).toBe(tones.gold);
});

test("start over clears completed prayers and returns to the crucifix", async ({ page }) => {
  await openFreshRosary(page);

  await page.getByRole("button", { name: "Next prayer" }).click();
  await page.getByRole("button", { name: "Next prayer" }).click();
  await expect(page.locator(".is-complete")).toHaveCount(2);

  await page.getByRole("button", { name: "Start over" }).click();
  await page
    .getByRole("group", { name: "Confirm start over" })
    .getByRole("button", { name: "Start over" })
    .click();

  await expect(page.getByRole("heading", { name: "Begin the Rosary" })).toBeVisible();
  await expect(page.locator(".is-complete")).toHaveCount(0);
  await expect(page.locator("[data-progress-count]")).toHaveText(
    `0 of ${ROSARY_SEQUENCE.length} prayers`,
  );
});
