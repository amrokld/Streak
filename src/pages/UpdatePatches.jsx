import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../Context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { getTokens } from "../theme/tokens";
import { useLanguage } from "../Context/LanguageContext";

const patches = [
    {
        version: "v2.0",
        date: "April 2026",
        notes: [
            "🌍 Full bilingual support — switch between English and Arabic instantly from Settings.",
            "🔄 Automatic RTL layout — the entire UI flips naturally when Arabic is selected.",
            "✏️ Native Arabic typography — Cairo font loads automatically for a premium Arabic experience.",
            "📊 Activity Calendar merged into Statistics — view your heatmap, filter by habit, and tap any day for details, all in one page.",
            "🏗️ Centralized theme system — all colors now flow from a single token file, making the app easier to customize.",
            "🧠 Smarter state management — tasks and habits both run through dedicated Contexts with clean separation from UI.",
            "📅 Normalized date handling — streak resets are now timezone-safe across all environments.",
            "🔑 Centralized storage keys — all localStorage access goes through a single constants file.",
            "🐛 Fixed streak page freeze — resolved an infinite loop that could lock navigation.",
            "✨ Cleaner navigation — Calendar replaced with an 'Other' placeholder for future features."
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
