import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="w-full grid grid-cols-3 items-center px-10 py-6 bg-[#1f1f1f]">

      {/* Logo */}
      <motion.div
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.02 }}
        onClick={() => navigate("/")}
        className="cursor-pointer select-none"
      >
        <span
          className="text-4xl md:text-5xl font-bold text-[#d4af37]"
          style={{ fontFamily: "Space Grotesk", letterSpacing: "0.06em" }}
        >
          STREAK
        </span>
      </motion.div>

      {/* Navigation (slightly left) */}
      <nav className="flex justify-center gap-10 text-lg text-[#bbb] relative -left-12">
        <NavLink className="hover:text-white transition" to="/statistics">
          Statistics
        </NavLink>
        <NavLink className="hover:text-white transition" to="/calendar">
          Calendar
        </NavLink>
        <NavLink className="hover:text-white transition" to="/info">
          Info
        </NavLink>
      </nav>

      {/* Right actions */}
      <div className="flex justify-end items-center gap-6 text-lg">
        <button className="text-[#d4af37] hover:opacity-80 transition">
          Dark
        </button>

        <button className="text-[#d4af37] hover:opacity-80 transition">
          New Habit
        </button>
      </div>
    </header>
  );
}
