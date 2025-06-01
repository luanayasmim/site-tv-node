// App configuration
const config = {
  videoFormats: [".mp4", ".avi", ".mkv", ".mov", ".webm", ".flv", ".wmv"],
  defaultFolder: "",
  scanInterval: 60,
  currentVideoIndex: 0,
  videoList: [],
  isPlaying: false,
  isFullscreen: false,
  isDarkMode: true,
  loopPlaylist: true,
  autoplay: true,
  showControls: false,
  controlsTimeout: null,
  lastScanTime: null,
};

const videoPlayer = document.getElementById("videoPlayer");
const videoContainer = document.getElementById("videoContainer");
const controlsOverlay = document.getElementById("controlsOverlay");
const statusBar = document.getElementById("statusBar");
const settingsPanel = document.getElementById("settingsPanel");
const messageElement = document.getElementById("message");
const progressBar = document.getElementById("progressBar");
const volumeControl = document.getElementById("volumeControl");
const currentVideoTitle = document.getElementById("currentVideoTitle");
const videoTime = document.getElementById("videoTime");
const videoCount = document.getElementById("videoCount");
const scanStatus = document.getElementById("scanStatus");
const nextScanTime = document.getElementById("nextScanTime");
const scanProgress = document.getElementById("scanProgress");
const videoList = document.getElementById("videoList");
const folderPath = document.getElementById("folderPath");
const scanInterval = document.getElementById("scanInterval");
const loopPlaylist = document.getElementById("loopPlaylist");
const autoplayCheckbox = document.getElementById("autoplay");
const pathError = document.getElementById("pathError");
const refreshSpinner = document.getElementById("refreshSpinner");
const scanStatusText = document.getElementById("scanStatusText");
const scanCount = document.getElementById("scanCount");

const playPauseBtn = document.getElementById("playPauseBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const volumeBtn = document.getElementById("volumeBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const settingsBtn = document.getElementById("settingsBtn");
const closeSettings = document.getElementById("closeSettings");
const manualRefresh = document.getElementById("manualRefresh");
const lightModeBtn = document.getElementById("lightModeBtn");
const darkModeBtn = document.getElementById("darkModeBtn");
const saveSettings = document.getElementById("saveSettings");

function initApp() {
  loadSettings();
  setupEventListeners();
  checkFolderAndScan();
  startScanTimer();
  updateUI();
}

function loadSettings() {
  const savedConfig = localStorage.getItem("videoPlayerConfig");
  if (savedConfig) {
    const parsedConfig = JSON.parse(savedConfig);
    Object.assign(config, parsedConfig);
  }

  folderPath.value = config.defaultFolder;
  scanInterval.value = config.scanInterval;
  loopPlaylist.checked = config.loopPlaylist;
  autoplayCheckbox.checked = config.autoplay;

  setTheme(config.isDarkMode);
}

function saveSettingsToStorage() {
  config.defaultFolder = folderPath.value;
  config.scanInterval = parseInt(scanInterval.value);
  config.loopPlaylist = loopPlaylist.checked;
  config.autoplay = autoplayCheckbox.checked;

  localStorage.setItem("videoPlayerConfig", JSON.stringify(config));
  showMessage("Configurações salvas com sucesso!");
}

function setTheme(isDarkMode) {
  config.isDarkMode = isDarkMode;

  if (isDarkMode) {
    document.body.classList.remove("light-theme");
    document.body.classList.add("bg-black", "text-white");
    darkModeBtn.classList.add("bg-blue-600");
    lightModeBtn.classList.remove("bg-blue-600");
  } else {
    document.body.classList.add("light-theme");
    document.body.classList.remove("bg-black", "text-white");
    lightModeBtn.classList.add("bg-blue-600");
    darkModeBtn.classList.remove("bg-blue-600");
  }
}

function setupEventListeners() {
  videoPlayer.addEventListener("play", () => {
    config.isPlaying = true;
    updatePlayPauseButton();
  });

  videoPlayer.addEventListener("pause", () => {
    config.isPlaying = false;
    updatePlayPauseButton();
  });

  videoPlayer.addEventListener("ended", () => {
    playNextVideo();
  });

  videoPlayer.addEventListener("timeupdate", updateProgressBar);
  videoPlayer.addEventListener("volumechange", updateVolumeButton);

  videoContainer.addEventListener("mousemove", showControls);
  videoContainer.addEventListener("mouseleave", () => {
    if (!config.showControls) hideControls();
  });

  playPauseBtn.addEventListener("click", togglePlayPause);
  prevBtn.addEventListener("click", playPreviousVideo);
  nextBtn.addEventListener("click", playNextVideo);
  progressBar.addEventListener("input", seekVideo);
  volumeControl.addEventListener("input", changeVolume);
  volumeBtn.addEventListener("click", toggleMute);
  fullscreenBtn.addEventListener("click", toggleFullscreen);

  settingsBtn.addEventListener("click", toggleSettingsPanel);
  closeSettings.addEventListener("click", toggleSettingsPanel);
  manualRefresh.addEventListener("click", () => {
    checkFolderAndScan();
  });
  lightModeBtn.addEventListener("click", () => setTheme(false));
  darkModeBtn.addEventListener("click", () => setTheme(true));
  saveSettings.addEventListener("click", () => {
    saveSettingsToStorage();
    startScanTimer();
  });
  loopPlaylist.addEventListener("change", () => {
    config.loopPlaylist = loopPlaylist.checked;
    console.log(loopPlaylist);
    saveSettingsToStorage();
  });
  autoplayCheckbox.addEventListener("change", () => {
    config.autoplay = autoplayCheckbox.checked;
    console.log(autoplayCheckbox);
    saveSettingsToStorage();
  });

  document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      e.preventDefault();
      togglePlayPause();
    } else if (e.code === "ArrowLeft") {
      seekRelative(-5);
    } else if (e.code === "ArrowRight") {
      seekRelative(5);
    } else if (e.code === "ArrowUp") {
      changeVolume(5);
    } else if (e.code === "ArrowDown") {
      changeVolume(-5);
    } else if (e.code === "KeyF") {
      toggleFullscreen();
    } else if (e.code === "KeyM") {
      toggleMute();
    } else if (e.code === "KeyN") {
      playNextVideo();
    } else if (e.code === "KeyP") {
      playPreviousVideo();
    } else if (e.code === "Escape" && config.isFullscreen) {
      toggleFullscreen();
    }
  });
}

function showControls() {
  if (config.isFullscreen || config.showControls) {
    controlsOverlay.style.display = "block";
    statusBar.style.display = "block";
    config.showControls = true;

    clearTimeout(config.controlsTimeout);
    config.controlsTimeout = setTimeout(() => {
      if (!videoPlayer.paused) {
        controlsOverlay.style.display = "none";
        statusBar.style.display = "none";
        config.showControls = false;
      }
    }, 3000);
  }
}

function hideControls() {
  controlsOverlay.style.display = "none";
  statusBar.style.display = "none";
  config.showControls = false;
}

function togglePlayPause() {
  if (videoPlayer.paused) {
    videoPlayer.play();
  } else {
    videoPlayer.pause();
  }
}

function updatePlayPauseButton() {
  if (videoPlayer.paused) {
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    playPauseBtn.classList.remove("bg-blue-600");
    playPauseBtn.classList.add("bg-green-600");
  } else {
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    playPauseBtn.classList.remove("bg-green-600");
    playPauseBtn.classList.add("bg-blue-600");
  }
}

function updateProgressBar() {
  const currentTime = videoPlayer.currentTime;
  const duration = videoPlayer.duration || 1;
  const progressPercent = (currentTime / duration) * 100;
  progressBar.value = progressPercent;

  videoTime.textContent = `${formatTime(currentTime)} / ${formatTime(
    duration
  )}`;
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

function seekVideo() {
  const seekTime = (progressBar.value / 100) * videoPlayer.duration;
  videoPlayer.currentTime = seekTime;
}

function seekRelative(seconds) {
  videoPlayer.currentTime += seconds;
}

function updateVolumeButton() {
  if (videoPlayer.muted || videoPlayer.volume === 0) {
    volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
  } else if (videoPlayer.volume < 0.5) {
    volumeBtn.innerHTML = '<i class="fas fa-volume-down"></i>';
  } else {
    volumeBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
  }
  volumeControl.value = videoPlayer.muted ? 0 : videoPlayer.volume * 100;
}

function changeVolume(change) {
  if (typeof change === "number") {
    let newVolume = videoPlayer.volume + change / 100;
    newVolume = Math.max(0, Math.min(1, newVolume));
    videoPlayer.volume = newVolume;
    videoPlayer.muted = false;
  } else {
    videoPlayer.volume = volumeControl.value / 100;
    videoPlayer.muted = false;
  }
  updateVolumeButton();
}

function toggleMute() {
  videoPlayer.muted = !videoPlayer.muted;
  updateVolumeButton();
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    videoContainer.requestFullscreen().catch((err) => {
      console.error(`Error attempting to enable fullscreen: ${err.message}`);
    });
    config.isFullscreen = true;
    fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
  } else {
    document.exitFullscreen();
    config.isFullscreen = false;
    fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
  }
}

function toggleSettingsPanel() {
  settingsPanel.classList.toggle("translate-x-full");
  settingsPanel.classList.toggle("translate-x-0");
}

function checkFolderAndScan() {
  const folder = folderPath.value.trim();
  if (!folder) {
    showMessage("Por favor, selecione uma pasta primeiro");
    return;
  }
  refreshSpinner.classList.remove("hidden");
  manualRefresh.disabled = true;
  onFolderScanComplete(folder);
}

async function onFolderScanComplete(folder) {
  refreshSpinner.classList.add("hidden");
  manualRefresh.disabled = false;
  const foundVideos = await realFindVideos(folder);

  if (foundVideos.length === 0) {
    showMessage("Nenhum vídeo encontrado na pasta");
    videoList.innerHTML =
      '<p class="text-gray-400 text-center py-4">Nenhum vídeo encontrado</p>';
    scanStatusText.classList.add("hidden");
    return;
  }

  config.videoList = foundVideos;
  updateVideoListUI();

  if (
    config.videoList.length > 0 &&
    (config.currentVideoIndex === 0 || !videoPlayer.src)
  ) {
    playVideoByIndex(0);
  }

  config.lastScanTime = new Date();
  updateScanStatus();
  showMessage(`Encontrados ${foundVideos.length} vídeos`);

  scanCount.textContent = foundVideos.length;
  scanStatusText.classList.remove("hidden");
}

function updateVideoListUI() {
  videoList.innerHTML = "";

  if (config.videoList.length === 0) {
    videoList.innerHTML =
      '<p class="text-gray-400 text-center py-4">Nenhum vídeo encontrado</p>';
    return;
  }

  config.videoList.forEach((video, index) => {
    const videoItem = document.createElement("div");
    const isCurrent = index === config.currentVideoIndex;
    videoItem.className =
      "flex items-center p-2 rounded hover:bg-gray-700 cursor-pointer " +
      (isCurrent ? "bg-blue-900" : "");

    const fileExt = video.path.split(".").pop().toLowerCase();
    let fileIcon = "fa-file-video";

    if (fileExt === "mp4") fileIcon = "fa-file-video";
    else if (fileExt === "avi") fileIcon = "fa-file-video";
    else if (fileExt === "mkv") fileIcon = "fa-file-video";
    else if (fileExt === "mov") fileIcon = "fa-file-video";
    else if (fileExt === "webm") fileIcon = "fa-file-video";

    videoItem.innerHTML = `
                    <i class="fas ${fileIcon} mr-3 ${
      index === config.currentVideoIndex ? "text-blue-400" : "text-gray-400"
    }"></i>
                    <span class="truncate flex-1">${video.name}</span>
                    <span class="text-gray-400 text-sm">${fileExt.toUpperCase()}</span>
                `;
    videoItem.addEventListener("click", () => playVideoByIndex(index));
    videoList.appendChild(videoItem);
  });
}

function playVideoByIndex(index) {
  if (index < 0 || index >= config.videoList.length) return;
  config.currentVideoIndex = index;
  const video = config.videoList[index];
  videoPlayer.src = `http://localhost:3001/file?path=${encodeURIComponent(
    video.path
  )}`;
  videoPlayer.load();
  if (config.autoplay) {
    videoPlayer.play().catch((e) => {
      if (e.name === "NotAllowedError") {
        videoPlayer.muted = true;
        videoPlayer.play().catch((err2) => {
          showMessage("Clique para reproduzir (autoplay bloqueado)");
        });
      } else {
        showMessage("Clique para reproduzir (erro de reprodução)");
      }
    });
  }
  currentVideoTitle.textContent = video.name;
  videoCount.textContent = `${index + 1}/${config.videoList.length}`;
  updateVideoListUI();
  updateUI();
}

function playNextVideo() {
  let nextIndex = config.currentVideoIndex + 1;

  if (nextIndex >= config.videoList.length) {
    if (config.loopPlaylist) {
      nextIndex = 0;
    } else {
      showMessage("Fim da playlist");
      return;
    }
  }

  playVideoByIndex(nextIndex);
}

function playPreviousVideo() {
  let prevIndex = config.currentVideoIndex - 1;

  if (prevIndex < 0) {
    if (config.loopPlaylist) {
      prevIndex = config.videoList.length - 1;
    } else {
      return;
    }
  }

  playVideoByIndex(prevIndex);
}

function startScanTimer() {
  if (window.scanTimer) {
    clearInterval(window.scanTimer);
  }

  const intervalMinutes = parseInt(scanInterval.value) || 60;
  const intervalMs = intervalMinutes * 60 * 1000;

  window.scanTimer = setInterval(() => {
    checkFolderAndScan();
  }, intervalMs);

  config.lastScanTime = new Date();
  updateScanStatus();
}

function updateScanStatus() {
  if (!config.lastScanTime) return;

  const nextScan = new Date(
    config.lastScanTime.getTime() + config.scanInterval * 60 * 1000
  );
  const now = new Date();
  const timeLeft = Math.max(0, Math.floor((nextScan - now) / 60000)); // in minutes

  let timeText;
  if (timeLeft === 0) {
    timeText = "em breve";
  } else if (timeLeft === 1) {
    timeText = "1 minuto";
  } else {
    timeText = `${timeLeft} minutos`;
  }

  nextScanTime.textContent = timeText;
}

function showMessage(text) {
  messageElement.textContent = text;
  messageElement.style.display = "block";

  setTimeout(() => {
    messageElement.style.display = "none";
  }, 3000);
}

function updateUI() {
  updatePlayPauseButton();
  updateVolumeButton();
  updateProgressBar();
  updateScanStatus();
}

document.addEventListener("DOMContentLoaded", initApp);

async function realFindVideos(folder) {
  try {
    const response = await fetch(
      `http://localhost:3001/videos?dir=${encodeURIComponent(folder)}`
    );
    const result = await response.json();
    if (!result.success) {
      showMessage(
        "Erro ao acessar a pasta: " + (result.error || "Erro desconhecido")
      );
      return [];
    }
    return result.videos.map((video) => ({
      name: video.name,
      path: video.path,
      exists: true,
    }));
  } catch (err) {
    showMessage("Erro ao conectar à API: " + err.message);
    return [];
  }
}
