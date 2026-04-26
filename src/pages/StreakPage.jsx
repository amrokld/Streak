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
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { accent } = getTokens(isDark);
  const { t } = useLanguage();


  const { habit: habitId } = useParams();
  const { habits, checkInHabit, resetHabit } = useHabits();
  const resolvedId = habits.find(h => String(h.id) === String(habitId))?.id ?? Number(habitId);
  const [habit, setHabit] = useState(null);
  const [message, setMessage] = useState("");
  const [showReset, setShowReset] = useState(false);
  const clickedTodayRef = useRef(false);

  const today = getToday();

  // Sync local state from habits context
  useEffect(() => {
    const found = habits.find(h => String(h.id) === String(habitId));
    if (!found) return;
    setHabit({
      ...found,
      currentStreak: found.currentStreak ?? 0,
      longestStreak: found.longestStreak ?? 0,
      freezeCount: found.freezeCount ?? 0,
      completedDays: Array.isArray(found.completedDays) ? found.completedDays : [],
      lastCompletedDate: found.lastCompletedDate ?? null,
    });
  }, [habitId, habits]);

  // Reset clickedTodayRef if habit already has today's check (page reload / return visit)
  useEffect(() => {
    if (habit?.lastCompletedDate === today) {
      clickedTodayRef.current = true;
    }
  }, [habit?.lastCompletedDate]);

  if (!habit) return null;

  const handleClick = () => {
    if (habit.lastCompletedDate === today || clickedTodayRef.current) {
      setMessage(t("comeBackTomorrow"));
      return;
    }
    clickedTodayRef.current = true;

    checkInHabit(resolvedId, ({ freezeEarned }) => {
      if (freezeEarned) setMessage(t("freezeEarned"));
    });

    confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
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
    <div className="relative min-h-[80vh] flex flex-col items-center justify-start pt-10 p-4 animate-fade-in">
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
            textShadow: habit.currentStreak > 0 ? `0 0 60px ${accent}60` : 'none' // Adds a sick glowing aurora effect!
          }}
        >
          {habit.currentStreak}
        </motion.div>

        <div style={{ minHeight: "44px" }} className="flex items-center justify-center">
          {message ? (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-medium px-6 py-2.5 rounded-full border shadow-sm"
              style={{
                backgroundColor: isDark ? "#2a2a2a" : "#ffffff",
                color: isDark ? "#fff" : "#000",
                borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"
              }}
            >
              {message}
            </motion.p>
          ) : (
            <p className="text-sm opacity-50">{t("tapToCheckIn")}</p>
          )}
        </div>
      </div>

      {/* MINI STATS: Streak (dominant) + Freezes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-12 w-full max-w-sm flex flex-col gap-6"
      >
        <div className="flex justify-around items-end">

          {/* 🔥 Current Streak — dominant */}
          <div className="flex flex-col items-center gap-2">
            <motion.svg
              animate={{ scale: [1, 1.15, 1], rotate: [-4, 4, -4, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              width="28" height="28" viewBox="0 0 24 24" fill={accent}
            >
              <path d="M12 2C12 2 7 8 7 13a5 5 0 0010 0c0-5-5-11-5-11z" />
              <path d="M10 15c0 1.1.9 2 2 2s2-.9 2-2c0-2-2-4-2-4s-2 2-2 4z" fill={isDark ? "#fff" : "#000"} opacity="0.3" />
            </motion.svg>
            <motion.span
              key={habit.currentStreak}
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="font-bold text-4xl"
              style={{ color: accent }}
            >
              {habit.currentStreak}
            </motion.span>
            <span className="text-xs opacity-50">{t("currentStreak")}</span>
          </div>

          {/* ❄️ Freeze Count */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-10 h-10 flex items-center justify-center">

              {/* Orbiting ice particles — only when freezes available */}
              {habit.freezeCount > 0 && [0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: "#93c5fd" }}
                  animate={{
                    x: [
                      Math.cos((i * Math.PI) / 2) * 14,
                      Math.cos((i * Math.PI) / 2 + Math.PI) * 14,
                      Math.cos((i * Math.PI) / 2) * 14,
                    ],
                    y: [
                      Math.sin((i * Math.PI) / 2) * 14,
                      Math.sin((i * Math.PI) / 2 + Math.PI) * 14,
                      Math.sin((i * Math.PI) / 2) * 14,
                    ],
                    opacity: [0.6, 1, 0.6],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 2.4 + i * 0.3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.4,
                  }}
                />
              ))}

              {/* Snowflake icon */}
              <motion.svg
                animate={habit.freezeCount > 0
                  ? { rotate: [0, 360] }
                  : {}}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                width="22" height="22" viewBox="0 0 24 24"
              >
                <path
                  d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07"
                  stroke={habit.freezeCount > 0 ? "#60a5fa" : (isDark ? "#444" : "#d1d5db")}
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
                <circle
                  cx="12" cy="12" r="2"
                  fill={habit.freezeCount > 0 ? "#60a5fa" : (isDark ? "#444" : "#d1d5db")}
                />
              </motion.svg>
            </div>

            <motion.span
              key={habit.freezeCount}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 350, damping: 18 }}
              className="font-bold text-2xl"
              style={{ color: habit.freezeCount > 0 ? "#60a5fa" : (isDark ? "#555" : "#ccc") }}
            >
              {habit.freezeCount}
            </motion.span>
            <span className="text-xs opacity-50">{t("freezeCount")}</span>
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
        className="absolute bottom-0 text-xs font-medium transition-all duration-300 group"
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