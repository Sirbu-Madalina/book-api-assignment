const { spawn } = require("node:child_process");

const baseUrl = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:4173";

function run(command, args, options = {}) {
  return spawn(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    ...options,
  });
}

function runPlaywright() {
  return new Promise((resolve) => {
    let resolved = false;
    let output = "";

    const tests = spawn("node", ["./node_modules/@playwright/test/cli.js", "test"], {
      stdio: ["ignore", "pipe", "pipe"],
      shell: process.platform === "win32",
      env: {
        ...process.env,
        PLAYWRIGHT_BASE_URL: baseUrl,
      },
    });

    function finish(code) {
      if (resolved) return;
      resolved = true;

      setTimeout(async () => {
        await stopProcessTree(tests);
        resolve(code);
      }, 500);
    }

    function handleOutput(chunk, stream) {
      const text = chunk.toString();
      output += text;
      stream.write(text);

      if (/\d+\s+failed/.test(output)) {
        finish(1);
      } else if (/\d+\s+passed/.test(output)) {
        finish(0);
      }
    }

    tests.stdout.on("data", (chunk) => handleOutput(chunk, process.stdout));
    tests.stderr.on("data", (chunk) => handleOutput(chunk, process.stderr));
    tests.on("close", (code) => finish(code || 0));
    tests.on("error", () => finish(1));
  });
}

async function waitForServer(url) {
  const deadline = Date.now() + 30000;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Server is still starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Timed out waiting for ${url}`);
}

function stopProcessTree(child) {
  if (!child.pid) return Promise.resolve();

  if (process.platform === "win32") {
    return new Promise((resolve) => {
      child.kill();
      const killer = spawn("taskkill", ["/pid", String(child.pid), "/t", "/f"], {
        stdio: "ignore",
        shell: true,
      });
      killer.on("close", resolve);
      killer.on("error", resolve);
      setTimeout(resolve, 1000);
    });
  }

  child.kill("SIGTERM");
  return Promise.resolve();
}

async function main() {
  const preview = run("node", [
    "./node_modules/vite/bin/vite.js",
    "preview",
    "--host",
    "127.0.0.1",
    "--port",
    "4173",
    "--configLoader",
    "runner",
  ]);

  try {
    await waitForServer(baseUrl);

    const exitCode = await runPlaywright();
    process.exitCode = exitCode || 0;
  } finally {
    await stopProcessTree(preview);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
