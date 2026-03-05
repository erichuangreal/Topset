import { Outlet } from "react-router-dom";
import Icons from "./Icons";
import RestTimerBar from "./RestTimerBar";
import { TimerProvider } from "../contexts/TimerContext";

export default function Layout() {
    return (
        <TimerProvider>
            <div className="min-h-screen bg-[#F6F5F3] text-[#1F2933]">
                <div className="mx-auto max-w-[430px] min-h-screen pb-20">
                    <Outlet />
                </div>
                <RestTimerBar />
                <Icons />
            </div>
        </TimerProvider>
    );
}
