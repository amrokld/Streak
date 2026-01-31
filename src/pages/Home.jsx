import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useHabits } from "../Context/HabitContext";
import HabitCard from "../components/HabitCard";
import { useTheme } from "../Context/ThemeContext";
import Onboarding from "./Onboarding";

export default function Home() {
  const { habits, addHabit } = useHabits();
  const { showNewHabit, setShowNewHabit } = useOutletContext();
  const { theme } = useTheme();
  
  const isDark = theme === "dark";
  const accent = isDark ? "#d4af37" : "#2563eb";
  const subText = isDark ? "#aaa" : "#6b7280";


  const [name, setName] = useState("");
  const [category, setCategory] = useState("important");
  const [activeCategories, setActiveCategories] = useState([]);

  const handleCreate = () => {
    if (!name.trim()) return;
    if (habits.length >= 10) return;

    const newHabit = {
      id: Date.now(),
      name: name.trim(),
      category,
      streak: 0,
      longestStreak: 0,
      completedDays: [],
      lastCheck: null
    };

    addHabit(newHabit);
    setName("");
    setCategory("important");
    setShowNewHabit(false);
  };

  const toggleCategory = (cat) => {
    setActiveCategories(prev =>
      prev.includes(cat)
      ? prev.filter(c => c !== cat)
      : [...prev, cat]
    );
  };

  return (
    <div className="flex justify-center mt-28">
      <div className="w-full max-w-6xl px-2">

        {/* Category filters */}
        <div className="flex gap-3 mb-6">
          {["important", "urgent", "optional"].map(cat => {
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

        {/* Habits grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {showNewHabit && (
            <Onboarding
              mode="new-habit"
              onClose={() => setShowNewHabit(false)}
            />
          )}

          {habits
            .filter(habit =>
              activeCategories.length === 0
                ? true
                : activeCategories.includes(habit.category)
            )
            .map(habit => (
              <HabitCard key={habit.id} habit={habit} />
            ))}
        </div>

      </div>
    </div>
  );

}
