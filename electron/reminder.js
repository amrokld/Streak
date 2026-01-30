import { Notification } from "electron";
import fs from "fs";
import path from "path";
import os from "os";

const dataPath = path.join(
  os.homedir(),
  ".streak-data.json"
);

function loadHabits() {
  if (!fs.existsSync(dataPath)) return [];
  return JSON.parse(fs.readFileSync(dataPath, "utf-8"));
}

export function runDailyCheck() {
  const habits = loadHabits();
  const today = new Date().toDateString();

  const completedToday = habits.some(h =>
    h.completedDays?.includes(today)
  );

    if (!completedToday) {
    new Notification({
        title: "STREAK",
        body: "You haven’t completed any habit today."
    }).show();
    return true;
    }

    return false;
}
