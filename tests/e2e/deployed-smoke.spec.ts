import { expect, test } from "@playwright/test";
import { expectNoHorizontalOverflow, openFreshRosary } from "./helpers";

test("deployed Pages site loads, advances, and registers its service worker", async ({ page }) => {
  await openFreshRosary(page);

  await page.getByRole("button", { name: "Next prayer" }).click();
  await expect(page.getByRole("heading", { name: "Opening Our Father" })).toBeVisible();
  await expectNoHorizontalOverflow(page);

  const serviceWorkerUrl = await page.evaluate(async () => {
    if (!("serviceWorker" in navigator)) return null;
    const registration = await navigator.serviceWorker.ready;
    return registration.active?.scriptURL ?? null;
  });

  expect(serviceWorkerUrl).toMatch(/\/rosary\/sw\.js$/);
});
