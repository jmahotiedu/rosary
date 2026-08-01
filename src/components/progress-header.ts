export function renderProgressHeader(
  progress: number,
  currentStep: number,
  totalSteps: number,
): string {
  const percent = Math.round(progress * 100);

  return `<header class="app-header">
    <div class="brand-block">
      <h1>Rosary</h1>
      <p>Prayer guide</p>
    </div>
    <div class="progress-summary">
      <p class="step-counter">Step ${currentStep} of ${totalSteps}</p>
      <button class="restart-button" type="button" data-action="restart">Start over</button>
    </div>
  </header>
  <div class="progress-track" role="progressbar" aria-label="Rosary completion" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}">
    <span style="--progress:${percent}%"></span>
  </div>`;
}
