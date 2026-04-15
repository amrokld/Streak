import { useState } from "react";
import { useTheme } from "../Context/ThemeContext";
import { useHabits } from "../Context/HabitContext";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { getTokens } from "../theme/tokens";
import { useLanguage } from "../Context/LanguageContext";

export default function Onboarding({
  mode = "onboarding",
  onClose
}) {
  const [habit, setHabit] = useState("");
  const [category, setCategory] = useState("important");

  const [frequency, setFrequency] = useState("daily");
  const [selectedDays, setSelectedDays] = useState([]);

  const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const DAY_LABELS = { mon: "M", tue: "T", wed: "W", thu: "T", fri: "F", sat: "S", sun: "S" };

  const toggleDay = (day) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };


  const { isDark } = useTheme();
  const { addHabit } = useHabits();
  const { t } = useLanguage();

  const navigate = useNavigate();

  const { accent, bg, cardBg, text, subText } = getTokens(isDark);

  const startTracking = () => {
    if (!habit.trim()) return;

    addHabit({
      id: Date.now(),
      name: habit.trim(),
      category,
      streak: 0,
      longestStreak: 0,
      completedDays: [],
      lastCheck: null,
      frequency,
      days: frequency === "custom" ? selectedDays : []
    });


    if (mode === "onboarding") {
      navigate("/");
    } else {
      onClose?.();
    }
  };

  const categories = ["important", "urgent", "optional"];

  const modalContent = (
    <div
      className={`flex items-center justify-center animate-fade-in transition-all duration-300
        ${mode === "new-habit" ? "fixed inset-0 z-[100] backdrop-blur-md" : "h-screen"}
      `}
      style={{
        backgroundColor: mode === "new-habit" ? (isDark ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.1)") : bg
      }}


      onClick={mode === "new-habit" ? onClose : undefined}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col items-center gap-6 px-10 py-12 rounded-3xl border"
        style={{
          backgroundColor: cardBg,
          color: text,
          /* Highlights the crisp edge of the card */
          borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",

          /* The magic: Center-spread accent glow + deep floating shadow */
          boxShadow: isDark
            ? `0 0 50px ${accent}20, 0 20px 40px rgba(0, 0, 0, 0.8)`
            : `0 0 40px ${accent}30, 0 20px 40px rgba(0, 0, 0, 0.15)`
        }}
      >

        <h1
          className="text-3xl font-bold"
          style={{ color: accent }}
        >
          {t("whatToTrack")}
        </h1>

        <p className="text-sm" style={{ color: subText }}>
          {t("oneHabit")}
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            startTracking();
          }}
          className="flex flex-col gap-4 w-64"
        >
          <input
            className="px-4 py-2 rounded outline-none text-center"
            style={{
              backgroundColor: isDark ? "#3a3a3a" : "#e5e7eb",
              color: text
            }}
            value={habit}
            onChange={(e) => setHabit(e.target.value)}
            placeholder={t("habitPlaceholder")}
            autoFocus
          />

          {/* Categories */}
          <div className="flex justify-center gap-2">
            {categories.map((cat) => {
              const active = category === cat;
              const colors = {
                urgent: "#ef4444",
                important: "#f59e0b",
                optional: "#22c55e"
              };
              const color = colors[cat];

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className="px-3 py-1 rounded-full text-xs transition font-bold capitalize"
                  style={{
                    border: `1px solid ${active ? color : (isDark ? "#444" : "#cbd5e1")}`,
                    backgroundColor: active ? (isDark ? `${color}15` : `${color}15`) : "transparent",
                    color: color
                  }}
                >
                  {t(cat)}
                </button>
              );
            })}
          </div>

          {/* Frequency Selection */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold tracking-wider uppercase text-center" style={{ color: subText }}>
              {t("frequency") || "Frequency"}
            </p>
            <div className="flex justify-center gap-2">
              {["daily", "custom"].map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setFrequency(freq)}
                  className="px-4 py-1 rounded-full text-xs font-bold capitalize transition"
                  style={{
                    border: `1px solid ${frequency === freq ? accent : (isDark ? "#444" : "#cbd5e1")}`,
                    backgroundColor: frequency === freq ? (isDark ? `${accent}15` : `${accent}15`) : "transparent",
                    color: frequency === freq ? accent : subText,
                  }}
                >
                  {t(freq) || freq}
                </button>
              ))}
            </div>

            {/* Day Picker — only for custom */}
            {frequency === "custom" && (
              <div className="flex justify-center gap-1 mt-1">
                {DAY_KEYS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className="w-8 h-8 rounded-full text-[11px] font-bold transition"
                    style={{
                      border: `1px solid ${selectedDays.includes(day) ? accent : (isDark ? "#444" : "#cbd5e1")}`,
                      backgroundColor: selectedDays.includes(day) ? accent : "transparent",
                      color: selectedDays.includes(day) ? (isDark ? "#000" : "#fff") : subText,
                    }}
                  >
                    {DAY_LABELS[day]}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="relative group w-full py-2.5 mt-2 rounded-xl font-bold overflow-hidden transition-all duration-200 active:scale-95"
            style={{
              backgroundColor: "transparent",
              color: accent,
              border: `1px solid ${accent}`
            }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-0 pointer-events-none" style={{ backgroundColor: accent }} />
            <span
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none"
              style={{ color: isDark ? "#000" : "#fff" }}
            >
              {mode === "onboarding" ? t("start") : t("create")}
            </span>
            <span className="relative z-10 block group-hover:opacity-0 transition-opacity duration-200">
              {mode === "onboarding" ? t("start") : t("create")}
            </span>
          </button>
        </form>

        {mode === "new-habit" && (
          <button
            onClick={onClose}
            className="relative group text-sm font-medium transition-all duration-300"
            style={{ color: subText }}
          >
            <span
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{ color: "#ef4444", textShadow: "0 0 12px rgba(239,68,68,0.8)" }}
            >
              {t("cancel")}
            </span>
            <span className="relative z-10 group-hover:opacity-0 transition-opacity duration-300">
              {t("cancel")}
            </span>
          </button>
        )}
      </div>
    </div>
  );

  return mode === "new-habit" ? createPortal(modalContent, document.body) : modalContent;
}
