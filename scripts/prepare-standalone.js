const fs = require("fs");
const path = require("path");

// This script copies the Next.js standalone output + static files + public assets
// into a single dist-standalone/ folder that electron-builder will bundle.

const ROOT = process.cwd();
const STANDALONE_SRC = path.join(ROOT, ".next", "standalone");
const STATIC_SRC = path.join(ROOT, ".next", "static");
const PUBLIC_SRC = path.join(ROOT, "public");
const DIST = path.join(ROOT, "dist-standalone");

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;

  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const child of fs.readdirSync(src)) {
      copyRecursive(path.join(src, child), path.join(dest, child));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

// Clean previous dist
if (fs.existsSync(DIST)) {
  fs.rmSync(DIST, { recursive: true, force: true });
}

console.log("Copying standalone server...");
copyRecursive(STANDALONE_SRC, DIST);

console.log("Copying static assets...");
copyRecursive(STATIC_SRC, path.join(DIST, ".next", "static"));

console.log("Copying public folder...");
copyRecursive(PUBLIC_SRC, path.join(DIST, "public"));

// Bundle the system Node.js binary so the standalone server runs on
// the same Node version that native modules were compiled for.
// This avoids ABI mismatch with Electron's embedded Node.
const NODE_BIN_SRC = process.execPath;
const NODE_BIN_DEST = path.join(DIST, "node-bin");
console.log(`Copying node binary from ${NODE_BIN_SRC}...`);
fs.copyFileSync(NODE_BIN_SRC, NODE_BIN_DEST);
fs.chmodSync(NODE_BIN_DEST, 0o755);

console.log("Standalone build prepared in dist-standalone/");
