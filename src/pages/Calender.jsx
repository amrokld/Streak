import { useTheme } from "../context/ThemeContext";

export default function Calendar() {
  const { isDark } = useTheme();
  const accent = isDark ? "#d4af37" : "#2563eb";

  // load all habits
  const habits = JSON.parse(localStorage.getItem("habits")) || [];

  // collect all completed days from all habits (deduplicated)
  const completedDays = Array.from(
    new Set(habits.flatMap(h => h.completedDays || []))
  );

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = Array.from({ length: daysInMonth }, (_, i) =>
    new Date(year, month, i + 1).toDateString()
  );

  return (
    <div className="max-w-xl mx-auto mt-20 flex flex-col items-center gap-6">
      <h1
        className="text-3xl font-bold"
        style={{ color: accent }}
      >
        Calendar
      </h1>

      <div className="grid grid-cols-7 gap-3">
        {days.map(day => {
          const isDone = completedDays.includes(day);
          const isToday = day === new Date().toDateString();

          return (
            <div
              key={day}
              className="h-10 w-10 flex items-center justify-center rounded text-sm select-none"
              style={{
                backgroundColor: isDone
                  ? accent
                  : isDark
                  ? "#2a2a2a"
                  : "#e5e7eb",
                color: isDone
                  ? isDark
                    ? "#000"
                    : "#fff"
                  : isDark
                  ? "#777"
                  : "#555",
                border: isToday
                  ? `1px solid ${accent}`
                  : "none"
              }}
            >
              {new Date(day).getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
}
