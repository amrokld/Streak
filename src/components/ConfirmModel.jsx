import { useTheme } from "../Context/ThemeContext";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";

export default function ConfirmModal({
  title = "Are you sure?",
  message,
  confirmText = "Delete",
  onConfirm,
  onCancel,
}) {
  const { isDark } = useTheme();

  const accent = isDark ? "#d4af37" : "#2563eb";
  const cardBg = isDark ? "#2a2a2a" : "#ffffff";
  const text = isDark ? "#ffffff" : "#1a1a1a";
  const subText = isDark ? "#aaa" : "#6b7280";

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in transition-all duration-300"
      style={{ backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.1)" }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="flex flex-col items-center gap-6 px-10 py-12 rounded-3xl text-center max-w-sm w-full border"
        style={{
          backgroundColor: cardBg,
          color: text,
          borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
          boxShadow: isDark
            ? `0 0 50px ${accent}20, 0 20px 40px rgba(0, 0, 0, 0.8)`
            : `0 0 40px ${accent}30, 0 20px 40px rgba(0, 0, 0, 0.15)`
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold" style={{ color: accent }}>
            {title}
          </h1>

          <p className="text-sm mt-1" style={{ color: subText }}>
            {message}
          </p>
        </div>

        <div className="flex flex-col gap-4 w-64 mt-2">
          <button
            onClick={onConfirm}
            className="py-2 rounded-xl font-medium transition text-red-500 hover:bg-red-500 hover:text-black hover:border-red-500"
            style={{
              border: `1px solid ${isDark ? "#444" : "#cbd5e1"}`
            }}
          >
            {confirmText}
          </button>

        </div>

        <button
          onClick={onCancel}
          className="text-sm opacity-50 transition hover:opacity-100"
        >
          Cancel
        </button>
      </motion.div>
    </div>,
    document.body
  );
}
