import { useTheme } from "../Context/ThemeContext";
import { formatDate } from "../utils/dateHelpers";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { getTokens } from "../theme/tokens";

export default function Statistics() {
  const { isDark } = useTheme();
  const { accent } = getTokens(isDark);

  const habits = JSON.parse(localStorage.getItem(STORAGE_KEYS.habits)) || [];

  // total number of habits
  const totalHabits = habits.length;

  // sum of all current streaks
  const totalActiveStreaks = habits.reduce(
    (sum, h) => sum + (h.streak || 0),
    0
  );

  // longest streak ever across all habits
  const longestStreak = Math.max(
    0,
    ...habits.map(h => h.longestStreak || 0)
  );

  // total check-ins across all habits
  const totalCheckIns = habits.reduce(
    (sum, h) => sum + (h.completedDays?.length || 0),
    0
  );

  // --- NEW CALCULATIONS ---

  // 1 & 2. Weekly Consistency & Activity Row
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return formatDate(d);
  });


  const weeklyActivity = last7Days.map((dateStr) => {
    // Check if any habit has a completion date on this date
    return habits.some((h) =>
      h.completedDays?.includes(dateStr)
    );
  });

  const consistencyCount = weeklyActivity.filter(Boolean).length;
  const consistencyPercentage = Math.round((consistencyCount / 7) * 100);

  // 3 & 4. Best and Weakest Habit
  let bestHabit = null;
  let weakestHabit = null;

  if (habits.length > 0) {
    const sortedHabits = [...habits].sort((a, b) => (b.streak || 0) - (a.streak || 0));
    bestHabit = sortedHabits[0];

    // Sort by smallest streak, then by least amount of completed days
    const weakestSorted = [...habits].sort((a, b) => {
      if ((a.streak || 0) !== (b.streak || 0)) {
        return (a.streak || 0) - (b.streak || 0);
      }
      return (a.completedDays?.length || 0) - (b.completedDays?.length || 0);
    });
    weakestHabit = weakestSorted[0];
  }

  // 5. Active Days This Month
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
    weakestHabitMessage = hasActivityThisWeek ? "needs some love" : "no activity this week";
  }

  const isTodayCompleted = weeklyActivity[6];



  return (
    <div className="max-w-xl mx-auto mt-20 flex flex-col gap-8 pb-10 animate-fade-in">
      {/* 1. HEADER SECTION (With Today Status) */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold" style={{ color: accent }}>
          Statistics
        </h1>
        <div
          className="flex items-center gap-2 text-xs font-bold px-4 py-1.5 rounded-full border transition-all duration-300 shadow-sm"
          style={{
            backgroundColor: isTodayCompleted ? (isDark ? "rgba(34,197,94,0.05)" : "rgba(34,197,94,0.05)") : (isDark ? "rgba(239,68,68,0.05)" : "rgba(239,68,68,0.05)"),
            borderColor: isTodayCompleted ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)",
            color: isTodayCompleted ? "#22c55e" : "#ef4444"
          }}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${isTodayCompleted ? "bg-[#22c55e]" : "bg-[#ef4444]"} animate-pulse`} style={{ boxShadow: `0 0 8px ${isTodayCompleted ? "#22c55e" : "#ef4444"}` }} />
          <span>Today: {isTodayCompleted ? "Completed" : "Not completed"}</span>
        </div>
      </div>


      {/* OVERVIEW SECTION */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold opacity-80">Overview</h2>
        <div className="grid grid-cols-2 gap-4">
          <StatCard label="Total Habits" value={totalHabits} accent={accent} />
          <StatCard label="Active Streaks" value={totalActiveStreaks} accent={accent} />
          <StatCard label="Longest Streak" value={longestStreak} accent={accent} />
          <StatCard label="Total Check-ins" value={totalCheckIns} accent={accent} />
          <StatCard label="Active Days (This Month)" value={activeDaysMonthCount} accent={accent} />
        </div>
      </section>

      {/* CONSISTENCY SECTION */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold opacity-80">Consistency</h2>
        <div
          className="rounded-xl p-5 flex flex-col gap-4"
          style={{ backgroundColor: isDark ? "#2a2a2a" : "#ffffff", color: isDark ? "#ffffff" : "#1a1a1a" }}
        >
          <div className="flex flex-col gap-1">
            <span className="font-medium text-sm">
              Consistency: <span style={{ color: accent, fontSize: "1.25rem", fontWeight: "bold", marginLeft: "4px" }}>{consistencyPercentage}%</span>
            </span>
            <p className="text-sm opacity-60">You showed up {consistencyCount} out of 7 days this week</p>
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


      {/* INSIGHTS SECTION */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold opacity-80">Insights</h2>
        <div className="grid grid-cols-1 gap-4">
          <div
            className="rounded-xl p-5 flex flex-col gap-1 border-l-4"
            style={{ backgroundColor: isDark ? "#2a2a2a" : "#ffffff", color: isDark ? "#ffffff" : "#1a1a1a", borderColor: "#4ade80" }}
          >
            <span className="text-sm opacity-60">Best Habit</span>
            {bestHabit ? (
              <span className="font-medium text-lg">
                {bestHabit.name} <span className="opacity-60 text-sm">({bestHabit.streak || 0} days)</span>
              </span>
            ) : (
              <span className="opacity-50 italic">No data yet</span>
            )}
          </div>

          <div
            className="rounded-xl p-5 flex flex-col gap-1 border-l-4"
            style={{ backgroundColor: isDark ? "#2a2a2a" : "#ffffff", color: isDark ? "#ffffff" : "#1a1a1a", borderColor: "#f87171" }}
          >
            <span className="text-sm opacity-60">Needs Attention</span>
            {weakestHabit ? (
              <span className="font-medium text-lg">{weakestHabit.name}</span>
            ) : (
              <span className="opacity-50 italic">No data yet</span>
            )}
          </div>
        </div>
      </section>
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

