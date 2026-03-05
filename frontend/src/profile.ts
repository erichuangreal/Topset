export type Units = "kg" | "lb";
export type Experience = "beginner" | "intermediate" | "advanced";
export type Goal = "strength" | "hypertrophy" | "general" | "cut" | "bulk";
export type CoachStyle = "motivational" | "strict" | "minimal";
export type SplitType = "fullbody" | "ppl" | "upperlower" | "custom";

export type Profile = {
    name: string;
    goal: Goal;

    units: Units;
    targetDaysPerWeek: number; // 1..7
    experience: Experience;

    bodyWeight: number; // 0 = not set; stored in chosen units
    restTimerSecs: number; // 0 = off; else 60 / 90 / 120 / 180 / 300
    coachStyle: CoachStyle;
    splitType: SplitType;

    syncEnabled: boolean;

    updatedAt: string; // ISO
};

export const DEFAULT_PROFILE: Profile = {
    name: "",
    goal: "general",

    units: "lb",
    targetDaysPerWeek: 3,
    experience: "beginner",

    bodyWeight: 0,
    restTimerSecs: 90,
    coachStyle: "motivational",
    splitType: "fullbody",

    syncEnabled: false,

    updatedAt: new Date().toISOString(),
};
