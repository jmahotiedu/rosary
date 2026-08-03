export type PrayerId = "sign-of-cross" | "apostles-creed" | "our-father" | "hail-mary" | "glory-be" | "fatima-prayer" | "hail-holy-queen" | "versicle-response" | "concluding-prayer";
export type MysterySetId = "joyful" | "sorrowful" | "glorious" | "luminous";
export type MysterySelectionMode = "automatic" | "manual";
export interface Prayer { readonly id: PrayerId; readonly title: string; readonly text: string; }
export interface Mystery { readonly name: string; readonly meditation: string; readonly scripture: string; }
export type StepKind = "crucifix" | "opening-large" | "opening-small" | "connector" | "decade-large" | "decade-small" | "after-decade" | "final";
export interface PrayerStep { readonly id:string; readonly kind:StepKind; readonly label:string; readonly location:string; readonly prayerIds:readonly PrayerId[]; readonly decade?:number; readonly beadNumber?:number; readonly mysteryIndex?:number; }
