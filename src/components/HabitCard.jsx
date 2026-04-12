import { useNavigate } from "react-router-dom";
import { useTheme } from "../Context/ThemeContext";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cardFlip } from "../motion/motionVariants";
import { getTokens } from "../theme/tokens";
import { useLanguage } from "../Context/LanguageContext";


export default function HabitCard({
  habit,
  onDeleteRequest,
  onEditCategory,
  forceClose,
}) {
  const [flipped, setFlipped] = useState(false);
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

  useEffect(() => {
    if (forceClose) setFlipped(false);
  }, [forceClose]);

  return (
    <div
      className="relative rounded-3xl min-h-[220px]"
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

            {habit.category && (
              <span
                className="inline-block mt-4 px-3 py-[2px] rounded-full text-[11px] font-bold capitalize tracking-wide hidden md:inline-block"
                style={{
                  backgroundColor: "transparent",
                  border: `1px solid ${catColor}`,
                  color: catColor
                }}
              >
                {t(habit.category)}
              </span>
            )}

            <div
              className="absolute bottom-6 right-6 w-16 h-16 rounded-2xl
                         flex items-center justify-center font-bold text-2xl"
              style={{ backgroundColor: badgeBg, color: accent }}
            >
              {habit.streak}
            </div>
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
    </div>
  );
}
