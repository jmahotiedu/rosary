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

test("the recovery release evicts the pre-fix service-worker cache", async ({ page }) => {
  test.setTimeout(45_000);
  await openFreshRosary(page);

  const staleUrl = await page.evaluate(
    () => new URL("src/domain/progress.js", window.location.href).href,
  );

  await page.evaluate(async (url) => {
    if (!("serviceWorker" in navigator) || !("caches" in window)) return;

    const current = await navigator.serviceWorker.ready;
    await current.unregister();
    await Promise.all((await caches.keys()).map((name) => caches.delete(name)));

    const oldCache = await caches.open("rosary-v2");
    await oldCache.put(
      url,
      new Response("stale-pre-recovery-module", {
        headers: { "Content-Type": "text/javascript" },
      }),
    );
  }, staleUrl);

  // Activating rosary-v3 claims this existing page. The app's controllerchange handler then
  // reloads it, so start the registration without awaiting its activation and observe the real
  // installed-client refresh as a separate browser event.
  const reloaded = page.waitForEvent("load", { timeout: 20_000 });
  await page.evaluate(() => {
    void navigator.serviceWorker.register("/rosary/sw.js", {
      scope: "/rosary/",
      updateViaCache: "none",
    });
  });
  await reloaded;
  await expect(page.getByRole("heading", { name: "Begin the Rosary" })).toBeVisible();

  await expect
    .poll(async () => page.evaluate(() => caches.keys()))
    .toContain("rosary-v3");
  await expect
    .poll(async () => page.evaluate(() => caches.keys()))
    .not.toContain("rosary-v2");

  const upgrade = await page.evaluate(async (url) => {
    const registration = await navigator.serviceWorker.ready;
    const staleResponse = await caches.match(url);
    return {
      activeScriptUrl: registration.active?.scriptURL ?? null,
      staleBody: staleResponse ? await staleResponse.text() : null,
    };
  }, staleUrl);

  expect(upgrade.activeScriptUrl).toMatch(/\/rosary\/sw\.js$/);
  expect(upgrade.staleBody).not.toBe("stale-pre-recovery-module");
});
