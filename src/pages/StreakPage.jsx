import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { useTheme } from "../context/ThemeContext";

export default function StreakPage() {
  const { isDark } = useTheme();
  const accent = isDark ? "#d4af37" : "#2563eb";

  const { habit: habitName } = useParams();
  const [habit, setHabit] = useState(null);
  const [message, setMessage] = useState("");

  const today = new Date().toDateString();

  useEffect(() => {
    const habits = JSON.parse(localStorage.getItem("habits")) || [];
    const found = habits.find(h => h.name === habitName);
    if (found) setHabit(found);
  }, [habitName]);

  if (!habit) return null;

  const handleClick = () => {
    // 🔒 already checked today
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

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="h-[80vh] flex items-center justify-center">
      <div
        className="px-16 py-10 rounded-3xl">
        <motion.div
          onClick={handleClick}
          whileTap={{ scale: 0.95 }}
          className="text-[10rem] md:text-[14rem] font-bold cursor-pointer select-none text-center"
          style={{ color: accent }}
        >
          {habit.streak}
        </motion.div>

        {message && (
          <p className="mt-4 text-sm text-center text-gray-500">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
