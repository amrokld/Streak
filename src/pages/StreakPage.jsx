import { motion } from "framer-motion";
import { useState } from "react";
import { useLocation } from "react-router-dom";

export default function StreakPage() {
  const { state } = useLocation();
  const habit = state?.habit || "My Habit";

  const [streak, setStreak] = useState(1);

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-6 bg-[#1f1f1f]">

      <h2 className="text-[#888] text-xl">{habit}</h2>

      <motion.div
        key={streak}
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 150, damping: 12 }}
        className="text-9xl font-bold text-[#d4af37]"
      >
        {streak}
      </motion.div>

      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => setStreak(streak + 1)}
        className="px-10 py-4 bg-[#2a2a2a] text-[#d4af37] rounded-2xl text-xl border border-[#444]"
      >
        Done Today
      </motion.button>
    </div>
  );
}
