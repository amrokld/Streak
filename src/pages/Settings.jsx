import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../Context/ThemeContext";
import { useHabits } from "../Context/HabitContext";

export default function Settings() {
    const { toggleTheme, isDark } = useTheme();
    const { habits } = useHabits();

    // State Management
    const [username, setUsername] = useState(localStorage.getItem("username") || "");
    const [reminders, setReminders] = useState(localStorage.getItem("reminders") === "true");
    const [toast, setToast] = useState("");
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackText, setFeedbackText] = useState("");
    const [isSending, setIsSending] = useState(false);


    // UI Tokens
    const accent = isDark ? "#d4af37" : "#2563eb";
    const subText = isDark ? "#aaa" : "#6b7280";
    const cardBg = isDark ? "#2a2a2a" : "#ffffff";
    const borderColor = isDark ? "#3f3f3f" : "#e5e7eb";

    // Actions
    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(""), 2500);
    };

    const saveGeneral = () => {
        localStorage.setItem("username", username);
        showToast("Username saved successfully");
    };

    const toggleReminders = () => {
        const newState = !reminders;
        setReminders(newState);
        localStorage.setItem("reminders", newState);
        showToast(newState ? "Reminders enabled" : "Reminders disabled");
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
        showToast("Backup downloaded!");
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const parsed = JSON.parse(e.target.result);
                if (Array.isArray(parsed)) {
                    localStorage.setItem("habits", JSON.stringify(parsed));
                    showToast("Import successful! Refreshing...");
                    setTimeout(() => window.location.reload(), 1500);
                } else {
                    showToast("Error: Invalid file format");
                }
            } catch (err) {
                showToast("Error reading file");
            }
        };
        reader.readAsText(file);
    };

    const resetHabits = () => {
        if (window.confirm("Are you sure you want to delete ALL habits?")) {
            localStorage.setItem("habits", "[]");
            showToast("Habits cleared! Refreshing...");
            setTimeout(() => window.location.reload(), 1000);
        }
    };

    const resetEverything = () => {
        if (window.confirm("⚠️ DANGER: This wipes absolutely everything. Proceed?")) {
            localStorage.clear();
            showToast("Factory reset complete. Bye!");
            setTimeout(() => window.location.reload(), 1500);
        }
    };

    const handleFeedbackSubmit = async () => {
        if (!feedbackText.trim()) return;
        setIsSending(true);

        try {
            // Local Storage Backup
            const existing = JSON.parse(localStorage.getItem("streak_feedback") || "[]");
            localStorage.setItem("streak_feedback", JSON.stringify([...existing, { text: feedbackText, date: new Date().toISOString() }]));
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


            showToast("Thanks for your feedback!");
            setFeedbackText("");
            setShowFeedback(false);
        } catch (err) {
            showToast("Error sending feedback");
        } finally {
            setIsSending(false);
        }
    };



    return (
        <div className="flex justify-center mt-12 pb-24 relative ">
            <div className="w-full max-w-2xl px-6">
                <h2 className="text-3xl font-bold mb-8" style={{ color: accent }}> Settings</h2>

                <div className="flex flex-col gap-8">

                    {/* 1. GENERAL SECTION */}
                    <section>
                        <h3 className="text-sm font-semibold tracking-wider mb-4 uppercase" style={{ color: subText }}>
                            General
                        </h3>
                        <div className="p-6 rounded-3xl flex flex-col gap-6" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Username</p>
                                    <p className="text-xs mt-1" style={{ color: subText }}>How you want to be greeted</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="px-4 py-2 rounded-xl outline-none text-sm w-32 focus:w-48 transition-all"
                                        style={{ backgroundColor: isDark ? "#3a3a3a" : "#f3f4f6", color: isDark ? "#fff" : "#1a1a1a" }}
                                    />
                                    <button
                                        onClick={saveGeneral}
                                        className="px-4 py-2 rounded-xl text-sm font-medium transition"
                                        style={{ backgroundColor: accent, color: isDark ? "#000" : "#fff" }}
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Theme</p>
                                    <p className="text-xs mt-1" style={{ color: subText }}>Toggle application theme</p>
                                </div>
                                <button
                                    onClick={toggleTheme}
                                    className="px-4 py-2 rounded-xl text-sm font-medium transition"
                                    style={{ border: `1px solid ${borderColor}`, color: accent }}
                                >
                                    {isDark ? "Light Mode" : "Dark Mode"}
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* 2. NOTIFICATIONS SECTION */}
                    <section>
                        <h3 className="text-sm font-semibold tracking-wider mb-4 uppercase" style={{ color: subText }}>
                            Notifications
                        </h3>
                        <div className="p-6 rounded-3xl flex flex-col gap-6" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Daily Reminders</p>
                                    <p className="text-xs mt-1" style={{ color: subText }}>Get notified about your habits</p>
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

                        </div>
                    </section>

                    {/* 3. DATA SECTION */}
                    <section>
                        <h3 className="text-sm font-semibold tracking-wider mb-4 uppercase" style={{ color: subText }}>
                            Data Management
                        </h3>
                        <div className="p-6 rounded-3xl flex flex-col gap-6" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Export Backup</p>
                                    <p className="text-xs mt-1" style={{ color: subText }}>Download your habits as a JSON file</p>
                                </div>
                                <button onClick={handleExport} className="px-4 py-2 rounded-xl text-sm font-medium transition" style={{ backgroundColor: isDark ? "#333" : "#f3f4f6", color: isDark ? "#fff" : "#1a1a1a" }}>
                                    Download
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Import Backup</p>
                                    <p className="text-xs mt-1" style={{ color: subText }}>Restore habits from a previous JSON</p>
                                </div>
                                <label className="px-4 py-2 rounded-xl text-sm font-medium transition cursor-pointer" style={{ backgroundColor: isDark ? "#333" : "#f3f4f6", color: isDark ? "#fff" : "#1a1a1a" }}>
                                    Upload
                                    <input type="file" accept=".json" className="hidden" onChange={handleImport} />
                                </label>
                            </div>

                            <div className="flex items-center justify-between border-t pt-6 mt-2" style={{ borderColor: borderColor }}>
                                <div>
                                    <p className="font-medium text-red-500">Reset Habits</p>
                                    <p className="text-xs mt-1" style={{ color: subText }}>Deletes all current habits permanently</p>
                                </div>
                                <button
                                    onClick={resetHabits}
                                    className="px-4 py-2 rounded-xl text-sm font-medium transition border border-red-500 text-red-500 hover:bg-red-500 hover:text-black"
                                >
                                    Reset Habits
                                </button>
                            </div>

                        </div>
                    </section>

                    {/* 4. DANGER ZONE */}
                    <section>
                        <h3 className="text-sm font-semibold tracking-wider mb-4 uppercase text-red-500">
                            Danger Zone
                        </h3>
                        <div className="p-6 rounded-3xl flex flex-col gap-6" style={{ backgroundColor: isDark ? "#2a1f1f" : "#fee2e2", border: "1px solid #f87171" }}>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-red-600 dark:text-red-400">Factory Reset</p>
                                    <p className="text-xs mt-1 opacity-80 text-red-600 dark:text-red-400">Wipes all habits, settings, themes, and your username.</p>
                                </div>
                                <button
                                    onClick={resetEverything}
                                    className="px-4 py-2 rounded-xl text-sm font-medium text-white transition bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30"
                                >
                                    Wipe Everything
                                </button>
                            </div>

                        </div>
                    </section>

                    {/* 5. INFO SECTION */}
                    <section>
                        <h3 className="text-sm font-semibold tracking-wider mb-4 uppercase" style={{ color: subText }}>
                            Info
                        </h3>
                        <div className="p-6 rounded-3xl flex flex-col gap-5" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>

                            <div className="flex flex-col gap-1">
                                <div className="flex items-end gap-2">
                                    <h4 className="text-xl font-bold tracking-widest" style={{ color: accent }}>STREAK</h4>
                                    <span className="text-xs font-medium mb-1" style={{ color: subText }}>v1.0</span>
                                </div>
                                <p className="text-sm">A simple habit tracking app focused on consistency.</p>
                                <p className="text-xs mt-1" style={{ color: subText }}>Privacy note: Your data is stored locally on your device.</p>
                            </div>

                            <div className="w-full h-px" style={{ backgroundColor: borderColor }} />

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowFeedback(!showFeedback)}
                                    className="text-sm font-medium transition hover:opacity-70"
                                    style={{ color: accent }}
                                >
                                    Report Bug / Feedback
                                </button>
                                <button
                                    onClick={() => window.location.href = "mailto:streakapp.feedback@gmail.com"}
                                    className="text-sm font-medium transition hover:opacity-70"
                                    style={{ color: accent }}
                                >
                                    Contact
                                </button>

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
                                                placeholder="Write your feedback..."
                                                className="w-full h-24 p-3 rounded-xl outline-none text-sm resize-none"
                                                style={{
                                                    backgroundColor: isDark ? "#3a3a3a" : "#f3f4f6",
                                                    color: isDark ? "#fff" : "#1a1a1a",
                                                    border: `1px solid ${borderColor}`
                                                }}
                                            />
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setShowFeedback(false)}
                                                    className="px-4 py-2 rounded-xl text-sm transition hover:bg-gray-500/10"
                                                    style={{ color: subText }}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleFeedbackSubmit}
                                                    disabled={!feedbackText.trim() || isSending}
                                                    className="px-4 py-2 rounded-xl text-sm font-medium transition active:scale-95 disabled:opacity-50"
                                                    style={{ backgroundColor: accent, color: isDark ? "#000" : "#fff" }}
                                                >
                                                    {isSending ? "Sending..." : "Submit"}
                                                </button>
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
