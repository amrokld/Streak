import { createContext, useContext, useState, useEffect } from "react";
import { syncHabits } from "../services/habitSync";
import { getToday } from "../utils/dateHelpers";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { applyCheckIn } from "../utils/streakEngine";

const HabitContext = createContext();

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
      return [...prev, habit];
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
  // ---- CHECK IN HABIT ----
  const checkInHabit = (id, onResult) => {
    const habit = habits.find(h => String(h.id) === String(id));
    if (!habit) return;

    const { habit: updated, freezeUsed, freezeEarned } = applyCheckIn(habit);

    // Fire callback synchronously, outside the updater — Strict Mode safe
    onResult?.({ freezeUsed, freezeEarned });

    updateHabit(id, () => {
      const prevDays = habit.completedDays || [];
      const today = getToday();
      if (prevDays.includes(today)) return updated;
      return { ...updated, completedDays: [...prevDays, today] };
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
      }}

    >
      {children}
    </HabitContext.Provider>
  );
}

export function useHabits() {
  return useContext(HabitContext);
}
