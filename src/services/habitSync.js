export function syncHabits() {
  const habits =
    JSON.parse(localStorage.getItem("habits")) || [];
  window.native?.saveHabits(habits);
}
