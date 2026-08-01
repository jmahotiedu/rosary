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
  assert.deepEqual(selected.completedStepIds, []);
  assert.equal(getCompletionProgress(selected.completedStepIds), 0);
});

test("previous navigation works after an accidental direct jump", () => {
  const selected = selectStep(restartNavigation(), "decade-5-hail-10");
  const previous = retreatStep(selected);

  assert.notEqual(previous.currentStepId, selected.currentStepId);
  assert.deepEqual(previous.completedStepIds, []);
});

test("next marks only the prayer being left as complete", () => {
  const afterFirst = advanceStep(restartNavigation());

  assert.equal(afterFirst.currentStepId, "opening-our-father");
  assert.deepEqual(afterFirst.completedStepIds, ["crucifix"]);
});

test("jumping ahead and pressing next does not complete skipped prayers", () => {
  const selected = selectStep(restartNavigation(), "decade-5-hail-10");
  const advanced = advanceStep(selected);

  assert.deepEqual(advanced.completedStepIds, ["decade-5-hail-10"]);
  assert.equal(advanced.completedStepIds.includes("crucifix"), false);
});

test("restart clears both selection and completion", () => {
  const progressed = advanceStep(advanceStep(restartNavigation()));
  const restarted = restartNavigation();

  assert.notDeepEqual(progressed.completedStepIds, []);
  assert.equal(restarted.currentStepId, "crucifix");
  assert.deepEqual(restarted.completedStepIds, []);
});
