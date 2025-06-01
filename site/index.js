// App configuration
const config = {
  videoFormats: [".mp4", ".avi", ".mkv", ".mov", ".webm", ".flv", ".wmv"],
  defaultFolder: "", // Will be set from localStorage
  scanInterval: 60, // minutes
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

// DOM Elements
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

// Buttons
const playPauseBtn = document.getElementById("playPauseBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const volumeBtn = document.getElementById("volumeBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const settingsBtn = document.getElementById("settingsBtn");
const closeSettings = document.getElementById("closeSettings");
const browseBtn = document.getElementById("browseBtn");
const manualRefresh = document.getElementById("manualRefresh");
const lightModeBtn = document.getElementById("lightModeBtn");
const darkModeBtn = document.getElementById("darkModeBtn");
const saveSettings = document.getElementById("saveSettings");

// Initialize the app
function initApp() {
  loadSettings();
  setupEventListeners();
  checkFolderAndScan();
  startScanTimer();
  updateUI();
}

// Load settings from localStorage
function loadSettings() {
  const savedConfig = localStorage.getItem("videoPlayerConfig");
  if (savedConfig) {
    const parsedConfig = JSON.parse(savedConfig);
    Object.assign(config, parsedConfig);
  }

  // Update UI elements with loaded settings
  folderPath.value = config.defaultFolder;
  scanInterval.value = config.scanInterval;
  loopPlaylist.checked = config.loopPlaylist;
  autoplayCheckbox.checked = config.autoplay;

  // Set theme
  setTheme(config.isDarkMode);
}

// Save settings to localStorage
function saveSettingsToStorage() {
  config.defaultFolder = folderPath.value;
  config.scanInterval = parseInt(scanInterval.value);
  config.loopPlaylist = loopPlaylist.checked;
  config.autoplay = autoplayCheckbox.checked;

  localStorage.setItem("videoPlayerConfig", JSON.stringify(config));
  showMessage("Configurações salvas com sucesso!");
}

// Set theme (true for dark, false for light)
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

// Set up event listeners
function setupEventListeners() {
  // Video player events
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

  // Mouse events for showing/hiding controls
  videoContainer.addEventListener("mousemove", showControls);
  videoContainer.addEventListener("mouseleave", () => {
    if (!config.showControls) hideControls();
  });

  // Control buttons
  playPauseBtn.addEventListener("click", togglePlayPause);
  prevBtn.addEventListener("click", playPreviousVideo);
  nextBtn.addEventListener("click", playNextVideo);
  progressBar.addEventListener("input", seekVideo);
  volumeControl.addEventListener("input", changeVolume);
  volumeBtn.addEventListener("click", toggleMute);
  fullscreenBtn.addEventListener("click", toggleFullscreen);

  // Settings panel
  settingsBtn.addEventListener("click", toggleSettingsPanel);
  closeSettings.addEventListener("click", toggleSettingsPanel);
  browseBtn.addEventListener("click", browseFolder);
  manualRefresh.addEventListener("click", () => {
    checkFolderAndScan();
  });
  lightModeBtn.addEventListener("click", () => setTheme(false));
  darkModeBtn.addEventListener("click", () => setTheme(true));
  saveSettings.addEventListener("click", () => {
    saveSettingsToStorage();
    startScanTimer(); // Restart timer with new interval
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

  // Keyboard shortcuts
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

// Show controls with timeout
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

// Hide controls immediately
function hideControls() {
  controlsOverlay.style.display = "none";
  statusBar.style.display = "none";
  config.showControls = false;
}

// Toggle play/pause
function togglePlayPause() {
  if (videoPlayer.paused) {
    videoPlayer.play();
  } else {
    videoPlayer.pause();
  }
}

// Update play/pause button
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

// Update progress bar
function updateProgressBar() {
  const currentTime = videoPlayer.currentTime;
  const duration = videoPlayer.duration || 1;
  const progressPercent = (currentTime / duration) * 100;
  progressBar.value = progressPercent;

  // Update time display
  videoTime.textContent = `${formatTime(currentTime)} / ${formatTime(
    duration
  )}`;
}

// Format time (seconds to MM:SS)
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

// Seek video
function seekVideo() {
  const seekTime = (progressBar.value / 100) * videoPlayer.duration;
  videoPlayer.currentTime = seekTime;
}

// Seek relative to current position
function seekRelative(seconds) {
  videoPlayer.currentTime += seconds;
}

// Update volume button
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

// Change volume
function changeVolume(change) {
  if (typeof change === "number") {
    // Change by delta (keyboard)
    let newVolume = videoPlayer.volume + change / 100;
    newVolume = Math.max(0, Math.min(1, newVolume));
    videoPlayer.volume = newVolume;
    videoPlayer.muted = false;
  } else {
    // Change by slider
    videoPlayer.volume = volumeControl.value / 100;
    videoPlayer.muted = false;
  }
  updateVolumeButton();
}

// Toggle mute
function toggleMute() {
  videoPlayer.muted = !videoPlayer.muted;
  updateVolumeButton();
}

// Toggle fullscreen
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

// Toggle settings panel
function toggleSettingsPanel() {
  settingsPanel.classList.toggle("translate-x-full");
  settingsPanel.classList.toggle("translate-x-0");
}

// Browse folder (simulated in browser environment)
function browseFolder() {
  // In a real Electron app, this would open a folder dialog
  // For web demo, we'll just simulate it with a prompt
  const path = prompt("Digite o caminho da pasta de vídeos:", folderPath.value);
  if (path !== null) {
    folderPath.value = path;
    checkFolderAndScan();
  }
}

// Check folder and scan for videos
function checkFolderAndScan() {
  const folder = folderPath.value.trim();

  if (!folder) {
    showMessage("Por favor, selecione uma pasta primeiro");
    return;
  }

  // Validate path format
  if (!isValidPath(folder)) {
    pathError.textContent =
      "Formato de caminho inválido. Use caminho local (C:\\Videos) ou rede (\\\\SERVER\\Videos)";
    pathError.classList.remove("hidden");
    return;
  }

  pathError.classList.add("hidden");
  refreshSpinner.classList.remove("hidden");
  manualRefresh.disabled = true;

  // Simulate scanning a folder (in a real app, this would be an API call)
  simulateScanFolder(folder);
}

// Validate path format
function isValidPath(path) {
  // Windows local path: C:\, C:\Users\, C:\Users\yasmi\Videos\
  const windowsLocalPath = /^[a-zA-Z]:\\(?:[^\\/:?"<>|\r\n]+\\?)*$/;
  // Windows network path: \\server\share, \\server\share\folder
  const windowsNetworkPath = /^\\\\[^\\/:?"<>|\r\n]+(\\[^\\/:?"<>|\r\n]+)+\\?$/;
  // Unix-like path: /home/user/videos/
  const unixPath = /^\/(?:[^\/:?"<>|\r\n]+\/)*$/;
  return (
    windowsLocalPath.test(path) ||
    windowsNetworkPath.test(path) ||
    unixPath.test(path)
  );
}

// Simulate scanning a folder (replace with actual API call in real app)
function simulateScanFolder(folder) {
  showMessage("Verificando pasta...");
  scanProgress.style.width = "0%";
  videoList.innerHTML =
    '<p class="text-gray-400 text-center py-4">Verificando pasta...</p>';

  // Simulate progress
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += 5;
    scanProgress.style.width = `${progress}%`;

    if (progress >= 100) {
      clearInterval(progressInterval);
      onFolderScanComplete(folder);
    }
  }, 100);
}

// Called when folder scan is complete
async function onFolderScanComplete(folder) {
  refreshSpinner.classList.add("hidden");
  manualRefresh.disabled = false;

  // Checa acesso à pasta (opcional, pode ser removido se confiar no backend)
  // if (!simulateCheckFolderAccess(folder)) { ... }
  // Agora, sempre tenta buscar os vídeos reais
  const foundVideos = await realFindVideos(folder);

  if (foundVideos.length === 0) {
    showMessage("Nenhum vídeo encontrado na pasta");
    videoList.innerHTML =
      '<p class="text-gray-400 text-center py-4">Nenhum vídeo encontrado</p>';
    scanStatusText.classList.add("hidden");
    return;
  }

  // Atualiza a lista de vídeos
  config.videoList = foundVideos;
  updateVideoListUI();

  // Reproduz o primeiro vídeo se não estiver tocando
  if (
    config.videoList.length > 0 &&
    (config.currentVideoIndex === 0 || !videoPlayer.src)
  ) {
    playVideoByIndex(0);
  }

  // Atualiza status
  config.lastScanTime = new Date();
  updateScanStatus();
  showMessage(`Encontrados ${foundVideos.length} vídeos`);

  // Atualiza contagem
  scanCount.textContent = foundVideos.length;
  scanStatusText.classList.remove("hidden");
}

// Simulate checking folder access
function simulateCheckFolderAccess(folder) {
  // In a real app, this would check actual folder access
  // For demo, we'll simulate some common errors

  // Check if path looks like a network path
  const isNetworkPath = folder.startsWith("\\\\");

  // Simulate network path access issues
  if (isNetworkPath) {
    // 20% chance to simulate network error
    if (Math.random() < 0.2) {
      return false;
    }
  }

  // 10% chance to simulate any other access error
  if (Math.random() < 0.1) {
    return false;
  }

  return true;
}

// Update video list UI
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

    // Icon based on file type
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

// Play video by index
function playVideoByIndex(index) {
  if (index < 0 || index >= config.videoList.length) return;
  config.currentVideoIndex = index;
  const video = config.videoList[index];
  // Usa o caminho local do vídeo (servido pelo backend)
  // Para funcionar no navegador, é necessário servir os arquivos de vídeo via backend (ex: rota /file?path=...)
  // Aqui, vamos supor que você vai criar essa rota depois
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

// Play next video
function playNextVideo() {
  let nextIndex = config.currentVideoIndex + 1;

  if (nextIndex >= config.videoList.length) {
    if (config.loopPlaylist) {
      nextIndex = 0;
    } else {
      // End of playlist, no looping
      showMessage("Fim da playlist");
      return;
    }
  }

  playVideoByIndex(nextIndex);
}

// Play previous video
function playPreviousVideo() {
  let prevIndex = config.currentVideoIndex - 1;

  if (prevIndex < 0) {
    if (config.loopPlaylist) {
      prevIndex = config.videoList.length - 1;
    } else {
      // Beginning of playlist, no looping
      return;
    }
  }

  playVideoByIndex(prevIndex);
}

// Start scan timer
function startScanTimer() {
  // Clear existing timer if any
  if (window.scanTimer) {
    clearInterval(window.scanTimer);
  }

  // Set new timer
  const intervalMinutes = parseInt(scanInterval.value) || 60;
  const intervalMs = intervalMinutes * 60 * 1000;

  window.scanTimer = setInterval(() => {
    checkFolderAndScan();
  }, intervalMs);

  // Update status
  config.lastScanTime = new Date();
  updateScanStatus();
}

// Update scan status UI
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

// Show brief message
function showMessage(text) {
  messageElement.textContent = text;
  messageElement.style.display = "block";

  setTimeout(() => {
    messageElement.style.display = "none";
  }, 3000);
}

// Update all UI elements
function updateUI() {
  updatePlayPauseButton();
  updateVolumeButton();
  updateProgressBar();
  updateScanStatus();
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", initApp);

// Substitua realFindVideos por uma função que consome a API REST
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
