import { useNavigate } from "react-router-dom";
import { useTheme } from "../Context/ThemeContext";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function HabitCard({ habit, onDeleteRequest, onEditCategory, forceClose }) {
  const [flipped, setFlipped] = useState(false);
  const navigate = useNavigate();
  const { isDark } = useTheme();

  // colors
  const accent = isDark ? "#d4af37" : "#2563eb";
  const cardBg = isDark ? "#2a2a2a" : "#ffffff";
  const subText = isDark ? "#777" : "#6b7280";
  const badgeBg = isDark ? "#3a3a3a" : "#e5e7eb";
  const shadow = isDark
    ? "none"
    : "0 12px 30px rgba(0, 0, 0, 0.08)";

  const categoryBg =
    habit.category === "important"
      ? isDark ? "#3a3a3a" : "#e5e7eb"
      : habit.category === "urgent"
      ? isDark ? "#4a3a2a" : "#fde68a"
      : isDark ? "#2a3a3a" : "#d1fae5";

  useEffect(() => {
    if (forceClose) {
      setFlipped(false);
    }
  }, [forceClose]);

  return (
    <motion.div
      className="relative w-64 h-44 rounded-3xl"
      animate={{ rotateY: flipped ? 180 : 0 }}
      transition={{ duration: 0.45, ease: "easeInOut" }}
      style={{ transformStyle: "preserve-3d" }}
      onContextMenu={(e) => {
        e.preventDefault();
        setFlipped(f => !f);
      }}
    >
      {/* ---------- FRONT ---------- */}
      <div
        className="absolute inset-0 p-6 rounded-3xl"
        style={{
          backfaceVisibility: "hidden",
          backgroundColor: cardBg,
          WebkitBackfaceVisibility: "hidden"
        }}
        onClick={() => !flipped && navigate(`/streak/${habit.name}`)}
      >
        <div>
          <h3
            className="text-xl font-medium"
            style={{ color: isDark ? "#ffffff" : "#1a1a1a" }}
          >
            {habit.name}
          </h3>

          <p
            className="text-sm mt-1"
            style={{ color: subText }}
          >
            click for more details
          </p>

          <p
            className="text-[11px] mt-1 opacity-40"
            style={{ color: subText }}
          >
            Right-click for options
          </p>

          {habit.category && (
            <span
              className="inline-block mt-4 px-2 py-[2px] rounded-full text-xs capitalize"
              style={{
                backgroundColor: categoryBg,
                color: accent
              }}
            >
              {habit.category}
            </span>
          )}
        </div>

        <div className="flex justify-end mt-3">
          <div
            className="absolute bottom-4 right-4 w-12 h-12 rounded-2xl
                      flex items-center justify-center font-bold text-lg"
            style={{
              backgroundColor: badgeBg,
              color: accent
            }}
          >
            {habit.streak}
          </div>
        </div>
      </div>

      {/* ---------- BACK (EDIT CATEGORY) ---------- */}
      <div
        className="absolute inset-0 p-6 rounded-3xl"
        style={{
          backgroundColor: cardBg,
          transform: "rotateY(180deg)",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden"
        }}
      >

      
      
      <div className="h-full flex flex-col justify-between">
      <div className="text-xs opacity-40 tracking-wide">
        OPTIONS
      </div>

      <div className="flex flex-col gap-3">
        <button
          className="py-2 rounded-xl transition"
          style={{
            backgroundColor: isDark ? "#333" : "#e5e7eb",
            color: isDark ? "#fff" : "#1a1a1a"
          }}
          onClick={() => onEditCategory(habit)}
        >
          Change category
        </button>

        <button
          className="py-2 rounded-xl transition"
          style={{
            backgroundColor: isDark ? "#2a1f1f" : "#fee2e2",
            color: "#ef4444"
          }}
          onClick={() => onDeleteRequest(habit)}
        >
          Delete habit
        </button>
      </div>



      <p className="text-xs opacity-40 text-center">
        Right-click to close
      </p>
    </div>
  </div>
  </motion.div>
  );
}
