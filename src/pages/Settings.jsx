import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../Context/ThemeContext";
import { useHabits } from "../Context/HabitContext";
import { useNavigate } from "react-router-dom";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { getTokens } from "../theme/tokens";
import { useLanguage } from "../Context/LanguageContext";

export default function Settings() {
    const { toggleTheme, isDark } = useTheme();
    const { habits } = useHabits();
    const navigate = useNavigate();
    const { t, lang, toggleLang } = useLanguage();

    // State Management
    const [username, setUsername] = useState(localStorage.getItem(STORAGE_KEYS.username) || "");
    const [reminders, setReminders] = useState(localStorage.getItem(STORAGE_KEYS.reminders) === "true");
    const [toast, setToast] = useState("");
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackText, setFeedbackText] = useState("");
    const [isSending, setIsSending] = useState(false);


    const { accent, subText, cardBg, borderColor } = getTokens(isDark);

    const AliveBtn = ({ onClick, children, color, outline, className = "", disabled }) => {
        const c = color || accent;
        return (
            <button
                onClick={onClick}
                disabled={disabled}
                className={`group px-4 py-2 rounded-xl text-sm font-medium overflow-hidden transition-all duration-200 active:scale-95 relative ${className} ${disabled ? "opacity-50 pointer-events-none" : ""}`}
                style={{
                    backgroundColor: outline ? "transparent" : c,
                    color: outline ? c : (isDark ? "#000" : "#fff"),
                    border: `1px solid ${outline ? c : "transparent"}`
                }}
            >
                {/* Simple hover background fill overlay */}
                {outline && (
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-0 pointer-events-none" style={{ backgroundColor: c }} />
                )}
                {!outline && (
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-15 transition-opacity duration-200 z-0 pointer-events-none bg-black dark:bg-white" />
                )}

                {/* Duplicated text allows perfect, snappy text color inversion using opacity without relying on dynamic arbitrary tailwind */}
                {outline && (
                    <span
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none"
                        style={{ color: isDark ? "#000" : "#fff" }}
                    >
                        {children}
                    </span>
                )}

                <span className={`relative z-10 block ${outline ? "group-hover:opacity-0 transition-opacity duration-200" : ""}`}>
                    {children}
                </span>
            </button>
        );
    };

    const AliveLabel = ({ onChange, children, color, className = "" }) => {
        const c = color || accent;
        return (
            <label
                className={`group px-4 py-2 rounded-xl text-sm font-medium overflow-hidden transition-all duration-200 active:scale-95 relative cursor-pointer inline-flex items-center justify-center ${className}`}
                style={{
                    backgroundColor: "transparent",
                    color: c,
                    border: `1px solid ${c}`
                }}
            >
                <input type="file" accept=".json" className="hidden" onChange={onChange} />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-0 pointer-events-none" style={{ backgroundColor: c }} />
                <span
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none"
                    style={{ color: isDark ? "#000" : "#fff" }}
                >
                    {children}
                </span>
                <span className="relative z-10 block group-hover:opacity-0 transition-opacity duration-200">
                    {children}
                </span>
            </label>
        );
    };

    // Actions
    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(""), 2500);
    };

    const saveGeneral = () => {
        localStorage.setItem(STORAGE_KEYS.username, username);
        showToast(t("usernameSaved"));
    };

    const toggleReminders = () => {
        const newState = !reminders;
        setReminders(newState);
        localStorage.setItem(STORAGE_KEYS.reminders, newState);
        window.dispatchEvent(new Event("storage"));
        showToast(newState ? t("remindersEnabled") : t("remindersDisabled"));
    };

    // === Data & Danger Actions ===
    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(habits));
        const downloadNode = document.createElement("a");
        downloadNode.setAttribute("href", dataStr);
        downloadNode.setAttribute("download", "streak_backup.json");
        document.body.appendChild(downloadNode);
        downloadNode.click();
        downloadNode.remove();
        showToast(t("backupDownloaded"));
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const parsed = JSON.parse(e.target.result);
                if (Array.isArray(parsed)) {
                    localStorage.setItem(STORAGE_KEYS.habits, JSON.stringify(parsed));
                    showToast(t("importSuccess"));
                    setTimeout(() => window.location.reload(), 1500);
                } else {
                    showToast(t("invalidFormat"));
                }
            } catch (err) {
                showToast(t("errorReading"));
            }
        };
        reader.readAsText(file);
    };

    const resetHabits = () => {
        if (window.confirm(t("confirmResetHabits"))) {
            localStorage.setItem(STORAGE_KEYS.habits, "[]");
            showToast(t("habitsCleared"));
            setTimeout(() => window.location.reload(), 1000);
        }
    };

    const resetEverything = () => {
        if (window.confirm(t("confirmFactoryReset"))) {
            localStorage.clear();
            showToast(t("factoryResetDone"));
            setTimeout(() => {
                window.location.href = "/";
            }, 1500);
        }
    };


    const handleFeedbackSubmit = async () => {
        if (!feedbackText.trim()) return;
        setIsSending(true);

        try {
            // Local Storage Backup
            const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.feedback) || "[]");
            localStorage.setItem(STORAGE_KEYS.feedback, JSON.stringify([...existing, { text: feedbackText, date: new Date().toISOString() }]));
            console.log("Feedback saved locally:", feedbackText);

            // --- EMAILJS REST API INTEGRATION ---
            // To activate live email, insert your keys below! (Uses native fetch, no external libraries)

            await fetch("https://api.emailjs.com/api/v1.0/email/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    service_id: "service_dl3aqxe",
                    template_id: "template_6zgr0kh",
                    user_id: "cZICxAp2fpTvA2sVS",
                    template_params: { message: feedbackText }
                })
            });


            showToast(t("feedbackThanks"));
            setFeedbackText("");
            setShowFeedback(false);
        } catch (err) {
            showToast(t("feedbackError"));
        } finally {
            setIsSending(false);
        }
    };



    return (
        <div className="flex justify-center mt-12 pb-24 relative ">
            <div className="w-full max-w-2xl px-6">
                <h2 className="text-3xl font-bold mb-8" style={{ color: accent }}> {t("settings")}</h2>

                <div className="flex flex-col gap-8">

                    {/* 1. GENERAL SECTION */}
                    <section>
                        <h3 className="text-sm font-semibold tracking-wider mb-4 uppercase" style={{ color: subText }}>
                            {t("general")}
                        </h3>
                        <div className="p-6 rounded-3xl flex flex-col gap-6" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">{t("username")}</p>
                                    <p className="text-xs mt-1" style={{ color: subText }}>{t("howGreeted")}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="px-4 py-2 rounded-xl outline-none text-sm w-32 focus:w-48 transition-all"
                                        style={{ backgroundColor: isDark ? "#3a3a3a" : "#f3f4f6", color: isDark ? "#fff" : "#1a1a1a" }}
                                    />
                                    <AliveBtn onClick={saveGeneral}>
                                        {t("save")}
                                    </AliveBtn>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">{t("theme")}</p>
                                    <p className="text-xs mt-1" style={{ color: subText }}>{t("toggleTheme")}</p>
                                </div>
                                <AliveBtn onClick={toggleTheme} outline>
                                    {isDark ? t("lightMode") : t("darkMode")}
                                </AliveBtn>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">{t("language")}</p>
                                    <p className="text-xs mt-1" style={{ color: subText }}>{t("languageDesc")}</p>
                                </div>
                                <AliveBtn onClick={toggleLang} outline>
                                    {lang === "en" ? t("arabic") : t("english")}
                                </AliveBtn>
                            </div>
                        </div>
                    </section>

                    {/* 2. NOTIFICATIONS SECTION */}
                    <section>
                        <h3 className="text-sm font-semibold tracking-wider mb-4 uppercase" style={{ color: subText }}>
                            {t("notifications")}
                        </h3>
                        <div className="p-6 rounded-3xl flex flex-col gap-6" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">{t("dailyReminders")}</p>
                                    <p className="text-xs mt-1" style={{ color: subText }}>{t("getNotified")}</p>
                                </div>
                                {/* Custom Toggle Switch */}
                                <button
                                    onClick={toggleReminders}
                                    className="w-12 h-6 rounded-full relative transition-colors"
                                    style={{ backgroundColor: reminders ? accent : (isDark ? "#444" : "#e5e7eb") }}
                                >
                                    <motion.div
                                        layout
                                        className="w-5 h-5 rounded-full bg-white absolute top-0.5"
                                        initial={false}
                                        animate={{ left: reminders ? "26px" : "2px" }}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                </button>
                            </div>

                            {reminders && (
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">{t("reminderTime") || "Reminder Time"}</p>
                                        <p className="text-xs mt-1" style={{ color: subText }}>{t("reminderTimeDesc") || "Choose when to receive your daily reminder"}</p>
                                    </div>
                                    <input
                                        type="time"
                                        defaultValue={localStorage.getItem(STORAGE_KEYS.reminderTime) || "20:00"}
                                        onChange={(e) => {
                                            localStorage.setItem(STORAGE_KEYS.reminderTime, e.target.value);
                                            window.dispatchEvent(new Event("storage"));
                                        }}

                                        className="px-3 py-2 rounded-xl outline-none text-sm"
                                        style={{
                                            backgroundColor: isDark ? "#3a3a3a" : "#f3f4f6",
                                            color: isDark ? "#fff" : "#1a1a1a",
                                            border: `1px solid ${borderColor}`
                                        }}
                                    />
                                </div>
                            )}

                        </div>
                    </section>

                    {/* 3. DATA SECTION */}
                    <section>
                        <h3 className="text-sm font-semibold tracking-wider mb-4 uppercase" style={{ color: subText }}>
                            {t("dataManagement")}
                        </h3>
                        <div className="p-6 rounded-3xl flex flex-col gap-6" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">{t("exportBackup")}</p>
                                    <p className="text-xs mt-1" style={{ color: subText }}>{t("exportDesc")}</p>
                                </div>
                                <AliveBtn onClick={handleExport} color={isDark ? "#fff" : "#1a1a1a"}>
                                    {t("download")}
                                </AliveBtn>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">{t("importBackup")}</p>
                                    <p className="text-xs mt-1" style={{ color: subText }}>{t("importDesc")}</p>
                                </div>
                                <AliveLabel onChange={handleImport} color={isDark ? "#fff" : "#1a1a1a"}>
                                    {t("upload")}
                                </AliveLabel>
                            </div>

                            <div className="flex items-center justify-between border-t pt-6 mt-2" style={{ borderColor: borderColor }}>
                                <div>
                                    <p className="font-medium text-red-500">{t("resetHabits")}</p>
                                    <p className="text-xs mt-1" style={{ color: subText }}>{t("resetHabitsDesc")}</p>
                                </div>
                                <AliveBtn onClick={resetHabits} color="#ef4444" outline>
                                    {t("resetHabits")}
                                </AliveBtn>
                            </div>

                        </div>
                    </section>

                    {/* 4. DANGER ZONE */}
                    <section>
                        <h3 className="text-sm font-semibold tracking-wider mb-4 uppercase text-red-500">
                            {t("dangerZone")}
                        </h3>
                        <div className="p-6 rounded-3xl flex flex-col gap-6" style={{ backgroundColor: isDark ? "#2a1f1f" : "#fee2e2", border: "1px solid #f87171" }}>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-red-600 dark:text-red-400">{t("factoryReset")}</p>
                                    <p className="text-xs mt-1 opacity-80 text-red-600 dark:text-red-400">{t("factoryResetDesc")}</p>
                                </div>
                                <AliveBtn onClick={resetEverything} color="#ef4444">
                                    {t("wipeEverything")}
                                </AliveBtn>
                            </div>

                        </div>
                    </section>

                    {/* 5. UPDATE PATCHES */}
                    <section>
                        <h3 className="text-sm font-semibold tracking-wider mb-4 uppercase" style={{ color: subText }}>
                            {t("updates")}
                        </h3>
                        <div className="p-6 rounded-3xl flex flex-col gap-6" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">{t("patchNotes")}</p>
                                    <p className="text-xs mt-1" style={{ color: subText }}>{t("patchNotesDesc")}</p>
                                </div>
                                <AliveBtn onClick={() => navigate("/updates")} outline>
                                    {t("view")}
                                </AliveBtn>
                            </div>
                        </div>
                    </section>

                    {/* 6. INFO SECTION */}
                    <section>
                        <h3 className="text-sm font-semibold tracking-wider mb-4 uppercase" style={{ color: subText }}>
                            {t("info")}
                        </h3>
                        <div className="p-6 rounded-3xl flex flex-col gap-5" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>

                            <div className="flex flex-col gap-1">
                                <div className="flex items-end gap-2">
                                    <h4 className="text-xl font-bold tracking-widest" style={{ color: accent }}>STREAK</h4>
                                    <span className="text-xs font-medium mb-1" style={{ color: subText }}>v4.1</span>
                                </div>
                                <p className="text-sm">{t("appDescription")}</p>
                                <p className="text-xs mt-1" style={{ color: subText }}>{t("privacyNote")}</p>
                            </div>

                            <div className="w-full h-px" style={{ backgroundColor: borderColor }} />

                            <div className="flex gap-4">
                                <AliveBtn onClick={() => setShowFeedback(!showFeedback)} outline>
                                    {t("reportBug")}
                                </AliveBtn>
                                <AliveBtn onClick={() => window.location.href = "mailto:streakapp.feedback@gmail.com"} outline>
                                    {t("contact")}
                                </AliveBtn>

                            </div>

                            <AnimatePresence>
                                {showFeedback && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="flex flex-col gap-3 pt-2">
                                            <textarea
                                                value={feedbackText}
                                                onChange={(e) => setFeedbackText(e.target.value)}
                                                placeholder={t("writeFeedback")}
                                                className="w-full h-24 p-3 rounded-xl outline-none text-sm resize-none"
                                                style={{
                                                    backgroundColor: isDark ? "#3a3a3a" : "#f3f4f6",
                                                    color: isDark ? "#fff" : "#1a1a1a",
                                                    border: `1px solid ${borderColor}`
                                                }}
                                            />
                                            <div className="flex justify-end gap-2">
                                                <AliveBtn
                                                    onClick={() => setShowFeedback(false)}
                                                    color={subText}
                                                    outline
                                                >
                                                    {t("cancel")}
                                                </AliveBtn>
                                                <AliveBtn
                                                    onClick={handleFeedbackSubmit}
                                                    disabled={!feedbackText.trim() || isSending}
                                                >
                                                    {isSending ? t("sending") : t("submit")}
                                                </AliveBtn>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </section>
                </div>
            </div>

            {/* TOAST SYSTEM (BONUS) */}
            <div className="fixed bottom-10 inset-x-0 flex justify-center z-50 pointer-events-none">
                <AnimatePresence>
                    {toast && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="px-6 py-3 rounded-full shadow-xl text-sm font-medium whitespace-nowrap pointer-events-auto"
                            style={{ backgroundColor: accent, color: isDark ? "#000" : "#fff" }}
                        >
                            {toast}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div >
    );
}
