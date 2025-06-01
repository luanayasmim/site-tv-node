const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  win.loadFile("index.html");
}

app.whenReady().then(createWindow);

ipcMain.handle("list-videos", async (event, folderPath, videoFormats) => {
  try {
    const files = fs.readdirSync(folderPath);
    const videos = files
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return videoFormats.includes(ext);
      })
      .map((file) => ({
        name: file,
        path: path.join(folderPath, file),
      }));
    return { success: true, videos };
  } catch (err) {
    return { success: false, error: err.message };
  }
});
