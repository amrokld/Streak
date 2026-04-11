import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Header from "../components/Header";
import { useTheme } from "../Context/ThemeContext";
import { useHabits } from "../Context/HabitContext";


export default function AppLayout() {
  const { isDark } = useTheme();
  const { habits } = useHabits();
  const [showNewHabit, setShowNewHabit] = useState(false);

  const location = useLocation();

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
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet context={{ showNewHabit, setShowNewHabit }} />
        </motion.div>
      </main>


    </div>
  );
}
