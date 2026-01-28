import { useTheme } from "../context/ThemeContext";

export default function Statistics() {
  const { isDark } = useTheme();
  const accent = isDark ? "#d4af37" : "#2563eb";

  const habits = JSON.parse(localStorage.getItem("habits")) || [];

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

  return (
    <div className="max-w-xl mx-auto mt-20 flex flex-col gap-6">
      <h1
        className="text-3xl font-bold"
        style={{ color: accent }}
      >
        Statistics
      </h1>

      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Total Habits" value={totalHabits} accent={accent}/>
        <StatCard label="Active Streaks" value={totalActiveStreaks} accent={accent}/>
        <StatCard label="Longest Streak" value={longestStreak} accent={accent}/>
        <StatCard label="Total Check-ins" value={totalCheckIns} accent={accent}/>
      </div>
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

