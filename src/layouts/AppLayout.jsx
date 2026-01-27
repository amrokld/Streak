import { useEffect, useState } from "react";
import Header from "../components/Header";

export default function AppLayout({ children, onNewHabit }) {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "dark"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const isDark = theme === "dark";

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{
        backgroundColor: isDark ? "#1f1f1f" : "#f2f4f8",
        color: isDark ? "#ffffff" : "#1a1a1a"
      }}
    >
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        onNewHabit={onNewHabit}
      />

      <main className="px-6">
        {children}
      </main>
    </div>
  );
}
