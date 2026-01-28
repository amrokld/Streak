import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../Context/ThemeContext";

export default function Onboarding() {
  const [habit, setHabit] = useState("");
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const accent = isDark ? "#d4af37" : "#2563eb";
  const bg = isDark ? "#1f1f1f" : "#f2f4f8";
  const cardBg = isDark ? "#2a2a2a" : "#ffffff";
  const text = isDark ? "#ffffff" : "#1a1a1a";
  const subText = isDark ? "#aaa" : "#6b7280";

  const startTracking = () => {
    if (!habit.trim()) return;

    const habits =
      JSON.parse(localStorage.getItem("habits")) || [];

    habits.push({
      id: Date.now(),
      name: habit.trim(),
      streak: 0,
      lastCheck: null
    });

    localStorage.setItem("habits", JSON.stringify(habits));

    navigate("/");
  };

  return (
    <div
      className="h-screen flex items-center justify-center"
      style={{ backgroundColor: bg }}
    >
      <div
        className="flex flex-col items-center gap-6 px-10 py-12 rounded-3xl"
        style={{
          backgroundColor: cardBg,
          color: text,
          boxShadow: isDark
            ? "none"
            : "0 20px 40px rgba(0,0,0,0.08)"
        }}
      >
        <h1
          className="text-3xl font-bold"
          style={{ color: accent }}
        >
          What do you want to track?
        </h1>

        <p className="text-sm" style={{ color: subText }}>
          One habit. One streak. Every day.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            startTracking();
          }}
          className="flex flex-col gap-4 w-64"
        >
          <input
            className="px-4 py-2 rounded outline-none text-center"
            style={{
              backgroundColor: isDark ? "#3a3a3a" : "#e5e7eb",
              color: text
            }}
            value={habit}
            onChange={(e) => setHabit(e.target.value)}
            placeholder="Gym, Study, Reading..."
          />

          <button
            type="submit"
            className="py-2 rounded-xl font-medium transition"
            style={{
              color: accent,
              border: `1px solid ${
                isDark ? "#444" : "#cbd5e1"
              }`
            }}
          >
            Start
          </button>
        </form>
      </div>
    </div>
  );
}
