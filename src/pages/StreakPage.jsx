import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { useTheme } from "../context/ThemeContext";

function getYesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toDateString();
}

export default function StreakPage() {
  const { isDark } = useTheme();
  const accent = isDark ? "#d4af37" : "#2563eb";

  const { habit: habitName } = useParams();
  const [habit, setHabit] = useState(null);
  const [message, setMessage] = useState("");
  const [showReset, setShowReset] = useState(false);

  const today = new Date().toDateString();

  useEffect(() => {
    const rawHabits = JSON.parse(localStorage.getItem("habits")) || [];
    const habits = rawHabits.map(h => ({
      ...h,
      streak: h.streak ?? 0,
      longestStreak: h.longestStreak ?? h.streak ?? 0,
      completedDays: Array.isArray(h.completedDays) ? h.completedDays : [],
      lastCheck: h.lastCheck ?? null
    }));

    const yesterday = getYesterday();
    let updated = false;

    const updatedHabits = habits.map(h => {
      if (h.name !== habitName) return h;

      const completedDays = h.completedDays || [];

      if (
        h.streak > 0 &&
        !completedDays.includes(yesterday) &&
        h.lastCheck !== yesterday
      ) {
        updated = true;
        return { ...h, streak: 0 };
      }

      return h;
    });

    if (updated) {
      localStorage.setItem("habits", JSON.stringify(updatedHabits));
    }

    const found = updatedHabits.find(h => h.name === habitName);
    if (found) setHabit(found);
  }, [habitName]);

  if (!habit) return null;

  const handleClick = () => {
    if (habit.lastCheck === today) {
      setMessage("Come back again tomorrow!");
      return;
    }

    const habits = JSON.parse(localStorage.getItem("habits")) || [];

    const updatedHabits = habits.map(h => {
      if (h.name !== habit.name) return h;

      const prevDays = h.completedDays || [];
      if (prevDays.includes(today)) return h;

      const newStreak = h.streak + 1;

      return {
        ...h,
        streak: newStreak,
        longestStreak: Math.max(h.longestStreak || 0, newStreak),
        lastCheck: today,
        completedDays: [...prevDays, today]
      };
    });

    localStorage.setItem("habits", JSON.stringify(updatedHabits));
    setHabit(updatedHabits.find(h => h.name === habit.name));

    setMessage("");
    window.dispatchEvent(new Event("habitsUpdated"));

    if (habit.streak >= 0) {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  // 🔴 manual reset
  const confirmReset = () => {
    const habits = JSON.parse(localStorage.getItem("habits")) || [];

    const updatedHabits = habits.map(h =>
      h.name === habit.name
        ? { ...h, 
          streak: 0, 
          lastCheck: null,
          completedDays: []
        }
        : h
    );

    localStorage.setItem("habits", JSON.stringify(updatedHabits));
    setHabit(updatedHabits.find(h => h.name === habit.name));

    setShowReset(false);
    setMessage("");
  };

  return (
    <div className="relative h-[80vh] flex flex-col items-center justify-center">

      {/* CENTER CONTENT */}
      <div className="flex flex-col items-center">
        <motion.div
          onClick={handleClick}
          whileTap={{ scale: 0.95 }}
          className="text-[10rem] md:text-[14rem] font-bold cursor-pointer select-none"
          style={{ color: accent }}
        >
          {habit.streak}
        </motion.div>

        {message && (
          <p className="mt-4 text-sm text-gray-500 text-center">
            {message}
          </p>
        )}
      </div>

      {/* RESET BUTTON — FIXED AT BOTTOM */}
      <button
        onClick={() => setShowReset(true)}
        className="absolute bottom-6 text-xs opacity-50 hover:opacity-100"
      >
        Reset streak
      </button>

      {/* CONFIRM MODAL */}
      {showReset && (
        <div 
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{
          backgroundColor: isDark
            ? "rgba(0,0,0,0.6)"
            : "rgba(0,0,0,0.2)"
        }}
        >
          <div 
            className="rounded-2xl px-6 py-4 w-[300px] text-center"
            style={{
              backgroundColor: isDark ? "#1f1f1f" : "#ffffff",
              color: isDark ? "#e5e7eb" : "#111827",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
            }}
          >
            <p className="mb-4 text-sm">
              This will reset your current streak to 0.
            </p>

            <div className="flex justify-center gap-6">
              <button
                onClick={() => setShowReset(false)}
                className="text-sm opacity-60"
              >
                Cancel
              </button>

              <button
                onClick={confirmReset}
                className="text-sm text-red-500"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
