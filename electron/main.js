const { app, BrowserWindow, dialog } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const net = require("net");
const fs = require("fs");

const isDev = process.env.NODE_ENV === "development";
const PORT = 3000;
const HOST = "127.0.0.1";
const URL = `http://${HOST}:${PORT}`;
const STARTUP_TIMEOUT_MS = 30_000;
const READY_POLL_INTERVAL_MS = 250;

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

function getRuntimeDbPath() {
  const runtimeDataDir = path.join(app.getPath("userData"), "data");
  fs.mkdirSync(runtimeDataDir, { recursive: true });

  const runtimeDbPath = path.join(runtimeDataDir, "ikkfms.db");
  if (fs.existsSync(runtimeDbPath)) return runtimeDbPath;

  const bundledDbPath = path.join(process.resourcesPath, "data", "ikkfms.db");
  if (fs.existsSync(bundledDbPath)) {
    fs.copyFileSync(bundledDbPath, runtimeDbPath);
  }

  return runtimeDbPath;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// Start the standalone Next.js server in production
function startNextServer() {
  return new Promise((resolve, reject) => {
    if (isDev) {
      resolve(); // In dev, Next.js dev server is started separately
      return;
    }

    if (serverProcess && !serverProcess.killed) {
      resolve();
      return;
    }

    const standaloneDir = path.join(process.resourcesPath, "standalone");
    const serverPath = path.join(
      standaloneDir,
      "server.js",
    );
    if (!fs.existsSync(serverPath)) {
      reject(new Error(`Standalone server was not found at ${serverPath}`));
      return;
    }

    // Use the bundled Node.js binary (not Electron's embedded Node)
    // to avoid ABI mismatch with native modules like better-sqlite3.
    const nodeBin = getNodeBinPath();
    if (!fs.existsSync(nodeBin)) {
      reject(new Error(`Bundled Node.js binary was not found at ${nodeBin}`));
      return;
    }
    if (
      process.platform === "win32" &&
      path.extname(nodeBin).toLowerCase() !== ".exe"
    ) {
      reject(
        new Error(
          "Windows package is missing node-bin.exe. Rebuild the Windows artifact on a Windows machine.",
        ),
      );
      return;
    }

    const dbPath = getRuntimeDbPath();
    let settled = false;

    const finish = (err) => {
      if (settled) return;
      settled = true;
      if (err) {
        if (serverProcess && !serverProcess.killed) {
          serverProcess.kill();
        }
        reject(err);
        return;
      }
      resolve();
    };

    serverProcess = spawn(nodeBin, [serverPath], {
      env: {
        ...process.env,
        NODE_ENV: "production",
        PORT: String(PORT),
        HOSTNAME: HOST,
        IKKFMS_DB_PATH: dbPath,
      },
      cwd: standaloneDir,
      stdio: "pipe",
      windowsHide: true,
    });

    serverProcess.stdout.on("data", (data) => {
      console.log(`[next] ${data}`);
    });

    serverProcess.stderr.on("data", (data) => {
      console.error(`[next] ${data}`);
    });

    serverProcess.once("error", (err) => {
      finish(new Error(`Failed to launch standalone server: ${err.message}`));
    });

    serverProcess.once("exit", (code, signal) => {
      const exitedBeforeReady = !settled;
      serverProcess = null;
      if (exitedBeforeReady) {
        const reason = signal ? `signal ${signal}` : `code ${code}`;
        finish(
          new Error(
            `Standalone server exited before becoming ready (${reason}).`,
          ),
        );
      }
    });

    const deadline = Date.now() + STARTUP_TIMEOUT_MS;

    // Wait for server to be ready
    const checkReady = () => {
      if (settled) return;
      if (Date.now() > deadline) {
        finish(
          new Error(
            `Standalone server did not become ready within ${Math.round(
              STARTUP_TIMEOUT_MS / 1000,
            )} seconds.`,
          ),
        );
        return;
      }

      const socket = new net.Socket();
      socket.setTimeout(500);
      socket.on("connect", () => {
        socket.destroy();
        finish();
      });
      socket.on("timeout", () => {
        socket.destroy();
        setTimeout(checkReady, READY_POLL_INTERVAL_MS);
      });
      socket.on("error", () => {
        socket.destroy();
        setTimeout(checkReady, READY_POLL_INTERVAL_MS);
      });
      socket.connect(PORT, HOST);
    };

    setTimeout(checkReady, READY_POLL_INTERVAL_MS);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: "IKKFMS - Pendataan Keluarga",
    backgroundColor: "#0f172a",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function showStartupError(err) {
  const details =
    err instanceof Error ? err.stack || err.message : String(err || "Unknown");
  console.error("[electron] startup failed:", details);

  if (!mainWindow || mainWindow.isDestroyed()) {
    dialog.showErrorBox("IKKFMS gagal dijalankan", details);
    return;
  }

  const errorHtml = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>IKKFMS gagal dijalankan</title>
    <style>
      body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #0f172a; color: #e2e8f0; }
      .wrap { max-width: 900px; margin: 48px auto; padding: 0 24px; }
      h1 { margin: 0 0 8px; font-size: 24px; }
      p { margin: 0 0 16px; color: #94a3b8; }
      pre { margin: 0; padding: 16px; border-radius: 10px; background: #111827; color: #fca5a5; overflow: auto; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <h1>Aplikasi belum bisa dimulai</h1>
      <p>Terjadi masalah saat menjalankan server internal aplikasi.</p>
      <pre>${escapeHtml(details)}</pre>
    </div>
  </body>
</html>`;

  mainWindow.loadURL(
    `data:text/html;charset=UTF-8,${encodeURIComponent(errorHtml)}`,
  );
}

function loadLoadingScreen() {
  if (!mainWindow || mainWindow.isDestroyed()) return Promise.resolve();

  const loadingHtml = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Memulai IKKFMS</title>
    <style>
      body { margin: 0; height: 100vh; display: grid; place-items: center; background: #0f172a; color: #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      .card { text-align: center; }
      .dot { width: 10px; height: 10px; border-radius: 9999px; display: inline-block; margin: 0 4px; background: #38bdf8; animation: pulse 1.2s infinite ease-in-out; }
      .dot:nth-child(2) { animation-delay: .15s; }
      .dot:nth-child(3) { animation-delay: .3s; }
      @keyframes pulse { 0%, 80%, 100% { opacity: .3; transform: scale(.9);} 40% { opacity: 1; transform: scale(1);} }
      p { margin-top: 14px; color: #94a3b8; }
    </style>
  </head>
  <body>
    <div class="card">
      <h2>IKKFMS</h2>
      <div><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
      <p>Menyiapkan aplikasi...</p>
    </div>
  </body>
</html>`;

  return mainWindow.loadURL(
    `data:text/html;charset=UTF-8,${encodeURIComponent(loadingHtml)}`,
  );
}

async function bootstrap() {
  createWindow();

  if (isDev) {
    await mainWindow.loadURL(URL);
    mainWindow.webContents.openDevTools();
    return;
  }

  await loadLoadingScreen();
  await startNextServer();
  await mainWindow.loadURL(URL);
}

app.whenReady().then(async () => {
  try {
    await bootstrap();
  } catch (err) {
    showStartupError(err);
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      bootstrap().catch(showStartupError);
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
