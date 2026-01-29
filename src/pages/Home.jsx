import { useEffect, useState } from "react";
import HabitCard from "../components/HabitCard";

export default function Home({ onNewHabitTrigger }) {
  const [habits, setHabits] = useState([]);

  useEffect(() => {
    let saved = JSON.parse(localStorage.getItem("habits"));
    
    if (!saved || saved.length === 0) {
      saved = [
        {
          id: 1,
          name: "Learning",
          streak: 1,
          longestStreak: 1,
          lastCheck: new Date().toDateString(),
          completedDays: [new Date().toDateString()]
        },
        {
          id: 2,
          name: "Gym",
          streak: 20,
          longestStreak: 20,
          lastCheck: new Date().toDateString(),
          completedDays: []
        }
      ];

      localStorage.setItem("habits", JSON.stringify(saved));
    }
    setHabits(
      saved.map(h => ({
        ...h,
        completedDays: h.completedDays || [],
        longestStreak: h.longestStreak || h.streak,
        lastCheck: h.lastCheck || null
      }))
    );
  }, []);

  useEffect(() => {
    const handler = () => {
      const saved = JSON.parse(localStorage.getItem("habits")) || [];
      setHabits(saved);
    };

    window.addEventListener("habitsUpdated", handler);
    return () => window.removeEventListener("habitsUpdated", handler);
  }, []);
  
  return (
    <div className="flex justify-center mt-28">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {habits.map(habit => (
        <HabitCard key={habit.id} habit={habit} />
        ))}
        </div>
    </div>
  );
}
