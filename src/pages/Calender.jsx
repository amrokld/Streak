import { useTheme } from "../Context/ThemeContext";
import { useState } from "react"; // Added useState!

export default function Calendar() {
  const { isDark } = useTheme();
  const accent = isDark ? "#d4af37" : "#2563eb";

  // Load all habits
  const habits = JSON.parse(localStorage.getItem("habits")) || [];

  // STATE
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedHabitId, setSelectedHabitId] = useState("all");
  const [selectedDay, setSelectedDay] = useState(null);

  // Derived Month State
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-11
  const monthName = currentDate.toLocaleString("default", { month: "long" });

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
      const dString = new Date(day).toDateString();
      activityMap[dString] = (activityMap[dString] || 0) + 1;

      if (!dayHabitNames[dString]) dayHabitNames[dString] = [];
      dayHabitNames[dString].push(h.name);
    });
  });

  // Calendar Grid Math
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // Matches Mon/Tue...
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => `blank-${i}`);
  const days = Array.from({ length: daysInMonth }, (_, i) =>
    new Date(year, month, i + 1).toDateString()
  );

  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

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
          Calendar
        </h1>

        {habits.length > 0 && (
          <select
            value={selectedHabitId}
            onChange={(e) => setSelectedHabitId(e.target.value)}
            className="px-4 py-2 rounded-lg text-sm font-medium outline-none cursor-pointer border transition-colors hover:opacity-80"
            style={{
              backgroundColor: isDark ? "#2a2a2a" : "#ffffff",
              color: isDark ? "#ffffff" : "#1a1a1a",
              borderColor: isDark ? "#3f3f3f" : "#e5e7eb"
            }}
          >
            <option value="all">All Habits</option>
            {habits.map(h => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
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
            <span className="font-bold text-lg tracking-wide uppercase">{monthName}</span>
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
          {weekDays.map((wd) => (
            <div key={wd} className="text-[10px] md:text-xs font-semibold opacity-40 uppercase tracking-widest">
              {wd}
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
            const isToday = day === today.toDateString();
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
                title={hasActivity ? `${count} ${count === 1 ? 'habit' : 'habits'} completed` : `No activity`}
              >
                {cellDate.getDate()}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. DAY DETAILS MODAL OVERLAY */}
      {selectedDay && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedDay(null)}
        >
          <div
            className="rounded-2xl w-full max-w-sm p-6 flex flex-col gap-5 shadow-2xl transition-all"
            style={{
              backgroundColor: isDark ? "#2a2a2a" : "#ffffff",
              color: isDark ? "#ffffff" : "#1a1a1a",
              border: `1px solid ${isDark ? "#3f3f3f" : "#e5e7eb"}`
            }}
            onClick={e => e.stopPropagation()} /* Prevents closing when clicking inside the window */
          >

            {/* Modal Header */}
            <div className="flex justify-between items-start border-b pb-3" style={{ borderColor: isDark ? "#3f3f3f" : "#e5e7eb" }}>
              <h3 className="text-xl font-bold">
                {new Date(selectedDay).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
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
                Activity
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
                <p className="opacity-50 italic text-sm mt-1">No habits were completed on this day.</p>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
