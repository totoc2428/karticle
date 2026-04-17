import { spawn } from "node:child_process";
import net from "node:net";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const npmCommand = "npm";
const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));

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

const isFrontendRunning = await isPortInUse(5183);
if (isFrontendRunning) {
  console.log(
    "[karticle] frontend widget server already running on http://localhost:5183",
  );
} else {
  processes.push(
    start("frontend", [
      "--workspace",
      "frontend",
      "run",
      "dev",
      "--",
      "--port",
      "5183",
      "--strictPort",
    ]),
  );
}

const isClientRunning = await isPortInUse(4173);
if (isClientRunning) {
  console.log(
    "[karticle] client_exemple already running on http://localhost:4173",
  );
} else {
  processes.push(
    start("client_exemple", ["--workspace", "client_exemple", "run", "dev"]),
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
