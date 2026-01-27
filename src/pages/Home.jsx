import HabitCard from "../components/HabitCard";

export default function Home() {
  const habits = [
    { name: "Learning", streak: 1 },
    { name: "Gym", streak: 20 }
  ];

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
