import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function StreakPage() {
  const [habit, setHabit] = useState("");
  const [streak, setStreak] = useState(0);
  const [lastCheck, setLastCheck] = useState("");
  const [longest, setLongest] = useState(0);
  const [totalDays, setTotalDays] = useState(0);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    setHabit(localStorage.getItem("habit") || "");
    setStreak(parseInt(localStorage.getItem("streak")) || 0);
    setLastCheck(localStorage.getItem("lastCheck") || "");
    setLongest(parseInt(localStorage.getItem("longestStreak")) || 0);
    setTotalDays(parseInt(localStorage.getItem("totalDays")) || 0);
  }, []);

  const handleDone = () => {
    const today = new Date().toDateString();
    if (lastCheck === today) {
        alert("YAY! already compeleted, see you tomorrow!")
        return;
    }

    const newStreak = streak + 1;
    const newTotal = totalDays + 1;
    const newLongest = Math.max(longest, newStreak);

    localStorage.setItem("streak", newStreak.toString());
    localStorage.setItem("lastCheck", today);
    localStorage.setItem("totalDays", newTotal.toString());
    localStorage.setItem("longestStreak", newLongest.toString());

    setStreak(newStreak);
    setLastCheck(today);
    setTotalDays(newTotal);
    setLongest(newLongest);

    setCelebrate(true);

    confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
    });

    setTimeout(() => setCelebrate(false), 500);
  };

  const resetHabit = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-[#1f1f1f]">

      <h2 className="text-[#888] text-xl">{habit}</h2>

      <motion.div
        key={streak}
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{
            scale: celebrate ? 1.3 : 1,
            opacity: 1,
            textShadow: celebrate
            ? "0px 0px 20px #d4af37"
            : "0px 0px 0px #000"
        }}
        transition={{ type: "spring", stiffness: 200 }}
        className="text-9xl font-bold text-[#d4af37]"
        >
        {streak}
      </motion.div>

      <div className="text-[#aaa] text-sm">
        Longest: {longest} days · Total: {totalDays} days
      </div>

      <motion.button
        onClick={handleDone}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        className="px-10 py-4 bg-[#2a2a2a] text-[#d4af37] rounded-2xl text-xl border border-[#444]"
      >
        Done Today
      </motion.button>

      <button
        onClick={resetHabit}
        className="mt-4 text-sm text-red-400 underline"
      >
        Change Habit
      </button>
    </div>
  );
}
