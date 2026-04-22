import { useEffect, useState } from "react";
import { useTour } from "./TourProvider";
import { useLanguage } from "../Context/LanguageContext";
import { useTheme } from "../Context/ThemeContext";
import { getTokens } from "../theme/tokens";
import { useNavigate, useLocation } from "react-router-dom"

export default function TourOverlay() {
    const { isActive, step, nextStep, endTour } = useTour();
    const { t, lang } = useLanguage();
    const { isDark } = useTheme();
    const tokens = getTokens(isDark);

    const [rect, setRect] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();


    // 2. Find the element and attach the spotlight
    useEffect(() => {
        if (!isActive || !step) return;

        let timeoutId;
        let updateFn;

        const attach = () => {
            const el = document.getElementById(step.targetId);

            // If the element isn't found yet (because React is still navigating), retry in 50ms
            if (!el) {
                timeoutId = setTimeout(attach, 50);
                return;
            }

            updateFn = () => setRect(el.getBoundingClientRect());
            updateFn();
            window.addEventListener("resize", updateFn);
            window.addEventListener("scroll", updateFn);
        };

        attach();

        return () => {
            clearTimeout(timeoutId);
            if (updateFn) {
                window.removeEventListener("resize", updateFn);
                window.removeEventListener("scroll", updateFn);
            }
        };
    }, [isActive, step, location.pathname]);


    if (!isActive || !rect) return null;

    const padding = step.id === "add" ? 24 : 8;

    return (
        <>
            {/* DARK OVERLAY */}
            <div
                className="fixed inset-0 z-[1000]"
                style={{
                    background: "transparent",
                    pointerEvents: "auto",
                    borderRadius: "16px",
                }}
            />

            {/* SPOTLIGHT (cut area imitation) */}
            <div
                className="fixed z-[1001] pointer-events-none rounded-xl"
                style={{
                    top: rect.top - padding,
                    left: rect.left - padding,
                    width: rect.width + padding * 2,
                    height: rect.height + padding * 2,
                    boxShadow: "0 0 0 9999px rgba(0,0,0,0.6)",
                    border: `2px solid ${tokens.accent}`,
                }}
            />

            {/* TOOLTIP */}
            <div
                className="fixed z-[1002] max-w-[260px] p-4 rounded-xl shadow-xl"
                style={{
                    top: rect.bottom + 24, // <--- Increased spacing
                    // Mathematically clamp the tooltip to the screen edges!
                    left: lang === "ar"
                        ? Math.max(20, rect.right - 260)
                        : Math.min(window.innerWidth - 280, rect.left),
                    backgroundColor: tokens.cardBg,
                    color: tokens.text,
                    direction: lang === "ar" ? "rtl" : "ltr",
                }}
            >

                <p className="text-sm mb-3">
                    {t(step.textKey)}
                </p>

                <div className="flex justify-between items-center text-xs">
                    <button
                        onClick={endTour}
                        className="opacity-60 hover:opacity-100"
                    >
                        {t("skipBtn")}
                    </button>

                    <button
                        onClick={nextStep}
                        className="font-bold"
                        style={{ color: tokens.accent }}
                    >
                        {t("continue")}
                    </button>
                </div>
            </div>
        </>
    );
}