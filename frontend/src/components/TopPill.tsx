import type { ReactNode } from "react";

type TopPillProps = {
    title: string;
    /** Optional secondary line shown below the title */
    subtitle?: string;
    /** Optional element pinned to the right side of the pill */
    right?: ReactNode;
};

export function TopPill({ title, subtitle, right }: TopPillProps) {
    return (
        <div className="relative w-full overflow-hidden rounded-[18px] bg-gradient-to-r from-[#DFE8FF] via-[#EEF2FF] to-[#F6F5F3] px-5 shadow-[0_2px_14px_rgba(99,102,241,0.10)] flex items-center justify-between"
            style={{ paddingTop: subtitle ? "11px" : "15px", paddingBottom: subtitle ? "11px" : "15px" }}
        >
            {/* left accent bar */}
            <div className="absolute left-0 top-0 h-full w-[3.5px] rounded-l-[18px] bg-[#6366F1] opacity-75" />

            <div className="pl-2">
                <div className="text-[20px] font-semibold tracking-tight text-[#111827] leading-tight">
                    {title}
                </div>
                {subtitle && (
                    <div className="mt-[3px] text-[11px] font-medium tracking-wide text-[#6366F1] uppercase opacity-80">
                        {subtitle}
                    </div>
                )}
            </div>

            {right && (
                <div className="shrink-0">{right}</div>
            )}
        </div>
    );
}
