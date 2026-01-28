import { motion } from "framer-motion";
import { useState } from "react";
import { useTheme } from "../Context/ThemeContext";

export default function StreakCounter() {
  const [streak, setStreak] = useState(0);
  const { isDark } = useTheme();

  const handleDone = () => {
    setStreak(prev => prev + 1);
  };

  return (
    <div 
      className="h-screen flex flex-col items-center justify-center gap-10"
      style={{ background: isDark ? "#1e1e1e" : "#f2f4f8" }}
  
      >

      <motion.div
        key={streak}
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 12 }}
        className="text-9xl font-extrabold text=[#d4af37]"
      >
        {streak}
      </motion.div>

      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        onClick={handleDone}
        className="px-10 py-4 bg-[#2a2a2a] text-[#d4af37] rounded-2xl text-xl border border-[#444]"
      >
        Done Today
      </motion.button>

    </div>
  );
}
