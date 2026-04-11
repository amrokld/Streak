import { app, BrowserWindow } from "electron";
import pkg from "electron-updater";
const { autoUpdater } = pkg;
import path from "path";
import { fileURLToPath } from "url";
import { runDailyCheck } from "./reminder.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let win;
let lastNotifiedDate = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1100,
    height: 750,
    backgroundColor: "#1f1f1f",
    icon: path.join(__dirname, "../public/Streak.ico"),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

function startDailyReminderLoop() {
  setInterval(() => {
    const today = new Date().toDateString();

    // prevent multiple notifications per day
    if (lastNotifiedDate === today) return;

    const didNotify = runDailyCheck();

    if (didNotify) {
      lastNotifiedDate = today;
    }
  }, 1000 * 60 * 60); // every hour
}

app.whenReady().then(() => {
  createWindow();
  startDailyReminderLoop();
  
  // Silently check for updates on startup
  autoUpdater.checkForUpdatesAndNotify();
});

app.on("window-all-closed", () => {
  // keep app alive on Windows/Linux
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
