import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useOutletContext } from "react-router-dom";
import { useHabits } from "../Context/HabitContext";
import HabitCard from "../components/HabitCard";
import { useTheme } from "../Context/ThemeContext";
import Onboarding from "./Onboarding";
import ConfirmModal from "../components/ConfirmModel";

export default function Home() {
  const { habits, deleteHabit, updateHabit } = useHabits();
  const { showNewHabit, setShowNewHabit } = useOutletContext();
  const { theme } = useTheme();

  const isDark = theme === "dark";
  const accent = isDark ? "#d4af37" : "#2563eb";
  const subText = isDark ? "#aaa" : "#6b7280";

  const [habitToDelete, setHabitToDelete] = useState(null);
  const [habitToEdit, setHabitToEdit] = useState(null);

  const forceCloseCards = Boolean(habitToDelete || habitToEdit);

  /* ---------- USERNAME ---------- */
  const [username, setUsername] = useState(
    localStorage.getItem("username") || ""
  );
  const [showNamePrompt, setShowNamePrompt] = useState(false);

  useEffect(() => {
    if (!username) setShowNamePrompt(true);
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
    <div className="flex justify-center mt-16 pb-24 animate-fade-in">
      <div className="w-full max-w-6xl px-2">

        {/* ---------- NAME PROMPT ---------- */}
        {showNamePrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className={`absolute inset-0 ${isDark ? "bg-black/60" : "bg-black/30"
                }`}
            />
            <div
              className="relative w-full max-w-sm rounded-3xl px-8 py-10 text-center"
              style={{
                backgroundColor: isDark ? "#2a2a2a" : "#ffffff",
                color: isDark ? "#ffffff" : "#1a1a1a"
              }}
            >
              <h2 className="text-2xl font-bold mb-2" style={{ color: accent }}>
                What should I call you?
              </h2>

              <p className="text-sm mb-6" style={{ color: subText }}>
                This is asked once.
              </p>

              <input
                autoFocus
                type="text"
                placeholder="Your name"
                className="w-full mb-6 px-4 py-2 rounded text-center outline-none"
                style={{
                  backgroundColor: isDark ? "#3a3a3a" : "#e5e7eb",
                  color: isDark ? "#fff" : "#1a1a1a"
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
                className="w-full py-2 rounded-xl font-medium"
                style={{
                  color: accent,
                  border: `1px solid ${isDark ? "#444" : "#cbd5e1"}`
                }}
                onClick={() => {
                  const value = document.querySelector("input")?.value.trim();
                  if (value) {
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
        <motion.div
          layout
          className={
            habits.length === 0
              ? "flex flex-col items-center justify-center mt-32 mb-16"
              : "mb-6 flex flex-col items-start"
          }
        >
          <motion.h2
            layout
            className={habits.length === 0 ? "text-4xl md:text-5xl font-bold text-center" : "text-2xl font-medium"}
          >
            {getGreeting()}
            {username && `, ${username}!`}
          </motion.h2>
          <motion.p
            layout
            className={habits.length === 0 ? "text-lg text-center mt-3" : "text-sm mt-1"}
            style={{ color: subText }}
          >
            It's nice to see you again
          </motion.p>
        </motion.div>


        {/* ---------- CATEGORY FILTERS ---------- */}
        <div className="flex gap-3 mb-6">
          {["important", "urgent", "optional"].filter((cat) => habits.some((h) => h.category === cat)).map((cat) => {
            const active = activeCategories.includes(cat);
            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className="px-4 py-1 rounded-full text-sm"
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
            .filter((h) =>
              activeCategories.length === 0
                ? true
                : activeCategories.includes(h.category)
            )
            .map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onDeleteRequest={setHabitToDelete}
                onEditCategory={setHabitToEdit}
                forceClose={forceCloseCards}
              />
            ))}
        </div>
      </div>

      {/* ---------- DELETE CONFIRM ---------- */}
      {habitToDelete && (
        <ConfirmModal
          title="Delete habit?"
          message={`"${habitToDelete.name}" will be permanently removed.`}
          confirmText="Delete"
          onCancel={() => setHabitToDelete(null)}
          onConfirm={() => {
            deleteHabit(habitToDelete.id);
            setHabitToDelete(null);
          }}
        />
      )}

      {habitToEdit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            backgroundColor: isDark
              ? "rgba(0,0,0,0.6)"
              : "rgba(0,0,0,0.3)"
          }}
          onClick={() => setHabitToEdit(null)}
        >
          <div
            className="rounded-3xl px-8 py-6 w-80"
            style={{
              backgroundColor: isDark ? "#2a2a2a" : "#ffffff",
              color: isDark ? "#ffffff" : "#1a1a1a"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-medium mb-4">
              Change category
            </h3>

            <div className="flex flex-col gap-3">
              {["important", "urgent", "optional"].map((cat) => (
                <button
                  key={cat}
                  className="py-2 rounded-xl transition"
                  style={{
                    backgroundColor:
                      habitToEdit.category === cat
                        ? isDark ? "#3a3a3a" : "#e5e7eb"
                        : isDark ? "#333" : "#f3f4f6",
                    color:
                      habitToEdit.category === cat
                        ? accent
                        : isDark ? "#fff" : "#1a1a1a"
                  }}
                  onClick={() => {
                    updateHabit(habitToEdit.id, { category: cat });
                    setHabitToEdit(null);
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              className="mt-4 text-sm opacity-60"
              onClick={() => setHabitToEdit(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
