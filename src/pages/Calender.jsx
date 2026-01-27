export default function Calendar() {
  const completedDays =
    JSON.parse(localStorage.getItem("completedDays")) || [];

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = Array.from({ length: daysInMonth }, (_, i) =>
    new Date(year, month, i + 1).toDateString()
  );

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-3xl font-bold text-[#d4af37] mb-6">Calendar</h1>

      <div className="grid grid-cols-7 gap-3">
        {days.map((day) => {
          const isDone = completedDays.includes(day);
          const isToday = day === new Date().toDateString();

          return (
            <div
              key={day}
              className={`h-10 flex items-center justify-center rounded text-sm
                ${isDone ? "bg-[#d4af37] text-black" : "bg-[#2a2a2a] text-[#555]"}
                ${isToday ? "border border-[#d4af37]" : ""}
              `}
            >
              {new Date(day).getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
}
