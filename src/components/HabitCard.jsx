import { useNavigate } from "react-router-dom";
import { useTheme } from "../Context/ThemeContext";

function handleDelete() {
  setHabits(prev => prev.filter(h => h.id !== habit.id));
}

export default function HabitCard({ habit }) {
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

  return (
    <div
      onClick={() => navigate(`/streak/${habit.name}`)}
      className="w-64 h-44 rounded-3xl p-6 cursor-pointer transition-transform"
      style={{
        backgroundColor: cardBg,
        boxShadow: shadow
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Text */}
      <div>
        <h3 
          className="text-xl font-medium"
          style={{ color: isDark ?"#ffffff" : "#1a1a1a" }}
        >
          {habit.name}
        </h3>  
        <p
          className="text-sm mt-1"
          style={{ color: subText }}
        >
          click for more details
        </p>
      </div>

      {/* Streak badge */}
      <div className="flex justify-end mt-6">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg"
          style={{
            backgroundColor: badgeBg,
            color: accent
          }}
        >
          {habit.streak}
        </div>
      </div>
    </div>
  );
}
