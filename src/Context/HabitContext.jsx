// HabitContext File
import { createContext, useContext, useState, useEffect } from "react";
import { syncHabits } from "../services/habitSync";
import { getToday, daysBetween } from "../utils/dateHelpers";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { applyCheckIn } from "../utils/streakEngine";


const HabitContext = createContext();

export const useHabit = () => useContext(HabitContext);
export const useHabits = () => useContext(HabitContext);

export function HabitProvider({ children }) {
  const [habits, setHabits] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.habits);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      // Validate it's a non-null array of objects
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(
        (h) => h && typeof h === "object" && typeof h.id !== "undefined"
      );
    } catch {
      return [];
    }
  });

  const MAX_HABITS = 12;

  // ---- ADD HABIT ----
  const addHabit = (habit) => {
    setHabits((prev) => {
      if (prev.length >= MAX_HABITS) return prev;
      return [
        ...prev,
        {
          ...habit,
          history: habit.history || [],
        },
      ];
    });
  };

  // ---- UPDATE HABIT (GENERIC) ----
  const updateHabit = (id, updater) => {
    setHabits((prev) =>
      prev.map((habit) => {
        if (String(habit.id) !== String(id)) return habit;
        return typeof updater === "function"
          ? updater(habit)
          : { ...habit, ...updater };
      })
    );
  };

  // ---- DELETE HABIT ----
  const deleteHabit = (id) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  // ---- CHECK IN HABIT ----
  const checkInHabit = (id, onResult) => {
    const habit = habits.find(h => String(h.id) === String(id));
    if (!habit) return;

    const { habit: updated, freezeUsed, freezeEarned } = applyCheckIn(habit);

    const today = getToday();
    const prevDate = habit.lastCompletedDate;
    let missedEntries = [];

    if (prevDate) {
      const gap = daysBetween(prevDate, today);

      if (gap > 1) {
        for (let i = 1; i < gap; i++) {
          const missedDate = new Date(prevDate);
          missedDate.setDate(missedDate.getDate() + i);

          const formatted = missedDate.toISOString().split("T")[0];

          missedEntries.push({
            date: formatted,
            status: "miss",
          });
        }
      }
    }

    // Fire callback synchronously, outside the updater — Strict Mode safe
    onResult?.({ freezeUsed, freezeEarned });

    updateHabit(id, () => {
      const prevDays = habit.completedDays || [];
      const prevHistory = habit.history || [];
      const today = getToday();

      if (prevDays.includes(today)) return updated;

      return {
        ...updated,
        completedDays: [...prevDays, today],
        history: [
          ...prevHistory,
          ...missedEntries,
          {
            date: today,
            status: freezeUsed ? "freeze" : "done",
          },
        ],
      };
    });
  };

  // ---- RESET HABIT ----
  const resetHabit = (id) => updateHabit(id, {
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedDate: null,
    freezeCount: 0,
    completedDays: []
  });

  const updateHabitName = (id, newName) => {
    setHabits((prev) =>
      prev.map((habit) =>
        habit.id === id ? { ...habit, name: newName } : habit
      )
    );
  };


  // ---- PERSIST TO LOCAL STORAGE (ONE PLACE ONLY) ----
  useEffect(() => {
    if (!Array.isArray(habits)) return; // guard: never write invalid state
    try {
      localStorage.setItem(STORAGE_KEYS.habits, JSON.stringify(habits));
      syncHabits();
    } catch (err) {
      console.error("Failed to persist habits:", err);
    }
  }, [habits]);


  return (
    <HabitContext.Provider
      value={{
        habits,
        addHabit,
        updateHabit,
        deleteHabit,
        checkInHabit,
        resetHabit,
        updateHabitName,
      }}

    >
      {children}
    </HabitContext.Provider>
  );
}
