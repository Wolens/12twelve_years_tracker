import { spawn } from "node:child_process";
import { stopStaleDevServers } from "./stop-stale-dev.mjs";

stopStaleDevServers();

const child = spawn("npx", ["next", "dev"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

child.on("exit", (code) => process.exit(code ?? 0));
