import Header from "../components/Header";
import { useTheme } from "../Context/ThemeContext";

export default function AppLayout({ children }) {
  const { isDark } = useTheme();

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{
        backgroundColor: isDark ? "#1f1f1f" : "#f2f4f8",
        color: isDark ? "#ffffff" : "#1a1a1a"
      }}
    >
      <Header />
      <main className="px-6">{children}</main>
    </div>
  );
}
