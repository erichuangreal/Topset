import React from "react";
import { useProfile } from "../hooks/useProfile";
import type { CoachStyle, Experience, Goal, SplitType, Units } from "../profile";
import { TopPill } from "../components/TopPill";

export default function ProfilePage() {
    const { profile, setProfile, resetProfile } = useProfile();

    const exportData = () => {
        const payload: Record<string, unknown> = {};
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (!k || !k.startsWith("lifting:")) continue;
            payload[k] = localStorage.getItem(k);
        }
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "topset-export.json";
        a.click();
        URL.revokeObjectURL(url);
    };

    const resetAllData = async () => {
        const ok = window.confirm(
            "Reset ALL data? This will permanently delete all workouts from the database and clear your local profile and drafts."
        );
        if (!ok) return;
        try {
            const res = await fetch("/api/workouts/all", { method: "DELETE" });
            const data = await res.json();
            if (!res.ok || data?.ok === false) {
                alert("Failed to delete workouts from the server. Please try again.");
                return;
            }
        } catch {
            alert("Could not reach the server. Check that the backend is running.");
            return;
        }
        const keys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith("lifting:")) keys.push(k);
        }
        keys.forEach((k) => localStorage.removeItem(k));
        resetProfile();
        alert("All data has been reset.");
    };

    // --- cyclers ---
    const toggleUnits = () =>
        setProfile((p) => ({ ...p, units: p.units === "lb" ? "kg" : "lb" }));

    const cycleDays = () =>
        setProfile((p) => ({
            ...p,
            targetDaysPerWeek: p.targetDaysPerWeek >= 7 ? 1 : p.targetDaysPerWeek + 1,
        }));

    const cycleIntensity = () => {
        const order: Experience[] = ["beginner", "intermediate", "advanced"];
        const next = order[(Math.max(0, order.indexOf(profile.experience)) + 1) % order.length];
        setProfile((p) => ({ ...p, experience: next }));
    };

    const cycleGoal = () => {
        const order: Goal[] = ["general", "strength", "hypertrophy", "cut", "bulk"];
        const next = order[(Math.max(0, order.indexOf(profile.goal)) + 1) % order.length];
        setProfile((p) => ({ ...p, goal: next }));
    };

    const cycleSplit = () => {
        const order: SplitType[] = ["fullbody", "ppl", "upperlower", "custom"];
        const next = order[(Math.max(0, order.indexOf(profile.splitType ?? "fullbody")) + 1) % order.length];
        setProfile((p) => ({ ...p, splitType: next }));
    };

    const cycleRestTimer = () => {
        const order = [0, 60, 90, 120, 180, 300];
        const cur = profile.restTimerSecs ?? 90;
        const idx = order.indexOf(cur);
        const next = order[idx === -1 ? 2 : (idx + 1) % order.length];
        setProfile((p) => ({ ...p, restTimerSecs: next }));
    };

    const cycleCoachStyle = () => {
        const order: CoachStyle[] = ["motivational", "strict", "minimal"];
        const next = order[(Math.max(0, order.indexOf(profile.coachStyle ?? "motivational")) + 1) % order.length];
        setProfile((p) => ({ ...p, coachStyle: next }));
    };

    const toggleSyncMode = () =>
        setProfile((p) => ({ ...p, syncEnabled: !p.syncEnabled }));

    const editName = () => {
        const v = window.prompt("Your name", profile.name ?? "");
        if (v === null) return;
        setProfile((p) => ({ ...p, name: v.trim() }));
    };

    const editBodyWeight = () => {
        const cur = profile.bodyWeight > 0 ? String(profile.bodyWeight) : "";
        const v = window.prompt(`Body weight (${prettyUnits(profile.units)})`, cur);
        if (v === null) return;
        const n = parseFloat(v);
        setProfile((p) => ({ ...p, bodyWeight: Number.isFinite(n) && n > 0 ? Math.round(n * 10) / 10 : 0 }));
    };

    return (
        <div className="min-h-screen bg-[#F6F5F3] pb-24">
            <div className="px-5 pt-6">
                <TopPill title="Profile" />

                {/* Avatar / identity card */}
                <div className="mt-5 flex items-center gap-4 rounded-[18px] bg-white px-4 py-4">
                    <button type="button" onClick={editName} aria-label="Edit name" className="shrink-0 active:scale-[0.97]">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#6366F1]">
                            {profile.name ? (
                                <span className="text-[20px] font-semibold text-white">
                                    {profile.name.trim().charAt(0).toUpperCase()}
                                </span>
                            ) : (
                                <UserIcon className="h-6 w-6 text-white opacity-80" />
                            )}
                        </div>
                    </button>

                    <div className="min-w-0 flex-1">
                        <button
                            type="button"
                            onClick={editName}
                            className="block w-full text-left text-[16px] font-semibold text-[#111827] hover:text-[#6366F1]"
                        >
                            {profile.name || "Tap to set name"}
                        </button>
                        <button
                            type="button"
                            onClick={cycleGoal}
                            className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#EEF2FF] px-2.5 py-0.5 text-[11px] font-medium text-[#6366F1] active:bg-[#E0E7FF]"
                        >
                            {prettyGoal(profile.goal)}
                            <ChevronIcon className="h-3 w-3" />
                        </button>
                    </div>
                </div>

                {/* Training section */}
                <div className="mt-6">
                    <SectionPill title="Training" />
                </div>

                <SettingCard>
                    <SettingRow
                        label="Units"
                        value={prettyUnits(profile.units)}
                        onClick={toggleUnits}
                    />
                    <SettingRow
                        label="Days per week"
                        value={`${profile.targetDaysPerWeek} day${profile.targetDaysPerWeek === 1 ? "" : "s"}`}
                        onClick={cycleDays}
                    />
                    <SettingRow
                        label="Experience"
                        value={prettyIntensity(profile.experience)}
                        onClick={cycleIntensity}
                    />
                    <SettingRow
                        label="Split"
                        value={prettySplit(profile.splitType ?? "fullbody")}
                        onClick={cycleSplit}
                        description="How you structure your training week"
                    />
                    <SettingRow
                        label="Rest timer"
                        value={prettyRestTimer(profile.restTimerSecs ?? 90)}
                        onClick={cycleRestTimer}
                        description="Default rest between sets"
                    />
                    <SettingRow
                        label="Body weight"
                        value={profile.bodyWeight > 0 ? `${profile.bodyWeight} ${prettyUnits(profile.units)}` : "Not set"}
                        onClick={editBodyWeight}
                        description="Used for bodyweight exercise ratios"
                        last
                    />
                </SettingCard>

                {/* Preferences section */}
                <div className="mt-6">
                    <SectionPill title="Preferences" />
                </div>

                <SettingCard>
                    <SettingRow
                        label="Coach feedback"
                        value={prettyCoachStyle(profile.coachStyle ?? "motivational")}
                        onClick={cycleCoachStyle}
                        description="Tone of in-session coaching cues"
                        last
                    />
                </SettingCard>

                {/* Data section */}
                <div className="mt-6">
                    <SectionPill title="Data" />
                </div>

                <SettingCard>
                    <SettingRow
                        label="Storage"
                        value={profile.syncEnabled ? "Sync" : "Local-only"}
                        onClick={toggleSyncMode}
                    />
                    <SettingRow
                        label="Export data"
                        onClick={exportData}
                    />
                    <SettingRow
                        label="Reset all data"
                        onClick={resetAllData}
                        danger
                        last
                    />
                </SettingCard>

                <div className="h-4" />
            </div>
        </div>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionPill({ title }: { title: string }) {
    return (
        <div className="mb-3 inline-flex items-center rounded-full bg-[#6366F1] px-4 py-1.5">
            <div className="text-[12px] font-semibold uppercase tracking-wide text-white">{title}</div>
        </div>
    );
}

function SettingCard({ children }: { children: React.ReactNode }) {
    return (
        <div className="overflow-hidden rounded-[18px] bg-white divide-y divide-[#F3F4F6]">
            {children}
        </div>
    );
}

function SettingRow({
    label,
    value,
    description,
    onClick,
    danger,
    last: _last,
}: {
    label: string;
    value?: string;
    description?: string;
    onClick: () => void;
    danger?: boolean;
    last?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex w-full items-center justify-between px-4 py-3.5 text-left active:bg-[#F9FAFB] transition-colors"
        >
            <div className="min-w-0 flex-1 pr-3">
                <div className={`text-[14px] font-medium leading-snug ${danger ? "text-red-500" : "text-[#111827]"}`}>
                    {label}
                </div>
                {description && (
                    <div className="mt-0.5 text-[11px] leading-snug text-[#9CA3AF]">{description}</div>
                )}
            </div>
            {value ? (
                <div className="flex shrink-0 items-center gap-1">
                    <span className={`text-[13px] font-medium ${danger ? "text-red-400" : "text-[#6366F1]"}`}>
                        {value}
                    </span>
                    <ChevronIcon className="h-3.5 w-3.5 text-[#D1D5DB]" />
                </div>
            ) : (
                <ChevronIcon className={`h-3.5 w-3.5 ${danger ? "text-red-300" : "text-[#D1D5DB]"}`} />
            )}
        </button>
    );
}

// ─── Formatters ───────────────────────────────────────────────────────────────

function prettyUnits(u: Units) { return u === "lb" ? "lbs" : "kg"; }

function prettyIntensity(e: Experience) {
    if (e === "beginner") return "Beginner";
    if (e === "intermediate") return "Intermediate";
    return "Advanced";
}

function prettyGoal(g: Goal) {
    const map: Record<Goal, string> = {
        general: "General fitness",
        strength: "Strength",
        hypertrophy: "Hypertrophy",
        cut: "Cut",
        bulk: "Bulk",
    };
    return map[g] ?? "General fitness";
}

function prettySplit(s: SplitType) {
    const map: Record<SplitType, string> = {
        fullbody: "Full Body",
        ppl: "Push / Pull / Legs",
        upperlower: "Upper / Lower",
        custom: "Custom",
    };
    return map[s] ?? "Full Body";
}

function prettyRestTimer(secs: number) {
    if (secs === 0) return "Off";
    if (secs < 60) return `${secs}s`;
    if (secs === 60) return "1 min";
    if (secs < 120) return `${secs}s`;
    return `${secs / 60} min`;
}

function prettyCoachStyle(s: CoachStyle) {
    if (s === "motivational") return "Motivational";
    if (s === "strict") return "Strict";
    return "Minimal";
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function UserIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
            <path d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Z"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M4.5 20c1.7-3.5 13.3-3.5 15 0"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

function ChevronIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
