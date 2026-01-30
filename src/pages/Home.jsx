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

  const [name, setName] = useState("");
  const [category, setCategory] = useState("important");

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

  return (
    <div className="flex justify-center mt-28">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">

        {showNewHabit && (
          <Onboarding
            mode="new-habit"
            onClose={() => setShowNewHabit(false)}
          />
        )}

        {habits.map(habit => (
          <HabitCard key={habit.id} habit={habit} />
        ))}
      </div>
    </div>
  );
}
