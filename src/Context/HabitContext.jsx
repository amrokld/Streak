import { createContext, useContext, useState, useEffect } from "react";

const HabitContext = createContext();

export function HabitProvider({ children }) {
  const [habits, setHabits] = useState(() => {
    const stored = localStorage.getItem("habits");
    return stored ? JSON.parse(stored) : [];
  });

  const addHabit = (habit) => {
    setHabits(prev => {
      if (prev.length >= 10) return prev;

      const updated = [...prev, habit];
      localStorage.setItem("habits", JSON.stringify(updated));
      return updated;
    });
  };

  const updateHabit = (id, updates) => {
    setHabits(prev => {
      const updated = prev.map(h => 
        h.id === id ? { ...h, ...updates } : h
      );
      localStorage.setItem.setItem("habits", JSON.stringify(updated));
      return updated;
    });
  };


  useEffect(() => {
    localStorage.setItem("habits", JSON.stringify(habits));
  }, [habits]);

  return (
    <HabitContext.Provider value={{ habits, setHabits, addHabit, updateHabit }}>
      {children}
    </HabitContext.Provider>
  );
}

export function useHabits() {
  return useContext(HabitContext);
}
