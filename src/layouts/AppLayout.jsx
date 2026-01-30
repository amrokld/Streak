import { useState } from "react";
import Header from "../components/Header";
import { useTheme } from "../Context/ThemeContext";
import { useHabits } from "../Context/HabitContext";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  const { isDark } = useTheme();
  const { habits } = useHabits();
  const [showNewHabit, setShowNewHabit] = useState(false);

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{
        backgroundColor: isDark ? "#1f1f1f" : "#f2f4f8",
        color: isDark ? "#ffffff" : "#1a1a1a"
      }}
    >
      <Header
        habits={habits}
        onNewHabit={() => setShowNewHabit(true)}
      />

      <main className="px-6">
        <Outlet context={{ showNewHabit, setShowNewHabit }} />
      </main>
    </div>
  );
}
