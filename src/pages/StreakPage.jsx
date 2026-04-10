import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { useTheme } from "../Context/ThemeContext";
import { useHabits } from "../Context/HabitContext";

function getYesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toDateString();
}

export default function StreakPage() {
  const { isDark } = useTheme();
  const accent = isDark ? "#d4af37" : "#2563eb";

  const { habit: habitId } = useParams();
  const { habits, updateHabit } = useHabits(); // ✅ fixed
  const [habit, setHabit] = useState(null);
  const [message, setMessage] = useState("");
  const [showReset, setShowReset] = useState(false);

  const today = new Date().toDateString();

  useEffect(() => {
    const rawHabits = habits.map(h => ({
      ...h,
      streak: h.streak ?? 0,
      longestStreak: h.longestStreak ?? h.streak ?? 0,
      completedDays: Array.isArray(h.completedDays) ? h.completedDays : [],
      lastCheck: h.lastCheck ?? null
    }));

    const yesterday = getYesterday();

    const updatedHabits = rawHabits.map(h => {
      if (h.id !== Number(habitId)) return h;

      const completedDays = h.completedDays || [];
      const today = new Date().toDateString();

      if (h.streak > 0 && h.lastCheck !== yesterday && h.lastCheck !== today) {
        // ✅ only reset streak (no undefined vars)
        updateHabit(Number(habitId), { streak: 0 });
        return { ...h, streak: 0 };
      }

      return h;
    });

    const found = updatedHabits.find(h => h.id === Number(habitId));
    if (found) setHabit(found);
  }, [habitId, habits]);

  if (!habit) return null;

  const handleClick = () => {
    if (habit.lastCheck === today) {
      setMessage("Come back again tomorrow!");
      return;
    }

    const prevDays = habit.completedDays || [];
    if (prevDays.includes(today)) return;

    const newStreak = habit.streak + 1;

    updateHabit(Number(habitId), {
      streak: newStreak,
      longestStreak: Math.max(habit.longestStreak || 0, newStreak),
      lastCheck: today,
      completedDays: [...prevDays, today]
    });


    setMessage("");

    if (newStreak >= 0) {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const confirmReset = () => {
    updateHabit(Number(habitId), {
      streak: 0,
      lastCheck: null,
      completedDays: []
    });

    setShowReset(false);
    setMessage("");
  };

  return (
    <div className="relative h-[80vh] flex flex-col items-center justify-center">

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

      <button
        onClick={() => setShowReset(true)}
        className="absolute bottom-6 text-xs opacity-50 hover:opacity-100"
      >
        Reset streak
      </button>

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