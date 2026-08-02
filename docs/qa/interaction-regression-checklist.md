# Interaction Regression Checklist

This checklist covers the failures found during the first live usability pass.

## Progress and recovery

- Tapping a later bead changes only the selected prayer.
- Tapping a later bead does not mark skipped prayers complete.
- Previous works immediately after a direct jump.
- Next marks only the prayer being left as complete.
- Start over clears selection progress after confirmation.
- Reload starts a fresh Rosary; completed prayers are not kept between visits.

## Opening strand

- The large Our Father bead is closest to the crucifix.
- Opening Hail Mary 1 is the lowest of the three small beads.
- Opening Hail Mary 2 is the middle small bead.
- Opening Hail Mary 3 is the upper small bead nearest the centerpiece.
- Next follows the same physical direction shown by the strand.

## Rosary rendering

- No extra ellipse or unexplained circle appears inside the loop.
- No decorative bead is layered over the crucifix.
- The crucifix remains connected to the strand.
- Beads, cord, medallion, and hit coordinates share the same view box.
- Empty space inside the loop does not select a bead.
- Crowded taps resolve to the nearest bead, not DOM order.

## Completion display

- Completion percentage is based on completed prayers, not the inspected bead.
- Direct inspection does not create check marks.
- Completed steps use restrained outlines rather than overlapping badges.
- The final-prayer step can be finished and then reviewed with Previous.
