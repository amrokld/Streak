import { contextBridge, Notification } from "electron";
import fs from "fs";
import path from "path";
import os from "os";

const dataPath = path.join(
  os.homedir(),
  ".streak-data.json"
);

contextBridge.exposeInMainWorld("native", {
  notify(title, body) {
    new Notification({ title, body }).show();
  },
  saveHabits(habits) {
    fs.writeFileSync(dataPath, JSON.stringify(habits));
  }
});
