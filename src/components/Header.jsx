import { motion } from "framer-motion";
import { useTheme } from "../Context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const MAX_HABITS = 12;

export default function Header({ habits, onNewHabit }) {

  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [ limitHit, setLimitHit] = useState();

  const accent = theme === "dark" ? "#d4af37" : "#2563eb";
  const muted = theme === "dark" ? "#bbb" : "#6b7280";

  const canCreate = Array.isArray(habits) && habits.length < MAX_HABITS;

  const limitMessages = [
    "Thats enough for now. 12 habits max.",
    "Slow down, 12 habits is the limit. ",
    "Limit reached. Finish before adding more",
    "No more habits. Finish the work.",
    "Are you insane? wanna have more than 12 habits.",
    "Bro, Chill! Dont lie to yourself, You ain't gonna do more than 12 habits at a time."
  ]

  const message = limitMessages[habits.length % limitMessages.length];

  const goToNewHabit = () =>{
    if (habits.length >= MAX_HABITS) {
      setLimitHit(true);
      return;
    }
    setLimitHit(false);
    onNewHabit?.();
  };

  useEffect(() => {
    if (!limitHit) return;

    const t = setTimeout(() => {
      setLimitHit(false);
    }, 2000);

    return () => clearTimeout(t);
  }, [limitHit]);

  return (
    <header className="w-full grid grid-cols-3 items-center px-10 py-6">
      
      {/* Logo */}
      <motion.div
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/")}
        className="cursor-pointer select-none"
      >
        <span
          className="text-4xl md:text-5xl font-bold"
          style={{
            fontFamily: "Space Grotesk",
            letterSpacing: "0.06em",
            color: accent
          }}
        >
          STREAK
        </span>
      </motion.div>

      {/* Navigation */}
      <nav className="flex justify-center gap-10 text-lg">
        <span
          onClick={() => navigate("/statistics")}
          style={{ color: muted }}
          className="cursor-pointer transition"
          onMouseEnter={(e) => (e.target.style.color = accent)}
          onMouseLeave={(e) => (e.target.style.color = muted)}
        >
          Statistics
        </span>

        <span
          onClick={() => navigate("/calendar")}
          style={{ color: muted }}
          className="cursor-pointer transition"
          onMouseEnter={(e) => (e.target.style.color = accent)}
          onMouseLeave={(e) => (e.target.style.color = muted)}
        >
          Calendar
        </span>

        <span className="cursor-not-allowed opacity-50">
          Info
        </span>
      </nav>

      {/* Right actions */}
      <div className="flex items-center gap-6 text-lg relative justify-self-end">
          <div className="relative">
            <button
              onClick={goToNewHabit}
              style={{ color: accent }}
            >
              New Habit
            </button>

            {limitHit && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6 }}
                className="absolute -bottom-10 right-0 px-3 py-1 rounded-full text-xs whitespace-nowrap"
                style={{
                  backgroundColor: theme === "dark" ? "#2a2a2a" : "#ffffff",
                  color: muted,
                  boxShadow:
                    theme === "dark"
                      ? "0 6px 20px rgba(0,0,0,0.4)"
                      : "0 6px 20px rgba(0,0,0,0.12)"
                }}
              >
                {message}
              </motion.div>
            )}
          </div>

          <button
            onClick={toggleTheme}
            style={{ color: accent }}
          >
            {theme === "dark" ? "Light" : "Dark"}
          </button>
        </div>

    </header>
  );
}
