export default function Statistics() {
  const streak = parseInt(localStorage.getItem("streak")) || 0;
  const longest = parseInt(localStorage.getItem("longestStreak")) || 0;
  const totalDays = parseInt(localStorage.getItem("totalDays")) || 0;

  const completionRate =
    totalDays > 0 ? Math.round((streak / totalDays) * 100) : 0;

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-[#d4af37]">Statistics</h1>

      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Current Streak" value={streak} />
        <StatCard label="Longest Streak" value={longest} />
        <StatCard label="Total Days" value={totalDays} />
        <StatCard label="Consistency" value={`${completionRate}%`} />
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-[#2a2a2a] rounded-xl p-5 flex flex-col gap-2">
      <span className="text-sm text-[#888]">{label}</span>
      <span className="text-3xl font-bold text-[#d4af37]">{value}</span>
    </div>
  );
}
