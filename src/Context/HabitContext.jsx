import { createContext, useContext, useState, useEffect } from "react";

const HabitContext = createContext();

export function HabitProvider({ children }) {
  const [habits, setHabits] = useState(() => {
    const stored = localStorage.getItem("habits");
    return stored ? JSON.parse(stored) : [];
  });

  // ---- ADD HABIT ----
  const addHabit = (habit) => {
    setHabits((prev) => {
      if (prev.length >= 10) return prev;
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
    const today = new Date().toDateString();

    updateHabit(habitId, (habit) => {
      if (habit.lastCompleted === today) return habit;

      return {
        ...habit,
        streak: habit.streak + 1,
        lastCompleted: today,
      };
    });
  };

  // ---- PERSIST TO LOCAL STORAGE (ONE PLACE ONLY) ----
  useEffect(() => {
    localStorage.setItem("habits", JSON.stringify(habits));
  }, [habits]);

  return (
    <HabitContext.Provider
      value={{
        habits,
        addHabit,
        updateHabit,
        deleteHabit,
        registerToday,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
}

export function useHabits() {
  return useContext(HabitContext);
}
