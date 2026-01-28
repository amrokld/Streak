import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const accent = theme === "dark" ? "#d4af37" : "#2563eb";
  const muted = theme === "dark" ? "#bbb" : "#6b7280";

  return (
    <header className="w-full grid grid-cols-3 items-center px-10 py-6">
      
      {/* Logo */}
      <motion.div
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/")}
        className="cursor-pointer select-none"
      >
        <span
          className="text-4xl md:text-5xl font-bold cursor-pointer select-none"
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
      <nav className="flex justify-center gap-10 text-lg relative -left-10">
        <span
          onClick={() => navigate("/statistics")}
          className="cursor-pointer transition"
          style={{ color: muted }}
          onMouseEnter={(e) => (e.target.style.color = accent)}
          onMouseLeave={(e) => (e.target.style.color = muted)}
        >
          Statistics
        </span>

        <span
          onClick={() => navigate("/calendar")}
          className="cursor-pointer transition"
          style={{ color: muted }}
          onMouseEnter={(e) => (e.target.style.color = accent)}
          onMouseLeave={(e) => (e.target.style.color = muted)}
        >
          Calendar
        </span>

        <span
          className="cursor-not-allowed opacity-50"
          title="Coming soon"
        >
          Info
        </span>
      </nav>



      {/* Right actions */}
      <div className="flex justify-end items-center gap-8 text-lg">
        <button
          onClick={() => navigate("/onboarding")}
          className="transition"
          style={{ color: accent }}
        >
          New Habit
        </button>

        <button
          onClick={toggleTheme}
          className="transition"
          style={{ color: accent }}
        >
          {theme === "dark" ? "Light" : "Dark"}
        </button>
      </div>
    </header>
  );
}
