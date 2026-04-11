import { motion } from "framer-motion";
import { useTheme } from "../Context/ThemeContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const MAX_HABITS = 12;

export default function Header({ habits, onNewHabit }) {

  const { theme } = useTheme(); // Removed toggleTheme
  const navigate = useNavigate();
  const location = useLocation(); // Required to know which tab we are on
  const [limitHit, setLimitHit] = useState();

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
  ];

  const message = limitMessages[(habits?.length || 0) % limitMessages.length];

  const goToNewHabit = () => {
    if (habits && habits.length >= MAX_HABITS) {
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

  // Clean navigation links using your exact labels
  const navLinks = [
    { label: "Statistics", path: "/statistics" },
    { label: "Calendar", path: "/calendar" },
    { label: "Settings", path: "/settings" }
  ];

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
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;

          return (
            <span
              key={link.path}
              onClick={() => navigate(link.path)}
              style={{ color: isActive ? accent : muted }}
              className="cursor-pointer transition relative"
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = accent; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = muted; }}
            >
              {link.label}

              {/* This is the new active tab underline animation! */}
              {isActive && (
                <motion.div
                  layoutId="headerActiveTab"
                  className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full"
                  style={{ backgroundColor: accent }}
                />
              )}
            </span>
          );
        })}
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
      </div>

    </header>
  );
}
