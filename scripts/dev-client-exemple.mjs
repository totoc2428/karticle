import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import net from "node:net";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const npmCommand = "npm";
const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return;
  }

  const content = readFileSync(filePath, "utf-8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(resolve(rootDir, ".env"));
loadEnvFile(resolve(rootDir, ".env.local"));

const widgetHost = process.env.KARTICLE_WIDGET_DNS ?? "localhost";
const widgetPort = Number(process.env.KARTICLE_WIDGET_PORT ?? "5173");
const clientHost = process.env.KARTICLE_CLIENT_DNS ?? "localhost";
const clientPort = Number(process.env.KARTICLE_CLIENT_PORT ?? "4173");
const widgetOrigin = `http://${widgetHost}:${widgetPort}`;
const clientOrigin = `http://${clientHost}:${clientPort}`;

function start(name, args) {
  const child = spawn(npmCommand, args, {
    cwd: rootDir,
    stdio: "inherit",
    shell: true,
  });

  child.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`[karticle] ${name} exited with code ${code}`);
    }
  });

  return child;
}

function isPortInUse(port) {
  const hosts = ["127.0.0.1", "::1"];

  return new Promise((resolvePort) => {
    let pending = hosts.length;
    let resolved = false;

    const finish = (value) => {
      if (!resolved) {
        resolved = true;
        resolvePort(value);
      }
    };

    for (const host of hosts) {
      const socket = net.createConnection({ port, host });

      socket.setTimeout(400);

      socket.once("connect", () => {
        socket.destroy();
        finish(true);
      });

      const handleNoConnection = () => {
        socket.destroy();
        pending -= 1;
        if (pending === 0) {
          finish(false);
        }
      };

      socket.once("timeout", handleNoConnection);
      socket.once("error", handleNoConnection);
    }
  });
}

const processes = [];

const isFrontendRunning = await isPortInUse(widgetPort);
if (isFrontendRunning) {
  console.log(
    `[karticle] frontend widget server already running on ${widgetOrigin}`,
  );
} else {
  processes.push(
    start("frontend", [
      "--workspace",
      "frontend",
      "run",
      "dev",
      "--",
      "--host",
      widgetHost,
      "--port",
      String(widgetPort),
      "--strictPort",
    ]),
  );
}

const isClientRunning = await isPortInUse(clientPort);
if (isClientRunning) {
  console.log(`[karticle] client_exemple already running on ${clientOrigin}`);
} else {
  processes.push(
    start("client_exemple", [
      "--workspace",
      "client_exemple",
      "run",
      "dev",
      "--",
      "--host",
      clientHost,
      "--port",
      String(clientPort),
      "--strictPort",
    ]),
  );
}

function shutdown() {
  for (const child of processes) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }
}

process.on("SIGINT", () => {
  shutdown();
  process.exit(0);
});

process.on("SIGTERM", () => {
  shutdown();
  process.exit(0);
});
