import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Onboarding() {
  const [habit, setHabit] = useState("");
  const navigate = useNavigate();

  const startTracking = () => {
    if (!habit) return;
    navigate("/streak", { state: { habit } });
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#1f1f1f] gap-6">
      <h1 className="text-3xl text-[#d4af37] font-bold">What do you want to track?</h1>

      <input
        className="px-4 py-2 rounded bg-[#2a2a2a] text-white outline-none"
        placeholder="e.g. Gym, Study, Reading"
        value={habit}
        onChange={(e) => setHabit(e.target.value)}
      />

      <button
        onClick={startTracking}
        className="px-6 py-2 bg-[#2a2a2a] text-[#d4af37] rounded-xl border border-[#444]"
      >
        Start
      </button>
    </div>
  );
}
