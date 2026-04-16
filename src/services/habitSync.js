import { STORAGE_KEYS } from "../constants/storageKeys";
import { saveHabits } from "../platform/native";

let syncDebounceTimer = null;

/**
 * Pushes the current localStorage habits to the native (Electron) layer.
 * Debounced — multiple rapid calls collapse into one sync after 500ms.
 * localStorage is the single source of truth; native is a write-mirror.
 */
export function syncHabits() {
  if (syncDebounceTimer) clearTimeout(syncDebounceTimer);
  syncDebounceTimer = setTimeout(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.habits);
      if (!raw) {
        saveHabits([]);
        return;
      }
      const habits = JSON.parse(raw);
      if (!Array.isArray(habits)) {
        console.warn("syncHabits: data in storage is not an array, skipping sync.");
        return;
      }
      saveHabits(habits);
    } catch (err) {
      console.error("syncHabits failed:", err);
      saveHabits([]);
    }
    syncDebounceTimer = null;
  }, 500);
}
