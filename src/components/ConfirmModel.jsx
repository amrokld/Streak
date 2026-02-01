import { useTheme } from "../Context/ThemeContext";

export default function ConfirmModal({
  title = "Are you sure?",
  message,
  confirmText = "Delete",
  onConfirm,
  onCancel
}) {
  const { isDark } = useTheme();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: isDark
          ? "rgba(0,0,0,0.65)"
          : "rgba(0,0,0,0.35)"
      }}
      onClick={onCancel}
    >
      <div
        className="rounded-3xl px-8 py-6 w-80"
        style={{
          backgroundColor: isDark ? "#2a2a2a" : "#ffffff"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-medium mb-2">{title}</h3>

        <p className="text-sm opacity-70 mb-6">
          {message}
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="text-sm opacity-60"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="text-sm font-medium"
            style={{ color: "#ef4444" }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
