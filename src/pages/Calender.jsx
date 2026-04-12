import { useTheme } from "../Context/ThemeContext";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { formatDate } from "../utils/dateHelpers";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { getTokens } from "../theme/tokens";
import { useLanguage } from "../Context/LanguageContext";

export default function Calendar() {
  const { isDark } = useTheme();
  const { accent } = getTokens(isDark);
  const { t, lang } = useLanguage();

  // Load all habits
  const habits = JSON.parse(localStorage.getItem(STORAGE_KEYS.habits)) || [];

  // STATE
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedHabitId, setSelectedHabitId] = useState("all");
  const [selectedDay, setSelectedDay] = useState(null);

  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilterMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Derived Month State
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-11
  const monthKeys = ["monthJanuary", "monthFebruary", "monthMarch", "monthApril", "monthMay", "monthJune", "monthJuly", "monthAugust", "monthSeptember", "monthOctober", "monthNovember", "monthDecember"];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  // FILTER LOGIC
  const filteredHabits = selectedHabitId === "all"
    ? habits
    : habits.filter((h) => h.id === Number(selectedHabitId));

  // Build Activity Map dynamically based on filtered habits
  const activityMap = {};
  const dayHabitNames = {}; // Keeps track of exactly which habits were done for the Modal

  filteredHabits.forEach((h) => {
    h.completedDays?.forEach((day) => {
      activityMap[day] = (activityMap[day] || 0) + 1;
      if (!dayHabitNames[day]) dayHabitNames[day] = [];
      dayHabitNames[day].push(h.name);
    });
  });

  // Calendar Grid Math
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // Matches Mon/Tue...
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => `blank-${i}`);
  const days = Array.from({ length: daysInMonth }, (_, i) =>
    formatDate(new Date(year, month, i + 1))
  );

  const dayKeys = ["daySu", "dayMo", "dayTu", "dayWe", "dayTh", "dayFr", "daySa"];

  // Heatmap Logic
  const getOpacity = (count) => {
    if (count === 1) return 0.5; // Light completion
    if (count === 2) return 0.75; // Medium completion
    if (count >= 3) return 1; // High completion
    return 1;
  };

  // Helper for missed days logic
  const today = new Date();
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <div className="max-w-xl mx-auto mt-12 flex flex-col items-center gap-6 pb-12 animate-fade-in px-4 md:px-0">

      {/* 1. HEADER & HABIT FILTER */}
      <div className="w-full flex justify-between items-center px-2">
        <h1 className="text-3xl font-bold" style={{ color: accent }}>
          {t("calendar")}
        </h1>

        {habits.length > 0 && (
          <div className="relative" ref={filterRef}>
            <div
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="flex items-center justify-between gap-3 px-4 py-2 rounded-xl text-sm font-medium outline-none cursor-pointer border transition-colors select-none"
              style={{
                backgroundColor: showFilterMenu ? (isDark ? "#444" : "#e2e8f0") : (isDark ? "#2a2a2a" : "#ffffff"),
                borderColor: showFilterMenu ? accent : (isDark ? "#3f3f3f" : "#e5e7eb"),
                color: isDark ? "#ffffff" : "#1a1a1a",
              }}
            >
              <span className="truncate max-w-[140px]">
                {selectedHabitId === "all" ? t("allHabits") : habits.find(h => String(h.id) === String(selectedHabitId))?.name || t("unknown")}
              </span>
              <motion.svg animate={{ rotate: showFilterMenu ? 180 : 0 }} className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </motion.svg>
            </div>

            <AnimatePresence>
              {showFilterMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-12 right-0 w-56 p-2 rounded-3xl border shadow-2xl z-50 overflow-hidden flex flex-col gap-1 max-h-64 overflow-y-auto"
                  style={{ backgroundColor: isDark ? "#2a2a2a" : "#ffffff", borderColor: isDark ? "#3f3f3f" : "#e5e7eb" }}
                >
                  <div
                    onClick={() => { setSelectedHabitId("all"); setShowFilterMenu(false); }}
                    className="px-4 py-2 text-sm font-bold cursor-pointer transition rounded-xl hover:brightness-110"
                    style={{
                      backgroundColor: selectedHabitId === "all" ? (isDark ? "#333" : "#f1f5f9") : "transparent",
                      color: selectedHabitId === "all" ? accent : (isDark ? "#aaa" : "#6b7280")
                    }}
                  >
                    {t("allHabits")}
                  </div>
                  {habits.map(h => (
                    <div
                      key={h.id}
                      onClick={() => { setSelectedHabitId(String(h.id)); setShowFilterMenu(false); }}
                      className="px-4 py-2 text-sm font-medium cursor-pointer transition rounded-xl hover:brightness-110 truncate"
                      style={{
                        backgroundColor: String(selectedHabitId) === String(h.id) ? (isDark ? "#333" : "#f1f5f9") : "transparent",
                        color: String(selectedHabitId) === String(h.id) ? accent : (isDark ? "#fff" : "#000")
                      }}
                    >
                      {h.name}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* 2. CALENDAR CARD */}
      <div
        className="rounded-xl p-5 md:p-7 shadow-sm w-full"
        style={{
          backgroundColor: isDark ? "#2a2a2a" : "#ffffff",
          color: isDark ? "#ffffff" : "#1a1a1a"
        }}
      >

        {/* Month Navigation */}
        <div className="flex justify-between items-center mb-6 px-2">
          <button
            onClick={prevMonth}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:backdrop-brightness-75 transition-all text-xl"
            style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)" }}
          >
            ‹
          </button>

          <div
            className="flex flex-col items-center cursor-pointer hover:opacity-70 transition-opacity"
            onClick={goToToday}
            title="Click to jump to Today"
          >
            <span className="font-bold text-lg tracking-wide uppercase">{t(monthKeys[month])}</span>
            <span className="text-xs opacity-50">{year}</span>
          </div>

          <button
            onClick={nextMonth}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:backdrop-brightness-75 transition-all text-xl"
            style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)" }}
          >
            ›
          </button>
        </div>

        {/* WEEKDAYS HEADER */}
        <div className="grid grid-cols-7 gap-2 mb-4 text-center border-b pb-3" style={{ borderColor: isDark ? "#3f3f3f" : "#e5e7eb" }}>
          {dayKeys.map((dk) => (
            <div key={dk} className="text-[10px] md:text-xs font-semibold opacity-40 uppercase tracking-widest">
              {t(dk)}
            </div>
          ))}
        </div>

        {/* CALENDAR GRID */}
        <div className="grid grid-cols-7 gap-1.5 md:gap-3">
          {blanks.map((b) => (
            <div key={b} className="aspect-square w-full"></div>
          ))}

          {days.map((day) => {
            const count = activityMap[day] || 0;
            const isToday = day === formatDate(today);
            const hasActivity = count > 0;

            const cellDate = new Date(day);
            const isPast = cellDate < todayDateOnly;

            // Fades out days that have passed and weren't actioned softly
            const isMissed = isPast && !hasActivity;

            return (
              <div
                key={day}
                onClick={() => setSelectedDay(day)}
                className="aspect-square w-full max-w-[2.8rem] mx-auto flex items-center justify-center rounded-lg text-sm select-none transition-all duration-200 cursor-pointer hover:scale-105"
                style={{
                  backgroundColor: hasActivity ? accent : (isDark ? "#3f3f3f" : "#f3f4f6"),
                  opacity: hasActivity ? getOpacity(count) : (isMissed ? 0.3 : 1), // Heavy fade for missed days!
                  color: hasActivity ? (isDark ? "#1a1a1a" : "#ffffff") : "inherit",
                  fontWeight: hasActivity || isToday ? "bold" : "normal",
                  outline: isToday ? `2px solid ${accent}` : "none",
                  outlineOffset: "3px",
                  boxShadow: isToday ? `0 0 10px ${accent}40` : "none" // Nice subtle pop for Today
                }}
                title={hasActivity ? `${count} ${count === 1 ? t("habitCompleted") : t("habitsCompleted")}` : t("noActivity")}
              >
                {cellDate.getDate()}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. DAY DETAILS MODAL OVERLAY */}
      {selectedDay && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in transition-all duration-300"
          style={{ backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.1)" }}
          onClick={() => setSelectedDay(null)}
        >
          <div
            className="rounded-3xl w-full max-w-sm px-8 py-8 flex flex-col gap-5 border transition-all"
            style={{
              backgroundColor: isDark ? "#2a2a2a" : "#ffffff",
              color: isDark ? "#ffffff" : "#1a1a1a",
              borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
              boxShadow: isDark
                ? `0 0 50px ${accent}20, 0 20px 40px rgba(0, 0, 0, 0.8)`
                : `0 0 40px ${accent}30, 0 20px 40px rgba(0, 0, 0, 0.15)`
            }}
            onClick={e => e.stopPropagation()} /* Prevents closing when clicking inside the window */
          >

            {/* Modal Header */}
            <div className="flex justify-between items-start border-b pb-3" style={{ borderColor: isDark ? "#3f3f3f" : "#e5e7eb" }}>
              <h3 className="text-xl font-bold">
                {new Date(selectedDay).toLocaleDateString(lang === "ar" ? "ar-SA" : undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>
              <div
                onClick={() => setSelectedDay(null)}
                className="p-1 cursor-pointer opacity-50 hover:opacity-100 transition-opacity bg-black/5 rounded-full"
              >
                ✕
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase opacity-40 tracking-wider mb-1">
                {t("activity")}
              </span>

              {dayHabitNames[selectedDay]?.length > 0 ? (
                dayHabitNames[selectedDay].map(name => (
                  <div
                    key={name}
                    className="flex items-center gap-3 p-3 rounded-xl text-sm font-medium"
                    style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#f8fafc" }}
                  >
                    <span style={{ color: accent, fontSize: '1.2rem' }}>●</span>
                    <span>{name}</span>
                  </div>
                ))
              ) : (
                <p className="opacity-50 italic text-sm mt-1">{t("noHabitsCompleted")}</p>
              )}
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
