import React from "react";
import { useTimer } from "../contexts/TimerContext";

function fmtTimer(secs: number): string {
    const s = Math.max(0, secs);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}

export default function RestTimerBar() {
    const { timerActive, elapsed, timerComplete, timerProgress, restTimerSecs, startRestTimer, dismissRestTimer } = useTimer();

    if (!timerActive) return null;

    return (
        <div className="fixed bottom-16 left-0 right-0 z-40 mx-auto max-w-[430px] px-4 pointer-events-none">
            <div className="pointer-events-auto rounded-[18px] border border-[#E5E7EB] bg-white px-4 py-3 shadow-[0_-2px_20px_rgba(0,0,0,0.10)]">
                <div className="flex items-center gap-3">

                    {/* Elapsed time */}
                    <div className="w-[48px] shrink-0">
                        <div className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">Rest</div>
                        <div className={`mt-0.5 text-[22px] font-semibold tabular-nums leading-none ${timerComplete ? "text-emerald-500" : "text-[#111827]"}`}>
                            {fmtTimer(elapsed)}
                        </div>
                    </div>

                    {/* Progress bar + status */}
                    <div className="min-w-0 flex-1">
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#F3F4F6]">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${timerComplete ? "bg-emerald-400" : "bg-[#6366F1]"}`}
                                style={{ width: `${timerProgress}%` }}
                            />
                        </div>
                        <div className="mt-1.5 text-[11px] text-[#9CA3AF]">
                            {timerComplete
                                ? "Rest complete — go when ready"
                                : restTimerSecs > 0
                                    ? `${fmtTimer(Math.max(0, restTimerSecs - elapsed))} remaining`
                                    : "Stopwatch running"
                            }
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex shrink-0 items-center gap-1.5">
                        <button
                            type="button"
                            onClick={startRestTimer}
                            title="Restart"
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EEF2FF] text-[#6366F1] active:bg-[#E0E7FF]"
                        >
                            <RestartIcon className="h-3.5 w-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={dismissRestTimer}
                            title="Dismiss"
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F3F4F6] text-[#6B7280] active:bg-[#E5E7EB]"
                        >
                            <CloseIcon className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function RestartIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
            <path d="M4 4v5h5" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4.07 13A8 8 0 1 0 5.9 7.6L4 9" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function CloseIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" />
        </svg>
    );
}
