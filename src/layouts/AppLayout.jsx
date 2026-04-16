import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "../components/Header";
import { useTheme } from "../Context/ThemeContext";
import { useHabits } from "../Context/HabitContext";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { getTokens } from "../theme/tokens";
import { useLanguage } from "../Context/LanguageContext";
import { useReminderScheduler } from "../hooks/useReminderScheduler";

export default function AppLayout() {
  const { isDark } = useTheme();
  const { habits } = useHabits();
  const [showNewHabit, setShowNewHabit] = useState(false);
  const { t } = useLanguage();

  const location = useLocation();
  const navigate = useNavigate();

  const [username, setUsername] = useState(
    localStorage.getItem(STORAGE_KEYS.username) || ""
  );

  const { accent, subText } = getTokens(isDark);

  const [remindersEnabled, setRemindersEnabled] = useState(
    localStorage.getItem(STORAGE_KEYS.reminders) === "true"
  );
  const [reminderTime, setReminderTime] = useState(
    localStorage.getItem(STORAGE_KEYS.reminderTime) || "20:00"
  );

  useReminderScheduler(habits, remindersEnabled, reminderTime);

  const buildReminderMessage = (pendingHabits) => {
    const priorityOrder = { urgent: 0, important: 1, optional: 2 };
    const sorted = [...pendingHabits].sort(
      (a, b) => (priorityOrder[a.category] ?? 1) - (priorityOrder[b.category] ?? 1)
    );
    const count = sorted.length;
    if (count === 1) return `"${sorted[0].name}" is still pending today. Keep your streak alive!`;
    const topName = sorted[0].name;
    return `${count} habits pending — starting with "${topName}". Don't break your streak!`;
  };

  // Add this useEffect inside AppLayout(), replacing the single useReminderScheduler(habits) line:
  useEffect(() => {
    const onStorage = () => {
      setRemindersEnabled(localStorage.getItem(STORAGE_KEYS.reminders) === "true");
      setReminderTime(localStorage.getItem(STORAGE_KEYS.reminderTime) || "20:00");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);



  if (!username) {
    return (
      <div
        className="min-h-screen flex items-center justify-center transition-colors duration-300"
        style={{
          backgroundColor: isDark ? "#1f1f1f" : "#f2f4f8",
          color: isDark ? "#ffffff" : "#1a1a1a"
        }}
      >
        <div
          className="relative w-full max-w-sm rounded-3xl px-8 py-10 text-center border animate-fade-in"
          style={{
            backgroundColor: isDark ? "#2a2a2a" : "#ffffff",
            borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
            boxShadow: isDark
              ? `0 0 50px ${accent}20, 0 20px 40px rgba(0, 0, 0, 0.8)`
              : `0 0 40px ${accent}30, 0 20px 40px rgba(0, 0, 0, 0.15)`
          }}
        >
          <h2 className="text-2xl font-bold mb-2" style={{ color: accent }}>
            {t("whatToCall")}
          </h2>

          <p className="text-sm mb-6" style={{ color: subText }}>
            {t("changeFromSettings")}
          </p>

          <input
            autoFocus
            type="text"
            placeholder={t("yourName")}
            className="w-full mb-6 px-4 py-2 rounded text-center outline-none"
            style={{
              backgroundColor: isDark ? "#3a3a3a" : "#e5e7eb",
              color: isDark ? "#fff" : "#1a1a1a"
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target.value.trim()) {
                const value = e.target.value.trim();
                localStorage.setItem(STORAGE_KEYS.username, value)
                setUsername(value);
                navigate("/");
              }
            }}
          />

          <button
            className="relative group w-full py-2.5 rounded-xl font-bold overflow-hidden transition-all duration-200 active:scale-95"
            style={{
              backgroundColor: "transparent",
              color: accent,
              border: `1px solid ${accent}`
            }}
            onClick={() => {
              const value = document.querySelector("input")?.value.trim();
              if (value) {
                localStorage.setItem(STORAGE_KEYS.username, value)
                setUsername(value);
                navigate("/");
              }
            }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-0 pointer-events-none" style={{ backgroundColor: accent }} />
            <span
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none"
              style={{ color: isDark ? "#000" : "#fff" }}
            >
              {t("continue")}
            </span>
            <span className="relative z-10 block group-hover:opacity-0 transition-opacity duration-200">
              {t("continue")}
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{
        backgroundColor: isDark ? "#1f1f1f" : "#f2f4f8",
        color: isDark ? "#ffffff" : "#1a1a1a"
      }}
    >
      <Header
        habits={habits}
        onNewHabit={() => setShowNewHabit(true)}
      />

      <main className="px-6">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet context={{ showNewHabit, setShowNewHabit }} />
        </motion.div>
      </main>


    </div>
  );
}
