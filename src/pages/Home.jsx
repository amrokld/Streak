import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useOutletContext } from "react-router-dom";
import { createPortal } from "react-dom";
import { useHabits } from "../Context/HabitContext";
import HabitCard from "../components/HabitCard";
import { useTheme } from "../Context/ThemeContext";
import Onboarding from "./Onboarding";
import ConfirmModal from "../components/ConfirmModel";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { getTokens } from "../theme/tokens";

export default function Home() {
  const { habits, deleteHabit, updateHabit } = useHabits();
  const { showNewHabit, setShowNewHabit } = useOutletContext();
  const { theme } = useTheme();

  const isDark = theme === "dark";
  const { accent, subText } = getTokens(isDark);

  const [habitToDelete, setHabitToDelete] = useState(null);
  const [habitToEdit, setHabitToEdit] = useState(null);

  const forceCloseCards = Boolean(habitToDelete || habitToEdit);

  /* ---------- USERNAME ---------- */
  const username = localStorage.getItem(STORAGE_KEYS.username) || "";

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
            {habits.length === 0
              ? "Welcome! Ready to build some streaks?"
              : "It's nice to see you again"}
          </motion.p>
        </motion.div>


        {/* ---------- CATEGORY FILTERS ---------- */}
        <div className="flex gap-3 mb-6">
          {["important", "urgent", "optional"].filter((cat) => habits.some((h) => h.category === cat)).map((cat) => {
            const active = activeCategories.includes(cat);
            const colors = {
              urgent: "#ef4444",
              important: "#f59e0b",
              optional: "#22c55e"
            };
            const color = colors[cat];

            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className="px-4 py-1 rounded-full text-sm font-bold capitalize transition-all"
                style={{
                  border: `1px solid ${active ? color : (isDark ? "#444" : "#cbd5e1")}`,
                  backgroundColor: active ? (isDark ? `${color}15` : `${color}10`) : "transparent",
                  color: active ? color : subText
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

      {habitToEdit && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-md animate-fade-in transition-all duration-300"
          style={{
            backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.1)"
          }}
          onClick={() => setHabitToEdit(null)}
        >
          <div
            className="rounded-3xl px-10 py-10 w-96 border flex flex-col items-center"
            style={{
              backgroundColor: isDark ? "#2a2a2a" : "#ffffff",
              color: isDark ? "#ffffff" : "#1a1a1a",
              borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
              boxShadow: isDark
                ? `0 0 50px ${accent}20, 0 20px 40px rgba(0, 0, 0, 0.8)`
                : `0 0 40px ${accent}30, 0 20px 40px rgba(0, 0, 0, 0.15)`
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold mb-8" style={{ color: accent }}>
              Change category
            </h3>

            <div className="flex flex-col items-center gap-3 w-full">
              {["urgent", "important", "optional"].map((cat) => {
                const colors = {
                  urgent: "#ef4444",
                  important: "#f59e0b",
                  optional: "#22c55e"
                };
                const active = habitToEdit.category === cat;
                const color = colors[cat];

                return (
                  <button
                    key={cat}
                    className="relative block w-full py-2.5 rounded-xl font-bold overflow-hidden transition-all duration-200 active:scale-95 group"
                    style={{
                      backgroundColor: active ? color : "transparent",
                      color: active ? (isDark ? "#000" : "#fff") : color,
                      border: `1px solid ${active ? "transparent" : color}`
                    }}
                    onClick={() => {
                      updateHabit(habitToEdit.id, { category: cat });
                      setHabitToEdit(null);
                    }}
                  >
                    {!active && (
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-0 pointer-events-none" style={{ backgroundColor: color }} />
                    )}
                    {!active && (
                      <span
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none capitalize"
                        style={{ color: isDark ? "#000" : "#fff" }}
                      >
                        {cat}
                      </span>
                    )}
                    <span className={`relative z-10 block capitalize ${!active ? "group-hover:opacity-0 transition-opacity duration-200" : ""}`}>
                      {cat}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              className="mt-8 text-sm font-medium opacity-50 hover:opacity-100 transition"
              onClick={() => setHabitToEdit(null)}
            >
              Cancel
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
