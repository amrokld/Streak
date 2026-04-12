import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import confetti from "canvas-confetti";
import { useTheme } from "../Context/ThemeContext";
import { useHabits } from "../Context/HabitContext";
import { getToday, formatDate } from "../utils/dateHelpers";
import { getTokens } from "../theme/tokens";
import { useLanguage } from "../Context/LanguageContext";

import ConfirmModal from "../components/ConfirmModel";

export default function StreakPage() {
  const { isDark } = useTheme();
  const { accent } = getTokens(isDark);
  const { t } = useLanguage();

  const { habit: habitId } = useParams();
  const { habits, checkInHabit, resetHabit, handleMissedDay } = useHabits();
  const [habit, setHabit] = useState(null);
  const [message, setMessage] = useState("");
  const [showReset, setShowReset] = useState(false);
  const missedDayChecked = useRef(null);

  const today = getToday();

  // Run handleMissedDay ONCE per habitId visit (not on every habits change)
  useEffect(() => {
    if (missedDayChecked.current !== habitId) {
      handleMissedDay(Number(habitId));
      missedDayChecked.current = habitId;
    }
  }, [habitId]);

  // Sync local state from habits context (safe — no state mutation here)
  useEffect(() => {
    const found = habits.find(h => h.id === Number(habitId));
    if (!found) return;

    const normalized = {
      ...found,
      streak: found.streak ?? 0,
      longestStreak: found.longestStreak ?? found.streak ?? 0,
      completedDays: Array.isArray(found.completedDays) ? found.completedDays : [],
      lastCheck: found.lastCheck ?? null
    };

    setHabit(normalized);
  }, [habitId, habits]);


  if (!habit) return null;

  const handleClick = () => {
    if (habit.lastCheck === today) {
      setMessage(t("comeBackTomorrow"));
      return;
    }

    checkInHabit(Number(habitId));
    setMessage("");

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const confirmReset = () => {
    resetHabit(Number(habitId));
    setShowReset(false);
    setMessage("");
  };

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return formatDate(d);
  });

  const recentActivity = last7Days.map(date => {
    return habit.completedDays?.includes(date);
  })

  return (
    <div className="relative h-[80vh] flex flex-col items-center justify-center p-4 animate-fade-in">

      {/* HIGHLIGHT: HABIT NAME */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-semibold mb-8 tracking-wide uppercase text-center"
        style={{ color: isDark ? "#ffffff" : "#1a1a1a", opacity: 0.8 }}
      >
        {habit.name}
      </motion.h1>

      <div className="flex flex-col items-center">
        {/* HUGE STREAK NUMBER WITH GLOW + ANIMATION */}
        <motion.div
          onClick={handleClick}
          whileTap={{ scale: 0.90 }}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="text-[10rem] md:text-[14rem] font-bold cursor-pointer select-none leading-none"
          style={{
            color: accent,
            textShadow: habit.streak > 0 ? `0 0 60px ${accent}60` : 'none' // Adds a sick glowing aurora effect!
          }}
        >
          {habit.streak}
        </motion.div>

        {message ? (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 text-sm font-medium px-6 py-2.5 rounded-full border shadow-sm"
            style={{
              backgroundColor: isDark ? "#2a2a2a" : "#ffffff",
              color: isDark ? "#fff" : "#000",
              borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"
            }}
          >
            {message}
          </motion.p>
        ) : (
          <p className="mt-8 text-sm opacity-50">{t("tapToCheckIn")}</p>
        )}
      </div>

      {/* MINI STATS & 7-DAY HISTORY FOR THIS HABIT */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-12 w-full max-w-sm flex flex-col gap-6"
      >
        <div className="flex justify-around text-sm" style={{ color: isDark ? "#ffffff" : "#1a1a1a" }}>
          <div className="flex flex-col items-center">
            <span className="opacity-50 mb-1">{t("longest")}</span>
            <span className="font-bold text-xl">{habit.longestStreak || habit.streak}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="opacity-50 mb-1">{t("totalDays")}</span>
            <span className="font-bold text-xl">{habit.completedDays?.length || 0}</span>
          </div>
        </div>

        {/* Mini 7-Day Dots */}
        <div className="flex justify-center gap-3 mt-2">
          {recentActivity.map((isDone, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full transition-all duration-300"
              style={{
                backgroundColor: isDone ? accent : (isDark ? "#3f3f3f" : "#e5e7eb"),
                opacity: isDone ? 1 : 0.4,
                transform: isDone ? 'scale(1.1)' : 'scale(1)'
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* RESET BUTTON */}
      <button
        onClick={() => setShowReset(true)}
        className="absolute bottom-6 text-xs font-medium transition-all duration-300 group"
        style={{ color: isDark ? "#ffffff" : "#1a1a1a" }}
      >
        <span
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap"
          style={{ color: "#ef4444", textShadow: "0 0 12px rgba(239,68,68,0.8)" }}
        >
          {t("resetStreak")}
        </span>
        <span className="relative z-10 opacity-40 group-hover:opacity-0 transition-opacity duration-300 whitespace-nowrap">
          {t("resetStreak")}
        </span>
      </button>

      {/* RESET MODAL */}
      {showReset && (
        <ConfirmModal
          title={t("resetStreakQ")}
          message={t("resetStreakMsg")}
          confirmText={t("reset")}
          onCancel={() => setShowReset(false)}
          onConfirm={confirmReset}
        />
      )}
    </div>
  );
}