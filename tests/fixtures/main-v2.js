import {
  restartNavigation,
  retreatStep,
  selectStep,
} from "./domain/progress.js";

// This is the cached bootstrap an already-installed v2 client executes before the production
// v3 worker takes control. Record both module execution and the old broken Previous behavior.
const initial = restartNavigation();
const inspected = selectStep(initial, "decade-5-hail-10");
const oldPreviousResult = retreatStep(inspected).currentStepId;

window.localStorage.setItem("rosary:test:loaded-v2-app", "true");
window.localStorage.setItem(
  "rosary:test:v2-previous-result",
  oldPreviousResult,
);

document.querySelector("#app").innerHTML = `
  <main aria-live="polite">
    <h1>Updating Rosary…</h1>
    <p>Installing the corrected offline version.</p>
  </main>
`;

let refreshing = false;
navigator.serviceWorker.addEventListener("controllerchange", () => {
  if (refreshing) return;
  refreshing = true;
  window.location.reload();
});

const registration = await navigator.serviceWorker.register("/rosary/sw.js", {
  scope: "/rosary/",
  updateViaCache: "none",
});

// The production worker calls skipWaiting during install. update() makes the transition explicit
// for this active-v2 fixture and mirrors the update check performed by the current app.
await registration.update();
