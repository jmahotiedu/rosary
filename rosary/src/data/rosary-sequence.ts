import type { PrayerStep } from "../domain/prayer-step";
const steps: PrayerStep[] = [
{id:"crucifix",kind:"crucifix",label:"Begin the Rosary",location:"Crucifix",prayerIds:["sign-of-cross","apostles-creed"]},
{id:"opening-our-father",kind:"opening-large",label:"Opening Our Father",location:"Large bead above the crucifix",prayerIds:["our-father"]},
...Array.from({length:3},(_,i)=>({id:`opening-hail-${i+1}`,kind:"opening-small" as const,label:`Opening Hail Mary ${i+1} of 3`,location:`Opening small bead ${i+1} of 3`,prayerIds:["hail-mary"] as const,beadNumber:i+1})),
{id:"opening-glory",kind:"connector",label:"Before the five decades",location:"Centerpiece before decade one",prayerIds:["glory-be"],mysteryIndex:0},
];
for(let decade=1;decade<=5;decade++){
 steps.push({id:`decade-${decade}-our-father`,kind:"decade-large",label:`Begin decade ${decade}`,location:`Large bead for decade ${decade}`,prayerIds:["our-father"],decade,mysteryIndex:decade-1});
 for(let bead=1;bead<=10;bead++) steps.push({id:`decade-${decade}-hail-${bead}`,kind:"decade-small",label:`Hail Mary ${bead} of 10`,location:`Small bead ${bead} in decade ${decade}`,prayerIds:["hail-mary"],decade,beadNumber:bead});
 steps.push({id:`decade-${decade}-close`,kind:"after-decade",label:`Complete decade ${decade}`,location:`After the tenth Hail Mary of decade ${decade}`,prayerIds:["glory-be","fatima-prayer"],decade});
}
steps.push({id:"final-prayers",kind:"final",label:"Conclude the Rosary",location:"After the fifth decade",prayerIds:["hail-holy-queen","versicle-response","concluding-prayer","sign-of-cross"]});
export const ROSARY_SEQUENCE: readonly PrayerStep[] = steps;
export const STEP_BY_ID = new Map(ROSARY_SEQUENCE.map((step,index)=>[step.id,{step,index}]));
