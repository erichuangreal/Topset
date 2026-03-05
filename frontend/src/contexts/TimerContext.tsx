import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useProfile } from "../hooks/useProfile";

type TimerContextValue = {
    timerActive: boolean;
    elapsed: number;
    timerComplete: boolean;
    timerProgress: number;
    restTimerSecs: number;
    startRestTimer: () => void;
    dismissRestTimer: () => void;
};

const TimerContext = createContext<TimerContextValue | null>(null);

export function TimerProvider({ children }: { children: React.ReactNode }) {
    const { profile } = useProfile();
    const restTimerSecs = profile.restTimerSecs ?? 90;

    const [restStartedAt, setRestStartedAt] = useState<number | null>(null);
    const [elapsed, setElapsed] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (restStartedAt === null) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
        }
        intervalRef.current = setInterval(() => {
            setElapsed(Math.floor((Date.now() - restStartedAt) / 1000));
        }, 500);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [restStartedAt]);

    function startRestTimer() {
        setRestStartedAt(Date.now());
        setElapsed(0);
    }

    function dismissRestTimer() {
        setRestStartedAt(null);
        setElapsed(0);
    }

    const timerActive = restStartedAt !== null;
    const timerComplete = timerActive && restTimerSecs > 0 && elapsed >= restTimerSecs;
    const timerProgress = restTimerSecs > 0
        ? Math.min((elapsed / restTimerSecs) * 100, 100)
        : 0;

    return (
        <TimerContext.Provider value={{
            timerActive,
            elapsed,
            timerComplete,
            timerProgress,
            restTimerSecs,
            startRestTimer,
            dismissRestTimer,
        }}>
            {children}
        </TimerContext.Provider>
    );
}

export function useTimer(): TimerContextValue {
    const ctx = useContext(TimerContext);
    if (!ctx) throw new Error("useTimer must be used within a TimerProvider");
    return ctx;
}
