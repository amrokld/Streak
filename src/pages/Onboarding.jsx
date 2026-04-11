import { useState } from "react";
import { useTheme } from "../Context/ThemeContext";
import { useHabits } from "../Context/HabitContext";
import { useNavigate } from "react-router-dom";

export default function Onboarding({
  mode = "onboarding",
  onClose
}) {
  const [habit, setHabit] = useState("");
  const [category, setCategory] = useState("important");

  const { isDark } = useTheme();
  const { addHabit } = useHabits();

  const navigate = useNavigate();

  const accent = isDark ? "#d4af37" : "#2563eb";
  const bg = isDark ? "#1f1f1f" : "#f2f4f8";
  const cardBg = isDark ? "#2a2a2a" : "#ffffff";
  const text = isDark ? "#ffffff" : "#1a1a1a";
  const subText = isDark ? "#aaa" : "#6b7280";

  const startTracking = () => {
    if (!habit.trim()) return;

    addHabit({
      id: Date.now(),
      name: habit.trim(),
      category,
      streak: 0,
      longestStreak: 0,
      completedDays: [],
      lastCheck: null
    });

    if (mode === "onboarding") {
      navigate("/");
    } else {
      onClose?.();
    }
  };

  const categories = ["important", "urgent", "optional"];

  return (
    <div
      className={`flex items-center justify-center animate-fade-in
        ${mode === "new-habit" ? "fixed inset-0 z-50" : "h-screen"}
      `}
      style={{
        backgroundColor: mode === "new-habit" ? "transparent" : bg
      }}


      onClick={mode === "new-habit" ? onClose : undefined}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col items-center gap-6 px-10 py-12 rounded-3xl border"
        style={{
          backgroundColor: cardBg,
          color: text,
          /* Highlights the crisp edge of the card */
          borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",

          /* The magic: Center-spread accent glow + deep floating shadow */
          boxShadow: isDark
            ? `0 0 50px ${accent}20, 0 20px 40px rgba(0, 0, 0, 0.8)`
            : `0 0 40px ${accent}30, 0 20px 40px rgba(0, 0, 0, 0.15)`
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
            autoFocus
          />

          {/* Categories */}
          <div className="flex justify-center gap-2">
            {categories.map((cat) => {
              const active = category === cat;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className="px-3 py-1 rounded-full text-xs transition"
                  style={{
                    border: `1px solid ${isDark ? "#444" : "#cbd5e1"
                      }`,
                    backgroundColor: active
                      ? isDark
                        ? "#3a3a3a"
                        : "#e5e7eb"
                      : "transparent",
                    color: active ? accent : subText
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <button
            type="submit"
            className="py-2 rounded-xl font-medium transition"
            style={{
              color: accent,
              border: `1px solid ${isDark ? "#444" : "#cbd5e1"
                }`
            }}
          >
            {mode === "onboarding" ? "Start" : "Create"}
          </button>
        </form>

        {mode === "new-habit" && (
          <button
            onClick={onClose}
            className="text-sm opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
