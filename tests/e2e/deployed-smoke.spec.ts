import { expect, test } from "@playwright/test";
import {
  clickRosaryStep,
  expectNoHorizontalOverflow,
  openFreshRosary,
} from "./helpers";

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

test("an active v2 installed client upgrades, reloads, and uses recovery behavior", async ({
  page,
}) => {
  test.setTimeout(60_000);

  // Start on a same-origin document inside the production scope, install the exact v2 worker,
  // and wait until this already-open client is actively controlled by it.
  await page.goto("./manifest.webmanifest?upgrade-probe=active-v2", {
    waitUntil: "domcontentloaded",
  });

  const v2Setup = await page.evaluate(async () => {
    if (!("serviceWorker" in navigator) || !("caches" in window)) return null;

    await Promise.all(
      (await navigator.serviceWorker.getRegistrations()).map((registration) =>
        registration.unregister(),
      ),
    );
    await Promise.all((await caches.keys()).map((name) => caches.delete(name)));
    localStorage.clear();

    const registration = await navigator.serviceWorker.register(
      "/rosary/sw-v2-fixture.js",
      {
        scope: "/rosary/",
        updateViaCache: "none",
      },
    );
    const worker = registration.installing ?? registration.waiting ?? registration.active;
    if (!worker) throw new Error("Expected the v2 worker to exist");

    if (worker.state !== "activated") {
      await new Promise<void>((resolve, reject) => {
        const timeout = window.setTimeout(
          () => reject(new Error(`v2 worker stopped at ${worker.state}`)),
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

    if (!navigator.serviceWorker.controller?.scriptURL.includes("/sw-v2-fixture.js")) {
      await new Promise<void>((resolve, reject) => {
        const timeout = window.setTimeout(
          () => reject(new Error("v2 worker did not claim the existing client")),
          15_000,
        );
        navigator.serviceWorker.addEventListener(
          "controllerchange",
          () => {
            window.clearTimeout(timeout);
            resolve();
          },
          { once: true },
        );
      });
    }

    const mainUrl = new URL("src/main.js", window.location.href).href;
    const progressUrl = new URL("src/domain/progress.js", window.location.href).href;
    const [mainFixture, progressFixture] = await Promise.all([
      fetch("/rosary/test-fixtures/main-v2.js", { cache: "no-store" }),
      fetch("/rosary/test-fixtures/progress-v2.js", { cache: "no-store" }),
    ]);
    if (!mainFixture.ok || !progressFixture.ok) {
      throw new Error("Could not load the cached v2 app fixtures");
    }

    // Recreate historical module responses under their production request URLs. Synthetic
    // responses intentionally have no fixture response URL, so relative imports resolve from
    // /src/main.js and /src/domain/progress.js exactly as they did in the installed application.
    const oldCache = await caches.open("rosary-v2");
    await Promise.all([
      oldCache.put(
        mainUrl,
        new Response(await mainFixture.text(), {
          headers: { "Content-Type": "text/javascript; charset=utf-8" },
        }),
      ),
      oldCache.put(
        progressUrl,
        new Response(await progressFixture.text(), {
          headers: { "Content-Type": "text/javascript; charset=utf-8" },
        }),
      ),
    ]);

    return {
      controllerUrl: navigator.serviceWorker.controller?.scriptURL ?? null,
      cacheNames: await caches.keys(),
    };
  });

  expect(v2Setup).not.toBeNull();
  expect(v2Setup!.controllerUrl).toMatch(/\/rosary\/sw-v2-fixture\.js$/);
  expect(v2Setup!.cacheNames).toContain("rosary-v2");

  // Load the app through the active v2 worker. It serves the cached pre-recovery bootstrap and
  // progress module, which then requests the production v3 worker. controllerchange reloads the
  // same installed client into current code.
  await page.goto("./", { waitUntil: "domcontentloaded" }).catch(() => null);
  await expect(page.getByRole("heading", { name: "Begin the Rosary" })).toBeVisible({
    timeout: 20_000,
  });

  await expect
    .poll(
      async () => {
        try {
          return await page.evaluate(
            () => navigator.serviceWorker.controller?.scriptURL ?? "",
          );
        } catch {
          return "";
        }
      },
      { timeout: 20_000 },
    )
    .toMatch(/\/rosary\/sw\.js$/);

  // These markers prove the active v2 worker served and executed both cached old modules. The
  // recorded result is the old bug: Previous moved to the neighboring fifth-decade bead instead
  // of returning to the prayer displayed before inspection.
  await expect
    .poll(async () =>
      page.evaluate(() => localStorage.getItem("rosary:test:loaded-v2-app")),
    )
    .toBe("true");
  await expect
    .poll(async () =>
      page.evaluate(() => localStorage.getItem("rosary:test:loaded-v2-progress")),
    )
    .toBe("true");
  await expect
    .poll(async () =>
      page.evaluate(() => localStorage.getItem("rosary:test:v2-previous-result")),
    )
    .toBe("decade-5-hail-9");

  await expect.poll(async () => page.evaluate(() => caches.keys())).toContain("rosary-v3");
  await expect.poll(async () => page.evaluate(() => caches.keys())).not.toContain("rosary-v2");

  // Verify the refreshed app is not merely controlled by v3: it must exhibit the exact recovery
  // behavior that was absent from the cached v2 progress module.
  await page.getByRole("button", { name: "Next prayer" }).click();
  await page.getByRole("button", { name: "Next prayer" }).click();
  await expect(page.getByRole("heading", { name: "Opening Hail Mary 1 of 3" })).toBeVisible();

  await clickRosaryStep(page, "decade-5-hail-10");
  await expect(page.getByRole("heading", { name: "Hail Mary 10 of 10" })).toBeVisible();
  await page.getByRole("button", { name: "Previous" }).click();
  await expect(page.getByRole("heading", { name: "Opening Hail Mary 1 of 3" })).toBeVisible();
});
