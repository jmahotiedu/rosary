export async function registerServiceWorker(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;

  let refreshing = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });

  const registration = await navigator.serviceWorker.register("/rosary/sw.js", {
    updateViaCache: "none",
  });

  const activateWaitingWorker = (): void => {
    if (registration.waiting && navigator.serviceWorker.controller) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
  };

  activateWaitingWorker();

  registration.addEventListener("updatefound", () => {
    const worker = registration.installing;
    worker?.addEventListener("statechange", () => {
      if (worker.state === "installed" && navigator.serviceWorker.controller) {
        worker.postMessage({ type: "SKIP_WAITING" });
      }
    });
  });

  await registration.update();
}
