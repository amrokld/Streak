import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Header from "../components/Header";
import { useTheme } from "../Context/ThemeContext";
import { useHabits } from "../Context/HabitContext";


export default function AppLayout() {
  const { isDark } = useTheme();
  const { habits } = useHabits();
  const [showNewHabit, setShowNewHabit] = useState(false);

  const location = useLocation();

  const [username, setUsername] = useState(
    localStorage.getItem("username") || ""
  );

  const accent = isDark ? "#d4af37" : "#2563eb";
  const subText = isDark ? "#aaa" : "#6b7280";

  if (!username) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center transition-colors duration-300"
        style={{
          backgroundColor: isDark ? "#1f1f1f" : "#f2f4f8",
          color: isDark ? "#ffffff" : "#1a1a1a"
        }}
      >
        <div
          className="relative w-full max-w-sm rounded-3xl px-8 py-10 text-center border animate-fade-in"
          style={{
            backgroundColor: isDark ? "#2a2a2a" : "#ffffff",
            borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
            boxShadow: isDark
              ? `0 0 50px ${accent}20, 0 20px 40px rgba(0, 0, 0, 0.8)`
              : `0 0 40px ${accent}30, 0 20px 40px rgba(0, 0, 0, 0.15)`
          }}
        >
          <h2 className="text-2xl font-bold mb-2" style={{ color: accent }}>
            What should I call you?
          </h2>

          <p className="text-sm mb-6" style={{ color: subText }}>
            You can change it from the settings
          </p>

          <input
            autoFocus
            type="text"
            placeholder="Your name"
            className="w-full mb-6 px-4 py-2 rounded text-center outline-none"
            style={{
              backgroundColor: isDark ? "#3a3a3a" : "#e5e7eb",
              color: isDark ? "#fff" : "#1a1a1a"
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target.value.trim()) {
                const value = e.target.value.trim();
                localStorage.setItem("username", value);
                setUsername(value);
              }
            }}
          />

          <button
            className="w-full py-2 rounded-xl font-medium"
            style={{
              color: accent,
              border: `1px solid ${isDark ? "#444" : "#cbd5e1"}`
            }}
            onClick={() => {
              const value = document.querySelector("input")?.value.trim();
              if (value) {
                localStorage.setItem("username", value);
                setUsername(value);
              }
            }}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{
        backgroundColor: isDark ? "#1f1f1f" : "#f2f4f8",
        color: isDark ? "#ffffff" : "#1a1a1a"
      }}
    >
      <Header
        habits={habits}
        onNewHabit={() => setShowNewHabit(true)}
      />

      <main className="px-6">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet context={{ showNewHabit, setShowNewHabit }} />
        </motion.div>
      </main>


    </div>
  );
}
