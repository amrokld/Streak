import { useEffect, useState } from "react";
import HabitCard from "../components/HabitCard";

export default function Home({ onNewHabitTrigger }) {
  const [habits, setHabits] = useState([]);

  useEffect(() => {
    let saved = JSON.parse(localStorage.getItem("habits"));
    
    if (!saved || saved.length === 0) {
      saved = [
        { id: 1, name: "Learning", streak: 1},
        { id: 2, name: "Gym", streak: 20}
      ];
      localStorage.setItem("habits", JSON.stringify(saved));
    }
    setHabits(saved);
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
        <div className="flex gap-12">
            {habits.map((h) => (
        <HabitCard key={h.name} habit={h} />
        ))}
        </div>
    </div>
  );
}
