import { useNavigate } from "react-router-dom";
import { useTheme } from "../Context/ThemeContext";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { cardFlip } from "../motion/motionVariants";
import { getTokens } from "../theme/tokens";
import { useLanguage } from "../Context/LanguageContext";
import { getToday } from "../utils/dateHelpers";
import { getTodayDayKey } from "../utils/dateHelpers";

export default function HabitCard({
  habit,
  onDeleteRequest,
  onEditCategory,
  forceClose,
  mode,
  onCheckIn,
}) {
  const [flipped, setFlipped] = useState(false);
  const [message, setMessage] = useState("");
  const clickedTodayRef = useRef(false);

  // Auto-clear message after 2s
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 2000);
    return () => clearTimeout(timer);
  }, [message]);

  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const { accent, cardBg, subText, badgeBg } = getTokens(isDark);
  const shadow = isDark ? "none" : "0 12px 30px rgba(0,0,0,0.08)";

  const colors = {
    urgent: "#ef4444",
    important: "#f59e0b",
    optional: "#22c55e"
  };
  const catColor = colors[habit.category] || subText;

  const DAY_LABELS_FULL = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" };

  const getScheduleLabel = () => {
    if (!habit.frequency || habit.frequency === "daily") return t("daily") || "Daily";
    if ((habit.frequency === "weekly" || habit.frequency === "custom") && habit.days?.length > 0) {
      return habit.days.map(d => DAY_LABELS_FULL[d]).join(", ");
    }
    return t("daily") || "Daily";
  };


  useEffect(() => {
    if (forceClose) setFlipped(false);
  }, [forceClose]);

  // Sync ref with actual lastCheck state — handles resets and re-appears
  useEffect(() => {
    clickedTodayRef.current = habit?.lastCheck === getToday();
  }, [habit?.lastCheck]);

  return (
    <motion.div
      className="relative rounded-3xl min-h-[220px]"
      whileHover={!flipped ? {
        boxShadow: `0 0 25px ${catColor}50`,
        borderColor: catColor
      } : {}}
      style={{
        border: `1px solid transparent`,
        borderRadius: "1.5rem"
      }}
      transition={{ duration: 0.2 }}
    >
      <div className="card-perspective absolute inset-0">
        <motion.div
          className="absolute inset-0 rounded-3xl"
          style={{ transformStyle: "preserve-3d" }}
          variants={cardFlip}
          animate={flipped ? "back" : "front"}
        >

          {/* FRONT */}
          <div
            className="absolute inset-0 p-6 rounded-3xl"
            style={{
              backfaceVisibility: "hidden",
              backgroundColor: cardBg,
              boxShadow: shadow
            }}
            onClick={() => !flipped && navigate(`/streak/${habit.id}`)}
            onContextMenu={(e) => {
              e.preventDefault();
              setFlipped(true);
            }}
          >
            <h3
              className="text-xl font-medium"
              style={{ color: isDark ? "#fff" : "#1a1a1a" }}
            >
              {habit.name}
            </h3>

            <p className="text-sm mt-1" style={{ color: subText }}>
              {t("clickForDetails")}
            </p>

            <p className="text-[11px] mt-1 opacity-40" style={{ color: subText }}>
              {t("rightClickOptions")}
            </p>

            <div className="flex flex-col items-start gap-1 mt-4">
              {habit.category && (
                <span
                  className="px-3 py-[2px] rounded-full text-[11px] font-bold capitalize tracking-wide hidden md:inline-block"
                  style={{
                    backgroundColor: "transparent",
                    border: `1px solid ${catColor}`,
                    color: catColor
                  }}
                >
                  {t(habit.category)}
                </span>
              )}

              {/* Schedule badge */}
              {(!habit.frequency || habit.frequency === "daily") ? (
                <span
                  className="px-2 py-[10px] rounded-full text-[10px] font-medium hidden md:inline-block"
                  style={{ color: subText, opacity: 0.5 }}
                >
                  {t("daily") || "Daily"}
                </span>
              ) : (
                <span
                  className="px-2 py-[10px] rounded-full text-[10px] font-bold tracking-wide hidden md:inline-block"
                  style={{ color: accent, opacity: 0.8 }}
                >
                  {getScheduleLabel()}
                </span>
              )}
            </div>

            {/* Message bubble */}
            {message && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-20 right-4 text-xs font-medium px-3 py-1.5 rounded-full border shadow-sm"
                style={{
                  backgroundColor: isDark ? "#2a2a2a" : "#ffffff",
                  color: isDark ? "#fff" : "#000",
                  borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
                  zIndex: 10,
                }}
              >
                {message}
              </motion.p>
            )}

            {/* Streak number — clickable in today mode */}
            <motion.div
              className="absolute bottom-6 right-6 w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl"
              style={{
                backgroundColor: badgeBg,
                color: accent,
                cursor: mode === "today" ? "pointer" : "default",
                textShadow: mode === "today" ? `0 0 15px ${accent}50` : "none",
              }}
              whileHover={mode === "today" ? { scale: 1.1 } : {}}
              whileTap={mode === "today" ? { scale: 0.9 } : {}}
              onClick={(e) => {
                if (mode !== "today") return;
                e.stopPropagation();

                if (habit.lastCheck === getToday() || clickedTodayRef.current) {
                  setMessage(t("comeBackTomorrow") || "Come back tomorrow!");
                  return;
                }

                clickedTodayRef.current = true;
                onCheckIn(habit.id);
              }}
            >
              {habit.streak}
            </motion.div>
          </div>

          {/* BACK */}
          <div
            className="absolute inset-0 p-6 rounded-3xl flex flex-col justify-between"
            style={{
              transform: "rotateY(180deg)",
              backfaceVisibility: "hidden",
              backgroundColor: cardBg,
              boxShadow: shadow
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              setFlipped(false);
            }}
          >
            <div className="text-xs opacity-40 tracking-wide">
              {t("options")}
            </div>

            <div className="flex flex-col gap-3">
              {/* Change Category (Accent Outline) */}
              <button
                className="relative group py-2 rounded-xl text-sm font-medium overflow-hidden transition-all duration-200 active:scale-95"
                style={{
                  backgroundColor: "transparent",
                  color: accent,
                  border: `1px solid ${accent}`
                }}
                onClick={() => onEditCategory(habit)}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-0 pointer-events-none" style={{ backgroundColor: accent }} />
                <span
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none"
                  style={{ color: isDark ? "#000" : "#fff" }}
                >
                  {t("changeCategory")}
                </span>
                <span className="relative z-10 block group-hover:opacity-0 transition-opacity duration-200">
                  {t("changeCategory")}
                </span>
              </button>

              {/* Delete Habit (Red Outline) */}
              <button
                className="relative group py-2 rounded-xl text-sm font-medium overflow-hidden transition-all duration-200 active:scale-95"
                style={{
                  backgroundColor: "transparent",
                  color: "#ef4444",
                  border: `1px solid #ef4444`
                }}
                onClick={() => onDeleteRequest(habit)}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-0 pointer-events-none" style={{ backgroundColor: "#ef4444" }} />
                <span
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none"
                  style={{ color: isDark ? "#000" : "#fff" }}
                >
                  {t("deleteHabit")}
                </span>
                <span className="relative z-10 block group-hover:opacity-0 transition-opacity duration-200">
                  {t("deleteHabit")}
                </span>
              </button>
            </div>

            <p className="text-xs opacity-40 text-center">
              {t("rightClickClose")}
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
