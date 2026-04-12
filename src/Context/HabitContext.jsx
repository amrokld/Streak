import { createContext, useContext, useState, useEffect } from "react";
import { syncHabits } from "../services/habitSync";
import { getToday, getYesterday } from "../utils/dateHelpers";
import { STORAGE_KEYS } from "../constants/storageKeys";

const HabitContext = createContext();

export function HabitProvider({ children }) {
  const [habits, setHabits] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.habits);
    return stored ? JSON.parse(stored) : [];
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
        if (habit.id !== id) return habit;

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

  // ---- REGISTER TODAY (STREAK FIX) ----
  const registerToday = (habitId) => {
    const today = getToday();

    updateHabit(habitId, (habit) => {
      if (habit.lastCheck === today) return habit;

      return {
        ...habit,
        streak: habit.streak + 1,
        lastCheck: today,
      };
    });
  };

  // ---- CHECK IN HABIT ----
  const checkInHabit = (id) => {
    const today = getToday();
    updateHabit(id, (habit) => {
      if (habit.lastCheck === today) return habit;
      const prevDays = habit.completedDays || [];
      if (prevDays.includes(today)) return habit;
      const newStreak = habit.streak + 1;
      return {
        ...habit,
        streak: newStreak,
        longestStreak: Math.max(habit.longestStreak || 0, newStreak),
        lastCheck: today,
        completedDays: [...prevDays, today]
      };
    });
  };

  // ---- RESET HABIT ----
  const resetHabit = (id) => {
    updateHabit(id, {
      streak: 0,
      lastCheck: null,
      completedDays: []
    });
  };

  // ---- HANDLE MISSED DAY ----
  const handleMissedDay = (id) => {
    const today = getToday();
    const yesterday = getYesterday();
    updateHabit(id, (habit) => {
      if (habit.streak > 0 && habit.lastCheck !== yesterday && habit.lastCheck !== today) {
        return { ...habit, streak: 0 };
      }
      return habit;
    });
  };

  // ---- PERSIST TO LOCAL STORAGE (ONE PLACE ONLY) ----
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.habits, JSON.stringify(habits));
    syncHabits();
  }, [habits]);

  return (
    <HabitContext.Provider
      value={{
        habits,
        addHabit,
        updateHabit,
        deleteHabit,
        registerToday,
        checkInHabit,
        resetHabit,
        handleMissedDay,
      }}

    >
      {children}
    </HabitContext.Provider>
  );
}

export function useHabits() {
  return useContext(HabitContext);
}
