import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../Context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { getTokens } from "../theme/tokens";
import { useLanguage } from "../Context/LanguageContext";

const patches = [
    {
        version: "v4.1",
        date: "April 2026",
        notes: [
            " Added a starting introduction for new users to get familiar with the apps functionalities.",
            " Fixed the bugs that related to the localstorage and habits triggering.",
            " Fixed the bugs of scheduling habits."
        ]
    },
    {
        version: "v4.0",
        date: "April 2026",
        notes: [
            " Fixed a critical streak bug where rapid clicks would fire confetti multiple times — now blocked instantly using a session ref.",
            " Added clickable streak number on the Today page: tap to check in directly from the habit card.",
            " Check-in on Today page now triggers a toast notification matching the app's existing style.",
            " 'Clear All' now cleanly removes completed tasks and hides done habits without breaking streaks or re-adding them to the pending list.",
            " 'Show Completed' section now auto-hides when there is nothing left to display.",
            " Added a Habit Scheduling System: create habits as Daily or Custom (specific weekdays).",
            " Today page now only shows habits scheduled for the current day — smarter and less cluttered.",
            " Habit cards now display the schedule label (e.g. 'Mon, Wed') below the category badge.",
            " Added a 'Category & Schedule' edit modal accessible from the habit card back — change both category and schedule in one place.",
            " Category picker in the edit modal now matches the pill-style used in the New Habit window.",
            " Edit Task modal redesigned to match all other modal windows — consistent typography, glow shadow, animated Save button, and Cancel link.",
            " Dual-label system (Priority + Time) applied consistently across both Tasks and Today pages.",
            " Overdue tasks shown in blue across all views for immediate visual clarity."
        ]
    },
    {
        version: "v3.0",
        date: "April 2026",
        notes: [
            " Added the TODAY page, a focused daily execution layer for habits and tasks.",
            " Centered and added a premium glow effect to the TODAY link in the header.",
            " New two-column layout for Today page to see all goals at a glance.",
            " Implemented Full Task Editing — you can now modify Name, Priority, and Dates.",
            " New 'Show Completed' section to track and celebrate your daily wins.",
            " Fully localized all new features for both English and Arabic."
        ]
    },
    {
        version: "v2.0",
        date: "April 2026",
        notes: [
            " Switch between English and Arabic instantly from Settings.",
            " The entire UI flips naturally when Arabic is selected.",
            " View your heatmap, filter by habit, and tap any day for details, all in one page.",
            " Tasks and habits both run through dedicated Contexts with clean separation from UI.",
            " Streak resets are now timezone-safe across all environments.",
            " All localStorage access goes through a single constants file.",
            " Resolved an infinite loop that could lock navigation.",
            " Calendar replaced with an 'Other' placeholder for future features."
        ]
    },
    {
        version: "v1.1",
        date: "April 2026",
        notes: [
            "Revamped all button designs with smooth 'alive' animations.",
            "Added an Info section with direct bug reporting and feedback.",
            "Improved onboarding flow and factory reset routing.",
            "Enhanced habit statistics and calendar stability."
        ]
    },
    {
        version: "v1.0",
        date: "March 2026",
        notes: [
            "Official launch of Streak.",
            "Track daily habits, build continuous streaks, and monitor progress.",
            "Full dark mode and light mode support.",
            "Local storage backups and native data management."
        ]
    }
];

export default function UpdatePatches() {
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const [openVersion, setOpenVersion] = useState(null);
    const { t } = useLanguage();

    const { accent, subText, cardBg, borderColor } = getTokens(isDark);

    const toggleOpen = (version) => {
        setOpenVersion(openVersion === version ? null : version);
    };

    return (
        <div className="flex justify-center mt-12 pb-24 relative animate-fade-in">
            <div className="w-full max-w-2xl px-6">

                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2.5 rounded-2xl transition hover:opacity-80 active:scale-95 border"
                        style={{ backgroundColor: cardBg, borderColor, color: isDark ? "#fff" : "#000" }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                    </button>
                    <h2 className="text-3xl font-bold" style={{ color: accent }}>{t("patchNotes")}</h2>
                </div>

                <div className="flex flex-col gap-4">
                    {patches.map((patch) => {
                        const isOpen = openVersion === patch.version;

                        return (
                            <div
                                key={patch.version}
                                className="rounded-3xl overflow-hidden transition-all duration-300 cursor-pointer"
                                style={{ backgroundColor: cardBg, border: `1px solid ${isOpen ? accent : borderColor}` }}
                                onClick={() => toggleOpen(patch.version)}
                            >
                                {/* HEADER (ALWAYS VISIBLE) */}
                                <div className="p-6 flex items-center justify-between pointer-events-none">
                                    <div className="flex flex-col gap-1">
                                        <h4 className="font-bold text-xl" style={{ color: isOpen ? accent : (isDark ? "#fff" : "#1a1a1a") }}>{patch.version}</h4>
                                        <span className="text-xs font-medium" style={{ color: subText }}>{patch.date}</span>
                                    </div>

                                    {/* CHEVRON ANIMATION */}
                                    <motion.div
                                        animate={{ rotate: isOpen ? 180 : 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: isOpen ? accent : subText }}>
                                            <polyline points="6 9 12 15 18 9"></polyline>
                                        </svg>
                                    </motion.div>
                                </div>

                                {/* CONTENT (ANIMATED SLIDE DOWN) */}
                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-6 pb-6 border-t pt-5 mx-6" style={{ borderColor }}>
                                                <ul className="flex flex-col gap-3 text-sm">
                                                    {patch.notes.map((note, i) => (
                                                        <li key={i} className="flex gap-4 items-start">
                                                            <span style={{ color: accent, fontSize: '1.2em', lineHeight: '1em' }}>•</span>
                                                            <span className="opacity-90 leading-relaxed font-medium">{note}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
