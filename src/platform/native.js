/**
 * Structured API bridge between the React frontend and the Electron native layer.
 * All native calls go through this module — never call window.native directly.
 */

const native = () => window.native ?? null;

// ---- NOTIFICATIONS ----
export const notify = (title, body) => {
  native()?.notify(title, body);
};

export const notifyStreakAlert = (habitName, streak) => {
  native()?.notify(
    "🔥 Streak Milestone!",
    `"${habitName}" is on a ${streak}-day streak. Keep it up!`
  );
};

export const notifyDailySummary = (completed, total) => {
  if (total === 0) return;
  const pct = Math.round((completed / total) * 100);
  native()?.notify(
    "📊 Daily Summary",
    `You completed ${completed}/${total} habits today (${pct}%).`
  );
};

// ---- SYSTEM SCHEDULING (requires Electron-side implementation) ----

/**
 * Schedules a system-level notification via the OS scheduler.
 * This survives app closure — must be implemented in electron/main.js
 * using node-schedule or Electron's powerMonitor + system notifications.
 *
 * @param {string} time - "HH:MM" format
 * @param {string} title
 * @param {string} body
 */
export const scheduleSystemNotification = (time, title, body) => {
  const n = native();
  if (!n) return;
  if (typeof n.scheduleNotification !== "function") {
    console.warn("native.scheduleNotification not implemented. System-level scheduling requires Electron main process integration.");
    return;
  }
  n.scheduleNotification({ time, title, body });
};


// ---- DATA SYNC ----
export const saveHabits = (habits) => {
  native()?.saveHabits(habits);
};

export const saveTasks = (tasks) => {
  const n = native();
  if (!n) return;
  if (typeof n.saveTasks !== "function") {
    console.warn("native.saveTasks is not implemented in the preload layer.");
    return;
  }
  n.saveTasks(tasks);
};

export const saveSettings = (settings) => {
  const n = native();
  if (!n) return;
  if (typeof n.saveSettings !== "function") {
    console.warn("native.saveSettings is not implemented in the preload layer.");
    return;
  }
  n.saveSettings(settings);
};

// ---- WINDOW CONTROLS ----
export const minimize = () => native()?.minimize?.();
export const maximize = () => native()?.maximize?.();
export const close = () => native()?.close?.();

