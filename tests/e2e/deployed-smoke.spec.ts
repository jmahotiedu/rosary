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

  // Use a same-origin static document without the app's controllerchange reload listener. This
  // isolates the worker lifecycle while still exercising the real browser Cache Storage and
  // service-worker APIs against an already-open client inside the production /rosary/ scope.
  await page.goto("./manifest.webmanifest?upgrade-probe=1", {
    waitUntil: "domcontentloaded",
  });

  const upgrade = await page.evaluate(async () => {
    if (!("serviceWorker" in navigator) || !("caches" in window)) return null;

    await Promise.all((await caches.keys()).map((name) => caches.delete(name)));
    const staleUrl = new URL("src/domain/progress.js", window.location.href).href;
    const oldCache = await caches.open("rosary-v2");
    await oldCache.put(
      staleUrl,
      new Response("stale-pre-recovery-module", {
        headers: { "Content-Type": "text/javascript" },
      }),
    );

    const registration = await navigator.serviceWorker.register(
      "/rosary/sw.js?upgrade-check=rosary-v3",
      {
        scope: "/rosary/",
        updateViaCache: "none",
      },
    );
    const worker = registration.installing ?? registration.waiting ?? registration.active;
    if (!worker) throw new Error("Expected the recovery worker to exist");

    if (worker.state !== "activated") {
      await new Promise<void>((resolve, reject) => {
        const timeout = window.setTimeout(
          () => reject(new Error(`Recovery worker stopped at ${worker.state}`)),
          15_000,
        );
        worker.addEventListener("statechange", () => {
          if (worker.state === "activated") {
            window.clearTimeout(timeout);
            resolve();
          }
        });
      });
    }

    const cacheNames = await caches.keys();
    const staleResponse = await caches.match(staleUrl);
    return {
      activeScriptUrl: registration.active?.scriptURL ?? null,
      cacheNames,
      staleBody: staleResponse ? await staleResponse.text() : null,
    };
  });

  expect(upgrade).not.toBeNull();
  expect(upgrade!.activeScriptUrl).toMatch(
    /\/rosary\/sw\.js\?upgrade-check=rosary-v3$/,
  );
  expect(upgrade!.cacheNames).toContain("rosary-v3");
  expect(upgrade!.cacheNames).not.toContain("rosary-v2");
  expect(upgrade!.staleBody).not.toBe("stale-pre-recovery-module");
});
