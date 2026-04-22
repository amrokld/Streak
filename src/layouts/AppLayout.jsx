import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "../components/Header";
import { useTheme } from "../Context/ThemeContext";
import { useHabits } from "../Context/HabitContext";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { getTokens } from "../theme/tokens";
import { useLanguage } from "../Context/LanguageContext";
import { useReminderScheduler } from "../hooks/useReminderScheduler";
import IntroFlow from "../starting/IntroFlow";

export default function AppLayout() {
  const { isDark } = useTheme();
  const { habits } = useHabits();
  const [showNewHabit, setShowNewHabit] = useState(false);
  const { t } = useLanguage();

  const location = useLocation();
  const navigate = useNavigate();

  const { accent, subText } = getTokens(isDark);

  const [remindersEnabled, setRemindersEnabled] = useState(
    localStorage.getItem(STORAGE_KEYS.reminders) === "true"
  );
  const [reminderTime, setReminderTime] = useState(
    localStorage.getItem(STORAGE_KEYS.reminderTime) || "20:00"
  );

  const [showIntro, setShowIntro] = useState(() => {
    return localStorage.getItem("onboarding_done") !== "true";
  });

  useReminderScheduler(habits, remindersEnabled, reminderTime);

  const buildReminderMessage = (pendingHabits) => {
    const priorityOrder = { urgent: 0, important: 1, optional: 2 };
    const sorted = [...pendingHabits].sort(
      (a, b) => (priorityOrder[a.category] ?? 1) - (priorityOrder[b.category] ?? 1)
    );
    const count = sorted.length;
    if (count === 1) return `"${sorted[0].name}" is still pending today. Keep your streak alive!`;
    const topName = sorted[0].name;
    return `${count} habits pending — starting with "${topName}". Don't break your streak!`;
  };

  // Add this useEffect inside AppLayout(), replacing the single useReminderScheduler(habits) line:
  useEffect(() => {
    const onStorage = () => {
      setRemindersEnabled(localStorage.getItem(STORAGE_KEYS.reminders) === "true");
      setReminderTime(localStorage.getItem(STORAGE_KEYS.reminderTime) || "20:00");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

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

      {showIntro && (
        <IntroFlow
          onFinish={() => {
            localStorage.setItem("onboarding_done", "true");
            setShowIntro(false);
          }}
          onOpenNewHabit={() => setShowNewHabit(true)}
          isModalOpen={showNewHabit}
        />
      )}
    </div>
  );
}
