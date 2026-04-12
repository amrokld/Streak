import { motion } from "framer-motion";
import { useTheme } from "../Context/ThemeContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { getTokens } from "../theme/tokens";
import { useLanguage } from "../Context/LanguageContext";


const MAX_HABITS = 12;

export default function Header({ habits, onNewHabit }) {

  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { accent, subText: muted, cardBg } = getTokens(isDark);
  const navigate = useNavigate();
  const location = useLocation();
  const [limitHit, setLimitHit] = useState();
  const { t } = useLanguage();

  const canCreate = Array.isArray(habits) && habits.length < MAX_HABITS;

  const limitMessages = [
    t("limitMsg1"),
    t("limitMsg2"),
    t("limitMsg3"),
    t("limitMsg4"),
    t("limitMsg5"),
    t("limitMsg6"),
  ];

  const message = limitMessages[(habits?.length || 0) % limitMessages.length];

  const goToNewHabit = () => {
    if (habits && habits.length >= MAX_HABITS) {
      setLimitHit(true);
      return;
    }
    setLimitHit(false);

    if (location.pathname !== "/") {
      navigate("/");
    }

    onNewHabit?.();
  };


  useEffect(() => {
    if (!limitHit) return;

    const timer = setTimeout(() => {
      setLimitHit(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [limitHit]);

  const navLinks = [
    { label: t("statistics"), path: "/statistics" },
    { label: t("other"), path: "/other" },
    { label: t("tasks"), path: "/tasks" }
  ];

  return (
    <header className="w-full grid grid-cols-3 items-center px-10 py-6">

      {/* Logo */}
      <motion.div
        whileTap={{ scale: 0.95 }}
        whileHover={{ y: -3 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        onClick={() => navigate("/")}
        className="cursor-pointer select-none group"
      >
        <span
          className="text-4xl md:text-5xl font-bold transition-all duration-300"
          style={{
            fontFamily: "Space Grotesk",
            letterSpacing: "0.06em",
            color: accent,
          }}
          onMouseEnter={(e) => e.currentTarget.style.textShadow = `0 0 10px ${accent}bb`}
          onMouseLeave={(e) => e.currentTarget.style.textShadow = "none"}
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
      <div className="flex items-center gap-8 text-lg relative justify-self-end">
        
        <div className="relative">
          <button
            onClick={goToNewHabit}
            style={{ color: accent }}
          >
            {t("newHabit")}
          </button>

          {limitHit && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6 }}
              className="absolute -bottom-10 right-0 px-3 py-1 rounded-full text-xs whitespace-nowrap"
              style={{
                backgroundColor: cardBg,
                color: muted,
                boxShadow:
                  isDark
                    ? "0 6px 20px rgba(0,0,0,0.4)"
                    : "0 6px 20px rgba(0,0,0,0.12)"
              }}
            >
              {message}
            </motion.div>
          )}
        </div>

        {/* Settings Far Right */}
        <button
          onClick={() => navigate("/settings")}
          className="transition relative"
          style={{ color: location.pathname === "/settings" ? accent : muted }}
          onMouseEnter={(e) => { if (location.pathname !== "/settings") e.currentTarget.style.color = accent; }}
          onMouseLeave={(e) => { 
            if (location.pathname !== "/settings") e.currentTarget.style.color = muted; 
          }}
        >
          {t("settings")}
        </button>

      </div>
    </header>
  );
}
