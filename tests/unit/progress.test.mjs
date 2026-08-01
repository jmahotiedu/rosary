import test from "node:test";
import assert from "node:assert/strict";

import {
  advanceStep,
  getCompletionProgress,
  restartNavigation,
  retreatStep,
  selectStep,
} from "../../dist/domain/progress.js";

test("direct bead selection never marks skipped steps complete", () => {
  const initial = restartNavigation();
  const selected = selectStep(initial, "decade-5-hail-10");

  assert.equal(selected.currentStepId, "decade-5-hail-10");
  assert.equal(selected.returnStepId, "crucifix");
  assert.deepEqual(selected.completedStepIds, []);
  assert.equal(getCompletionProgress(selected.completedStepIds), 0);
});

test("Previous restores the exact pre-jump prayer", () => {
  const initial = restartNavigation();
  const selected = selectStep(initial, "decade-5-hail-10");
  const recovered = retreatStep(selected);

  assert.equal(recovered.currentStepId, "crucifix");
  assert.equal(recovered.returnStepId, null);
  assert.deepEqual(recovered.completedStepIds, []);
});

test("Previous follows sequence order when there was no direct jump", () => {
  const afterFirst = advanceStep(restartNavigation());
  const previous = retreatStep(afterFirst);

  assert.equal(previous.currentStepId, "crucifix");
  assert.equal(previous.returnStepId, null);
});

test("next marks only the prayer being left as complete", () => {
  const afterFirst = advanceStep(restartNavigation());

  assert.equal(afterFirst.currentStepId, "opening-our-father");
  assert.deepEqual(afterFirst.completedStepIds, ["crucifix"]);
  assert.equal(afterFirst.returnStepId, null);
});

test("jumping ahead and pressing next does not complete skipped prayers", () => {
  const selected = selectStep(restartNavigation(), "decade-5-hail-10");
  const advanced = advanceStep(selected);

  assert.deepEqual(advanced.completedStepIds, ["decade-5-hail-10"]);
  assert.equal(advanced.completedStepIds.includes("crucifix"), false);
  assert.equal(advanced.returnStepId, null);
});

test("restart clears selection, completion, and recovery context", () => {
  const progressed = selectStep(advanceStep(restartNavigation()), "decade-4-hail-8");
  const restarted = restartNavigation();

  assert.notDeepEqual(progressed.completedStepIds, []);
  assert.notEqual(progressed.returnStepId, null);
  assert.equal(restarted.currentStepId, "crucifix");
  assert.deepEqual(restarted.completedStepIds, []);
  assert.equal(restarted.returnStepId, null);
});
