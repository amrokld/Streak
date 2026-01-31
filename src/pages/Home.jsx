import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useHabits } from "../Context/HabitContext";
import HabitCard from "../components/HabitCard";
import { useTheme } from "../Context/ThemeContext";
import Onboarding from "./Onboarding";

export default function Home() {
  const { habits } = useHabits();
  const { showNewHabit, setShowNewHabit } = useOutletContext();
  const { theme } = useTheme();

  const isDark = theme === "dark";
  const accent = isDark ? "#d4af37" : "#2563eb";
  const subText = isDark ? "#aaa" : "#6b7280";

  /* ---------- USERNAME STATE (FIXED) ---------- */
  const [username, setUsername] = useState(
    localStorage.getItem("username") || ""
  );
  const [showNamePrompt, setShowNamePrompt] = useState(false);

  useEffect(() => {
    if (!username) {
      setShowNamePrompt(true);
    }
  }, [username]);

  /* ---------- CATEGORY FILTER ---------- */
  const [activeCategories, setActiveCategories] = useState([]);

  const toggleCategory = (cat) => {
    setActiveCategories((prev) =>
      prev.includes(cat)
        ? prev.filter((c) => c !== cat)
        : [...prev, cat]
    );
  };

  /* ---------- GREETING ---------- */
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="flex justify-center mt-16 lg:mt-20 pb-20 lg:pb-28">
      <div className="w-full max-w-6xl px-2">

        {/* ---------- NAME PROMPT ---------- */}
        {showNamePrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className={`absolute inset-0 ${
                isDark ? "bg-black/60" : "bg-black/30"
              }`}
            />

            <div
              className="relative w-full max-w-sm rounded-3xl px-8 py-10 text-center"
              style={{
                backgroundColor: isDark ? "#2a2a2a" : "#ffffff",
                color: isDark ? "#ffffff" : "#1a1a1a"
              }}
            >
              <h2
                className="text-2xl font-bold mb-2"
                style={{ color: accent }}
              >
                What should I call you?
              </h2>

              <p className="text-sm mb-6" style={{ color: subText }}>
                Usernames will be asked once only!
              </p>

              <input
                id="username-input"
                autoFocus
                type="text"
                placeholder="Your name"
                className="w-full mb-6 px-4 py-2 rounded outline-none text-center"
                style={{
                  backgroundColor: isDark ? "#3a3a3a" : "#e5e7eb",
                  color: isDark ? "#ffffff" : "#1a1a1a"
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.target.value.trim()) {
                    const value = e.target.value.trim();
                    localStorage.setItem("username", value);
                    setUsername(value);
                    setShowNamePrompt(false);
                  }
                }}
              />

              <button
                className="w-full py-2 rounded-xl font-medium transition"
                style={{
                  color: accent,
                  border: `1px solid ${isDark ? "#444" : "#cbd5e1"}`
                }}
                onClick={() => {
                  const input = document.getElementById("username-input");
                  if (input?.value.trim()) {
                    const value = input.value.trim();
                    localStorage.setItem("username", value);
                    setUsername(value);
                    setShowNamePrompt(false);
                  }
                }}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ---------- GREETING ---------- */}
        <div className="mb-6">
          <h2
            className="text-2xl font-medium"
            style={{ color: isDark ? "#ffffff" : "#1a1a1a" }}
          >
            {getGreeting()}
            {username ? `, ${username}!` : ""}
          </h2>

          <p className="text-sm mt-1" style={{ color: subText }}>
            It's nice to see you again
          </p>
        </div>

        {/* ---------- CATEGORY FILTERS ---------- */}
        <div className="flex gap-3 mb-6">
          {["important", "urgent", "optional"].map((cat) => {
            const active = activeCategories.includes(cat);

            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className="px-4 py-1 rounded-full text-sm transition whitespace-nowrap"
                style={{
                  border: `1px solid ${isDark ? "#444" : "#cbd5e1"}`,
                  backgroundColor: active
                    ? isDark ? "#3a3a3a" : "#e5e7eb"
                    : "transparent",
                  color: active ? accent : subText
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* ---------- HABITS GRID ---------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {showNewHabit && (
            <Onboarding
              mode="new-habit"
              onClose={() => setShowNewHabit(false)}
            />
          )}

          {habits
            .filter((habit) =>
              activeCategories.length === 0
                ? true
                : activeCategories.includes(habit.category)
            )
            .map((habit) => (
              <HabitCard key={habit.id} habit={habit} />
            ))}
        </div>

      </div>
    </div>
  );
}
