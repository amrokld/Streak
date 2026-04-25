// Statistics Page
import { useTheme } from "../Context/ThemeContext";
import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { formatDate, getToday } from "../utils/dateHelpers";
import { isHabitScheduledForToday, isCompletedToday } from "../utils/habitSchedule";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { getTokens } from "../theme/tokens";
import { useLanguage } from "../Context/LanguageContext";

export default function Statistics() {
  const { isDark } = useTheme();
  const { accent } = getTokens(isDark);
  const { t, lang } = useLanguage();

  const habits = JSON.parse(localStorage.getItem(STORAGE_KEYS.habits)) || [];
  const [activeTab, setActiveTab] = useState("overview");

  // Header Today calculation
  const isTodayCompleted = useMemo(() => {
    const todayStr = getToday();
    const todaysHabits = habits.filter(h => isHabitScheduledForToday(h));
    if (todaysHabits.length === 0) return false;
    return todaysHabits.every(h => isCompletedToday(h, todayStr));
  }, [habits]);

  return (
    <div className="w-full max-w-3xl px-3 mx-auto mt-14 flex flex-col gap-4 pb-6 animate-fade-in">
      {/* HEADER */}
      <div id="tour-nav-stats" className="flex justify-between items-center">
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

      {/* TABS NAVIGATION */}
      <StatsTabs activeTab={activeTab} setActiveTab={setActiveTab} isDark={isDark} accent={accent} t={t} />

      {/* TAB CONTENT */}
      {activeTab === "overview" && <OverviewTab habits={habits} isDark={isDark} accent={accent} t={t} />}
      {activeTab === "calendar" && <CalendarTab habits={habits} isDark={isDark} accent={accent} t={t} lang={lang} />}
      {activeTab === "heatmap" && <HeatmapTab habits={habits} isDark={isDark} accent={accent} t={t} lang={lang} />}
    </div>
  );
}

// ==================== TABS NAVIGATION COMPONENT ====================
function StatsTabs({ activeTab, setActiveTab, isDark, accent, t }) {
  const tabs = [
    { id: "overview", label: t("overview") || "Overview" },
    { id: "calendar", label: t("activityCalendar") || "Calendar" },
    { id: "heatmap", label: t("heatmap") || "Heatmap" }
  ];

  return (
    <div
      className="flex gap-1 p-1 rounded-xl mb-1 shadow-sm"
      style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)" }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="relative flex-1 py-2.5 text-sm font-bold rounded-xl transition-colors outline-none"
            style={{
              color: isActive ? (isDark ? "#1a1a1a" : "#ffffff") : (isDark ? "#ffffff" : "#1a1a1a"),
              opacity: isActive ? 1 : 0.6
            }}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-xl"
                style={{ backgroundColor: accent }}
                initial={false}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ==================== OVERVIEW TAB ====================
function OverviewTab({ habits, isDark, accent, t }) {
  const stats = useMemo(() => {
    const totalHabits = habits.length;
    const totalActiveStreaks = habits.reduce((sum, h) => sum + (h.streak || 0), 0);
    const longestStreak = Math.max(0, ...habits.map(h => h.longestStreak || 0));
    const totalCheckIns = habits.reduce((sum, h) => sum + (h.completedDays?.length || 0), 0);

    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      return formatDate(d);
    });

    const weeklyActivity = last7Days.map((dateStr) => {
      return habits.some((h) => h.completedDays?.includes(dateStr));
    });

    const consistencyCount = weeklyActivity.filter(Boolean).length;
    const consistencyPercentage = Math.round((consistencyCount / 7) * 100);

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

    return {
      totalHabits, totalActiveStreaks, longestStreak, totalCheckIns, activeDaysMonthCount,
      consistencyPercentage, consistencyCount, weeklyActivity, bestHabit, weakestHabit
    };
  }, [habits]);

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold opacity-80">{t("overview")}</h2>
        <div className="grid grid-cols-2 gap-4">
          <StatCard label={t("totalHabits")} value={stats.totalHabits} accent={accent} isDark={isDark} />
          <StatCard label={t("activeStreaks")} value={stats.totalActiveStreaks} accent={accent} isDark={isDark} />
          <StatCard label={t("longestStreak")} value={stats.longestStreak} accent={accent} isDark={isDark} />
          <StatCard label={t("totalCheckIns")} value={stats.totalCheckIns} accent={accent} isDark={isDark} />
          <StatCard label={t("activeDaysMonth")} value={stats.activeDaysMonthCount} accent={accent} isDark={isDark} />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold opacity-80">{t("consistency")}</h2>
        <div
          className="rounded-xl p-5 flex flex-col gap-4 shadow-sm"
          style={{ backgroundColor: isDark ? "#2a2a2a" : "#ffffff", color: isDark ? "#ffffff" : "#1a1a1a" }}
        >
          <div className="flex flex-col gap-1">
            <span className="font-medium text-sm">
              {t("consistency")}: <span style={{ color: accent, fontSize: "1.25rem", fontWeight: "bold", marginLeft: "4px" }}>{stats.consistencyPercentage || 0}%</span>
            </span>
            <p className="text-sm opacity-60">{t("showedUp").replace("{count}", stats.consistencyCount)}</p>
          </div>

          <div className="flex justify-between mt-3">
            {stats.weeklyActivity.map((isActive, index) => (
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

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold opacity-80">{t("insights")}</h2>
        <div className="grid grid-cols-1 gap-4">
          <div
            className="rounded-xl p-5 flex flex-col gap-1 border-l-4 shadow-sm"
            style={{ backgroundColor: isDark ? "#2a2a2a" : "#ffffff", color: isDark ? "#ffffff" : "#1a1a1a", borderColor: "#4ade80" }}
          >
            <span className="text-sm opacity-60">{t("bestHabit")}</span>
            {stats.bestHabit ? (
              <span className="font-medium text-lg">
                {stats.bestHabit.name} <span className="opacity-60 text-sm">({stats.bestHabit.streak || 0} {t("days")})</span>
              </span>
            ) : (
              <span className="opacity-50 italic">{t("noDataYet")}</span>
            )}
          </div>

          <div
            className="rounded-xl p-5 flex flex-col gap-1 border-l-4 shadow-sm"
            style={{ backgroundColor: isDark ? "#2a2a2a" : "#ffffff", color: isDark ? "#ffffff" : "#1a1a1a", borderColor: "#f87171" }}
          >
            <span className="text-sm opacity-60">{t("needsAttention")}</span>
            {stats.weakestHabit ? (
              <span className="font-medium text-lg">{stats.weakestHabit.name}</span>
            ) : (
              <span className="opacity-50 italic">{t("noDataYet")}</span>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

// ==================== CALENDAR TAB ====================
function CalendarTab({ habits, isDark, accent, t, lang }) {
  const [calDate, setCalDate] = useState(new Date());
  const [selectedHabitId, setSelectedHabitId] = useState("all");
  const [selectedDay, setSelectedDay] = useState(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilterMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const today = useMemo(() => new Date(), []);
  const calYear = calDate.getFullYear();
  const calMonth = calDate.getMonth();
  const monthKeys = ["monthJanuary", "monthFebruary", "monthMarch", "monthApril", "monthMay", "monthJune", "monthJuly", "monthAugust", "monthSeptember", "monthOctober", "monthNovember", "monthDecember"];
  const dayKeys = ["daySu", "dayMo", "dayTu", "dayWe", "dayTh", "dayFr", "daySa"];

  const prevMonth = () => setCalDate(new Date(calYear, calMonth - 1, 1));
  const nextMonth = () => setCalDate(new Date(calYear, calMonth + 1, 1));
  const goToToday = () => setCalDate(new Date());

  const filteredHabits = selectedHabitId === "all"
    ? habits
    : habits.filter((h) => h.id === Number(selectedHabitId));

  const { activityMap, dayHabitNames } = useMemo(() => {
    const map = {};
    const names = {};
    filteredHabits.forEach((h) => {
      h.completedDays?.forEach((day) => {
        map[day] = (map[day] || 0) + 1;
        if (!names[day]) names[day] = [];
        names[day].push(h.name);
      });
    });
    return { activityMap: map, dayHabitNames: names };
  }, [filteredHabits]);

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(calYear, calMonth, 1).getDay();
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => `blank-${i}`);
  const calDays = Array.from({ length: daysInMonth }, (_, i) => formatDate(new Date(calYear, calMonth, i + 1)));

  const getOpacity = (count) => {
    if (count === 1) return 0.5;
    if (count === 2) return 0.75;
    return 1;
  };

  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold opacity-80">{t("activityCalendar")}</h2>

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

      <div
        className="rounded-xl p-4 md:p-5 shadow-sm w-full max-w-2xl mx-auto"
        style={{ backgroundColor: isDark ? "#2a2a2a" : "#ffffff", color: isDark ? "#ffffff" : "#1a1a1a" }}
      >
        <div className="flex justify-between items-center mb-6 px-2">
          <button
            onClick={prevMonth}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:backdrop-brightness-75 transition-all text-xl"
            style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)" }}
          >‹</button>

          <div className="flex flex-col items-center cursor-pointer hover:opacity-70 transition-opacity" onClick={goToToday}>
            <span className="font-bold text-lg tracking-wide uppercase">{t(monthKeys[calMonth])}</span>
            <span className="text-xs opacity-50">{calYear}</span>
          </div>

          <button
            onClick={nextMonth}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:backdrop-brightness-75 transition-all text-xl"
            style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)" }}
          >›</button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4 text-center border-b pb-3" style={{ borderColor: isDark ? "#3f3f3f" : "#e5e7eb" }}>
          {dayKeys.map((dk) => (
            <div key={dk} className="text-[10px] md:text-xs font-semibold opacity-40 uppercase tracking-widest">{t(dk)}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {blanks.map((b) => <div key={b} className="aspect-square w-full"></div>)}

          {calDays.map((day) => {
            const count = activityMap[day] || 0;
            const isToday = day === formatDate(today);
            const hasActivity = count > 0;
            const cellDate = new Date(day);
            const isMissed = cellDate < todayDateOnly && !hasActivity;

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
            <div className="flex justify-between items-start border-b pb-3" style={{ borderColor: isDark ? "#3f3f3f" : "#e5e7eb" }}>
              <h3 className="text-xl font-bold">
                {new Date(selectedDay).toLocaleDateString(lang === "ar" ? "ar-SA" : undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>
              <div onClick={() => setSelectedDay(null)} className="p-1 cursor-pointer opacity-50 hover:opacity-100 transition-opacity bg-black/5 rounded-full">✕</div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase opacity-40 tracking-wider mb-1">{t("activity")}</span>
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

// ==================== HEATMAP TAB ====================
function HeatmapTab({ habits, isDark, accent, t, lang }) {
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: "" });

  const { days, activityMap, todayRef, totalCompleted } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // reset time for exact comparison

    const endDayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)

    // Show 16 weeks (approx 4 months). This safely fits mobile screens horizontally!
    const weeksToShow = 16;
    const daysToShow = weeksToShow * 7;

    const daysUntilNextSaturday = 6 - endDayOfWeek;
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + daysUntilNextSaturday);

    const startD = new Date(endDate);
    startD.setDate(endDate.getDate() - daysToShow + 1);

    const generatedDays = [];
    for (let i = 0; i < daysToShow; i++) {
      const d = new Date(startD);
      d.setDate(startD.getDate() + i);
      generatedDays.push(d);
    }

    const map = {};
    habits.forEach((h) => {
      h.completedDays?.forEach((dayStr) => {
        map[dayStr] = (map[dayStr] || 0) + 1;
      });
    });

    let total = 0;
    generatedDays.forEach(d => {
      const str = formatDate(d);
      if (map[str]) total += map[str];
    });

    return { days: generatedDays, activityMap: map, todayRef: today, totalCompleted: total };
  }, [habits]);

  const getIntensityStyle = (count, isFuture) => {
    if (isFuture) return { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", opacity: 0.4 };
    if (count === 0) return { backgroundColor: isDark ? "#3f3f3f" : "#f3f4f6" };
    
    // Use hex alpha to avoid conflicts with Framer Motion element opacity
    if (count === 1) return { backgroundColor: `${accent}40` }; // 25%
    if (count === 2) return { backgroundColor: `${accent}80` }; // 50%
    if (count === 3) return { backgroundColor: `${accent}bf` }; // 75%
    return { backgroundColor: accent }; // 100%
  };

  const handleMouseEnter = (e, content) => {
    const rect = e.currentTarget.getBoundingClientRect();

    setTooltip({
      visible: true,
      x: rect.left + rect.width / 2 + window.scrollX,
      y: rect.top + window.scrollY,
      content
    });
  };

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold opacity-80">{t("heatmap") || "Activity Heatmap"}</h2>

        {/* Cool small stat badge */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm text-xs font-bold"
          style={{
            backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
            borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
            color: accent
          }}
        >
          <span className="opacity-80 text-[10px] uppercase tracking-wider" style={{ color: isDark ? '#fff' : '#000' }}>
            {t("total") || "Total"}:
          </span>
          {totalCompleted} {t("checkIns") || "Check-ins"}
        </div>
      </div>

      <div
        className="rounded-xl p-4 md:p-5 shadow-sm w-full max-w-2xl mx-auto flex flex-col items-center relative"
        style={{ backgroundColor: isDark ? "#2a2a2a" : "#ffffff", color: isDark ? "#ffffff" : "#1a1a1a" }}
      >
        <div className="w-full flex justify-between items-center mb-6">
          <h3 className="font-bold text-[10px] md:text-xs tracking-wide uppercase opacity-50">{t("last16Weeks") || "Past 16 Weeks"}</h3>
          <h3 className="font-bold text-[10px] md:text-xs tracking-wide uppercase opacity-50">
            {days[0].toLocaleDateString(lang === "ar" ? "ar-SA" : undefined, { month: 'short', year: 'numeric' })} - {todayRef.toLocaleDateString(lang === "ar" ? "ar-SA" : undefined, { month: 'short', year: 'numeric' })}
          </h3>
        </div>

        {/* Horizontal Heatmap Grid Container */}
        <div className="flex gap-1.5 md:gap-2 justify-center w-full">
          {/* Heatmap Row Labels (Mon, Wed, Fri) */}
          <div className={`grid gap-1 md:gap-1.5 ${lang === "ar" ? 'pl-1 md:pl-2' : 'pr-1 md:pr-2'}`} style={{ gridTemplateRows: 'repeat(7, 1fr)' }}>
            <div className="text-[8px] md:text-[10px] opacity-40 font-semibold flex items-center justify-end"></div>
            <div className="text-[8px] md:text-[10px] opacity-40 font-semibold flex items-center justify-end">{t("dayMo")?.substring(0, 3) || "Mon"}</div>
            <div className="text-[8px] md:text-[10px] opacity-40 font-semibold flex items-center justify-end"></div>
            <div className="text-[8px] md:text-[10px] opacity-40 font-semibold flex items-center justify-end">{t("dayWe")?.substring(0, 3) || "Wed"}</div>
            <div className="text-[8px] md:text-[10px] opacity-40 font-semibold flex items-center justify-end"></div>
            <div className="text-[8px] md:text-[10px] opacity-40 font-semibold flex items-center justify-end">{t("dayFr")?.substring(0, 3) || "Fri"}</div>
            <div className="text-[8px] md:text-[10px] opacity-40 font-semibold flex items-center justify-end"></div>
          </div>

          {/* Classic GitHub-style Horizontal Grid - fully responsive! */}
          <div
            className="grid w-full gap-1 md:gap-1.5"
            style={{
              gridTemplateRows: 'repeat(7, 1fr)',
              gridAutoFlow: 'column',
              gridAutoColumns: '1fr'
            }}
          >
            {days.map((date, i) => {
              const dateStr = formatDate(date);
              const count = activityMap[dateStr] || 0;
              const displayDate = date.toLocaleDateString(lang === "ar" ? "ar-SA" : undefined, { month: 'short', day: 'numeric' });

              const isFuture = date > todayRef;
              const isToday = date.getTime() === todayRef.getTime();

              const tooltipText = isFuture ? "" : `${displayDate}: ${count} ${count === 1 ? (t("habitCompleted") || "habit") : (t("habitsCompleted") || "habits")}`;

              return (
                <motion.div
                  key={dateStr}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={!isFuture ? {
                    scale: 1.12,
                    y: -1
                  } : {}}
                  transition={{
                    delay: i * 0.003,
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }}
                  onMouseEnter={(e) => !isFuture && handleMouseEnter(e, tooltipText)}
                  onMouseLeave={handleMouseLeave}
                  className="w-full aspect-square rounded-sm cursor-pointer"
                  style={{
                    ...getIntensityStyle(count, isFuture),
                    outline: isToday ? `1.5px solid ${accent}` : "none",
                    outlineOffset: "2px",
                    boxShadow: isToday
                      ? `0 0 8px ${accent}40`
                      : (!isFuture && count > 0
                        ? `0 0 6px ${accent}30`
                        : "none")
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="w-full flex justify-between items-center mt-8 pt-4 border-t" style={{ borderColor: isDark ? "#3f3f3f" : "#e5e7eb" }}>
          <span className="text-[10px] md:text-xs opacity-40 font-bold tracking-widest uppercase">{t("activityLevel") || "Activity Level"}</span>
          <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs font-medium">
            <span className="opacity-40">{t("less") || "Less"}</span>
            <div
              onMouseEnter={(e) => handleMouseEnter(e, "0 habits")}
              onMouseLeave={handleMouseLeave}
              className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-sm cursor-pointer"
              style={{ backgroundColor: isDark ? "#3f3f3f" : "#f3f4f6" }}
            />

            <div
              onMouseEnter={(e) => handleMouseEnter(e, "1 habit")}
              onMouseLeave={handleMouseLeave}
              className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-sm cursor-pointer"
              style={{ backgroundColor: `${accent}40` }}
            />

            <div
              onMouseEnter={(e) => handleMouseEnter(e, "2 habits")}
              onMouseLeave={handleMouseLeave}
              className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-sm cursor-pointer"
              style={{ backgroundColor: `${accent}80` }}
            />

            <div
              onMouseEnter={(e) => handleMouseEnter(e, "3–4 habits")}
              onMouseLeave={handleMouseLeave}
              className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-sm cursor-pointer"
              style={{ backgroundColor: `${accent}bf` }}
            />

            <div
              onMouseEnter={(e) => handleMouseEnter(e, "5+ habits")}
              onMouseLeave={handleMouseLeave}
              className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-sm cursor-pointer"
              style={{ backgroundColor: accent }}
            />
            <span className="opacity-40">{t("more") || "More"}</span>
          </div>
        </div>
      </div>

      {/* CUSTOM TOOLTIP PORTAL */}
      {createPortal(
        <AnimatePresence>
          {tooltip.visible && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: "-50%", y: -5 }}
              animate={{ opacity: 1, scale: 1, x: "-50%", y: -12 }}
              exit={{ opacity: 0, scale: 0.9, x: "-50%", y: -5 }}
              className="absolute z-[200] pointer-events-none px-3 py-1.5 rounded-lg text-xs font-bold shadow-xl whitespace-nowrap"
              style={{
                backgroundColor: isDark ? "rgba(26,26,26,0.9)" : "rgba(255,255,255,0.9)",
                color: isDark ? "#ffffff" : "#1a1a1a",
                border: `1px solid ${isDark ? "#333" : "#e5e7eb"}`,
                left: tooltip.x,
                top: tooltip.y,
                translateY: "-100%",
                boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.5)" : "0 4px 20px rgba(0,0,0,0.1)",
                backdropFilter: "blur(8px)"
              }}
            >
              {tooltip.content}
              {/* Tooltip arrow */}
              <div
                className="absolute left-1/2 bottom-0 w-2 h-2"
                style={{
                  backgroundColor: isDark ? "rgba(26,26,26,0.9)" : "rgba(255,255,255,0.9)",
                  borderBottom: `1px solid ${isDark ? "#333" : "#e5e7eb"}`,
                  borderRight: `1px solid ${isDark ? "#333" : "#e5e7eb"}`,
                  transform: "translate(-50%, 50%) rotate(45deg)"
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>

  );
}




// ==================== SHARED STAT CARD COMPONENT ====================
function StatCard({ label, value, accent, isDark }) {
  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-2 shadow-sm"
      style={{
        backgroundColor: isDark ? "#2a2a2a" : "#ffffff",
        color: isDark ? "#ffffff" : "#1a1a1a"
      }}
    >
      <span className="text-sm opacity-60">{label}</span>
      <span className="text-3xl font-bold" style={{ color: accent }}>
        {value}
      </span>
    </div>
  );
}
