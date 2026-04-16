import { getTodayDayKey } from "./dateHelpers";

/**
 * Returns true only if the habit is genuinely scheduled for today.
 * Unknown or unsupported frequencies are treated as NOT scheduled (false),
 * not as daily — this prevents unintended habits from appearing.
 */
export function isHabitScheduledForToday(habit) {
    if (!habit || typeof habit !== "object") return false;

    const { frequency, days } = habit;
    const todayKey = getTodayDayKey();

    if (!frequency || frequency === "daily") return true;

    if (frequency === "custom") {
        // No days defined → treat as unscheduled, not daily
        if (!Array.isArray(days) || days.length === 0) return false;
        return days.includes(todayKey);
    }

    // Unknown/unsupported frequency → do not show
    return false;
}

/**
 * Returns true if the habit was completed today.
 * Uses completedDays as the single source of truth.
 */
export function isCompletedToday(habit, today) {
    if (!habit || !today) return false;
    return Array.isArray(habit.completedDays) && habit.completedDays.includes(today);
}

/**
 * Returns true if a custom-frequency habit has no days selected.
 * Use this to show a warning in the UI, not to alter scheduling logic.
 */
export function isCustomHabitUnscheduled(habit) {
    return (
        habit?.frequency === "custom" &&
        (!Array.isArray(habit.days) || habit.days.length === 0)
    );
}

