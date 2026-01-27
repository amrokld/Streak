import { useNavigate } from "react-router-dom";

export default function HabitCard({ habit }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/streak/${habit.name}`)}
      className="
        w-64 h-44 bg-[#2a2a2a] rounded-3xl p-6
        cursor-pointer transition
        hover:ring-2 hover:ring-[#d4af37]
        flex flex-col justify-between
      "
    >
      {/* Text */}
      <div>
        <h3 className="text-xl font-medium">{habit.name}</h3>
        <p className="text-sm text-[#777] mt-1">
          click for more details
        </p>
      </div>

      {/* Streak number (inside, tall feel) */}
      <div className="flex justify-end">
        <div
          className="
            w-12 h-12 rounded-2xl
            bg-[#3a3a3a]
            text-[#d4af37]
            flex items-center justify-center
            font-bold text-lg
          "
        >
          {habit.streak}
        </div>
      </div>
    </div>
  );
}
