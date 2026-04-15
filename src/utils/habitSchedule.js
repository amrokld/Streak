import { getTodayDayKey } from "./dateHelpers";

export function isHabitScheduledForToday(habit) {
    const todayKey = getTodayDayKey();

    // Daily or missing frequency → always show
    if (!habit.frequency || habit.frequency === "daily") return true;

    // Custom → check days array (fallback to daily if empty)
    if (habit.frequency === "custom") {
        if (!habit.days || habit.days.length === 0) return true;
        return habit.days.includes(todayKey);
    }

    return true;
}
