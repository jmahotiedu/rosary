import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { expectNoHorizontalOverflow, openFreshRosary } from "./helpers";

test("primary prayer flow has no automated WCAG A or AA violations", async ({ page }) => {
  await openFreshRosary(page);

  let results;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      break;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes("Execution context was destroyed") || attempt === 2) {
        throw error;
      }
      await expect(page.getByRole("heading", { name: "Begin the Rosary" })).toBeVisible();
    }
  }

  expect(results!.violations).toEqual([]);
});

test("controls expose clear names and keyboard focus", async ({ page }) => {
  await openFreshRosary(page);

  await expect(page.getByRole("button", { name: "Start over" })).toBeVisible();
  await expect(page.getByRole("combobox", { name: /mysteries/i })).toBeVisible();
  await expect(page.getByRole("button", { name: "Previous" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Next prayer" })).toBeEnabled();

  await page.keyboard.press("Tab");
  await expect(page.getByRole("combobox", { name: /mysteries/i })).toBeFocused();

  await expectNoHorizontalOverflow(page);
});
