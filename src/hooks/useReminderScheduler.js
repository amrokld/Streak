import { useEffect, useRef } from "react";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { isHabitScheduledForToday, isCompletedToday } from "../utils/habitSchedule";
import { getToday } from "../utils/dateHelpers";
import { notify, notifyDailySummary } from "../platform/native";

// ---- Helpers ----

/**
 * Builds an adaptive reminder message based on habit urgency and streak status.
 * Fixes 5, 9, 10: contextual tone, safe data access, streak-aware messaging.
 */
function buildReminderMessage(pendingHabits) {
    try {
        if (!Array.isArray(pendingHabits) || pendingHabits.length === 0) {
            return "Time to check in on your habits!";
        }

        const priorityOrder = { urgent: 0, important: 1, optional: 2 };
        const sorted = [...pendingHabits].sort(
            (a, b) => (priorityOrder[a.category] ?? 1) - (priorityOrder[b.category] ?? 1)
        );

        const count = sorted.length;
        const top = sorted[0];
        const topName = top?.name?.trim() || "a habit";
        const topStreak = typeof top?.streak === "number" ? top.streak : 0;
        const topCategory = top?.category;

        // Fix 9 & 10: tone adapts to category and streak risk
        if (topCategory === "urgent") {
            if (count === 1) return `⚠️ "${topName}" is urgent and still pending. Don't lose your ${topStreak}-day streak!`;
            return `⚠️ ${count} habits pending — "${topName}" is urgent. Act now!`;
        }

        if (topStreak >= 7) {
            if (count === 1) return `🔥 "${topName}" — ${topStreak} days strong. Don't break it now!`;
            return `🔥 ${count} habits pending. Your ${topStreak}-day streak on "${topName}" is at risk!`;
        }

        if (count === 1) return `"${topName}" is still pending today. Keep your streak alive!`;
        return `${count} habits pending — starting with "${topName}". Don't break your streak!`;
    } catch {
        return "You still have habits to complete today!";
    }
}

function parseReminderTime(rawTime) {
    try {
        const raw = rawTime || localStorage.getItem(STORAGE_KEYS.reminderTime) || "20:00";
        const [h, m] = raw.split(":").map(Number);
        if (isNaN(h) || isNaN(m)) return { hour: 20, minute: 0 };
        return { hour: Math.min(23, Math.max(0, h)), minute: Math.min(59, Math.max(0, m)) };
    } catch {
        return { hour: 20, minute: 0 };
    }
}

function msUntilTime(rawTime) {
    const { hour, minute } = parseReminderTime(rawTime);
    const now = new Date();
    const target = new Date();
    target.setHours(hour, minute, 0, 0);
    const diff = target - now;
    return diff > 0 ? diff : null;
}

// ---- Hook ----

/**
 * @param {Array} habits - live habits array from context
 * @param {boolean} remindersEnabled - from settings state (re-triggers on change)
 * @param {string} reminderTime - "HH:MM" string (re-triggers on change)
 */
export function useReminderScheduler(habits, remindersEnabled, reminderTime) {
    const timerRef = useRef(null);
    const habitsRef = useRef(habits);

    // Always keep habitsRef current without restarting the scheduler
    useEffect(() => {
        habitsRef.current = habits;
    }, [habits]);

    // Restart scheduler when reminders toggle or time changes — Fix 2
    useEffect(() => {
        // Clear any existing timer before (re)scheduling
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        if (!remindersEnabled) return;

        const today = getToday();
        if (localStorage.getItem(STORAGE_KEYS.reminderSentPrefix + today)) return;

        // Fix 3 & 6: if time already passed today, skip silently (no instant fire)
        const msUntil = msUntilTime(reminderTime);
        if (msUntil === null) return;

        timerRef.current = setTimeout(() => {
            try {
                if (localStorage.getItem(STORAGE_KEYS.reminders) !== "true") return;

                const now = getToday();
                if (localStorage.getItem(STORAGE_KEYS.reminderSentPrefix + now)) return;

                const currentHabits = habitsRef.current;
                if (!Array.isArray(currentHabits)) return;

                const scheduled = currentHabits.filter(isHabitScheduledForToday);
                // Fix 7: safeguard — nothing scheduled, send nothing
                if (scheduled.length === 0) {
                    localStorage.setItem(STORAGE_KEYS.reminderSentPrefix + now, "true");
                    return;
                }

                const pending = scheduled.filter(h => !isCompletedToday(h, now));

                if (pending.length === 0) {
                    localStorage.setItem(STORAGE_KEYS.reminderSentPrefix + now, "true");
                    return;
                }

                // Fix 8 & 10: categorize pending by urgency for title differentiation
                const hasUrgent = pending.some(h => h.category === "urgent");
                const title = hasUrgent ? "⚠️ Streak — Urgent Reminder" : "Streak";

                notify(title, buildReminderMessage(pending));
                localStorage.setItem(STORAGE_KEYS.reminderSentPrefix + now, "true");

                // Daily summary — fires 3s after the main reminder
                const completedToday = scheduled.filter(h => isCompletedToday(h, now));
                setTimeout(() => {
                    notifyDailySummary(completedToday.length, scheduled.length);
                }, 3000);
            } catch (err) {
                console.error("Reminder scheduler error:", err);
            }
        }, msUntil);

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [remindersEnabled, reminderTime]); // Fix 2: re-runs when settings change
}

