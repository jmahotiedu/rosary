import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { expectNoHorizontalOverflow, openFreshRosary } from "./helpers";

test("primary prayer flow has no automated WCAG A or AA violations", async ({ page }) => {
  await openFreshRosary(page);

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  expect(results.violations).toEqual([]);
});

test("controls expose clear names and keyboard focus", async ({ page }) => {
  await openFreshRosary(page);

  await expect(page.getByRole("button", { name: "Start over" })).toBeVisible();
  await expect(page.getByRole("combobox", { name: /mysteries/i })).toBeVisible();
  await expect(page.getByRole("button", { name: "Previous" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Next prayer" })).toBeEnabled();

  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Start over" })).toBeFocused();

  await expectNoHorizontalOverflow(page);
});
