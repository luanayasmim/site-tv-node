const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  listVideos: (folderPath, videoFormats) =>
    ipcRenderer.invoke("list-videos", folderPath, videoFormats),
});
