import { getToday, daysBetween } from "./dateHelpers";

const MAX_FREEZES = 5;
const WEEKLY_REWARD_INTERVAL = 7;   // every 7 consecutive days
const MILESTONES = [30, 60, 90, 180, 365]; // bonus freeze at these streaks

/**
 * Pure function — takes the current habit and returns a result object.
 * Does NOT mutate. Does NOT touch UI or storage.
 *
 * @returns {{ habit: Object, freezeUsed: boolean, freezeEarned: boolean }}
 */
export function applyCheckIn(habit) {
    const today = getToday();

    // ── Rule 1: already checked in today → no-op ──────────────────────────
    if (habit.lastCompletedDate === today) {
        return { habit, freezeUsed: false, freezeEarned: false };
    }

    const prevStreak = habit.currentStreak ?? 0;
    let newStreak = 1;
    let newFreezeCount = habit.freezeCount ?? 0;
    let freezeUsed = false;

    if (habit.lastCompletedDate) {
        const gap = daysBetween(habit.lastCompletedDate, today);

        if (gap === 1) {
            // ── Rule 2: consecutive day ────────────────────────────────────
            newStreak = prevStreak + 1;
        } else {
            // ── Rule 3: gap exists ─────────────────────────────────────────
            const missedDays = gap - 1;
            if (newFreezeCount >= missedDays) {
                newFreezeCount -= missedDays;
                newStreak = prevStreak + 1;
                freezeUsed = true;
            } else {
                newStreak = 1;
                newFreezeCount = 0;
            }
        }
    }

    // ── Freeze earning: weekly reward ──────────────────────────────────────
    let freezeEarned = false;
    if (newStreak > 0 && newStreak % WEEKLY_REWARD_INTERVAL === 0 && newStreak !== prevStreak) {
        if (newFreezeCount < MAX_FREEZES) {
            newFreezeCount = Math.min(newFreezeCount + 1, MAX_FREEZES);
            freezeEarned = true;
        }
    }

    // ── Freeze earning: milestone reward (only if weekly didn't already trigger) ──
    if (!freezeEarned && MILESTONES.includes(newStreak) && newStreak !== prevStreak) {
        if (newFreezeCount < MAX_FREEZES) {
            newFreezeCount = Math.min(newFreezeCount + 1, MAX_FREEZES);
            freezeEarned = true;
        }
    }

    const newLongest = Math.max(habit.longestStreak ?? 0, newStreak);

    return {
        habit: {
            ...habit,
            currentStreak: newStreak,
            longestStreak: newLongest,
            freezeCount: newFreezeCount,
            lastCompletedDate: today,
        },
        freezeUsed,
        freezeEarned,
    };
}
