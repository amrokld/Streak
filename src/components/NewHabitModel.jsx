import { useState } from "react";

export default function NewHabitModal({ onClose }) {
  const [name, setName] = useState("");

  const saveHabit = () => {
    if (!name) return;

    const habits = JSON.parse(localStorage.getItem("habits")) || [];
    habits.push({
      id: Date.now(),
      name,
      streak: 0
    });

    localStorage.setItem("habits", JSON.stringify(habits));
    window.dispatchEvent(new Event("habitsUpdated"));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#2a2a2a] p-6 rounded-2xl w-80">
        <h2 className="text-xl mb-4">New Habit</h2>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Habit name"
          className="w-full px-4 py-2 rounded bg-[#1f1f1f] mb-4"
        />

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="text-sm text-[#aaa]">
            Cancel
          </button>
          <button onClick={saveHabit} className="text-[#d4af37]">
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
