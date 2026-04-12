import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Header from "../components/Header";
import { useTheme } from "../Context/ThemeContext";
import { useHabits } from "../Context/HabitContext";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { getTokens } from "../theme/tokens";


export default function AppLayout() {
  const { isDark } = useTheme();
  const { habits } = useHabits();
  const [showNewHabit, setShowNewHabit] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const [username, setUsername] = useState(
    localStorage.getItem(STORAGE_KEYS.username) || ""
  );

  const { accent, subText } = getTokens(isDark);

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
                localStorage.setItem(STORAGE_KEYS.username, value)
                setUsername(value);
                navigate("/");
              }
            }}
          />

          <button
            className="relative group w-full py-2.5 rounded-xl font-bold overflow-hidden transition-all duration-200 active:scale-95"
            style={{
              backgroundColor: "transparent",
              color: accent,
              border: `1px solid ${accent}`
            }}
            onClick={() => {
              const value = document.querySelector("input")?.value.trim();
              if (value) {
                localStorage.setItem(STORAGE_KEYS.username, value)
                setUsername(value);
                navigate("/");
              }
            }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-0 pointer-events-none" style={{ backgroundColor: accent }} />
            <span
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none"
              style={{ color: isDark ? "#000" : "#fff" }}
            >
              Continue
            </span>
            <span className="relative z-10 block group-hover:opacity-0 transition-opacity duration-200">
              Continue
            </span>
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
