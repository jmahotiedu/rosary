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
  assert.equal(selected.inspectionReturnStepId, "crucifix");
  assert.deepEqual(selected.completedStepIds, []);
  assert.equal(getCompletionProgress(selected.completedStepIds), 0);
});

test("Previous restores the exact pre-jump prayer", () => {
  const progressed = advanceStep(advanceStep(restartNavigation()));
  assert.equal(progressed.currentStepId, "opening-hail-1");

  const selected = selectStep(progressed, "decade-5-hail-10");
  const recovered = retreatStep(selected);

  assert.equal(recovered.currentStepId, "opening-hail-1");
  assert.equal(recovered.inspectionReturnStepId, null);
  assert.deepEqual(recovered.completedStepIds, ["crucifix", "opening-our-father"]);
});

test("multiple inspection taps retain the original recovery location", () => {
  const progressed = advanceStep(restartNavigation());
  const firstInspection = selectStep(progressed, "decade-2-hail-4");
  const secondInspection = selectStep(firstInspection, "decade-5-hail-10");

  assert.equal(secondInspection.inspectionReturnStepId, "opening-our-father");
  assert.equal(retreatStep(secondInspection).currentStepId, "opening-our-father");
});

test("tapping the original bead exits inspection mode immediately", () => {
  const progressed = advanceStep(restartNavigation());
  const inspected = selectStep(progressed, "decade-4-hail-7");
  const returnedByTap = selectStep(inspected, "opening-our-father");

  assert.equal(returnedByTap.currentStepId, "opening-our-father");
  assert.equal(returnedByTap.inspectionReturnStepId, null);
  assert.deepEqual(returnedByTap.completedStepIds, ["crucifix"]);
});

test("normal Previous moves one sequence step when not inspecting", () => {
  const progressed = advanceStep(advanceStep(restartNavigation()));
  const previous = retreatStep(progressed);

  assert.equal(previous.currentStepId, "opening-our-father");
  assert.equal(previous.inspectionReturnStepId, null);
});

test("next marks only the prayer being left as complete and exits inspection mode", () => {
  const selected = selectStep(restartNavigation(), "decade-5-hail-10");
  const advanced = advanceStep(selected);

  assert.equal(advanced.currentStepId, "decade-5-close");
  assert.deepEqual(advanced.completedStepIds, ["decade-5-hail-10"]);
  assert.equal(advanced.inspectionReturnStepId, null);
  assert.equal(advanced.completedStepIds.includes("crucifix"), false);
});

test("restart clears selection, completion, and recovery state", () => {
  const inspected = selectStep(advanceStep(restartNavigation()), "decade-3-hail-5");
  assert.notEqual(inspected.inspectionReturnStepId, null);

  const restarted = restartNavigation();
  assert.equal(restarted.currentStepId, "crucifix");
  assert.deepEqual(restarted.completedStepIds, []);
  assert.equal(restarted.inspectionReturnStepId, null);
});
