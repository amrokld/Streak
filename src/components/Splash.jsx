import { motion } from "framer-motion";

export default function Splash({ onFinish }) {
  const theme =
    document.documentElement.getAttribute("data-theme") || "dark";

  const isDark = theme === "dark";

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backgroundColor: isDark ? "#1f1f1f" : "#f2f4f8"
      }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 0.6, duration: 0.3 }}
      onAnimationComplete={onFinish}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="text-6xl md:text-7xl font-bold"
        style={{
          fontFamily: "Space Grotesk",
          letterSpacing: "0.08em",
          color: isDark ? "#d4af37" : "#2563eb"
        }}
      >
        STREAK
      </motion.div>
    </motion.div>
  );
}
