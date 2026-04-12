import { useTheme } from "../Context/ThemeContext";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { formatDate } from "../utils/dateHelpers";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { getTokens } from "../theme/tokens";
import { useLanguage } from "../Context/LanguageContext";

export default function Statistics() {
  const { isDark } = useTheme();
  const { accent } = getTokens(isDark);
  const { t, lang } = useLanguage();

  const habits = JSON.parse(localStorage.getItem(STORAGE_KEYS.habits)) || [];

  // ==================== STATS CALCULATIONS ====================

  const totalHabits = habits.length;

  const totalActiveStreaks = habits.reduce(
    (sum, h) => sum + (h.streak || 0),
    0
  );

  const longestStreak = Math.max(
    0,
    ...habits.map(h => h.longestStreak || 0)
  );

  const totalCheckIns = habits.reduce(
    (sum, h) => sum + (h.completedDays?.length || 0),
    0
  );

  // Weekly Consistency & Activity Row
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return formatDate(d);
  });

  const weeklyActivity = last7Days.map((dateStr) => {
    return habits.some((h) =>
      h.completedDays?.includes(dateStr)
    );
  });

  const consistencyCount = weeklyActivity.filter(Boolean).length;
  const consistencyPercentage = Math.round((consistencyCount / 7) * 100);

  // Best and Weakest Habit
  let bestHabit = null;
  let weakestHabit = null;

  if (habits.length > 0) {
    const sortedHabits = [...habits].sort((a, b) => (b.streak || 0) - (a.streak || 0));
    bestHabit = sortedHabits[0];

    const weakestSorted = [...habits].sort((a, b) => {
      if ((a.streak || 0) !== (b.streak || 0)) {
        return (a.streak || 0) - (b.streak || 0);
      }
      return (a.completedDays?.length || 0) - (b.completedDays?.length || 0);
    });
    weakestHabit = weakestSorted[0];
  }

  // Active Days This Month
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const uniqueActiveDaysThisMonth = new Set();
  habits.forEach((h) => {
    h.completedDays?.forEach((dateStr) => {
      if (dateStr.startsWith(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`)) {
        uniqueActiveDaysThisMonth.add(dateStr);
      }
    });
  });
  const activeDaysMonthCount = uniqueActiveDaysThisMonth.size;

  let weakestHabitMessage = "";
  if (weakestHabit) {
    const hasActivityThisWeek = last7Days.some(dateStr =>
      weakestHabit.completedDays?.some(d => d.startsWith(dateStr))
    );
    weakestHabitMessage = hasActivityThisWeek ? t("needsLove") : t("noActivityWeek");
  }

  const isTodayCompleted = weeklyActivity[6];

  // ==================== CALENDAR STATE ====================

  const [calDate, setCalDate] = useState(new Date());
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

  // Calendar derived state
  const calYear = calDate.getFullYear();
  const calMonth = calDate.getMonth();
  const monthKeys = ["monthJanuary", "monthFebruary", "monthMarch", "monthApril", "monthMay", "monthJune", "monthJuly", "monthAugust", "monthSeptember", "monthOctober", "monthNovember", "monthDecember"];
  const dayKeys = ["daySu", "dayMo", "dayTu", "dayWe", "dayTh", "dayFr", "daySa"];

  const prevMonth = () => setCalDate(new Date(calYear, calMonth - 1, 1));
  const nextMonth = () => setCalDate(new Date(calYear, calMonth + 1, 1));
  const goToToday = () => setCalDate(new Date());

  // Calendar filter
  const filteredHabits = selectedHabitId === "all"
    ? habits
    : habits.filter((h) => h.id === Number(selectedHabitId));

  // Activity map
  const activityMap = {};
  const dayHabitNames = {};

  filteredHabits.forEach((h) => {
    h.completedDays?.forEach((day) => {
      activityMap[day] = (activityMap[day] || 0) + 1;
      if (!dayHabitNames[day]) dayHabitNames[day] = [];
      dayHabitNames[day].push(h.name);
    });
  });

  // Calendar grid
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(calYear, calMonth, 1).getDay();
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => `blank-${i}`);
  const calDays = Array.from({ length: daysInMonth }, (_, i) =>
    formatDate(new Date(calYear, calMonth, i + 1))
  );

  const getOpacity = (count) => {
    if (count === 1) return 0.5;
    if (count === 2) return 0.75;
    if (count >= 3) return 1;
    return 1;
  };

  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  // ==================== RENDER ====================

  return (
    <div className="max-w-xl mx-auto mt-20 flex flex-col gap-8 pb-10 animate-fade-in">

      {/* HEADER WITH TODAY STATUS */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold" style={{ color: accent }}>
          {t("statistics")}
        </h1>
        <div
          className="flex items-center gap-2 text-xs font-bold px-4 py-1.5 rounded-full border transition-all duration-300 shadow-sm"
          style={{
            backgroundColor: isTodayCompleted ? "rgba(34,197,94,0.05)" : "rgba(239,68,68,0.05)",
            borderColor: isTodayCompleted ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)",
            color: isTodayCompleted ? "#22c55e" : "#ef4444"
          }}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${isTodayCompleted ? "bg-[#22c55e]" : "bg-[#ef4444]"} animate-pulse`} style={{ boxShadow: `0 0 8px ${isTodayCompleted ? "#22c55e" : "#ef4444"}` }} />
          <span>{t("todayLabel")}: {isTodayCompleted ? t("completed") : t("notCompleted")}</span>
        </div>
      </div>


      {/* OVERVIEW */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold opacity-80">{t("overview")}</h2>
        <div className="grid grid-cols-2 gap-4">
          <StatCard label={t("totalHabits")} value={totalHabits} accent={accent} />
          <StatCard label={t("activeStreaks")} value={totalActiveStreaks} accent={accent} />
          <StatCard label={t("longestStreak")} value={longestStreak} accent={accent} />
          <StatCard label={t("totalCheckIns")} value={totalCheckIns} accent={accent} />
          <StatCard label={t("activeDaysMonth")} value={activeDaysMonthCount} accent={accent} />
        </div>
      </section>

      {/* CONSISTENCY */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold opacity-80">{t("consistency")}</h2>
        <div
          className="rounded-xl p-5 flex flex-col gap-4"
          style={{ backgroundColor: isDark ? "#2a2a2a" : "#ffffff", color: isDark ? "#ffffff" : "#1a1a1a" }}
        >
          <div className="flex flex-col gap-1">
            <span className="font-medium text-sm">
              {t("consistency")}: <span style={{ color: accent, fontSize: "1.25rem", fontWeight: "bold", marginLeft: "4px" }}>{consistencyPercentage}%</span>
            </span>
            <p className="text-sm opacity-60">{t("showedUp").replace("{count}", consistencyCount)}</p>
          </div>

          <div className="flex justify-between mt-3">
            {weeklyActivity.map((isActive, index) => (
              <div
                key={index}
                className="w-8 h-8 rounded-full transition-all"
                style={{
                  backgroundColor: isActive ? accent : (isDark ? "#3f3f3f" : "#e5e7eb"),
                  opacity: isActive ? 1 : 0.2
                }}
              />
            ))}
          </div>
        </div>
      </section>


      {/* INSIGHTS */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold opacity-80">{t("insights")}</h2>
        <div className="grid grid-cols-1 gap-4">
          <div
            className="rounded-xl p-5 flex flex-col gap-1 border-l-4"
            style={{ backgroundColor: isDark ? "#2a2a2a" : "#ffffff", color: isDark ? "#ffffff" : "#1a1a1a", borderColor: "#4ade80" }}
          >
            <span className="text-sm opacity-60">{t("bestHabit")}</span>
            {bestHabit ? (
              <span className="font-medium text-lg">
                {bestHabit.name} <span className="opacity-60 text-sm">({bestHabit.streak || 0} {t("days")})</span>
              </span>
            ) : (
              <span className="opacity-50 italic">{t("noDataYet")}</span>
            )}
          </div>

          <div
            className="rounded-xl p-5 flex flex-col gap-1 border-l-4"
            style={{ backgroundColor: isDark ? "#2a2a2a" : "#ffffff", color: isDark ? "#ffffff" : "#1a1a1a", borderColor: "#f87171" }}
          >
            <span className="text-sm opacity-60">{t("needsAttention")}</span>
            {weakestHabit ? (
              <span className="font-medium text-lg">{weakestHabit.name}</span>
            ) : (
              <span className="opacity-50 italic">{t("noDataYet")}</span>
            )}
          </div>
        </div>
      </section>


      {/* ==================== ACTIVITY CALENDAR ==================== */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold opacity-80">{t("activityCalendar")}</h2>

          {/* Habit filter dropdown */}
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

        {/* Calendar Card */}
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
            >
              <span className="font-bold text-lg tracking-wide uppercase">{t(monthKeys[calMonth])}</span>
              <span className="text-xs opacity-50">{calYear}</span>
            </div>

            <button
              onClick={nextMonth}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:backdrop-brightness-75 transition-all text-xl"
              style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)" }}
            >
              ›
            </button>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-2 mb-4 text-center border-b pb-3" style={{ borderColor: isDark ? "#3f3f3f" : "#e5e7eb" }}>
            {dayKeys.map((dk) => (
              <div key={dk} className="text-[10px] md:text-xs font-semibold opacity-40 uppercase tracking-widest">
                {t(dk)}
              </div>
            ))}
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 gap-1.5 md:gap-3">
            {blanks.map((b) => (
              <div key={b} className="aspect-square w-full"></div>
            ))}

            {calDays.map((day) => {
              const count = activityMap[day] || 0;
              const isToday = day === formatDate(today);
              const hasActivity = count > 0;

              const cellDate = new Date(day);
              const isPast = cellDate < todayDateOnly;
              const isMissed = isPast && !hasActivity;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className="aspect-square w-full max-w-[2.8rem] mx-auto flex items-center justify-center rounded-lg text-sm select-none transition-all duration-200 cursor-pointer hover:scale-105"
                  style={{
                    backgroundColor: hasActivity ? accent : (isDark ? "#3f3f3f" : "#f3f4f6"),
                    opacity: hasActivity ? getOpacity(count) : (isMissed ? 0.3 : 1),
                    color: hasActivity ? (isDark ? "#1a1a1a" : "#ffffff") : "inherit",
                    fontWeight: hasActivity || isToday ? "bold" : "normal",
                    outline: isToday ? `2px solid ${accent}` : "none",
                    outlineOffset: "3px",
                    boxShadow: isToday ? `0 0 10px ${accent}40` : "none"
                  }}
                  title={hasActivity ? `${count} ${count === 1 ? t("habitCompleted") : t("habitsCompleted")}` : t("noActivity")}
                >
                  {cellDate.getDate()}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* DAY DETAILS MODAL */}
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
            onClick={e => e.stopPropagation()}
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


function StatCard({ label, value, accent }) {
  const { isDark } = useTheme();

  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-2"
      style={{
        backgroundColor: isDark ? "#2a2a2a" : "#ffffff",
        color: isDark ? "#ffffff" : "#1a1a1a"
      }}
    >
      <span className="text-sm opacity-60">{label}</span>
      <span
        className="text-3xl font-bold"
        style={{ color: accent }}
      >
        {value}
      </span>
    </div>
  );
}
