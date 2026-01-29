import { contextBridge, Notification } from "electron";

contextBridge.exposeInMainWorld("native", {
  notify(title, body) {
    new Notification({ title, body }).show();
  }
});
