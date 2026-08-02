export function renderProgressHeader(
  completedCount: number,
  totalSteps: number,
  restartPending: boolean,
  mysterySelector: string,
): string {
  const confirm = restartPending
    ? `<div class="restart-confirm" role="group" aria-label="Confirm start over">
        <p>Start the Rosary over and clear completed prayers?</p>
        <div class="restart-confirm-actions">
          <button type="button" data-action="restart-cancel">Cancel</button>
          <button type="button" class="primary" data-action="restart-confirm">Start over</button>
        </div>
      </div>`
    : "";

  return `<header class="app-header">
    <h1>Rosary</h1>
    ${mysterySelector}
    <div class="progress-summary">
      <button class="restart-button" type="button" data-action="restart"${restartPending ? " hidden" : ""}>Start over</button>
      <p class="progress-count" data-progress-count>${completedCount} of ${totalSteps} prayers</p>
    </div>
  </header>${confirm}`;
}
