import { useNavigate } from "react-router-dom";
import { TopPill } from "../components/TopPill";
import FlameIcon from "../assets/Subtract.svg?react";
import { useEffect, useState } from "react";
import {
    computeMood,
    computeTodayCoach,
    computeStreak,
    computeWeeklyHighlights,
    startOfIsoWeek,
    todayKey,
    type ApiWorkout,
} from "../components/insights";
import type { MoodLabel } from "../components/insights";

// encouragement lines
const ENCOURAGEMENT_LINES = [
    "Future you is watching — and proud.",
    "One more rep of effort. Not weight.",
    "Keep the streak alive. Even if it's light.",
    "You don't need a big day everyday.",
    "Stay honest with the work.",
    "Nothing fancy. Just show up.",
    "You're building something, slowly.",
    "Nobody to prove to, but yourself.",
    "This is how it's done.",
    "Keep it clean.",
    "Do the work. Log it. Move on."
];

function pickRandomLine(lines: string[]) {
    return lines[Math.floor(Math.random() * lines.length)];
}

function toKey(d: Date) {
    return d.toISOString().slice(0, 10);
}

function formatLastSessionLabel(dateStr: string, today: string): string {
    const d = new Date(dateStr + "T00:00:00");
    const t = new Date(today + "T00:00:00");
    const diffDays = Math.floor((t.getTime() - d.getTime()) / 86400000);
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString(undefined, { weekday: "short" });
}

function getLastWorkoutSummary(workouts: ApiWorkout[]): { date: string; summary: string; shortLabel: string } | null {
    const sorted = [...workouts].filter((w) => !w.restDay).sort((a, b) => (b.date > a.date ? 1 : -1));
    const w = sorted[0];
    if (!w) return null;
    const today = todayKey();
    const exerciseCount = w.exercises.length;
    const setCount = w.exercises.reduce((s, ex) => s + ex.sets.length, 0);
    const names = w.exercises.map((e) => e.name).slice(0, 3).join(", ");
    const summary = names
        ? `${exerciseCount} exercise${exerciseCount !== 1 ? "s" : ""}, ${setCount} sets — ${names}${w.exercises.length > 3 ? "…" : ""}`
        : `${exerciseCount} exercise${exerciseCount !== 1 ? "s" : ""}, ${setCount} sets`;
    return {
        date: w.date,
        summary,
        shortLabel: formatLastSessionLabel(w.date, today),
    };
}

export default function Home() {
    const nav = useNavigate();
    const [line, setLine] = useState("");
    const [streak, setStreak] = useState(0);
    const [mood, setMood] = useState<MoodLabel | "">("");
    const [weekly, setWeekly] = useState<string[]>([]);
    const [coachLine, setCoachLine] = useState("-");
    const [thisWeekCount, setThisWeekCount] = useState(0);
    const [lastWorkout, setLastWorkout] = useState<{ date: string; summary: string; shortLabel: string } | null>(null);

    useEffect(() => {
        (async () => {
            const end = todayKey();
            const start = (() => {
                const d = new Date(end + "T00:00:00");
                d.setDate(d.getDate() - 27);
                return d.toISOString().slice(0, 10);
            })();

            const res = await fetch(`/api/workouts/range?start=${start}&end=${end}`);
            const data = await res.json();
            if (!res.ok || data?.ok === false) return;
            const workouts: ApiWorkout[] = data.workouts ?? [];
            setStreak(computeStreak(workouts, end));
            setMood(computeMood(workouts, end));
            setWeekly(computeWeeklyHighlights(workouts, end));

            const monday = startOfIsoWeek(new Date(end + "T00:00:00"));
            const weekStart = toKey(monday);
            const weekWorkouts = workouts.filter((w) => w.date >= weekStart && w.date <= end);
            const weekDates = new Set(weekWorkouts.map((w) => w.date));
            setThisWeekCount(weekDates.size);
            setLastWorkout(getLastWorkoutSummary(workouts));

            const rDay = await fetch(`/api/workouts?date=${end}`);
            const jDay = await rDay.json();
            const dayWorkouts: ApiWorkout[] = jDay.workouts ?? [];
            setCoachLine(computeTodayCoach(dayWorkouts));
        })();
    }, []);
    useEffect(() => {
        setLine(pickRandomLine(ENCOURAGEMENT_LINES));
    }, []);

        async function logRestDay() {
    const date = new Date().toISOString().slice(0, 10);

    const res = await fetch("/api/workouts/rest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date }),
    });

    const text = await res.text();
    console.log("restDay status:", res.status, "body:", text);

    if (!res.ok) {
        alert(`Rest day failed (${res.status}). Check console.`);
        return;
    }

    let data: any = null;
    try { data = JSON.parse(text); } catch {}

    if (data?.ok !== true) {
        alert("Rest day failed. Check console.");
        return;
    }

    alert("Rest day logged");
    }

    const moodColorClass =
        mood === "locked in"
            ? "text-emerald-600"
            : mood === "steady"
              ? "text-[var(--color-primary)]"
              : mood === "sore"
                ? "text-amber-600"
                : mood === "drained"
                  ? "text-[var(--color-text-subtle)]"
                  : "text-[var(--color-text-subtle)]";

    return (
        <div className="px-5 pt-6 pb-24">
            <TopPill
                title="Home"
                subtitle={new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
            />

            <p className="mt-5 pl-1 text-left text-[14px] leading-snug text-[#374151]">
                {line}
            </p>

            <div className="mt-4 grid grid-cols-3 gap-2">
                <button
                    type="button"
                    onClick={() => document.getElementById("highlights")?.scrollIntoView({ behavior: "smooth" })}
                    className="flex flex-col items-center justify-center gap-1 rounded-[var(--radius-pill)] bg-[var(--color-primary-light)] py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2"
                >
                    <span className="flex items-center gap-1 text-[18px] font-semibold leading-none text-[var(--color-text)]">
                        {streak}
                        <FlameIcon className="h-5 w-5 text-[var(--color-primary)]" />
                    </span>
                    <span className="text-[11px] font-medium text-[var(--color-text-muted)]">Streak</span>
                </button>
                <button
                    type="button"
                    onClick={() => nav("/stats")}
                    className="flex flex-col items-center justify-center gap-1 rounded-[var(--radius-pill)] bg-[var(--color-primary-light)] py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2"
                >
                    <span className="text-[18px] font-semibold leading-none text-[var(--color-text)]">{thisWeekCount}</span>
                    <span className="text-[11px] font-medium text-[var(--color-text-muted)]">This week</span>
                </button>
                <button
                    type="button"
                    onClick={() => nav("/calendar")}
                    className="flex flex-col items-center justify-center gap-1 rounded-[var(--radius-pill)] bg-[var(--color-primary-light)] py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2"
                >
                    <span className="text-[14px] font-semibold leading-none text-[var(--color-text)]">
                        {lastWorkout?.shortLabel ?? "—"}
                    </span>
                    <span className="text-[11px] font-medium text-[var(--color-text-muted)]">Last session</span>
                </button>
            </div>

            <div className="mt-6 flex justify-center">
                <div
                    className="h-[210px] w-[270px] overflow-hidden rounded-[var(--radius-card)] bg-white shadow-[0_10px_25px_rgba(0,0,0,0.08)]"
                >
                    {mood ? (
                        <img
                            src={"/avatar-" + mood.replace(" ", "-") + ".png"}
                            alt={"Gym cat feeling " + mood}
                            className="h-full w-full object-contain object-center"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/80 shadow-inner">
                                <UserIcon className="h-10 w-10 text-[var(--color-text)] opacity-60" />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <p className={`mt-4 text-center text-[17px] font-semibold ${moodColorClass}`}>
                Today, I'm feeling {mood || "…"}.
            </p>

            <div className="mt-5 rounded-[18px] bg-white px-4 py-4 shadow-sm">
                <h3 className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                    Today's focus
                </h3>
                <p className="mt-1.5 text-[14px] leading-snug text-[var(--color-text)]">{coachLine}</p>
            </div>

            <div className="mt-3 rounded-[18px] bg-white px-4 py-4 shadow-sm">
                <h3 className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                    Last workout
                </h3>
                {lastWorkout ? (
                    <>
                        <p className="mt-1 text-[14px] font-medium text-[var(--color-text)]">
                            {new Date(lastWorkout.date + "T12:00:00").toLocaleDateString(undefined, {
                                weekday: "long",
                                month: "short",
                                day: "numeric",
                            })}
                        </p>
                        <p className="mt-0.5 text-[13px] text-[var(--color-text-muted)]">{lastWorkout.summary}</p>
                    </>
                ) : (
                    <p className="mt-1 text-[14px] text-[var(--color-text-muted)]">
                        No sessions yet — log your first.
                    </p>
                )}
            </div>

            <div className="mt-6 flex gap-3">
                <button
                    type="button"
                    onClick={() => nav("/log")}
                    className="h-[46px] flex-1 rounded-full bg-[var(--color-primary)] text-[13px] font-medium text-white shadow-[0_10px_18px_rgba(99,102,241,0.25)] transition hover:brightness-110 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2"
                >
                    Log today's session
                </button>
                <button
                    type="button"
                    onClick={logRestDay}
                    className="h-[46px] flex-1 rounded-full border-2 border-[#D1D5DB] bg-transparent text-[13px] font-medium text-[var(--color-text-muted)] transition hover:bg-gray-100 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2"
                >
                    Log rest day
                </button>
            </div>

            <div id="highlights" className="mt-6 overflow-hidden rounded-[var(--radius-card)] bg-white shadow-[0_4px_14px_rgba(0,0,0,0.06)]">
                <div className="border-b border-[#E5E7EB] px-4 py-3">
                    <h2 className="text-[18px] font-semibold text-[var(--color-text)]">Highlight of the week</h2>
                </div>
                <div className="px-4 py-4">
                    <div className="space-y-4">
                        <HighlightRow
                            icon={<CrownIcon className="h-5 w-5 text-[var(--color-primary)]" />}
                            text={weekly[0] ?? "Log once this week: keep it alive."}
                        />
                        <div className="border-b border-[#F3F4F6]" />
                        <HighlightRow
                            icon={<TrophyIcon className="h-5 w-5 text-[var(--color-primary)]" />}
                            text={weekly[1] ?? "Heaviest set: coming soon."}
                        />
                        <div className="border-b border-[#F3F4F6]" />
                        <HighlightRow
                            icon={<GiftIcon className="h-5 w-5 text-[var(--color-primary)]" />}
                            text={weekly[2] ?? "Most consistent lift: coming soon."}
                        />
                    </div>
                    <a
                        href="/stats"
                        onClick={(e) => {
                            e.preventDefault();
                            nav("/stats");
                        }}
                        className="mt-4 block text-center text-[13px] font-medium text-[var(--color-primary)] hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2"
                    >
                        See full stats
                    </a>
                </div>
            </div>

            <div className="h-2" />
        </div>
    );
}


function HighlightRow({ icon, text }: { icon: React.ReactNode; text: string }) {
    return (
        <div className="flex items-start gap-4">
            <div className="mt-[2px] shrink-0">{icon}</div>
            <p className="text-[13px] leading-snug text-[var(--color-text-muted)]">{text}</p>
        </div>
    );
}

/* Icons */
// Remember to replace UserIcon with an actual avatar image later
function UserIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
            <path
                d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M4.5 20c1.7-3.5 13.3-3.5 15 0"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
}



function CrownIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
            <path
                d="M4 8l4 4 4-7 4 7 4-4v10H4V8Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
            />
            <path
                d="M6 18h12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
}

function TrophyIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
            <path
                d="M8 4h8v4a4 4 0 0 1-8 0V4Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
            />
            <path
                d="M6 4H4v3a4 4 0 0 0 4 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M18 4h2v3a4 4 0 0 1-4 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M12 12v4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M8 20h8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M10 16h4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
}

function GiftIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
            <path
                d="M4 10h16v10H4V10Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
            />
            <path
                d="M12 10v10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M4 10V7h16v3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
            />
            <path
                d="M12 7c-1.2 0-3-1.2-3-2.5S10.2 2 12 4.2C13.8 2 15 3.2 15 4.5S13.2 7 12 7Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
            />
        </svg>
    );
}
