const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const net = require("net");
const fs = require("fs");

const isDev = process.env.NODE_ENV === "development";
const PORT = 3000;
const URL = `http://localhost:${PORT}`;

let mainWindow;
let serverProcess;

function getNodeBinPath() {
  const standaloneDir = path.join(process.resourcesPath, "standalone");
  const platformBinName = process.platform === "win32" ? "node-bin.exe" : "node-bin";
  const platformBinPath = path.join(standaloneDir, platformBinName);
  const legacyBinPath = path.join(standaloneDir, "node-bin");

  if (fs.existsSync(platformBinPath)) return platformBinPath;
  return legacyBinPath;
}

// Start the standalone Next.js server in production
function startNextServer() {
  return new Promise((resolve, reject) => {
    if (isDev) {
      resolve(); // In dev, Next.js dev server is started separately
      return;
    }

    const serverPath = path.join(
      process.resourcesPath,
      "standalone",
      "server.js",
    );

    // Use the bundled Node.js binary (not Electron's embedded Node)
    // to avoid ABI mismatch with native modules like better-sqlite3.
    const nodeBin = getNodeBinPath();

    serverProcess = spawn(nodeBin, [serverPath], {
      env: {
        ...process.env,
        NODE_ENV: "production",
        PORT: String(PORT),
        HOSTNAME: "localhost",
        IKKFMS_DB_PATH: path.join(process.resourcesPath, "data", "ikkfms.db"),
      },
      cwd: path.join(process.resourcesPath, "standalone"),
      stdio: "pipe",
    });

    serverProcess.stdout.on("data", (data) => {
      console.log(`[next] ${data}`);
    });

    serverProcess.stderr.on("data", (data) => {
      console.error(`[next] ${data}`);
    });

    serverProcess.on("error", reject);

    // Wait for server to be ready
    const checkReady = () => {
      const socket = new net.Socket();
      socket.setTimeout(500);
      socket.on("connect", () => {
        socket.destroy();
        resolve();
      });
      socket.on("timeout", () => {
        socket.destroy();
        setTimeout(checkReady, 300);
      });
      socket.on("error", () => {
        setTimeout(checkReady, 300);
      });
      socket.connect(PORT, "localhost");
    };

    setTimeout(checkReady, 500);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: "IKKFMS - Pendataan Keluarga",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL(URL);

  // Retry if Next.js server isn't ready yet
  mainWindow.webContents.on("did-fail-load", () => {
    setTimeout(() => mainWindow.loadURL(URL), 2000);
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  startNextServer().catch((err) => {
    console.error("[electron] failed to start standalone server:", err);
  });
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  app.quit();
});

app.on("before-quit", () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
});
