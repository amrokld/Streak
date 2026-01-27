import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

export default function StreakPage() {
  const [streak, setStreak] = useState(0);
  const [lastCheck, setLastCheck] = useState("");
  const [message, setMessage] = useState("");

  const today = new Date().toDateString();

  useEffect(() => {
    setStreak(parseInt(localStorage.getItem("streak")) || 0);
    setLastCheck(localStorage.getItem("lastCheck") || "");
  }, []);

  const handleClick = () => {
    if (lastCheck === today) {
      setMessage("Come back again tomorrow.");
      return;
    }

    const newStreak = streak + 1;

    localStorage.setItem("streak", newStreak.toString());
    localStorage.setItem("lastCheck", today);

    setStreak(newStreak);
    setLastCheck(today);
    setMessage("");

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="h-[80vh] flex flex-col items-center justify-center gap-4">

      <motion.div
        onClick={handleClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="text-[10rem] md:text-[14rem] font-bold text-[#d4af37]
                   cursor-pointer select-none"
      >
        {streak}
      </motion.div>

      {message && (
        <p className="text-sm text-[#777] mt-2">
          {message}
        </p>
      )}
    </div>
  );
}
