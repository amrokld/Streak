// Home Page
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
import { useLanguage } from "../Context/LanguageContext";
import { isCustomHabitUnscheduled } from "../utils/habitSchedule";

export default function Home() {
  const { habits, deleteHabit, updateHabit } = useHabits();
  const { showNewHabit, setShowNewHabit } = useOutletContext();
  const { theme } = useTheme();
  const { t } = useLanguage();

  const isDark = theme === "dark";
  const { accent, subText } = getTokens(isDark);

  const [habitToDelete, setHabitToDelete] = useState(null);
  const [habitToEdit, setHabitToEdit] = useState(null);

  const forceCloseCards = Boolean(habitToDelete || habitToEdit);

  const [editCategory, setEditCategory] = useState("important");
  const [editFrequency, setEditFrequency] = useState("daily");
  const [editDays, setEditDays] = useState([]);
  const [editName, setEditName] = useState("");
  const [nameExists, setNameExists] = useState(false);
  const [showError, setShowError] = useState(false);
  const [shake, setShake] = useState(false);

  const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const DAY_LABELS = { mon: "M", tue: "T", wed: "W", thu: "T", fri: "F", sat: "S", sun: "S" };

  const toggleEditDay = (day) => {
    setEditDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  useEffect(() => {
    if (habitToEdit) {
      setEditCategory(habitToEdit.category || "important");
      setEditFrequency(habitToEdit.frequency || "daily");
      setEditDays(habitToEdit.days || []);
      setEditName(habitToEdit.name || "");
      setNameExists(false);
    }
  }, [habitToEdit]);


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
    if (hour < 12) return t("goodMorning");
    if (hour < 18) return t("goodAfternoon");
    return t("goodEvening");
  };

  const getTimePeriod = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    if (hour < 21) return "evening";
    return "night";
  };

  const getRandom = (arr) =>
    arr[Math.floor(Math.random() * arr.length)];

  const timePeriod = getTimePeriod();
  const subtext = getRandom(t("homeSubtext")[timePeriod]);

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
              ? t("welcomeMessage")
              : subtext}
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
                {t(cat)}
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
              <div key={habit.id} className="relative">
                <HabitCard
                  habit={habit}
                  onDeleteRequest={setHabitToDelete}
                  onEditCategory={setHabitToEdit}
                  forceClose={forceCloseCards}
                />
                {isCustomHabitUnscheduled(habit) && (
                  <div
                    className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: "#f59e0b22", color: "#f59e0b" }}
                  >
                    No days set
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* ---------- DELETE CONFIRM ---------- */}
      {habitToDelete && (
        <ConfirmModal
          title={t("deleteHabitQ")}
          message={`"${habitToDelete.name}" ${t("willBeRemoved")}`}
          confirmText={t("delete")}
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
              {t("EditHabit") || "Edit Habit"}
            </h3>

            <div className="w-full mb-6 flex flex-col gap-2">
              <p
                className="text-xs font-bold tracking-wider uppercase mb-3 self-start"
                style={{ color: subText }}
              >
                {t("habitName") || "Habit Name"}
              </p>

              <input
                value={editName}
                onChange={(e) => {
                  const value = e.target.value;
                  setEditName(value);

                  const exists = habits.some(
                    h =>
                      h.id !== habitToEdit.id &&
                      h.name.trim().toLowerCase() === value.trim().toLowerCase()
                  );

                  setNameExists(exists);
                }}
                maxLength={40}
                placeholder="Edit habit name..."
                className={`w-full px-3 py-2 rounded-xl text-sm outline-none transition-all duration-200 ${shake ? "animate-shake" : ""}`}
                style={{
                  backgroundColor: isDark ? "#1f1f1f" : "#f3f4f6",
                  color: isDark ? "#fff" : "#000",
                  border: (nameExists || showError)
                    ? "1px solid #ef4444"
                    : isDark
                      ? "1px solid rgba(255,255,255,0.06)"
                      : "1px solid rgba(0,0,0,0.08)",

                  boxShadow: (nameExists || showError)
                    ? "0 0 8px rgba(239,68,68,0.4)"
                    : "none",
                }}
              />

              <p
                className="transition-all duration-200"
                style={{
                  fontSize: "11px",
                  marginTop: nameExists ? "4px" : "0px",
                  color: "#ef4444",
                  fontWeight: 600,
                  opacity: nameExists || showError ? 1 : 0,
                  transform: (nameExists || showError) ? "translateY(0)" : "translateY(-6px)",
                  height: (nameExists || showError) ? "auto" : "0px",
                  overflow: "hidden",
                }}
              >
                {nameExists || showError
                  ? (t("duplicateName") || "This name already exists")
                  : ""}
              </p>
            </div>

            {/* Divider */}
            <div className="w-full h-px mt-4 mb-3" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }} />

            {/* Category label */}
            <p
              className="text-xs font-bold tracking-wider uppercase mb-3 self-start"
              style={{ color: subText }}
            >
              {t("category") || "Category"}
            </p>

            <div className="flex gap-2 mb-2">
              {["important", "urgent", "optional"].map((cat) => {
                const colors = { urgent: "#ef4444", important: "#f59e0b", optional: "#22c55e" };
                const active = editCategory === cat;
                const color = colors[cat];
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setEditCategory(cat)}
                    className="px-4 py-1 rounded-full text-xs transition font-bold capitalize"
                    style={{
                      border: `1px solid ${active ? color : (isDark ? "#444" : "#cbd5e1")}`,
                      backgroundColor: active ? `${color}15` : "transparent",
                      color: color,
                    }}
                  >
                    {t(cat)}
                  </button>
                );
              })}
            </div>

            {/* Divider */}
            <div className="w-full h-px mt-4 mb-3" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }} />

            {/* Schedule section */}
            <p className="text-xs font-bold tracking-wider uppercase mb-3 self-start" style={{ color: subText }}>
              {t("frequency") || "Frequency"}
            </p>

            <div className="flex gap-2 mb-3">
              {["daily", "custom"].map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setEditFrequency(freq)}
                  className="px-4 py-1 rounded-full text-xs font-bold capitalize transition"
                  style={{
                    border: `1px solid ${editFrequency === freq ? accent : (isDark ? "#444" : "#cbd5e1")}`,
                    backgroundColor: editFrequency === freq ? `${accent}15` : "transparent",
                    color: editFrequency === freq ? accent : subText,
                  }}
                >
                  {t(freq) || freq}
                </button>
              ))}
            </div>

            {editFrequency === "custom" && (
              <div className="flex gap-1 mb-3">
                {DAY_KEYS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleEditDay(day)}
                    className="w-8 h-8 rounded-full text-[11px] font-bold transition"
                    style={{
                      border: `1px solid ${editDays.includes(day) ? accent : (isDark ? "#444" : "#cbd5e1")}`,
                      backgroundColor: editDays.includes(day) ? accent : "transparent",
                      color: editDays.includes(day) ? (isDark ? "#000" : "#fff") : subText,
                    }}
                  >
                    {DAY_LABELS[day]}
                  </button>
                ))}
              </div>
            )}

            <button
              className="relative group w-full py-2.5 mt-6 rounded-xl font-bold overflow-hidden transition-all duration-200 active:scale-95"
              style={{
                backgroundColor: "transparent",
                color: accent,
                border: `1px solid ${accent}`,
              }}
              onClick={() => {
                const safeDays = (editFrequency === "custom" && editDays.length === 0) ? [] : editDays;
                if (!editName.trim()) {
                  setEditName(habitToEdit.name);
                }
                if (nameExists) {
                  setShowError(true);
                  setShake(true);

                  setTimeout(() => setShake(false), 400);
                  setTimeout(() => setShowError(false), 2000);

                  return;
                }
                updateHabit(habitToEdit.id, {
                  name: editName.trim() || habitToEdit.name,
                  category: editCategory,
                  frequency: editFrequency,
                  days: safeDays,
                }); setHabitToEdit(null);
              }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-0 pointer-events-none"
                style={{ backgroundColor: accent }}
              />
              <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none" style={{ color: isDark ? "#000" : "#fff" }}>
                {t("save")}
              </span>
              <span className="relative z-10 block group-hover:opacity-0 transition-opacity duration-200">
                {t("save")}
              </span>
            </button>

            <button
              className="mt-8 text-sm font-medium opacity-50 hover:opacity-100 transition"
              onClick={() => setHabitToEdit(null)}
            >
              {t("cancel")}
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
