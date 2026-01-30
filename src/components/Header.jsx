import { motion } from "framer-motion";
import { useTheme } from "../Context/ThemeContext";
import { useNavigate } from "react-router-dom";

const MAX_HABITS = 10;

export default function Header({ habits, onNewHabit }) {

  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const accent = theme === "dark" ? "#d4af37" : "#2563eb";
  const muted = theme === "dark" ? "#bbb" : "#6b7280";

  const canCreate = Array.isArray(habits) && habits.length < MAX_HABITS;

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
      <div className="flex justify-end items-center gap-8 text-lg">
        <button
          onClick={() => {
            console.log("INTENT FIRED");
            onNewHabit();
          }}
          disabled={!canCreate}
          style={{
            color: accent,
            pointerEvents: canCreate ? "auto" : "none",
            position: "relative",
            zIndex: 10
          }}
        >
          New Habit
        </button>

        <button onClick={toggleTheme} style={{ color: accent }}>
          {theme === "dark" ? "Light" : "Dark"}
        </button>
      </div>
    </header>
  );
}
