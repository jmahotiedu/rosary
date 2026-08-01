export function renderProgressHeader(
  progress: number,
  currentStep: number,
  totalSteps: number,
): string {
  const percent = Math.round(progress * 100);
  return `<header class="app-header">
    <div>
      <p class="eyebrow">Interactive prayer guide</p>
      <h1>Rosary</h1>
    </div>
    <div class="progress-summary">
      <button class="restart-button" type="button" data-action="restart">Start over</button>
      <div class="progress-ring" style="--progress:${Math.round(progress * 360)}deg" aria-label="${percent} percent complete">
        <span>${percent}%</span>
      </div>
      <p>Step ${currentStep} of ${totalSteps}</p>
    </div>
  </header>`;
}
